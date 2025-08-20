from django.db import models
from django.utils import timezone
import uuid


def generate_uuid():
    return str(uuid.uuid4().hex[:25])


class ScanLog(models.Model):
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('DUPLICATE', 'Duplicate'),
        ('DUPLICATE_OVERRIDE', 'Duplicate Override'),
        ('ERROR', 'Error'),
    ]

    id = models.CharField(primary_key=True, max_length=30, default=generate_uuid)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='scan_logs')
    scanner = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='scan_logs')
    student_id = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')
    timestamp = models.DateTimeField(default=timezone.now)
    
    # Enhanced duplicate tracking
    is_override = models.BooleanField(default=False)
    override_reason = models.CharField(max_length=255, null=True, blank=True)
    last_scan_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'scan_logs'
        verbose_name = 'Scan Log'
        verbose_name_plural = 'Scan Logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.event.name} - {self.student_id} by {self.scanner.name}"
