#!/bin/bash

echo "==================================================================="
echo "Anthropic API 环境变量配置脚本"
echo "注意：本脚本需要在bash环境中运行"
echo "Windows用户请在git bash终端环境下使用"
echo "Mac/Linux用户可直接在终端中运行"
echo "==================================================================="

# 1. 检查终端环境
echo "正在检查运行环境..."

# 检查是否为bash环境
if [ -z "$BASH_VERSION" ]; then
    echo "❌ 错误: 当前不是bash环境"
    echo "请在bash终端中运行此脚本："
    echo "  - Windows: 使用 Git Bash 或 WSL"
    echo "  - Mac/Linux: 使用系统终端"
    exit 1
fi

# 检测操作系统
OS_TYPE="unknown"
case "$(uname -s)" in
    Linux*)     OS_TYPE="Linux";;
    Darwin*)    OS_TYPE="Mac";;
    CYGWIN*|MINGW*|MSYS*) OS_TYPE="Windows";;
    *)          OS_TYPE="unknown";;
esac

echo "✓ 检测到操作系统: $OS_TYPE"
echo "✓ bash环境检查通过 (版本: $BASH_VERSION)"

# 2. 确定环境变量配置文件
echo "正在确定环境变量配置文件..."

CONFIG_FILE=""

# 优先检查当前shell类型
if [ -n "$ZSH_VERSION" ] || [[ "$SHELL" == *"zsh"* ]]; then
    # zsh环境 - 特别处理Mac系统
    if [ -f "$HOME/.zshrc" ]; then
        CONFIG_FILE="$HOME/.zshrc"
        echo "检测到zsh环境，使用 ~/.zshrc"
    else
        CONFIG_FILE="$HOME/.zshrc"
        touch "$CONFIG_FILE"
        echo "创建新的zsh配置文件: ~/.zshrc"
    fi
    
    # 检查是否使用Oh My Zsh，避免冲突
    if [ -n "$ZSH" ] && [ -d "$ZSH" ]; then
        echo "⚠️  检测到Oh My Zsh环境，将在配置文件末尾添加变量"
        echo "   这样可以避免Oh My Zsh加载时的冲突"
    fi
elif [[ "$SHELL" == *"bash"* ]] || [ -n "$BASH_VERSION" ]; then
    # bash环境 - 根据系统选择合适的配置文件
    if [ "$OS_TYPE" = "Mac" ]; then
        # Mac系统优先使用 .bash_profile
        if [ -f "$HOME/.bash_profile" ]; then
            CONFIG_FILE="$HOME/.bash_profile"
            echo "Mac系统使用 ~/.bash_profile"
        else
            CONFIG_FILE="$HOME/.bash_profile"
            touch "$CONFIG_FILE"
            echo "创建新的配置文件: ~/.bash_profile"
        fi
    else
        # Linux/Windows(Git Bash) 使用 .bashrc
        if [ -f "$HOME/.bashrc" ]; then
            CONFIG_FILE="$HOME/.bashrc"
            echo "使用 ~/.bashrc"
        else
            CONFIG_FILE="$HOME/.bashrc"
            touch "$CONFIG_FILE"
            echo "创建新的配置文件: ~/.bashrc"
        fi
    fi
fi

# 如果还没确定配置文件，使用默认
if [ -z "$CONFIG_FILE" ]; then
    CONFIG_FILE="$HOME/.bashrc"
    touch "$CONFIG_FILE"
    echo "使用默认配置文件: ~/.bashrc"
fi

echo "✓ 环境变量配置文件: ${CONFIG_FILE/#$HOME/~}"

# 3. 检查现有配置
echo "检查现有Anthropic配置..."
EXISTING_CONFIG=false

if [ -f "$CONFIG_FILE" ] && grep -q "ANTHROPIC_AUTH_TOKEN\|ANTHROPIC_BASE_URL" "$CONFIG_FILE" 2>/dev/null; then
    EXISTING_CONFIG=true
    echo "⚠️  检测到已存在Anthropic相关配置："
    grep -n "ANTHROPIC_" "$CONFIG_FILE" || true
    echo ""
    read -p "是否要覆盖现有配置？(y/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 0
    fi
    
    # 备份原配置
    backup_file="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$CONFIG_FILE" "$backup_file"
    echo "✓ 已备份原配置到: ${backup_file/#$HOME/~}"
