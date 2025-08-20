from rest_framework import serializers
from django.db.models import Count, Q
from django.utils import timezone
from .models import Event, EventUser
from apps.users.serializers import UserSerializer
from apps.scans.models import ScanLog


class EventUserSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.CharField(write_only=True)

    class Meta:
        model = EventUser
        fields = ['id', 'user', 'user_id', 'location']


class EventSerializer(serializers.ModelSerializer):
    event_users = EventUserSerializer(many=True, read_only=True)
    assigned_users = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    user_locations = serializers.DictField(
        child=serializers.CharField(allow_blank=True), write_only=True, required=False
    )
    status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'description', 'date', 'time_range', 'location',
            'scanning_enabled', 'status', 'created_at', 'updated_at',
            # Enhanced timing fields
            'start_date', 'end_date', 'is_permanent', 'duplicate_policy',
            'event_users', 'assigned_users', 'user_locations'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        assigned_users = validated_data.pop('assigned_users', [])
        user_locations = validated_data.pop('user_locations', {})
        
        event = Event.objects.create(**validated_data)
        
        # Create EventUser instances for assigned users
        for user_id in assigned_users:
            EventUser.objects.create(
                event=event,
                user_id=user_id,
                location=user_locations.get(user_id, '')
            )
        
        return event

    def update(self, instance, validated_data):
        assigned_users = validated_data.pop('assigned_users', None)
        user_locations = validated_data.pop('user_locations', {})
        
        # Update event fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update assigned users if provided
        if assigned_users is not None:
            # Remove existing assignments
            instance.event_users.all().delete()
            
            # Create new assignments
            for user_id in assigned_users:
                EventUser.objects.create(
                    event=instance,
                    user_id=user_id,
                    location=user_locations.get(user_id, '')
                )
        
        return instance
    
    def get_status(self, obj):
        """Return dynamically calculated status."""
        return obj.calculated_status


class EventWithStatsSerializer(EventSerializer):
    total_scans = serializers.SerializerMethodField()
    unique_scans = serializers.SerializerMethodField()
    duplicate_scans = serializers.SerializerMethodField()
    error_scans = serializers.SerializerMethodField()
    scans_by_hour = serializers.SerializerMethodField()
    scanner_performance = serializers.SerializerMethodField()
    peak_hour = serializers.SerializerMethodField()
    logs = serializers.SerializerMethodField()

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + [
            'total_scans', 'unique_scans', 'duplicate_scans', 'error_scans',
            'scans_by_hour', 'scanner_performance', 'peak_hour', 'logs'
        ]

    def get_total_scans(self, obj):
        return obj.scan_logs.count()

    def get_unique_scans(self, obj):
        # Count unique students who were successfully scanned
        return obj.scan_logs.filter(status='SUCCESS').values('student_id').distinct().count()

    def get_duplicate_scans(self, obj):
        return obj.scan_logs.filter(status='DUPLICATE').count()

    def get_error_scans(self, obj):
        return obj.scan_logs.filter(status='ERROR').count()

    def get_scans_by_hour(self, obj):
        from django.db.models import Count
        from django.db.models.functions import Extract
        
        # Only count SUCCESS scans for consistency
        hourly_data = (
            obj.scan_logs
            .filter(status='SUCCESS')
            .annotate(hour=Extract('timestamp', 'hour'))
            .values('hour')
            .annotate(scans=Count('id'))
            .order_by('hour')
        )
        
        return [
            {'hour': f"{item['hour']:02d}:00", 'scans': item['scans']}
            for item in hourly_data
        ]

    def get_scanner_performance(self, obj):
        from django.db.models import Count
        
        # Only count SUCCESS scans for consistency
        scanner_data = (
            obj.scan_logs
            .filter(status='SUCCESS')
            .values('scanner__id', 'scanner__name')
            .annotate(scans=Count('id'))
            .order_by('-scans')
        )
        
        return [
            {
                'user_id': item['scanner__id'],
                'user_name': item['scanner__name'],
                'scans': item['scans']
            }
            for item in scanner_data
        ]

    def get_peak_hour(self, obj):
        scans_by_hour = self.get_scans_by_hour(obj)
        if not scans_by_hour:
            return {'hour': 'N/A', 'scans': 0}
        
        peak = max(scans_by_hour, key=lambda x: x['scans'])
        return peak

    def get_logs(self, obj):
        from apps.scans.serializers import ScanLogSerializer
        logs = obj.scan_logs.select_related('scanner', 'event').order_by('-timestamp')[:50]
        return ScanLogSerializer(logs, many=True).data
