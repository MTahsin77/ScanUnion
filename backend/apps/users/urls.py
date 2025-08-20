from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_view, name='login'),
    path('change-password/', views.change_password_view, name='change-password'),
    path('profile/', views.profile_view, name='profile'),
    
    # User management endpoints
    path('', views.UserListCreateView.as_view(), name='user-list-create'),
    path('<str:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
