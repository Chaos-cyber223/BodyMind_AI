# 认证流程修复测试

## 问题分析
1. **问题描述**: 使用 `./start_app.sh` 启动后直接进入 ProfileSetup 页面且无法退出
2. **根本原因**: 认证状态管理逻辑错误，缺少 profile 完成状态的跟踪

## 修复方案

### 1. 添加 Profile 完成状态管理
- 在 `AuthContext.tsx` 中添加 `isProfileComplete` 状态
- 使用 AsyncStorage 持久化 profile 完成状态
- 提供 `setProfileComplete` 函数来更新状态

### 2. 修复导航逻辑
- 在 `App.tsx` 的 `AppStack` 中根据 `isProfileComplete` 状态决定初始页面
- 如果 profile 已完成，直接进入 `MainApp`
- 如果 profile 未完成，进入 `ProfileSetup`

### 3. 添加跳过功能
- 在 `ProfileSetupScreen` 中添加 Skip 按钮
- 用户可以跳过 profile 设置直接进入主应用
- 提供后退确认对话框

## 测试步骤

1. **首次登录测试**:
   - 新用户登录 → 进入 ProfileSetup
   - 完成 profile 设置 → 进入 MainApp
   - 重新启动应用 → 直接进入 MainApp

2. **跳过功能测试**:
   - 新用户登录 → 进入 ProfileSetup
   - 点击 Skip 按钮 → 直接进入 MainApp
   - 重新启动应用 → 直接进入 MainApp

3. **后退功能测试**:
   - 在 ProfileSetup 第一步点击返回 → 显示跳过确认对话框
   - 在 ProfileSetup 非第一步点击返回 → 返回上一步

## 代码修改总结

### AuthContext.tsx
```typescript
interface AuthContextType {
  // ... 原有属性
  isProfileComplete: boolean;
  setProfileComplete: (complete: boolean) => Promise<void>;
}
```

### App.tsx
```typescript
function AppStack() {
  const { isProfileComplete } = useAuth();
  
  return (
    <Stack.Navigator 
      initialRouteName={isProfileComplete ? "MainApp" : "ProfileSetup"}
    >
      // ... screens
    </Stack.Navigator>
  );
}
```

### ProfileSetupScreen.tsx
- 添加 Skip 按钮
- 修改完成逻辑调用 `setProfileComplete(true)`
- 添加后退确认对话框

## 预期结果
- 用户完成 profile 设置后，下次启动直接进入主应用
- 用户可以跳过 profile 设置
- 不再出现无法退出 ProfileSetup 的问题