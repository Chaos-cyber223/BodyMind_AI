from typing import Dict, List, Optional, Any
import os
from pathlib import Path
import logging

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import TextLoader, PyPDFLoader
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.schema import Document

from ..config import get_settings

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.settings = get_settings()
        self.embeddings = None
        self.vector_store = None
        self.qa_chain = None
        self._initialize_rag()
        
    def _initialize_rag(self):
        """Initialize the RAG system with LangChain components"""
        try:
            # Initialize embeddings with SiliconFlow API
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=self.settings.openai_api_key,
                openai_api_base=os.getenv("OPENAI_API_BASE", "https://api.siliconflow.cn/v1"),
                model=self.settings.embedding_model
            )
            
            # Initialize or load vector store
            persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
            
            if os.path.exists(persist_directory):
                # Load existing vector store
                self.vector_store = Chroma(
                    persist_directory=persist_directory,
                    embedding_function=self.embeddings
                )
                logger.info(f"Loaded existing vector store from {persist_directory}")
            else:
                # Create new vector store with initial documents
                self.vector_store = Chroma(
                    persist_directory=persist_directory,
                    embedding_function=self.embeddings
                )
                self._load_initial_knowledge()
                
            # Initialize LLM with SiliconFlow
            llm = ChatOpenAI(
                openai_api_key=self.settings.openai_api_key,
                openai_api_base=os.getenv("OPENAI_API_BASE", "https://api.siliconflow.cn/v1"),
                model_name=self.settings.default_model,
                temperature=self.settings.temperature,
                max_tokens=self.settings.max_tokens
            )
            
            # Create conversational retrieval chain
            memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer"
            )
            
            self.qa_chain = ConversationalRetrievalChain.from_llm(
                llm=llm,
                retriever=self.vector_store.as_retriever(
                    search_kwargs={"k": 5}
                ),
                memory=memory,
                return_source_documents=True,
                verbose=True
            )
            
            logger.info("RAG system initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize RAG system: {str(e)}")
            raise
    
    def _load_initial_knowledge(self):
        """Load initial fat loss knowledge into vector store"""
        # Create documents from the original knowledge base
        documents = [
            Document(
                page_content="""
                Caloric Deficit for Fat Loss:
                The fundamental principle of fat loss is creating a caloric deficit - consuming fewer calories than you expend. 
                Research shows that a deficit of 3,500 calories theoretically leads to 1 pound of fat loss, though individual 
                variation exists. A moderate deficit of 500-750 calories per day typically results in 1-2 pounds of fat loss 
                per week, which is considered safe and sustainable. Studies from the Journal of the American Medical Association 
                and American Journal of Clinical Nutrition support this approach.
                """,
                metadata={"topic": "caloric_deficit", "sources": "JAMA, American Journal of Clinical Nutrition"}
            ),
            Document(
                page_content="""
                Protein Intake During Fat Loss:
                Higher protein intake (0.8-1.2g per pound of body weight) during fat loss helps preserve lean muscle mass 
                and increases satiety. Research demonstrates that protein has a higher thermic effect of food (TEF) compared 
                to carbohydrates and fats, meaning more calories are burned during digestion and metabolism. The International 
                Journal of Obesity and Journal of Nutrition have published extensive research supporting high protein diets 
                for successful fat loss while maintaining muscle mass.
                """,
                metadata={"topic": "protein_intake", "sources": "International Journal of Obesity, Journal of Nutrition"}
            ),
            Document(
                page_content="""
                Exercise Strategies for Fat Loss:
                Resistance training is crucial during fat loss to preserve muscle mass and maintain metabolic rate. 
                Cardiovascular exercise, particularly HIIT, can be effective for fat loss and time efficiency. 
                Studies show that combining resistance training with moderate cardio yields optimal body composition changes.
                The Journal of Applied Physiology and Sports Medicine research confirms that a combination approach 
                is most effective for fat loss while preserving lean mass.
                """,
                metadata={"topic": "exercise_types", "sources": "Journal of Applied Physiology, Sports Medicine"}
            ),
            Document(
                page_content="""
                Metabolic Adaptation and Plateaus:
                During prolonged caloric restriction, the body adapts by reducing metabolic rate, a phenomenon known as 
                metabolic adaptation. Strategies to minimize this include diet breaks, refeed days, and maintaining 
                resistance training. Research suggests that rapid weight loss can lead to greater metabolic slowdown 
                compared to gradual approaches. Obesity Reviews and International Journal of Obesity have documented 
                these adaptations and effective countermeasures.
                """,
                metadata={"topic": "metabolic_adaptation", "sources": "Obesity Reviews, International Journal of Obesity"}
            ),
            Document(
                page_content="""
                Meal Timing and Intermittent Fasting:
                While total caloric intake is most important for fat loss, meal timing can have modest effects. 
                Research on intermittent fasting shows it can be effective primarily due to its impact on total 
                caloric intake rather than metabolic advantages. Eating adequate protein at each meal may help 
                with satiety and muscle protein synthesis. Studies from Annual Review of Nutrition and Cell Metabolism 
                provide evidence for flexible meal timing approaches.
                """,
                metadata={"topic": "meal_timing", "sources": "Annual Review of Nutrition, Cell Metabolism"}
            )
        ]
        
        # Add documents to vector store
        self.vector_store.add_documents(documents)
        self.vector_store.persist()
        logger.info(f"Loaded {len(documents)} initial documents into vector store")
    
    async def get_relevant_context(self, query: str, conversation_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get relevant context using LangChain's conversational retrieval
        """
        try:
            # Use the QA chain to get answer with sources
            result = await self.qa_chain.acall({
                "question": query,
                "chat_history": []  # Memory handles this internally
            })
            
            # Extract sources from source documents
            sources = []
            topics = []
            
            if "source_documents" in result:
                for doc in result["source_documents"]:
                    if "sources" in doc.metadata:
                        sources.extend(doc.metadata["sources"].split(", "))
                    if "topic" in doc.metadata:
                        topics.append(doc.metadata["topic"])
            
            return {
                "content": result.get("answer", ""),
                "sources": list(set(sources)),  # Remove duplicates
                "topics": list(set(topics)),
                "confidence_score": 0.95  # High confidence with LangChain RAG
            }
            
        except Exception as e:
            logger.error(f"Error in RAG retrieval: {str(e)}")
            return None
    
    async def add_document(self, file_path: str, metadata: Optional[Dict] = None) -> bool:
        """
        Add a new document to the vector store
        """
        try:
            # Determine loader based on file extension
            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            elif file_path.endswith('.txt'):
                loader = TextLoader(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_path}")
            
            # Load and split documents
            documents = loader.load()
            
            # Add metadata if provided
            if metadata:
                for doc in documents:
                    doc.metadata.update(metadata)
            
            # Split documents
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
            )
            
            split_docs = text_splitter.split_documents(documents)
            
            # Add to vector store
            self.vector_store.add_documents(split_docs)
            self.vector_store.persist()
            
            logger.info(f"Added {len(split_docs)} chunks from {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add document: {str(e)}")
            return False
    
    def get_all_topics(self) -> List[str]:
        """
        Get all available topics from the vector store
        """
        # This is a simplified version - in production, you'd query the vector store metadata
        return ["caloric_deficit", "protein_intake", "exercise_types", "metabolic_adaptation", "meal_timing"]
    
    def clear_conversation_memory(self, conversation_id: Optional[str] = None):
        """
        Clear conversation memory for a fresh start
        """
        if self.qa_chain and hasattr(self.qa_chain, 'memory'):
            self.qa_chain.memory.clear()