from django.urls import path
from . import views

app_name = 'events'

urlpatterns = [
    path('', views.EventListCreateView.as_view(), name='event-list-create'),
    path('<str:pk>/', views.EventDetailView.as_view(), name='event-detail'),
]
