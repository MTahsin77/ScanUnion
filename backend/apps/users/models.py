from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import uuid


def generate_uuid():
    return str(uuid.uuid4().hex[:25])


class UserManager(BaseUserManager):
    def create_user(self, pin, name, email=None, password=None, **extra_fields):
        """Create and return a regular user with a PIN."""
        if not pin:
            raise ValueError('The PIN field must be set')
        if not name:
            raise ValueError('The name field must be set')
        
        user = self.model(
            pin=pin,
            name=name,
            email=self.normalize_email(email) if email else None,
            **extra_fields
        )
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, pin, name, email=None, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        extra_fields.setdefault('enabled', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(pin, name, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('USER', 'User'),
    ]

    id = models.CharField(primary_key=True, max_length=30, default=generate_uuid)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    pin = models.CharField(max_length=10, unique=True)
    enabled = models.BooleanField(default=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    is_first_login = models.BooleanField(default=False)
    temp_password = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Django required fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'pin'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.name} ({self.pin})"

    @property
    def is_admin(self):
        return self.role == 'ADMIN'

    @property
    def is_scanner(self):
        return self.role == 'USER'
