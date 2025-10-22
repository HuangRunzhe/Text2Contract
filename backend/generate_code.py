#!/usr/bin/env python3
"""
激活码生成脚本
用于为购买用户生成激活码
"""

import json
import os
import secrets
import string
from datetime import datetime

ACTIVATION_CODES_FILE = "activation_codes.json"

def load_activation_codes():
    """加载激活码数据"""
    if not os.path.exists(ACTIVATION_CODES_FILE):
        return {}
    try:
        with open(ACTIVATION_CODES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {}

def save_activation_codes(codes_data):
    """保存激活码数据"""
    with open(ACTIVATION_CODES_FILE, 'w', encoding='utf-8') as f:
        json.dump(codes_data, f, ensure_ascii=False, indent=2)

def generate_random_code(length=16):
    """生成随机激活码"""
    # 使用大写字母和数字，每4位用-分隔
    chars = string.ascii_uppercase + string.digits
    parts = []
    for _ in range(4):
        part = ''.join(secrets.choice(chars) for _ in range(4))
        parts.append(part)
    return '-'.join(parts)

def create_activation_code(code_type='basic', custom_code=None, note=''):
    """
    创建激活码
    
    参数:
        code_type: 'basic' (20次) 或 'pro' (无限次)
        custom_code: 自定义激活码（可选）
        note: 备注信息
    """
    codes_data = load_activation_codes()
    
    # 生成或使用自定义激活码
    code = custom_code if custom_code else generate_random_code()
    
    # 检查激活码是否已存在
    if code in codes_data:
        print(f"❌ 激活码已存在: {code}")
        return None
    
    # 设置激活码信息
    if code_type == 'pro':
        code_info = {
            "type": "pro",
            "remaining_uses": -1,  # -1 表示无限次
            "created_date": datetime.now().isoformat(),
            "expire_date": None,
            "note": note or "专业套餐 - 无限次使用"
        }
    else:  # basic
        code_info = {
            "type": "basic",
            "remaining_uses": 20,
            "created_date": datetime.now().isoformat(),
            "expire_date": None,
            "note": note or "基础套餐 - 20次使用"
        }
    
    # 保存激活码
    codes_data[code] = code_info
    save_activation_codes(codes_data)
    
    print(f"✅ 激活码创建成功!")
    print(f"激活码: {code}")
    print(f"类型: {code_info['type']}")
    print(f"剩余次数: {'无限' if code_info['remaining_uses'] == -1 else code_info['remaining_uses']}")
    print(f"备注: {code_info['note']}")
    
    return code

def list_activation_codes():
    """列出所有激活码"""
    codes_data = load_activation_codes()
    
    if not codes_data:
        print("📋 暂无激活码")
        return
    
    print(f"\n📋 激活码列表 (共 {len(codes_data)} 个):\n")
    print(f"{'激活码':<20} {'类型':<10} {'剩余次数':<12} {'备注':<30}")
    print("-" * 80)
    
    for code, info in codes_data.items():
        remaining = '无限' if info.get('remaining_uses', 0) == -1 else str(info.get('remaining_uses', 0))
        code_type = info.get('type', 'unknown')
        note = info.get('note', '')
        print(f"{code:<20} {code_type:<10} {remaining:<12} {note:<30}")

def delete_activation_code(code):
    """删除激活码"""
    codes_data = load_activation_codes()
    
    if code not in codes_data:
        print(f"❌ 激活码不存在: {code}")
        return False
    
    del codes_data[code]
    save_activation_codes(codes_data)
    print(f"✅ 激活码已删除: {code}")
    return True

if __name__ == "__main__":
    import sys
    
    print("=" * 80)
    print("激活码管理系统")
    print("=" * 80)
    
    if len(sys.argv) < 2:
        print("\n使用方法:")
        print("  python generate_code.py create basic [自定义码] [备注]  # 创建基础套餐激活码(20次)")
        print("  python generate_code.py create pro [自定义码] [备注]    # 创建专业套餐激活码(无限次)")
        print("  python generate_code.py list                           # 列出所有激活码")
        print("  python generate_code.py delete <激活码>                # 删除指定激活码")
        print("\n示例:")
        print("  python generate_code.py create basic                   # 生成随机基础激活码")
        print("  python generate_code.py create pro CUSTOM-CODE-2024   # 生成自定义专业激活码")
        print("  python generate_code.py list                           # 查看所有激活码")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "create":
        if len(sys.argv) < 3:
            print("❌ 请指定套餐类型: basic 或 pro")
            sys.exit(1)
        
        code_type = sys.argv[2]
        if code_type not in ['basic', 'pro']:
            print("❌ 套餐类型必须是 basic 或 pro")
            sys.exit(1)
        
        custom_code = sys.argv[3] if len(sys.argv) > 3 else None
        note = sys.argv[4] if len(sys.argv) > 4 else ''
        
        create_activation_code(code_type, custom_code, note)
    
    elif command == "list":
        list_activation_codes()
    
    elif command == "delete":
        if len(sys.argv) < 3:
            print("❌ 请指定要删除的激活码")
            sys.exit(1)
        
        code = sys.argv[2]
        delete_activation_code(code)
    
    else:
        print(f"❌ 未知命令: {command}")
        print("可用命令: create, list, delete")
        sys.exit(1)

