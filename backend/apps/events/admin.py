from django.contrib import admin
from .models import Event, EventUser


class EventUserInline(admin.TabularInline):
    model = EventUser
    extra = 1
    autocomplete_fields = ['user']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'location', 'status', 'scanning_enabled', 'created_at')
    list_filter = ('status', 'scanning_enabled', 'created_at', 'date')
    search_fields = ('name', 'location', 'description')
    ordering = ('-date',)
    inlines = [EventUserInline]
    
    fieldsets = (
        (None, {'fields': ('name', 'description')}),
        ('Event Details', {'fields': ('date', 'time_range', 'location')}),
        ('Settings', {'fields': ('scanning_enabled', 'status')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ('created_at', 'updated_at')


@admin.register(EventUser)
class EventUserAdmin(admin.ModelAdmin):
    list_display = ('event', 'user', 'location')
    list_filter = ('event', 'user__role')
    search_fields = ('event__name', 'user__name', 'location')
    autocomplete_fields = ['event', 'user']
