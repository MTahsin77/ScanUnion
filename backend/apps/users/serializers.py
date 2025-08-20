from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
import bcrypt
import secrets
import string

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'pin', 'enabled', 'role', 'is_first_login', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    temp_password = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'pin', 'role', 'password', 'temp_password', 'enabled']
        read_only_fields = ['id', 'temp_password']

    def validate_pin(self, value):
        if User.objects.filter(pin=value).exists():
            raise serializers.ValidationError("A user with this PIN already exists.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        role = validated_data.get('role', 'USER')
        
        # Generate temporary password for admin users if no password provided
        if role == 'ADMIN' and not password:
            temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            validated_data['temp_password'] = temp_password
            validated_data['is_first_login'] = True
        
        user = User.objects.create_user(**validated_data)
        
        if password:
            user.set_password(password)
            user.save()
        
        return user


class LoginSerializer(serializers.Serializer):
    pin = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)
    password = serializers.CharField(required=False, write_only=True)

    def validate(self, attrs):
        pin = attrs.get('pin')
        email = attrs.get('email')
        password = attrs.get('password')

        if pin:
            # Scanner login with PIN
            try:
                user = User.objects.get(pin=pin, enabled=True)
                if user.role != 'USER':
                    raise serializers.ValidationError("Invalid PIN or user disabled")
                attrs['user'] = user
                return attrs
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid PIN or user disabled")
        
        elif email and password:
            # Admin login with email and password
            try:
                user = User.objects.get(email=email, enabled=True, role='ADMIN')
                
                # Check password (temp password or hashed password)
                password_valid = False
                
                if user.is_first_login and user.temp_password:
                    password_valid = password == user.temp_password
                elif user.password:
                    password_valid = user.check_password(password)
                
                if not password_valid:
                    raise serializers.ValidationError("Invalid credentials")
                
                attrs['user'] = user
                return attrs
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")
        
        else:
            raise serializers.ValidationError("Invalid login request")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        old_password = attrs.get('old_password')
        
        # Check old password (temp password or hashed password)
        if user.is_first_login and user.temp_password:
            if old_password != user.temp_password:
                raise serializers.ValidationError("Old password is incorrect")
        elif not user.check_password(old_password):
            raise serializers.ValidationError("Old password is incorrect")
        
        return attrs
