from django.urls import path
from .views import CropAnalysisView

urlpatterns = [
    path('analyze/', CropAnalysisView.as_view(), name='crop_analyze'),
]
