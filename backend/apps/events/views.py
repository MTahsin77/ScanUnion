from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch
from .models import Event, EventUser
from .serializers import EventSerializer, EventWithStatsSerializer
from apps.users.permissions import IsAdminUser


class EventListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'scanning_enabled']
    
    def get_queryset(self):
        queryset = Event.objects.prefetch_related(
            Prefetch('event_users', queryset=EventUser.objects.select_related('user'))
        )
        
        # Filter by user for scanner users
        user_id = self.request.query_params.get('userId')
        if user_id:
            queryset = queryset.filter(event_users__user_id=user_id)
        
        return queryset.order_by('-date')
    
    def get_serializer_class(self):
        include_stats = self.request.query_params.get('includeStats') == 'true'
        if include_stats:
            return EventWithStatsSerializer
        return EventSerializer
    
    def get_permissions(self):
        # Only admins can create events
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.prefetch_related(
        Prefetch('event_users', queryset=EventUser.objects.select_related('user')),
        'scan_logs__scanner'
    )
    
    def get_serializer_class(self):
        return EventWithStatsSerializer
    
    def get_permissions(self):
        # Only admins can update/delete events
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]
