#!/usr/bin/env python3
"""
显示预设的5篇减脂科学知识
"""

# 从RAG知识库管理器导入预设知识
import sys
import os
sys.path.append('backend/ai-service')

try:
    from rag_knowledge_manager import PRESET_KNOWLEDGE
except ImportError:
    print("❌ 无法导入预设知识，请确保在项目根目录运行")
    sys.exit(1)

def show_preset_knowledge():
    """显示所有预设的科学知识"""
    print("📚 BodyMind AI 预设科学知识库")
    print("=" * 60)
    print(f"总共包含 {len(PRESET_KNOWLEDGE)} 篇科学研究文档\n")
    
    for i, knowledge in enumerate(PRESET_KNOWLEDGE, 1):
        print(f"📄 文档 {i}: {knowledge['title']}")
        print(f"📅 来源: {knowledge['source']}")
        print(f"📖 内容预览:")
        
        # 显示内容的前200个字符
        content_preview = knowledge['content'].strip()
        if len(content_preview) > 200:
            content_preview = content_preview[:200] + "..."
        
        # 按行显示，每行前面加上缩进
        for line in content_preview.split('\n'):
            if line.strip():
                print(f"   {line.strip()}")
        
        print(f"\n   📊 完整内容长度: {len(knowledge['content'])} 字符")
        print("-" * 60)
        print()

def show_knowledge_topics():
    """显示知识库涵盖的主题"""
    topics = []
    for knowledge in PRESET_KNOWLEDGE:
        title = knowledge['title']
        if "热量" in title or "缺口" in title:
            topics.append("🔥 热量缺口原理")
        elif "蛋白质" in title:
            topics.append("🥩 蛋白质营养学")
        elif "力量训练" in title:
            topics.append("💪 力量训练科学")
        elif "HIIT" in title or "有氧" in title:
            topics.append("🏃 有氧运动对比")
        elif "平台期" in title:
            topics.append("📈 减脂平台期")
    
    print("🎯 涵盖的主要科学主题:")
    print("=" * 30)
    for topic in set(topics):
        print(f"  • {topic}")
    print()

def search_by_keyword(keyword):
    """按关键词搜索预设知识"""
    print(f"🔍 搜索关键词: '{keyword}'")
    print("=" * 40)
    
    found = False
    for i, knowledge in enumerate(PRESET_KNOWLEDGE, 1):
        if (keyword.lower() in knowledge['title'].lower() or 
            keyword.lower() in knowledge['content'].lower()):
            print(f"📄 匹配文档 {i}: {knowledge['title']}")
            
            # 查找包含关键词的段落
            paragraphs = knowledge['content'].split('\n\n')
            for para in paragraphs:
                if keyword.lower() in para.lower():
                    print(f"   📝 相关内容: {para.strip()[:150]}...")
                    break
            print()
            found = True
    
    if not found:
        print(f"❌ 未找到包含 '{keyword}' 的内容")
        print("💡 可尝试的关键词: 蛋白质, HIIT, 热量, 平台期, 力量训练")

def main():
    """主函数"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "search" and len(sys.argv) > 2:
            keyword = sys.argv[2]
            search_by_keyword(keyword)
        elif command == "topics":
            show_knowledge_topics()
        elif command == "help":
            print("使用方法:")
            print("  python3 show_preset_knowledge.py              # 显示所有预设知识")
            print("  python3 show_preset_knowledge.py topics       # 显示涵盖的主题")
            print("  python3 show_preset_knowledge.py search 关键词 # 搜索特定内容")
            print("  python3 show_preset_knowledge.py help         # 显示帮助")
        else:
            show_preset_knowledge()
    else:
        show_preset_knowledge()
        show_knowledge_topics()
        
        print("💡 使用提示:")
        print("  python3 show_preset_knowledge.py search 蛋白质   # 搜索蛋白质相关内容")
        print("  python3 show_preset_knowledge.py topics         # 查看主题分类")

if __name__ == "__main__":
    main()