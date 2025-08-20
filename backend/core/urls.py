"""
URL configuration for event scanning system project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/scan-logs/', include('apps.scans.urls')),
]
