#!/usr/bin/env python3
"""
Test script for the new LangChain RAG system
"""
import asyncio
import sys
from pathlib import Path

# Add the parent directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.rag_service import RAGService
from app.services.ai_service import AIService

async def test_rag_system():
    print("🚀 Testing LangChain RAG System...\n")
    
    try:
        # Initialize services
        print("1. Initializing RAG Service...")
        rag_service = RAGService()
        print("✅ RAG Service initialized successfully!\n")
        
        print("2. Initializing AI Service...")
        ai_service = AIService()
        print("✅ AI Service initialized successfully!\n")
        
        # Test adding a document
        print("3. Adding sample document to knowledge base...")
        doc_path = "./knowledge_base/papers/sample_fat_loss_research.txt"
        success = await rag_service.add_document(
            doc_path, 
            metadata={"topic": "protein_research", "source": "International Journal of Obesity"}
        )
        if success:
            print("✅ Document added successfully!\n")
        else:
            print("❌ Failed to add document\n")
        
        # Test queries
        test_queries = [
            "How much protein should I eat for fat loss?",
            "What is the thermic effect of protein?",
            "How can I prevent muscle loss during dieting?",
            "What's the best meal timing for fat loss?"
        ]
        
        print("4. Testing RAG queries...\n")
        for query in test_queries:
            print(f"Query: {query}")
            
            # Get RAG context
            context = await rag_service.get_relevant_context(query)
            if context:
                print(f"✅ Found relevant context!")
                print(f"Topics: {context.get('topics', [])}")
                print(f"Sources: {context.get('sources', [])}")
                print(f"Confidence: {context.get('confidence_score', 0)}")
            else:
                print("❌ No relevant context found")
            
            # Get AI response
            response = await ai_service.get_chat_response(
                query,
                user_profile={"age": 30, "weight": 70, "goal": "fat_loss"}
            )
            print(f"\nAI Response Preview: {response.content[:200]}...")
            print(f"Sources cited: {response.sources}")
            print("-" * 80 + "\n")
        
        print("5. Testing conversation memory...")
        rag_service.clear_conversation_memory()
        print("✅ Conversation memory cleared!\n")
        
        print("🎉 All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_rag_system())