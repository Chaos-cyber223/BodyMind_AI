# BodyMind AI 认证系统实施手册

## 目录
1. [系统概述](#系统概述)
2. [实施方案选择](#实施方案选择)
3. [快速开始指南](#快速开始指南)
4. [数据库架构](#数据库架构)
5. [API 接口文档](#api-接口文档)
6. [前端认证流程](#前端认证流程)
7. [测试指南](#测试指南)
8. [故障排除](#故障排除)

## 系统概述

BodyMind AI 认证系统提供完整的用户认证和授权功能，包括：
- 用户注册/登录
- JWT token 认证
- 密码加密存储
- 会话管理
- 用户配置文件管理

### 技术栈
- **后端**: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **认证**: JWT (JSON Web Tokens) + bcrypt
- **前端**: React Native + AsyncStorage
- **可选云服务**: Supabase

## 实施方案选择

### 方案一：Supabase 云服务（推荐用于生产环境）

**优势**：
- 零配置，开箱即用
- 内置用户管理界面
- 自动处理 JWT 刷新
- 免费套餐足够开发使用
- 内置邮件验证功能

**劣势**：
- 需要网络连接
- 数据存储在云端
- 免费套餐有限制

### 方案二：本地 PostgreSQL（推荐用于开发环境）

**优势**：
- 完全控制数据
- 无网络依赖
- 无使用限制
- 学习价值高

**劣势**：
- 需要配置数据库
- 需要自行实现所有功能
- 维护成本较高

## 快速开始指南

### 方案一：Supabase 实施步骤

#### 1. 创建 Supabase 项目
```bash
# 访问 https://app.supabase.com
# 创建新项目，记录以下信息：
# - Project URL
# - Anon Key
# - Service Role Key
```

#### 2. 配置后端环境变量
```bash
cd backend/ai-service
# 编辑 .env 文件
echo "SUPABASE_URL=your-project-url" >> .env
echo "SUPABASE_ANON_KEY=your-anon-key" >> .env
echo "SUPABASE_SERVICE_KEY=your-service-key" >> .env
```

#### 3. 安装 Supabase 依赖
```bash
pip install supabase
```

#### 4. 创建数据库表
在 Supabase Dashboard SQL Editor 中执行：
```sql
-- 用户配置文件表
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    age INTEGER,
    gender VARCHAR(10),
    height FLOAT,
    weight FLOAT,
    activity_level VARCHAR(20),
    goal VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户数据表
CREATE TABLE user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    weight FLOAT,
    calories INTEGER,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT,
    exercise_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 RLS 策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own data" ON user_data
    FOR ALL USING (auth.uid() = user_id);
```

### 方案二：本地 PostgreSQL 实施步骤

#### 1. 安装 PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# 下载安装程序：https://www.postgresql.org/download/windows/
```

#### 2. 创建数据库
```bash
# 创建数据库用户和数据库
sudo -u postgres psql
CREATE USER bodymind WITH PASSWORD 'your-secure-password';
CREATE DATABASE bodymind_db OWNER bodymind;
\q
```

#### 3. 配置后端环境变量
```bash
cd backend/ai-service
echo "DATABASE_URL=postgresql://bodymind:your-secure-password@localhost/bodymind_db" >> .env
echo "JWT_SECRET_KEY=$(openssl rand -hex 32)" >> .env
echo "JWT_ALGORITHM=HS256" >> .env
echo "ACCESS_TOKEN_EXPIRE_MINUTES=30" >> .env
```

#### 4. 安装依赖
```bash
pip install sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart
```

#### 5. 初始化数据库
```bash
# 运行数据库迁移
cd backend/ai-service
python -m app.database.init_db
```

## 数据库架构

### 用户表 (users)
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 用户配置文件表 (user_profiles)
```sql
CREATE TABLE user_profiles (
    id UUID REFERENCES users(id) PRIMARY KEY,
    age INTEGER,
    gender VARCHAR(10),
    height FLOAT,
    weight FLOAT,
    activity_level VARCHAR(20),
    goal VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 用户数据表 (user_data)
```sql
CREATE TABLE user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    weight FLOAT,
    calories INTEGER,
    protein FLOAT,
    carbs FLOAT,
    fat FLOAT,
    exercise_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);
```

## API 接口文档

### 认证接口

#### 注册
```bash
POST /api/auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword123"
}

# 响应
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "user": {
        "id": "uuid",
        "email": "user@example.com"
    }
}
```

#### 登录
```bash
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword123

# 响应
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer"
}
```

#### 获取当前用户
```bash
GET /api/auth/me
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# 响应
{
    "id": "uuid",
    "email": "user@example.com",
    "is_active": true
}
```

### 用户配置文件接口

#### 创建/更新配置文件
```bash
POST /api/profile/setup
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activity_level": "moderate",
    "goal": "lose_weight"
}

# 响应
{
    "profile": {...},
    "tdee": 2450,
    "recommendations": {...}
}
```

#### 获取配置文件
```bash
GET /api/profile
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# 响应
{
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activity_level": "moderate",
    "goal": "lose_weight"
}
```

### 用户数据接口

#### 记录每日数据
```bash
POST /api/data/daily
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
    "date": "2024-01-15",
    "weight": 69.5,
    "calories": 2200,
    "protein": 150,
    "carbs": 220,
    "fat": 70,
    "exercise_minutes": 45
}
```

#### 获取历史数据
```bash
GET /api/data/history?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

# 响应
[
    {
        "date": "2024-01-15",
        "weight": 69.5,
        "calories": 2200,
        ...
    }
]
```

## 前端认证流程

### 1. 安装依赖
```bash
cd mobile
npm install @react-native-async-storage/async-storage
npm install axios
```

### 2. 认证服务实现
```typescript
// mobile/src/services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class AuthService {
    private token: string | null = null;
    
    async login(email: string, password: string) {
        const response = await axios.post('/api/auth/login', {
            username: email,
            password
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        this.token = response.data.access_token;
        await AsyncStorage.setItem('auth_token', this.token);
        return response.data;
    }
    
    async logout() {
        this.token = null;
        await AsyncStorage.removeItem('auth_token');
    }
    
    async getToken() {
        if (!this.token) {
            this.token = await AsyncStorage.getItem('auth_token');
        }
        return this.token;
    }
    
    async isAuthenticated() {
        const token = await this.getToken();
        return !!token;
    }
}

export default new AuthService();
```

### 3. API 客户端配置
```typescript
// mobile/src/services/api.client.ts
import axios from 'axios';
import AuthService from './auth.service';

const apiClient = axios.create({
    baseURL: 'http://localhost:8765',
    timeout: 10000
});

// 请求拦截器 - 自动添加认证头
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AuthService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器 - 处理 401 错误
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AuthService.logout();
            // 导航到登录页面
        }
        return Promise.reject(error);
    }
);

export default apiClient;
```

### 4. 认证守卫组件
```typescript
// mobile/src/components/AuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AuthService from '../services/auth.service';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    
    useEffect(() => {
        checkAuth();
    }, []);
    
    const checkAuth = async () => {
        const authenticated = await AuthService.isAuthenticated();
        setIsAuthenticated(authenticated);
    };
    
    if (isAuthenticated === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    
    if (!isAuthenticated) {
        // 重定向到登录页面
        return null;
    }
    
    return <>{children}</>;
};
```

## 测试指南

### 后端 API 测试

#### 1. 注册新用户
```bash
curl -X POST "http://localhost:8765/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }'
```

#### 2. 用户登录
```bash
curl -X POST "http://localhost:8765/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=Test123456!"

# 保存返回的 access_token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."
```

#### 3. 设置用户配置文件
```bash
curl -X POST "http://localhost:8765/api/profile/setup" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "female",
    "height": 165,
    "weight": 60,
    "activity_level": "moderate",
    "goal": "lose_weight"
  }'
```

#### 4. 记录每日数据
```bash
curl -X POST "http://localhost:8765/api/data/daily" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "weight": 59.5,
    "calories": 1800,
    "protein": 120,
    "carbs": 180,
    "fat": 60,
    "exercise_minutes": 30
  }'
```

### 前端集成测试

#### 1. 启动后端服务
```bash
cd backend/ai-service
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8765
```

#### 2. 启动前端开发服务器
```bash
cd mobile
npm run web
```

#### 3. 测试认证流程
1. 访问 http://localhost:19006
2. 尝试访问需要认证的页面（应重定向到登录）
3. 注册新账户
4. 登录测试
5. 设置用户配置文件
6. 测试数据记录功能

### 自动化测试

#### 后端单元测试
```bash
cd backend/ai-service
pytest tests/test_auth.py -v
pytest tests/test_profile.py -v
```

#### 前端测试
```bash
cd mobile
npm test
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败
**问题**：`psycopg2.OperationalError: could not connect to server`

**解决方案**：
```bash
# 检查 PostgreSQL 服务状态
sudo systemctl status postgresql

# 检查数据库配置
psql -U bodymind -d bodymind_db -h localhost

# 验证 .env 文件中的 DATABASE_URL
cat backend/ai-service/.env | grep DATABASE_URL
```

#### 2. JWT Token 无效
**问题**：`401 Unauthorized: Invalid token`

**解决方案**：
- 检查 token 是否过期
- 验证 JWT_SECRET_KEY 配置
- 确保前端正确传递 Authorization header

#### 3. CORS 错误
**问题**：`Access to XMLHttpRequest blocked by CORS policy`

**解决方案**：
```python
# 在 FastAPI 中配置 CORS
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:19006"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. Supabase 连接问题
**问题**：`Supabase client error`

**解决方案**：
- 验证 Supabase URL 和 API keys
- 检查网络连接
- 确认 Supabase 项目状态

### 调试技巧

#### 1. 启用详细日志
```python
# backend/ai-service/app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### 2. 检查 JWT Token
```bash
# 解码 JWT token 查看内容
echo $TOKEN | cut -d. -f2 | base64 -d | jq
```

#### 3. 数据库查询调试
```bash
# 连接到数据库
psql -U bodymind -d bodymind_db

# 查看用户表
SELECT * FROM users;

# 查看用户配置文件
SELECT * FROM user_profiles;
```

### 性能优化建议

1. **Token 缓存**：在前端缓存 token，减少 AsyncStorage 读取
2. **连接池**：配置数据库连接池提高并发性能
3. **Redis 缓存**：使用 Redis 缓存用户会话信息
4. **API 限流**：实施 rate limiting 防止滥用

### 安全最佳实践

1. **密码策略**：
   - 最小长度：8 个字符
   - 必须包含大小写字母和数字
   - 定期提醒用户更新密码

2. **Token 管理**：
   - 使用短期 access token（30 分钟）
   - 实施 refresh token 机制
   - 支持 token 撤销

3. **数据加密**：
   - 使用 HTTPS 传输
   - 敏感数据加密存储
   - 实施数据脱敏

4. **审计日志**：
   - 记录所有认证事件
   - 监控异常登录行为
   - 定期安全审计

## 部署清单

### 开发环境
- [ ] PostgreSQL/SQLite 数据库配置
- [ ] 环境变量配置
- [ ] 依赖安装
- [ ] 数据库迁移
- [ ] API 测试

### 生产环境
- [ ] Supabase/云数据库配置
- [ ] HTTPS 证书
- [ ] 环境变量管理（使用 secrets）
- [ ] 备份策略
- [ ] 监控告警
- [ ] 日志收集
- [ ] 安全扫描

## 联系支持

如有问题，请参考：
- FastAPI 文档：https://fastapi.tiangolo.com/
- Supabase 文档：https://supabase.com/docs
- PostgreSQL 文档：https://www.postgresql.org/docs/

---

最后更新：2025-01-15
版本：1.0.0