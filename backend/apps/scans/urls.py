from django.urls import path
from . import views

app_name = 'scans'

urlpatterns = [
    path('', views.ScanLogListCreateView.as_view(), name='scanlog-list-create'),
    path('<str:pk>/', views.ScanLogDetailView.as_view(), name='scanlog-detail'),
]
