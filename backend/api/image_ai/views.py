from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from ml.crop_detection_ai.orchestrator import orchestrator_instance

class CropAnalysisView(APIView):
    """
    API Endpoint for uploading a crop/soil image and running the full AI pipeline.
    """
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        language = request.data.get('language', 'English')
        
        if not file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # In a real app, save the file temporarily or to S3
            # file_path = save_temp_file(file)
            file_path = "mock_path.jpg"
            
            # Run the ML Orchestrator pipeline
            results = orchestrator_instance.analyze_crop_image(file_path, language)
            
            return Response({
                'message': 'Analysis complete',
                'results': results
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
