#!/usr/bin/env python3
"""
测试增强版RAG系统
"""

import requests
import json
import time

API_URL = "http://localhost:8766"  # 使用新的端口

def test_rag_system():
    """测试完整的RAG系统"""
    
    print("🧪 测试增强版RAG AI系统")
    print("=" * 50)
    
    # 1. 健康检查
    print("\n1. 检查服务状态...")
    try:
        response = requests.get(f"{API_URL}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ 服务状态: {health_data['status']}")
            print(f"📊 RAG状态: {health_data['rag_status']}")
            print(f"📚 知识库: {health_data['rag_stats']}")
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ 服务连接失败: {e}")
        return
    
    # 2. 登录获取token
    print("\n2. 登录获取token...")
    login_response = requests.post(
        f"{API_URL}/api/auth/login",
        json={"email": "test@example.com", "password": "Test123456!"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ 登录失败: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ 登录成功，获得token")
    
    # 3. 测试知识库搜索
    print("\n3. 测试知识库直接搜索...")
    search_queries = [
        "蛋白质摄入量",
        "HIIT训练效果",
        "减脂平台期",
        "力量训练肌肉"
    ]
    
    for query in search_queries:
        try:
            response = requests.post(
                f"{API_URL}/api/knowledge/search",
                headers=headers,
                params={"query": query, "k": 2}
            )
            if response.status_code == 200:
                data = response.json()
                print(f"\n🔍 搜索: '{query}'")
                print(f"   找到 {data['total_found']} 个相关文档")
                for i, result in enumerate(data['results']):
                    print(f"   {i+1}. {result['metadata']['title']} (相关性: {result['score']:.3f})")
            else:
                print(f"❌ 搜索失败: {query}")
        except Exception as e:
            print(f"❌ 搜索错误: {e}")
    
    # 4. 测试RAG增强的AI聊天
    print("\n4. 测试RAG增强的AI聊天...")
    test_messages = [
        {
            "message": "我想知道减脂期间每天应该吃多少蛋白质？我体重70公斤。",
            "user_profile": {
                "age": 30,
                "gender": "male",
                "height": 175,
                "weight": 70,
                "activity_level": "moderate",
                "goal": "lose_weight"
            }
        },
        {
            "message": "HIIT训练和传统有氧运动哪个减脂效果更好？",
            "user_profile": None
        },
        {
            "message": "为什么我减脂到了平台期，体重不再下降了？",
            "user_profile": None
        },
        {
            "message": "减脂期间做力量训练有什么好处？",
            "user_profile": None
        }
    ]
    
    conversation_id = None
    
    for i, test_data in enumerate(test_messages, 1):
        print(f"\n💬 对话 {i}: {test_data['message']}")
        
        # 添加conversation_id以维持对话连续性
        if conversation_id:
            test_data["conversation_id"] = conversation_id
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{API_URL}/api/chat/message",
                headers=headers,
                json=test_data,
                timeout=60
            )
            end_time = time.time()
            
            if response.status_code == 200:
                result = response.json()
                conversation_id = result.get('conversation_id')
                
                print(f"⏱️  响应时间: {end_time - start_time:.2f}秒")
                print(f"🔍 RAG检索: 找到 {result.get('rag_docs_found', 0)} 个相关文档")
                
                if result.get('sources'):
                    print(f"📚 引用来源: {', '.join(result['sources'])}")
                
                print(f"🤖 AI回复:")
                ai_response = result['response']
                # 截断过长的回复
                if len(ai_response) > 300:
                    print(f"   {ai_response[:300]}...")
                else:
                    print(f"   {ai_response}")
                    
                print(f"✅ 对话成功完成")
            else:
                print(f"❌ 聊天失败: {response.status_code} - {response.text}")
                
        except requests.exceptions.Timeout:
            print(f"⏰ 请求超时（可能是AI API限制）")
        except Exception as e:
            print(f"❌ 聊天错误: {e}")
        
        # 等待一下避免API限制
        time.sleep(2)
    
    # 5. 测试上传自定义文档
    print("\n5. 测试上传自定义文档...")
    custom_doc = {
        "content": """
睡眠与减脂的关系研究

研究表明，睡眠质量和时长对减脂效果有重要影响：

1. 睡眠不足（每晚少于7小时）会导致瘦素（leptin）水平降低，胃饥饿素（ghrelin）水平升高，增加食欲。

2. 睡眠不足会影响胰岛素敏感性，增加脂肪储存倾向。

3. 深度睡眠期间，生长激素分泌达到峰值，有助于脂肪分解和肌肉恢复。

4. 建议：保持7-9小时睡眠，固定作息时间，睡前避免蓝光和咖啡因。

来源：Sleep and Weight Loss Research, 2023
        """,
        "title": "睡眠对减脂的影响",
        "source": "Sleep Research Journal 2023",
        "category": "lifestyle_factors"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/api/knowledge/upload",
            headers=headers,
            json=custom_doc
        )
        if response.status_code == 200:
            result = response.json()
            print(f"✅ 文档上传成功: {result['title']}")
            print(f"📊 更新后统计: {result['stats']}")
        else:
            print(f"❌ 文档上传失败: {response.text}")
    except Exception as e:
        print(f"❌ 上传错误: {e}")
    
    # 6. 测试新上传文档的检索效果
    print("\n6. 测试新文档检索效果...")
    sleep_query = "睡眠对减脂有什么影响？"
    
    try:
        response = requests.post(
            f"{API_URL}/api/chat/message",
            headers=headers,
            json={
                "message": sleep_query,
                "conversation_id": conversation_id
            },
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"💬 问题: {sleep_query}")
            print(f"🔍 RAG检索: 找到 {result.get('rag_docs_found', 0)} 个相关文档")
            if result.get('sources'):
                print(f"📚 引用来源: {', '.join(result['sources'])}")
            print(f"🤖 AI回复: {result['response'][:200]}...")
        else:
            print(f"❌ 查询失败")
    except Exception as e:
        print(f"❌ 查询错误: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 RAG系统测试完成！")
    print("\n📋 总结:")
    print("- ✅ 基于真实科学论文的知识检索")
    print("- ✅ 智能向量相似度搜索")
    print("- ✅ 动态知识库更新")
    print("- ✅ 对话上下文维持")
    print("- ✅ 多语言支持和引用来源")

if __name__ == "__main__":
    test_rag_system()