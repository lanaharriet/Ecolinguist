from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import PyPDF2
from ml.pdf_chat_ai.vector_store import vector_store_instance
from ml.pdf_chat_ai.rag_engine import ask_pdf_question
import uuid

class PDFUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reader = PyPDF2.PdfReader(file)
            texts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    # Very simple chunking by paragraphs or just full page for now
                    chunks = text.split('\n\n')
                    texts.extend([chunk.strip() for chunk in chunks if chunk.strip()])
                    
            if not texts:
                return Response({'error': 'No text found in PDF'}, status=status.HTTP_400_BAD_REQUEST)

            document_id = str(uuid.uuid4())
            # Add to ChromaDB
            vector_store_instance.add_texts(document_id, texts)
            
            return Response({
                'message': 'PDF uploaded and parsed successfully', 
                'document_id': document_id,
                'chunks_processed': len(texts)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PDFChatView(APIView):
    def post(self, request, *args, **kwargs):
        question = request.data.get('question')
        language = request.data.get('language', 'English')
        
        if not question:
            return Response({'error': 'Question is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Query the RAG engine
            answer = ask_pdf_question(question, language=language)
            return Response({'answer': answer}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

