from rest_framework import serializers
from .models import ScanLog
from apps.events.models import Event
from apps.users.models import User


class ScanLogSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.name', read_only=True)
    scanner_name = serializers.CharField(source='scanner.name', read_only=True)

    class Meta:
        model = ScanLog
        fields = [
            'id', 'event_id', 'scanner_id', 'student_id', 'status', 'timestamp',
            'event_name', 'scanner_name'
        ]
        read_only_fields = ['id', 'timestamp']

    def create(self, validated_data):
        event_id = validated_data.get('event_id')
        scanner_id = validated_data.get('scanner_id')
        student_id = validated_data.get('student_id')

        # Check if this student was already scanned for this event
        existing_scan = ScanLog.objects.filter(
            event_id=event_id,
            student_id=student_id
        ).first()

        status = 'SUCCESS'
        if existing_scan:
            status = 'DUPLICATE'

        validated_data['status'] = status
        return super().create(validated_data)


class ScanLogCreateSerializer(serializers.Serializer):
    event_id = serializers.CharField()
    scanner_id = serializers.CharField()
    student_id = serializers.CharField(max_length=50)

    def validate_event_id(self, value):
        try:
            Event.objects.get(id=value)
        except Event.DoesNotExist:
            raise serializers.ValidationError("Event not found")
        return value

    def validate_scanner_id(self, value):
        try:
            User.objects.get(id=value, role='USER')
        except User.DoesNotExist:
            raise serializers.ValidationError("Scanner not found")
        return value

    def create(self, validated_data):
        # Check if this student was already scanned for this event
        existing_scan = ScanLog.objects.filter(
            event_id=validated_data['event_id'],
            student_id=validated_data['student_id']
        ).first()

        status = 'SUCCESS'
        if existing_scan:
            status = 'DUPLICATE'

        scan_log = ScanLog.objects.create(
            event_id=validated_data['event_id'],
            scanner_id=validated_data['scanner_id'],
            student_id=validated_data['student_id'],
            status=status
        )
        
        return scan_log
