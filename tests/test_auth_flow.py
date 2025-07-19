#!/usr/bin/env python3
"""
测试认证流程修复效果
"""
import requests
import json
import sys

API_URL = "http://localhost:8765"

def test_auth_flow():
    print("=== 测试认证流程 ===\n")
    
    # 1. 健康检查
    print("1. 检查API健康状态...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"   状态: {response.status_code}")
        print(f"   响应: {response.json()}\n")
    except Exception as e:
        print(f"   错误: API服务未运行 - {e}")
        return False
    
    # 2. 测试登录
    print("2. 测试登录功能...")
    login_data = {
        "email": "test@example.com",
        "password": "Test123456!"
    }
    
    try:
        response = requests.post(f"{API_URL}/api/auth/login", json=login_data)
        print(f"   状态: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   成功: 获得access_token")
            print(f"   用户: {data.get('user', {}).get('email')}")
            print(f"   Token前缀: {data.get('access_token', '')[:20]}...\n")
            return True
        else:
            print(f"   失败: {response.json()}\n")
            return False
            
    except Exception as e:
        print(f"   错误: {e}\n")
        return False

def summarize_auth_fix():
    print("\n=== 认证流程修复总结 ===\n")
    print("✅ 已实现的功能:")
    print("   - AuthContext支持isProfileComplete状态")
    print("   - ProfileSetupScreen添加Skip按钮")
    print("   - App.tsx根据profile完成状态决定初始页面")
    print("   - 简化的认证API (test_simple_api.py)")
    print("   - 测试账号: test@example.com / Test123456!")
    
    print("\n📝 修复的问题:")
    print("   - 移除了ProfileSetupScreen的双重header")
    print("   - 添加了profile完成状态持久化")
    print("   - 实现了跳过profile设置的功能")
    
    print("\n🔍 测试步骤:")
    print("   1. 新用户登录 → 进入ProfileSetup")
    print("   2. 点击Skip → 进入MainApp")
    print("   3. 重启应用 → 直接进入MainApp")
    
    print("\n💡 下一步:")
    print("   - 在浏览器访问 http://localhost:8081")
    print("   - 使用iPhone 14 Pro视图测试")
    print("   - 验证认证流程是否正常工作")

if __name__ == "__main__":
    print("BodyMind_AI 认证流程测试\n")
    
    if test_auth_flow():
        print("✅ API测试通过!")
    else:
        print("❌ API测试失败!")
        print("\n请确保运行了: cd backend/ai-service && python test_simple_api.py")
    
    summarize_auth_fix()