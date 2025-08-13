# Create your models here.
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, partnership_number, password=None, **extra_fields):
        if not partnership_number:
            raise ValueError("Partnership number is required")

        # Ensure normal users cannot be created as staff/superuser
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)

        user = self.model(partnership_number=partnership_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, partnership_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(partnership_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ('community', 'Community'),
        ('business', 'Business'),
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    partnership_number = models.CharField(max_length=50, unique=True)  # Must be unique as USERNAME_FIELD
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(unique=True, max_length=20, null=True, blank=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='community')
    profile_image_url = models.URLField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    county = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    email_token = models.CharField(max_length=100, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'partnership_number'
    REQUIRED_FIELDS = ['first_name', 'last_name','user_type']

    objects = UserManager()

    def __str__(self):
        return self.partnership_number

