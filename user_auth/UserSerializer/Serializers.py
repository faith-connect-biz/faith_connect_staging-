# authapp/serializers.py

from rest_framework import serializers

from user_auth.models import User


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'partnership_number', 'user_type',
            'email', 'phone', 'password'
        ]
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 6},
        }

    def validate(self, data):
        email = data.get('email')
        phone = data.get('phone')

        if not email and not phone:
            raise serializers.ValidationError("Either phone or email must be provided.")

        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists.")

        if phone and User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("Phone number already exists.")

        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
