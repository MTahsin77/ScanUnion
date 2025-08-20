from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('pin', 'name', 'email', 'role', 'enabled', 'is_first_login', 'created_at')
    list_filter = ('role', 'enabled', 'is_first_login', 'created_at')
    search_fields = ('name', 'email', 'pin')
    ordering = ('-created_at',)
    filter_horizontal = ()
    
    fieldsets = (
        (None, {'fields': ('pin', 'password')}),
        ('Personal info', {'fields': ('name', 'email')}),
        ('Permissions', {'fields': ('role', 'enabled', 'is_first_login', 'temp_password')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('pin', 'name', 'email', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
