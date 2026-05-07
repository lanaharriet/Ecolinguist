from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from django.contrib.auth.models import User

class CreateProfileView(APIView):
    """
    API endpoint to register a new user and create their EcoLinguist profile.
    """
    def post(self, request, *args, **kwargs):
        # We handle flat data from frontend and nest it for the serializer
        data = {
            "username": request.data.get("username"),
            "password": request.data.get("password"),
            "first_name": request.data.get("first_name", ""),
            "profile": {
                "location": request.data.get("location", ""),
                "farmer_type": request.data.get("farmer_type", ""),
                "land_size": request.data.get("land_size"),
                "main_crops": request.data.get("main_crops", ""),
                "preferred_language": request.data.get("preferred_language", "English"),
                "farming_experience": request.data.get("farming_experience")
            }
        }
        
        # Check if user exists
        if User.objects.filter(username=data['username']).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile created successfully!",
                "user": {
                    "username": serializer.data['username'],
                    "first_name": serializer.data['first_name']
                }
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
