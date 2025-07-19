#!/usr/bin/env python3
"""测试AI聊天功能"""
import requests
import json

API_URL = "http://localhost:8765"

# 1. 登录获取token
print("1. 登录获取token...")
login_response = requests.post(
    f"{API_URL}/api/auth/login",
    json={"email": "test@example.com", "password": "Test123456!"}
)

if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    print(f"✅ 登录成功，获得token: {token[:20]}...")
else:
    print(f"❌ 登录失败: {login_response.text}")
    exit(1)

# 2. 测试AI聊天
print("\n2. 测试AI聊天...")
headers = {"Authorization": f"Bearer {token}"}

test_messages = [
    {
        "message": "我想减脂，每天应该吃多少蛋白质？",
        "user_profile": {
            "age": 30,
            "gender": "male",
            "height": 175,
            "weight": 80,
            "activity_level": "moderate",
            "goal": "lose_weight"
        }
    },
    {
        "message": "如何计算我的每日热量需求？",
        "user_profile": None
    },
    {
        "message": "什么运动最适合减脂？",
        "user_profile": None
    }
]

for i, test_data in enumerate(test_messages, 1):
    print(f"\n测试 {i}: {test_data['message']}")
    
    response = requests.post(
        f"{API_URL}/api/chat/message",
        headers=headers,
        json=test_data
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ AI回复: {result['response'][:100]}...")
        if result.get('sources'):
            print(f"   引用来源: {', '.join(result['sources'])}")
    else:
        print(f"❌ 请求失败: {response.text}")

# 3. 测试个人资料设置
print("\n\n3. 测试个人资料设置和TDEE计算...")
profile_data = {
    "age": 30,
    "gender": "male",
    "height": 175,
    "weight": 80,
    "activity_level": "moderate",
    "goal": "lose_weight",
    "target_weight": 70
}

response = requests.post(
    f"{API_URL}/api/profile/setup",
    headers=headers,
    json=profile_data
)

if response.status_code == 200:
    result = response.json()
    print(f"✅ TDEE计算成功:")
    print(f"   基础代谢率(BMR): {result['bmr']} 卡路里")
    print(f"   每日总消耗(TDEE): {result['tdee']} 卡路里")
    print(f"   每日热量目标: {result['daily_calorie_target']} 卡路里")
    print(f"   宏量营养素:")
    print(f"     - 蛋白质: {result['macros']['protein_g']}g")
    print(f"     - 碳水: {result['macros']['carbs_g']}g")
    print(f"     - 脂肪: {result['macros']['fat_g']}g")
    print(f"   建议:")
    for rec in result['recommendations']:
        print(f"     - {rec}")
else:
    print(f"❌ 请求失败: {response.text}")

print("\n✅ AI服务测试完成！")