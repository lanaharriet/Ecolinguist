from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # Auth JWT
    path('auth/register', views.register, name='register'),
    path('auth/token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Endpoints
    path('profile', views.profile_view, name='profile'),
    path('crop/add', views.add_crop, name='add_crop'),
    path('generate-report', views.generate_report, name='generate_report'),
    path('report/<int:pk>', views.get_report, name='get_report'),
    path('weather', views.get_weather, name='get_weather'),
    path('schemes', views.get_schemes, name='get_schemes'),
    path('voice-input', views.process_voice_input, name='voice_input'),
    path('resources', views.get_resources, name='resources'),
]