fi

# 颜色定义
colorReset='\033[0m'
colorBright='\033[1m'
colorCyan='\033[36m'
colorYellow='\033[33m'
colorMagenta='\033[35m'
colorRed='\033[31m'
colorBlue='\033[34m'
colorWhite='\033[37m'
colorGreen='\033[32m'

# 显示API密钥获取横幅
show_api_banner() {
    printf "${colorBright}${colorRed}   █████╗ ██╗  ${colorBlue}██████╗ ██████╗ ██████╗ ███████╗${colorMagenta} ██╗    ██╗██╗████████╗██╗  ██╗${colorReset}\n"
    printf "${colorBright}${colorRed}  ██╔══██╗██║ ${colorBlue}██╔════╝██╔═══██╗██╔══██╗██╔════╝${colorMagenta} ██║    ██║██║╚══██╔══╝██║  ██║${colorReset}\n"
    printf "${colorBright}${colorRed}  ███████║██║ ${colorBlue}██║     ██║   ██║██║  ██║█████╗  ${colorMagenta} ██║ █╗ ██║██║   ██║   ███████║${colorReset}\n"
    printf "${colorBright}${colorRed}  ██╔══██║██║ ${colorBlue}██║     ██║   ██║██║  ██║██╔══╝  ${colorMagenta} ██║███╗██║██║   ██║   ██╔══██║${colorReset}\n"
    printf "${colorBright}${colorRed}  ██║  ██║██║ ${colorBlue}╚██████╗╚██████╔╝██████╔╝███████╗${colorMagenta} ╚███╔███╔╝██║   ██║██╗██║  ██║${colorReset}\n"
    printf "${colorBright}${colorRed}  ╚═╝  ╚═╝╚═╝ ${colorBlue} ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝${colorMagenta}  ╚══╝╚══╝ ╚═╝   ╚═╝╚═╝╚═╝  ╚═╝${colorReset}\n"
    printf "\n"
    printf "${colorBright}${colorYellow}🌐 请从以下网址获取您的API密钥：${colorReset}\n"
    printf "${colorBright}${colorCyan}📋 https://aicodewith.com/dashboard/api-keys${colorReset}\n"
    printf "\n"
    printf "${colorBright}${colorGreen}📝 API密钥格式: sk-acw-********-****************${colorReset}\n"
    printf "\n"
}

# 4. 获取API密钥
echo ""
show_api_banner

# 输入API密钥并验证
while true; do
    read -p "请输入ANTHROPIC_AUTH_TOKEN: " auth_token
    echo ""
    
    # 基本格式验证
    if [[ "$auth_token" =~ ^sk-acw-.{8}-.{16}$ ]]; then
        echo "✓ API密钥格式验证通过"
        break
    else
        echo "❌ API密钥格式不正确"
        echo "   正确格式: sk-acw-********-****************"
        echo "   请重新输入"
    fi
done

# 5. 更新配置文件
echo "正在更新配置文件..."

# 移除旧的Anthropic配置
if [ "$EXISTING_CONFIG" = true ]; then
    # 创建临时文件，移除旧配置
    temp_file=$(mktemp)
    grep -v "ANTHROPIC_AUTH_TOKEN\|ANTHROPIC_BASE_URL" "$CONFIG_FILE" > "$temp_file"
    mv "$temp_file" "$CONFIG_FILE"
fi

# 添加新配置
{
    echo ""
    echo "# Anthropic API Configuration - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "export ANTHROPIC_AUTH_TOKEN=\"$auth_token\""
    echo "export ANTHROPIC_BASE_URL=\"https://api.jiuwanliguoxue.com/\""
} >> "$CONFIG_FILE"

echo "✓ 配置已写入 ${CONFIG_FILE/#$HOME/~}"

