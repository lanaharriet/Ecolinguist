from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, CropReport, Scheme, Resource

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class SchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scheme
        fields = '__all__'

class CropReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropReport
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['location', 'farmer_type', 'land_size', 'main_crops', 'preferred_language', 'farming_experience']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(required=False)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'email', 'profile']
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create or get profile to avoid IntegrityError
        UserProfile.objects.get_or_create(user=user, defaults=profile_data)
        return user
