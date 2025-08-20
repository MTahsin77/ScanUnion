#!/usr/bin/env python3
"""
Comprehensive Test Data Population Script
Populates the Event Scanning System with realistic test data for all scenarios
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random

# Add the backend directory to Python path
sys.path.append('/Volumes/Tahz 1TB/Projects/studio/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Setup Django
django.setup()

from apps.users.models import User
from apps.events.models import Event, EventUser
from apps.scans.models import ScanLog

def clear_existing_data():
    """Clear existing test data"""
    print("🧹 Clearing existing data...")
    ScanLog.objects.all().delete()
    EventUser.objects.all().delete()
    Event.objects.all().delete()
    # Clear only test users, keep the main admin
    User.objects.filter(role='USER').delete()
    User.objects.filter(pin__in=['admin123', 'tadmin']).delete()
    print("✅ Existing data cleared")

def create_users():
    """Create admin and scanner users"""
    print("👥 Creating users...")
    
    users = []
    
    # Use existing admin or create new ones
    existing_admin = User.objects.filter(role='ADMIN').first()
    if existing_admin:
        users.append(existing_admin)
        print(f"  • Using existing admin: {existing_admin.name}")
    
    # Create additional admin if needed
    admin1, created = User.objects.get_or_create(
        pin='admin123',
        defaults={
            'name': 'System Admin',
            'email': 'admin@scanunion.com',
            'role': 'ADMIN',
            'enabled': True,
            'is_first_login': False
        }
    )
    if created:
        admin1.set_password('adminpass123')
        admin1.save()
        print(f"  • Created admin: {admin1.name}")
    users.append(admin1)
    
    # Scanner users
    scanner_data = [
        {'pin': '1234', 'name': 'John Doe'},
        {'pin': '5678', 'name': 'Jane Smith'},
        {'pin': '9012', 'name': 'Peter Jones'},
        {'pin': '3456', 'name': 'Alice Williams'},
        {'pin': '7890', 'name': 'Bob Johnson'},
        {'pin': '1410', 'name': 'Tahz'},
        {'pin': '2468', 'name': 'Sarah Connor'},
        {'pin': '1357', 'name': 'Mike Wilson'},
        {'pin': '8642', 'name': 'Lisa Brown'},
        {'pin': '9753', 'name': 'David Lee'}
    ]
    
    for data in scanner_data:
        user = User.objects.create_user(
            pin=data['pin'],
            name=data['name'],
            role='USER',
            enabled=True,
            is_first_login=False
        )
        users.append(user)
    
    print(f"✅ Created {len(users)} users ({2} admins, {len(users)-2} scanners)")
    return users

def create_events(users):
    """Create events with different timing scenarios"""
    print("📅 Creating events...")
    
    events = []
    scanner_users = [u for u in users if u.role == 'USER']
    
    now = timezone.now()
    
    # Event 1: Ongoing multi-day event (started yesterday, ends tomorrow)
    event1 = Event.objects.create(
        name='Freshers Welcome Week',
        description='A week-long orientation event for new students with multiple activities and sessions.',
        start_date=now - timedelta(days=1),
        end_date=now + timedelta(days=1),
        location='Main Campus',
        is_permanent=False,
        duplicate_policy='ONCE_PER_DAY',
        scanning_enabled=True,
        status='ONGOING'
    )
    events.append(event1)
    
    # Assign multiple scanners to this event
    for scanner in scanner_users[:6]:
        EventUser.objects.create(event=event1, user=scanner)
    
    # Event 2: Upcoming single-day event (tomorrow)
    event2 = Event.objects.create(
        name='Programming Workshop',
        description='Intensive Python programming workshop for beginners.',
        start_date=now + timedelta(days=1),
        end_date=now + timedelta(days=1, hours=8),
        location='Computer Lab A',
        is_permanent=False,
        duplicate_policy='ONCE_PER_EVENT',
        scanning_enabled=True,
        status='UPCOMING'
    )
    events.append(event2)
    
    # Assign fewer scanners
    for scanner in scanner_users[:3]:
        EventUser.objects.create(event=event2, user=scanner)
    
    # Event 3: Completed event (last week)
    event3 = Event.objects.create(
        name='Career Fair 2024',
        description='Annual career fair connecting students with potential employers.',
        start_date=now - timedelta(days=7),
        end_date=now - timedelta(days=5),
        location='Exhibition Hall',
        is_permanent=False,
        duplicate_policy='ONCE_PER_EVENT',
        scanning_enabled=False,
        status='COMPLETED'
    )
    events.append(event3)
    
    # Assign all scanners to this major event
    for scanner in scanner_users:
        EventUser.objects.create(event=event3, user=scanner)
    
    # Event 4: Permanent event (always ongoing)
    event4 = Event.objects.create(
        name='Library Access Control',
        description='Continuous access control for library entry throughout the academic year.',
        location='Main Library',
        is_permanent=True,
        duplicate_policy='ALLOW_DUPLICATES',
        scanning_enabled=True,
        status='ONGOING'
    )
    events.append(event4)
    
    # Assign specific scanners for library duty
    for scanner in scanner_users[::2]:  # Every other scanner
        EventUser.objects.create(event=event4, user=scanner)
    
    # Event 5: Short completed event with lots of data
    event5 = Event.objects.create(
        name='Student Union Elections',
        description='Annual student union elections with high turnout.',
        start_date=now - timedelta(days=3),
        end_date=now - timedelta(days=3, hours=-6),  # 6-hour event
        location='Student Union Building',
        is_permanent=False,
        duplicate_policy='ONCE_PER_EVENT',
        scanning_enabled=False,
        status='COMPLETED'
    )
    events.append(event5)
    
    for scanner in scanner_users[:4]:
        EventUser.objects.create(event=event5, user=scanner)
    
    # Event 6: Future long event (next month)
    event6 = Event.objects.create(
        name='International Student Festival',
        description='Month-long celebration of international student culture.',
        start_date=now + timedelta(days=30),
        end_date=now + timedelta(days=60),
        location='Various Campus Locations',
        is_permanent=False,
        duplicate_policy='ONCE_PER_DAY',
        scanning_enabled=True,
        status='UPCOMING'
    )
    events.append(event6)
    
    for scanner in scanner_users:
        EventUser.objects.create(event=event6, user=scanner)
    
    print(f"✅ Created {len(events)} events with different scenarios")
    return events

def create_scan_logs(events, users):
    """Create realistic scan logs for different scenarios"""
    print("📊 Creating scan logs...")
    
    scanner_users = [u for u in users if u.role == 'USER']
    now = timezone.now()
    
    total_scans = 0
    
    # Event 1: Freshers Week (ongoing, lots of activity)
    event1 = events[0]
    assigned_scanners = list(EventUser.objects.filter(event=event1).values_list('user', flat=True))
    
    # Generate scans for yesterday and today
    for day_offset in [-1, 0]:
        scan_day = now + timedelta(days=day_offset)
        
        # Generate 150-300 scans per day
        daily_scans = random.randint(150, 300)
        
        for i in range(daily_scans):
            # Random time during the day
            hour = random.randint(8, 22)
            minute = random.randint(0, 59)
            scan_time = scan_day.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # Random student ID
            student_id = f"ST{random.randint(100000, 999999)}"
            
            # Random scanner from assigned ones
            scanner_id = random.choice(assigned_scanners)
            
            # Check for duplicates based on policy (ONCE_PER_DAY)
            existing_today = ScanLog.objects.filter(
                event=event1,
                student_id=student_id,
                timestamp__date=scan_time.date(),
                status__in=['SUCCESS', 'DUPLICATE_OVERRIDE']
            ).exists()
            
            status = 'DUPLICATE' if existing_today else 'SUCCESS'
            
            # Sometimes override duplicates (10% chance)
            if status == 'DUPLICATE' and random.random() < 0.1:
                status = 'DUPLICATE_OVERRIDE'
            
            ScanLog.objects.create(
                event=event1,
                scanner_id=scanner_id,
                student_id=student_id,
                timestamp=scan_time,
                status=status,
                is_override=(status == 'DUPLICATE_OVERRIDE')
            )
            total_scans += 1
    
    # Event 3: Career Fair (completed, massive dataset)
    event3 = events[2]
    assigned_scanners = list(EventUser.objects.filter(event=event3).values_list('user', flat=True))
    
    # Generate scans over the 3-day period
    start_date = event3.start_date
    end_date = event3.end_date
    
    current_date = start_date
    while current_date <= end_date:
        # More scans on middle day
        if current_date.date() == (start_date + timedelta(days=1)).date():
            daily_scans = random.randint(800, 1200)  # Peak day
        else:
            daily_scans = random.randint(400, 600)
        
        for i in range(daily_scans):
            hour = random.randint(9, 17)  # Business hours
            minute = random.randint(0, 59)
            scan_time = current_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            student_id = f"ST{random.randint(100000, 999999)}"
            scanner_id = random.choice(assigned_scanners)
            
            # Check for duplicates (ONCE_PER_EVENT)
            existing = ScanLog.objects.filter(
                event=event3,
                student_id=student_id,
                status__in=['SUCCESS', 'DUPLICATE_OVERRIDE']
            ).exists()
            
            status = 'DUPLICATE' if existing else 'SUCCESS'
            
            # Override some duplicates
            if status == 'DUPLICATE' and random.random() < 0.15:
                status = 'DUPLICATE_OVERRIDE'
            
            ScanLog.objects.create(
                event=event3,
                scanner_id=scanner_id,
                student_id=student_id,
                timestamp=scan_time,
                status=status,
                is_override=(status == 'DUPLICATE_OVERRIDE')
            )
            total_scans += 1
        
        current_date += timedelta(days=1)
    
    # Event 4: Library Access (permanent, continuous scans)
    event4 = events[3]
    assigned_scanners = list(EventUser.objects.filter(event=event4).values_list('user', flat=True))
    
    # Generate scans for the past week (ALLOW_DUPLICATES)
    for day_offset in range(-7, 1):
        scan_day = now + timedelta(days=day_offset)
        
        # Library has steady traffic
        daily_scans = random.randint(200, 400)
        
        for i in range(daily_scans):
            hour = random.randint(7, 23)  # Library hours
            minute = random.randint(0, 59)
            scan_time = scan_day.replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            student_id = f"ST{random.randint(100000, 999999)}"
            scanner_id = random.choice(assigned_scanners)
            
            # No duplicate checking for library access
            ScanLog.objects.create(
                event=event4,
                scanner_id=scanner_id,
                student_id=student_id,
                timestamp=scan_time,
                status='SUCCESS',
                is_override=False
            )
            total_scans += 1
    
    # Event 5: Student Elections (short but intense)
    event5 = events[4]
    assigned_scanners = list(EventUser.objects.filter(event=event5).values_list('user', flat=True))
    
    start_time = event5.start_date
    end_time = event5.end_date
    
    # High intensity scanning over 6 hours
    scans_count = random.randint(600, 800)
    
    for i in range(scans_count):
        # Random time within the event period
        time_diff = end_time - start_time
        random_seconds = random.randint(0, int(time_diff.total_seconds()))
        scan_time = start_time + timedelta(seconds=random_seconds)
        
        student_id = f"ST{random.randint(100000, 999999)}"
        scanner_id = random.choice(assigned_scanners)
        
        # Check for duplicates (ONCE_PER_EVENT)
        existing = ScanLog.objects.filter(
            event=event5,
            student_id=student_id,
            status__in=['SUCCESS', 'DUPLICATE_OVERRIDE']
        ).exists()
        
        status = 'DUPLICATE' if existing else 'SUCCESS'
        
        # Elections are strict, fewer overrides
        if status == 'DUPLICATE' and random.random() < 0.05:
            status = 'DUPLICATE_OVERRIDE'
        
        ScanLog.objects.create(
            event=event5,
            scanner_id=scanner_id,
            student_id=student_id,
            timestamp=scan_time,
            status=status,
            is_override=(status == 'DUPLICATE_OVERRIDE')
        )
        total_scans += 1
    
    print(f"✅ Created {total_scans} scan logs across all events")

def print_summary():
    """Print a summary of created data"""
    print("\n" + "="*60)
    print("📊 DATABASE POPULATION SUMMARY")
    print("="*60)
    
    # Users
    admin_count = User.objects.filter(role='ADMIN').count()
    scanner_count = User.objects.filter(role='USER').count()
    print(f"👥 Users: {admin_count} Admins, {scanner_count} Scanners")
    
    # Events
    events = Event.objects.all()
    print(f"📅 Events: {events.count()} total")
    for event in events:
        scanner_count = EventUser.objects.filter(event=event).count()
        scan_count = ScanLog.objects.filter(event=event).count()
        print(f"   • {event.name}: {scanner_count} scanners, {scan_count} scans ({event.status})")
    
    # Scan statistics
    total_scans = ScanLog.objects.count()
    success_scans = ScanLog.objects.filter(status='SUCCESS').count()
    duplicate_scans = ScanLog.objects.filter(status='DUPLICATE').count()
    override_scans = ScanLog.objects.filter(status='DUPLICATE_OVERRIDE').count()
    
    print(f"📊 Scan Logs: {total_scans} total")
    print(f"   • Successful: {success_scans}")
    print(f"   • Duplicates: {duplicate_scans}")
    print(f"   • Overridden: {override_scans}")
    
    print("\n" + "="*60)
    print("✅ TEST DATA POPULATION COMPLETE!")
    print("="*60)
    
    print("\n🎯 TEST SCENARIOS READY:")
    print("• Event Status Testing: Upcoming, Ongoing, Completed events")
    print("• Duplicate Policy Testing: Once per event, Once per day, Allow duplicates")
    print("• Analytics Testing: Hourly, daily, weekly trends")
    print("• Scanner Assignment: Multiple scanners per event")
    print("• High Volume Testing: Thousands of scan logs")
    print("• Time Range Testing: Past, present, and future events")

def main():
    """Main function to populate test data"""
    print("🚀 Starting comprehensive test data population...")
    print("This will create realistic data for testing all scenarios.\n")
    
    try:
        # Step 1: Clear existing data
        clear_existing_data()
        
        # Step 2: Create users
        users = create_users()
        
        # Step 3: Create events
        events = create_events(users)
        
        # Step 4: Create scan logs
        create_scan_logs(events, users)
        
        # Step 5: Print summary
        print_summary()
        
    except Exception as e:
        print(f"❌ Error during population: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
