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
        query = request.data.get('query', None)
        filename = request.data.get('filename', '')
        
        if not file:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        import base64
        try:
            image_b64 = base64.b64encode(file.read()).decode('utf-8')
            
            # Run the ML Orchestrator pipeline
            results = orchestrator_instance.analyze_crop_image(image_b64, language, query, filename)
            
            return Response({
                'message': 'Analysis complete',
                'results': results
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
