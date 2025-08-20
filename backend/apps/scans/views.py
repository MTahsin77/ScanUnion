from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import ScanLog
from .serializers import ScanLogSerializer, ScanLogCreateSerializer


class ScanLogListCreateView(generics.ListCreateAPIView):
    queryset = ScanLog.objects.select_related('event', 'scanner').order_by('-timestamp')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event_id', 'scanner_id', 'status']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ScanLogCreateSerializer
        return ScanLogSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        scan_log = serializer.save()
        
        # Return the scan log with full details
        response_serializer = ScanLogSerializer(scan_log)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ScanLogDetailView(generics.RetrieveAPIView):
    queryset = ScanLog.objects.select_related('event', 'scanner')
    serializer_class = ScanLogSerializer
    permission_classes = [IsAuthenticated]
