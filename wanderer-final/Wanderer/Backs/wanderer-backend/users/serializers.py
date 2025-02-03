from rest_framework import serializers
from users.models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True,required=False)

    class Meta:
        model = CustomUser
        fields = ['email', 'password','role']

    # def validate_password(self, value):
    #     if value:
    #         user = CustomUser(username=self.initial_data.get('username'))
    #         validate_password(value, user=user) 
    #     return value

    def create(self, validated_data):
        password=validated_data.pop('password',None)
        role = validated_data.get('role', 'user')
        user = CustomUser.objects.create_user(**validated_data, password=password) 
        if role == 'user':
            user.is_approved='approved'
            user.save()
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True,write_only=True)
    confirm_password=serializers.CharField(required=True,write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        return data


