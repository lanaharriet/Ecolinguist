import os
import io
import PyPDF2
import requests
import tempfile
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import UserProfile, CropReport, Scheme, Resource
from .serializers import UserSerializer, UserProfileSerializer, CropReportSerializer, SchemeSerializer, ResourceSerializer
from .ai_engine.orchestrator import orchestrate_crop_report
from .voice.pipeline import transcribe_audio, generate_tts

from rest_framework_simplejwt.tokens import RefreshToken

def extract_pdf_data(file_obj):
    try:
        pdf_reader = PyPDF2.PdfReader(file_obj)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print("PDF Extraction Error:", e)
        return ""

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    try:
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        reports = CropReportSerializer(request.user.reports.all().order_by('-created_at')[:5], many=True).data
        return Response({
            'profile': serializer.data, 
            'username': request.user.username,
            'recent_reports': reports
        })
    except UserProfile.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_crop(request):
    crop_name = request.data.get('crop')
    try:
        profile = request.user.profile
        current_crops = profile.crops or ""
        profile.crops = f"{current_crops},{crop_name}".strip(",")
        profile.save()
        return Response({'message': 'Crop added successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    crop_type = request.data.get('crop_type', 'Unknown Crop')
    condition = request.data.get('condition', '')
    
    # PDF Processing
    extracted_text = ""
    if 'document' in request.FILES:
        extracted_text = extract_pdf_data(request.FILES['document'])

    # Weather Processing (Default mock values if API fails)
    lat = request.data.get('lat', 28.6139)
    lon = request.data.get('lon', 77.2090)
    weather_data = {"temperature": 28, "condition": "Clear", "humidity": "50%"}
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json().get('current_weather', {})
            weather_data['temperature'] = data.get("temperature", 28)
    except:
        pass # rely on defaults
    
    # Call AI Orchestrator
    ai_dict = orchestrate_crop_report(crop_type, condition, weather_data, extracted_text)
    
    try:
        report = CropReport.objects.create(
            user=request.user,
            crop_type=crop_type,
            user_condition_input=condition[:1000],
            status=ai_dict.get('status', 'Moderate'),
            issues_identified=ai_dict.get('issues_identified', ''),
            recommendations=ai_dict.get('recommendations', ''),
            step_by_step_guidance=ai_dict.get('step_by_step_guidance', ''),
            loss_prediction=ai_dict.get('loss_prediction', '')
        )
        return Response(CropReportSerializer(report).data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report(request, pk):
    try:
        report = CropReport.objects.get(pk=pk, user=request.user)
        return Response(CropReportSerializer(report).data)
    except CropReport.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_weather(request):
    lat = request.query_params.get('lat', 28.6139)
    lon = request.query_params.get('lon', 77.2090)
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json().get('current_weather', {})
            return Response({
                "temperature": data.get("temperature", 28),
                "condition": "Cloudy", # mapping weathercode omitted for brevity
                "humidity": "60%" 
            })
    except:
        pass
    return Response({"temperature": 28, "condition": "Sunny", "humidity": "60%"})

@api_view(['GET'])
@permission_classes([AllowAny])
def get_schemes(request):
    schemes = Scheme.objects.all()
    return Response(SchemeSerializer(schemes, many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_resources(request):
    resources = Resource.objects.all()
    return Response(ResourceSerializer(resources, many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_voice_input(request):
    """
    End-to-End Voice Pipeline
    Audio(Whisper) -> Text -> Orchestrator(Llama) -> Audio(ElevenLabs)
    """
    text_input = request.data.get('text', '')
    
    if 'audio' in request.FILES:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            for chunk in request.FILES['audio'].chunks():
                temp_audio.write(chunk)
            temp_path = temp_audio.name
        
        transcription = transcribe_audio(temp_path)
        os.remove(temp_path)
        
        if transcription:
            text_input = transcription
            
    if not text_input:
        return Response({"error": "Failed to transcribe audio or no text provided"}, status=400)
    
    # Get weather details 
    weather_data = {"temperature": 28, "condition": "Sunny", "humidity": "60%"}
    
    ai_dict = orchestrate_crop_report("Unknown", text_input, weather_data, "")
    response_text = ai_dict.get('recommendations', 'I could not process that.')
    
    audio_url = generate_tts(response_text)
    
    return Response({
        "recognized_text": text_input,
        "ai_text": response_text,
        "audio_url": audio_url,
        "full_report": ai_dict
    })
