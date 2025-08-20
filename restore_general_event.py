#!/usr/bin/env python3
"""
Restore the "General" event that was manually created
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Add the backend directory to Python path
sys.path.append('/Volumes/Tahz 1TB/Projects/studio/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django
django.setup()

from apps.users.models import User
from apps.events.models import Event, EventUser
from apps.scans.models import ScanLog

def restore_general_event():
    """Restore the General event"""
    print("🔄 Restoring 'General' event...")
    
    # Check if General event already exists
    existing = Event.objects.filter(name='General').first()
    if existing:
        print(f"⚠️ Event 'General' already exists with ID: {existing.id}")
        return existing
    
    # Create the General event
    # Making some reasonable assumptions - you can adjust these
    now = timezone.now()
    
    general_event = Event.objects.create(
        name='General',
        description='General purpose event for scanning activities',
        start_date=now,  # Start now
        end_date=None,   # No end date (will be set as permanent)
        location='Various Locations',
        is_permanent=True,  # Assuming it was a permanent event
        duplicate_policy='ALLOW_DUPLICATES',  # Most flexible policy
        scanning_enabled=True,
        status='ONGOING'
    )
    
    # Assign Tahz and a few other scanners to it
    tahz_user = User.objects.filter(name='Tahz', role='USER').first()
    if tahz_user:
        EventUser.objects.create(event=general_event, user=tahz_user)
        print(f"  • Assigned scanner: {tahz_user.name}")
    
    # Assign a couple other scanners
    other_scanners = User.objects.filter(role='USER').exclude(id=tahz_user.id if tahz_user else None)[:3]
    for scanner in other_scanners:
        EventUser.objects.create(event=general_event, user=scanner)
        print(f"  • Assigned scanner: {scanner.name}")
    
    print(f"✅ Successfully restored 'General' event with ID: {general_event.id}")
    print(f"   • Status: {general_event.status}")
    print(f"   • Permanent: {general_event.is_permanent}")
    print(f"   • Duplicate Policy: {general_event.duplicate_policy}")
    print(f"   • Scanning Enabled: {general_event.scanning_enabled}")
    print(f"   • Assigned Scanners: {EventUser.objects.filter(event=general_event).count()}")
    
    return general_event

def main():
    """Main function"""
    try:
        event = restore_general_event()
        print("\n🎉 General event has been restored!")
        
    except Exception as e:
        print(f"❌ Error restoring General event: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
