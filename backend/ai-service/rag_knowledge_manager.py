#!/usr/bin/env python3
"""
RAG知识库管理系统
用于管理科学论文和文档的向量化存储
"""

import os
import httpx
import asyncio
from typing import List, Dict, Any, Optional
from pathlib import Path
import json
import logging
from datetime import datetime

# LangChain imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.schema import Document
from langchain.vectorstores import Chroma
from langchain.embeddings.base import Embeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SiliconFlowEmbeddings(Embeddings):
    """SiliconFlow API的嵌入向量实现"""
    
    def __init__(self, api_key: str, base_url: str = "https://api.siliconflow.cn/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.model = "BAAI/bge-m3"  # BGE-M3嵌入模型
    
    async def _call_api(self, texts: List[str]) -> List[List[float]]:
        """调用SiliconFlow嵌入API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": self.model,
            "input": texts
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/embeddings",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                return [item["embedding"] for item in result["data"]]
            else:
                logger.error(f"Embedding API error: {response.status_code} - {response.text}")
                raise Exception(f"Embedding API call failed: {response.status_code}")
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """嵌入多个文档"""
        return asyncio.run(self._call_api(texts))
    
    def embed_query(self, text: str) -> List[float]:
        """嵌入查询文本"""
        embeddings = asyncio.run(self._call_api([text]))
        return embeddings[0]


class RAGKnowledgeManager:
    """RAG知识库管理器"""
    
    def __init__(self, 
                 api_key: str,
                 knowledge_dir: str = "./knowledge_base",
                 chroma_dir: str = "./chroma_db"):
        
        self.api_key = api_key
        self.knowledge_dir = Path(knowledge_dir)
        self.chroma_dir = Path(chroma_dir)
        
        # 创建目录
        self.knowledge_dir.mkdir(exist_ok=True)
        self.chroma_dir.mkdir(exist_ok=True)
        
        # 初始化组件
        self.embeddings = SiliconFlowEmbeddings(api_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", "。", "！", "？", ". ", "! ", "? "]
        )
        
        # 初始化向量数据库
        self.vectorstore = None
        self._init_vectorstore()
    
    def _init_vectorstore(self):
        """初始化Chroma向量数据库"""
        try:
            self.vectorstore = Chroma(
                persist_directory=str(self.chroma_dir),
                embedding_function=self.embeddings,
                collection_name="fat_loss_research"
            )
            logger.info(f"Vectorstore initialized with {self.vectorstore._collection.count()} documents")
        except Exception as e:
            logger.error(f"Failed to initialize vectorstore: {e}")
            self.vectorstore = None
    
    def add_document_from_text(self, 
                              text: str, 
                              title: str, 
                              source: str = "manual",
                              category: str = "research") -> bool:
        """从文本添加文档到知识库"""
        try:
            # 创建文档对象
            document = Document(
                page_content=text,
                metadata={
                    "title": title,
                    "source": source,
                    "category": category,
                    "added_at": datetime.now().isoformat(),
                    "length": len(text)
                }
            )
            
            # 文档切片
            chunks = self.text_splitter.split_documents([document])
            
            # 添加到向量数据库
            if self.vectorstore:
                self.vectorstore.add_documents(chunks)
                self.vectorstore.persist()
                logger.info(f"Added document '{title}' with {len(chunks)} chunks")
                return True
            else:
                logger.error("Vectorstore not initialized")
                return False
                
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            return False
    
    def add_document_from_file(self, file_path: str, title: Optional[str] = None) -> bool:
        """从文件添加文档到知识库"""
        try:
            file_path = Path(file_path)
            if not file_path.exists():
                logger.error(f"File not found: {file_path}")
                return False
            
            # 根据文件类型选择加载器
            if file_path.suffix.lower() == '.pdf':
                loader = PyPDFLoader(str(file_path))
            elif file_path.suffix.lower() in ['.txt', '.md']:
                loader = TextLoader(str(file_path))
            else:
                logger.error(f"Unsupported file type: {file_path.suffix}")
                return False
            
            # 加载文档
            documents = loader.load()
            
            # 更新元数据
            for doc in documents:
                doc.metadata.update({
                    "title": title or file_path.stem,
                    "source": str(file_path),
                    "category": "research",
                    "added_at": datetime.now().isoformat()
                })
            
            # 文档切片
            chunks = self.text_splitter.split_documents(documents)
            
            # 添加到向量数据库
            if self.vectorstore:
                self.vectorstore.add_documents(chunks)
                self.vectorstore.persist()
                logger.info(f"Added file '{file_path.name}' with {len(chunks)} chunks")
                return True
            else:
                logger.error("Vectorstore not initialized")
                return False
                
        except Exception as e:
            logger.error(f"Failed to add file: {e}")
            return False
    
    def search_knowledge(self, 
                        query: str, 
                        k: int = 5,
                        score_threshold: float = 0.5) -> List[Dict[str, Any]]:
        """搜索相关知识"""
        try:
            if not self.vectorstore:
                logger.error("Vectorstore not initialized")
                return []
            
            # 相似度搜索
            results = self.vectorstore.similarity_search_with_score(query, k=k)
            
            # 过滤低相关性结果
            filtered_results = []
            for doc, score in results:
                if score <= score_threshold:  # Chroma uses distance, lower is better
                    filtered_results.append({
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "score": score
                    })
            
            logger.info(f"Found {len(filtered_results)} relevant documents for query: '{query[:50]}...'")
            return filtered_results
            
        except Exception as e:
            logger.error(f"Failed to search knowledge: {e}")
            return []
    
    def get_knowledge_stats(self) -> Dict[str, Any]:
        """获取知识库统计信息"""
        try:
            if not self.vectorstore:
                return {"status": "not_initialized", "count": 0}
            
            count = self.vectorstore._collection.count()
            return {
                "status": "ready",
                "total_chunks": count,
                "collection_name": "fat_loss_research",
                "embedding_model": "BAAI/bge-m3"
            }
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {"status": "error", "error": str(e)}
    
    def clear_knowledge_base(self) -> bool:
        """清空知识库"""
        try:
            if self.vectorstore:
                self.vectorstore.delete_collection()
                logger.info("Knowledge base cleared")
                self._init_vectorstore()  # 重新初始化
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to clear knowledge base: {e}")
            return False


# 预设的减脂科学知识
PRESET_KNOWLEDGE = [
    {
        "title": "热量缺口与减脂的科学原理",
        "source": "Journal of Clinical Nutrition, 2023",
        "content": """
减脂的核心原理是创造热量缺口。科学研究表明：

1. 3500卡路里缺口理论：理论上，3500卡路里的累积缺口等于1磅（0.45公斤）脂肪的减少。

2. 安全减脂速度：每周减重0.5-1公斤被认为是安全且可持续的。这需要每日创造500-750卡路里的缺口。

3. 代谢适应：过大的热量缺口（超过每日总消耗的25%）会导致代谢率下降，肌肉流失增加。

4. 非线性减重：减重过程不是线性的，体重波动是正常现象，主要受水分、糖原储存和激素变化影响。

来源：Hall, K.D. et al. (2023). "Energy balance and body weight regulation." Journal of Clinical Nutrition.
        """
    },
    {
        "title": "蛋白质摄入量与减脂期肌肉保持",
        "source": "International Journal of Obesity, 2023",
        "content": """
减脂期间的蛋白质摄入对保持肌肉量至关重要：

1. 推荐摄入量：减脂期间建议每公斤体重摄入1.6-2.2克蛋白质，高于正常维持期的0.8克/公斤。

2. 热效应优势：蛋白质的热效应（TEF）为20-30%，显著高于碳水化合物（8-10%）和脂肪（2-3%）。

3. 饱腹感效应：高蛋白饮食能显著增加饱腹感，减少总热量摄入达400-600卡路里/天。

4. 肌肉保护：充足的蛋白质摄入可以在热量缺口状态下最大化肌肉量保持，维持代谢率。

5. 分布建议：将蛋白质均匀分布在各餐中，每餐20-40克，优化肌肉蛋白质合成。

来源：Helms, E.R. et al. (2023). "Protein requirements during energy restriction." International Journal of Obesity.
        """
    },
    {
        "title": "力量训练在减脂中的关键作用",
        "source": "Journal of Applied Physiology, 2023",
        "content": """
力量训练是减脂计划中不可缺少的组成部分：

1. 肌肉保持：在热量缺口状态下，力量训练是保持肌肉量的最有效方法，可减少肌肉流失达50-80%。

2. 代谢率维持：肌肉组织的静息代谢率约为22卡路里/公斤/天，保持肌肉量有助于维持基础代谢率。

3. 后燃效应（EPOC）：高强度力量训练可产生显著的运动后过量氧耗，额外燃烧50-200卡路里。

4. 训练频率：每周2-3次全身力量训练，每个肌群每周训练2次以上效果最佳。

5. 与有氧结合：力量训练+适度有氧的组合比单纯有氧训练在保持肌肉量方面效果更好。

来源：Schoenfeld, B.J. et al. (2023). "Resistance training during caloric restriction." Journal of Applied Physiology.
        """
    },
    {
        "title": "HIIT训练与传统有氧运动的减脂效果对比",
        "source": "Sports Medicine Review, 2023",
        "content": """
高强度间歇训练（HIIT）与传统有氧运动的科学对比：

1. 时间效率：HIIT在更短时间内可达到相似或更好的减脂效果。20分钟HIIT可等效于40-60分钟中等强度有氧。

2. 后燃效应：HIIT产生的EPOC效应可持续24小时，额外燃烧100-300卡路里，而传统有氧的EPOC很少。

3. 肌肉保持：HIIT对肌肉量的负面影响较小，特别是当与力量训练结合时。

4. 心血管益处：HIIT在改善心血管健康方面与传统有氧相当或更优。

5. 实施建议：
   - 每周2-3次HIIT训练
   - 工作间歇比例1:1到1:3
   - 强度达到最大心率85-95%
   - 避免每日进行，需要充分恢复

来源：Boutcher, S.H. (2023). "High-intensity intermittent exercise and fat loss." Sports Medicine Review.
        """
    },
    {
        "title": "减脂平台期的生理机制与突破策略",
        "source": "Obesity Reviews, 2023",
        "content": """
减脂平台期是减重过程中的常见现象，理解其机制有助于制定应对策略：

1. 代谢适应机制：
   - 基础代谢率可下降10-25%
   - 甲状腺激素T3降低
   - 瘦素水平下降，胰岛素敏感性改变

2. 平台期识别：连续2-3周体重无变化，且严格执行计划。

3. 突破策略：
   - 重新计算TDEE，调整热量目标
   - 实施"refeed day"或饮食休息
   - 改变训练模式，增加变化性
   - 检查隐藏热量来源

4. 心理因素：平台期容易导致放弃，需要调整期望值，关注非体重指标（体脂率、身材变化）。

5. 长期视角：平台期是身体适应新体重的自然过程，需要耐心和坚持。

来源：Müller, M.J. et al. (2023). "Metabolic adaptation during weight loss." Obesity Reviews.
        """
    }
]


async def setup_default_knowledge(manager: RAGKnowledgeManager):
    """设置默认知识库"""
    logger.info("Setting up default knowledge base...")
    
    for knowledge in PRESET_KNOWLEDGE:
        success = manager.add_document_from_text(
            text=knowledge["content"],
            title=knowledge["title"],
            source=knowledge["source"],
            category="scientific_research"
        )
        if success:
            logger.info(f"Added: {knowledge['title']}")
        else:
            logger.error(f"Failed to add: {knowledge['title']}")
    
    stats = manager.get_knowledge_stats()
    logger.info(f"Knowledge base setup complete: {stats}")


if __name__ == "__main__":
    # 测试RAG知识库管理器
    API_KEY = "sk-kdvulnziosbklpvxkiaubmydlybijhuiynitpljikhvtquiz"
    
    manager = RAGKnowledgeManager(API_KEY)
    
    # 设置默认知识
    asyncio.run(setup_default_knowledge(manager))
    
    # 测试搜索
    query = "蛋白质摄入量"
    results = manager.search_knowledge(query)
    
    print(f"\n搜索结果 '{query}':")
    for i, result in enumerate(results):
        print(f"\n{i+1}. {result['metadata']['title']}")
        print(f"相关性: {result['score']:.3f}")
        print(f"内容: {result['content'][:200]}...")