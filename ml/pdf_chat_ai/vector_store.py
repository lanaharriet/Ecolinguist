import chromadb
from chromadb.config import Settings
import os

VECTOR_DB_DIR = os.path.join(os.path.dirname(__file__), 'chroma_db')

class VectorStore:
    def __init__(self):
        # Initialize persistent ChromaDB
        self.client = chromadb.PersistentClient(path=VECTOR_DB_DIR)
        self.collection = self.client.get_or_create_collection(name="climate_reports")

    def add_texts(self, document_id, texts, metadatas=None):
        if not metadatas:
            metadatas = [{"source": document_id} for _ in texts]
        
        ids = [f"{document_id}_chunk_{i}" for i in range(len(texts))]
        
        self.collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        return ids

    def query(self, query_text, n_results=3):
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results

vector_store_instance = VectorStore()
