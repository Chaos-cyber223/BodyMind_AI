#!/usr/bin/env python3
"""生成密码哈希值"""
import bcrypt

password = "Test123456!"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"密码: {password}")
print(f"哈希值: {hashed.decode('utf-8')}")

# 验证
print(f"\n验证结果: {bcrypt.checkpw(password.encode('utf-8'), hashed)}")