#!/usr/bin/env python3
"""直接测试AI API"""
import httpx
import asyncio
import os

OPENAI_API_KEY = "sk-kdvulnziosbklpvxkiaubmydlybijhuiynitpljikhvtquiz"
OPENAI_API_BASE = "https://api.siliconflow.cn/v1"
DEFAULT_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B"

async def test_ai():
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": "你是一个AI助手。"},
            {"role": "user", "content": "你好，请简单介绍一下自己。"}
        ],
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    print(f"测试AI API...")
    print(f"API地址: {OPENAI_API_BASE}/chat/completions")
    print(f"模型: {DEFAULT_MODEL}")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{OPENAI_API_BASE}/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            print(f"\n响应状态: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                print(f"✅ AI回复: {content}")
            else:
                print(f"❌ 错误: {response.text}")
                
        except Exception as e:
            print(f"❌ 请求失败: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_ai())