# 6. 加载环境变量
echo "正在加载环境变量..."
source "$CONFIG_FILE"

# 验证配置
if [ -n "$ANTHROPIC_AUTH_TOKEN" ] && [ -n "$ANTHROPIC_BASE_URL" ]; then
    echo "✅ 环境变量配置成功！"
    echo ""
    echo "📊 当前配置:"
    echo "   ANTHROPIC_BASE_URL: $ANTHROPIC_BASE_URL"
    echo "   ANTHROPIC_AUTH_TOKEN: ${ANTHROPIC_AUTH_TOKEN:0:12}...(已隐藏)"
    echo ""
    echo "🎉 配置完成！"
    echo ""
    
    # 7. 询问是否更新Claude Code客户端
    echo "🚀 是否要更新Claude Code客户端到最新版本？"
    read -p "这将执行: npm uninstall/install -g @anthropic-ai/claude-code (y/N): " update_claude
    
    if [[ "$update_claude" =~ ^[Yy]$ ]]; then
        echo "检查npm环境..."
        if command -v npm >/dev/null 2>&1; then
            echo "✓ npm已安装"
            echo ""
            echo "🔄 正在更新Claude Code客户端..."
            
            echo "步骤1: 卸载旧版本..."
            npm uninstall -g @anthropic-ai/claude-code
            
            echo "步骤2: 安装最新版本..."
            if npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com; then
                echo "✅ Claude Code客户端更新成功！"
            else
                echo "❌ Claude Code客户端安装失败，请手动执行："
                echo "   npm install -g @anthropic-ai/claude-code --registry=https://registry.npmmirror.com"
            fi
        else
            echo "❌ 未找到npm，请先安装Node.js"
            echo "   下载地址: https://nodejs.org/"
        fi
        echo ""
    fi
    
# 显示配置完成横幅
show_complete_banner() {
    printf "\n"
    printf "${colorBright}${colorRed}   █████╗ ██╗  ${colorBlue}██████╗ ██████╗ ██████╗ ███████╗${colorMagenta} ██╗    ██╗██╗████████╗██╗  ██╗${colorReset}\n"
    printf "${colorBright}${colorRed}  ██╔══██╗██║ ${colorBlue}██╔════╝██╔═══██╗██╔══██╗██╔════╝${colorMagenta} ██║    ██║██║╚══██╔══╝██║  ██║${colorReset}\n"
    printf "${colorBright}${colorRed}  ███████║██║ ${colorBlue}██║     ██║   ██║██║  ██║█████╗  ${colorMagenta} ██║ █╗ ██║██║   ██║   ███████║${colorReset}\n"
    printf "${colorBright}${colorRed}  ██╔══██║██║ ${colorBlue}██║     ██║   ██║██║  ██║██╔══╝  ${colorMagenta} ██║███╗██║██║   ██║   ██╔══██║${colorReset}\n"
    printf "${colorBright}${colorRed}  ██║  ██║██║ ${colorBlue}╚██████╗╚██████╔╝██████╔╝███████╗${colorMagenta} ╚███╔███╔╝██║   ██║██╗██║  ██║${colorReset}\n"
    printf "${colorBright}${colorRed}  ╚═╝  ╚═╝╚═╝ ${colorBlue} ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝${colorMagenta}  ╚══╝╚══╝ ╚═╝   ╚═╝╚═╝╚═╝  ╚═╝${colorReset}\n"
    printf "\n"
    printf "${colorBright}${colorYellow}📌 请执行以下命令使配置立即生效：${colorReset}\n"
    printf "${colorBright}${colorCyan}   source ${CONFIG_FILE/#$HOME/~}${colorReset}\n"
    printf "\n"
    printf "${colorBright}${colorGreen}🔄 或者重启终端让配置自动生效${colorReset}\n"
    printf "\n"
}

    show_complete_banner
    echo ""
    echo "🔧 如需修改配置，可编辑: ${CONFIG_FILE/#$HOME/~}"
else
    echo "❌ 配置验证失败，请检查："
    echo "   1. 配置文件是否正确写入"
    echo "   2. API密钥是否有效"
    exit 1
fi