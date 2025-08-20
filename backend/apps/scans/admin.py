from django.contrib import admin
from .models import ScanLog


@admin.register(ScanLog)
class ScanLogAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'event', 'scanner', 'status', 'timestamp')
    list_filter = ('status', 'event', 'timestamp')
    search_fields = ('student_id', 'event__name', 'scanner__name')
    ordering = ('-timestamp',)
    autocomplete_fields = ['event', 'scanner']
    
    fieldsets = (
        (None, {'fields': ('event', 'scanner', 'student_id')}),
        ('Status', {'fields': ('status',)}),
        ('Timestamp', {'fields': ('timestamp',)}),
    )
    
    readonly_fields = ('timestamp',)
