from django.urls import path
from .views import PDFUploadView, PDFChatView

urlpatterns = [
    path('upload/', PDFUploadView.as_view(), name='pdf-upload'),
    path('chat/', PDFChatView.as_view(), name='pdf-chat'),
]
