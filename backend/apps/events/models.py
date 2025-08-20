from django.db import models
from django.utils import timezone
import uuid


def generate_uuid():
    return str(uuid.uuid4().hex[:25])


class Event(models.Model):
    STATUS_CHOICES = [
        ('UPCOMING', 'Upcoming'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
    ]
    
    DUPLICATE_POLICY_CHOICES = [
        ('ONCE_PER_EVENT', 'Once per event'),
        ('ONCE_PER_DAY', 'Once per day'),
        ('ALLOW_DUPLICATES', 'Allow duplicates'),
    ]

    id = models.CharField(primary_key=True, max_length=30, default=generate_uuid)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    # Enhanced timing fields
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_permanent = models.BooleanField(default=False)
    
    # Legacy fields for backward compatibility
    date = models.DateTimeField(null=True, blank=True)
    time_range = models.CharField(max_length=100, null=True, blank=True)
    
    location = models.CharField(max_length=255, null=True, blank=True)
    scanning_enabled = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UPCOMING')
    
    # Duplicate handling policy
    duplicate_policy = models.CharField(
        max_length=20, 
        choices=DUPLICATE_POLICY_CHOICES, 
        default='ONCE_PER_EVENT'
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'events'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['-date']

    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        """Override save to automatically calculate status based on dates."""
        if not self.is_permanent and self.start_date and self.end_date:
            now = timezone.now()
            if now < self.start_date:
                self.status = 'UPCOMING'
            elif self.start_date <= now <= self.end_date:
                self.status = 'ONGOING'
            else:
                self.status = 'COMPLETED'
        elif self.is_permanent:
            self.status = 'ONGOING'
        
        super().save(*args, **kwargs)
    
    @property
    def calculated_status(self):
        """Calculate status dynamically without saving to database."""
        if self.is_permanent:
            return 'ONGOING'
        
        if not self.start_date or not self.end_date:
            return self.status  # Return stored status if dates are missing
        
        now = timezone.now()
        if now < self.start_date:
            return 'UPCOMING'
        elif self.start_date <= now <= self.end_date:
            return 'ONGOING'
        else:
            return 'COMPLETED'


class EventUser(models.Model):
    """Junction table for many-to-many relationship between events and users with additional location field."""
    id = models.CharField(primary_key=True, max_length=30, default=generate_uuid)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_users')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='event_users')
    location = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'event_users'
        unique_together = ('event', 'user')
        verbose_name = 'Event User Assignment'
        verbose_name_plural = 'Event User Assignments'

    def __str__(self):
        return f"{self.event.name} - {self.user.name}"
