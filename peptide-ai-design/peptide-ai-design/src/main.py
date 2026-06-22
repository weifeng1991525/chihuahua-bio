#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
main.py - 多肽AI辅助设计技能主入口
输入需求描述，生成专业docx设计方案
"""

import os
import sys
import json
import argparse
from datetime import datetime

# 添加src目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analyzer import PeptideAnalyzer
from report_builder import PeptideReportBuilder


def main():
    parser = argparse.ArgumentParser(description="多肽AI辅助设计 - 生成专业docx方案")
    parser.add_argument("query", help="多肽设计需求描述，例如：'合成10mg纯度95%的RKKRRQRRR穿膜肽，N端FITC标记'")
    parser.add_argument("--output", "-o", default="./output", help="输出目录")
    parser.add_argument("--json", "-j", action="store_true", help="同时输出JSON数据文件")
    parser.add_argument("--client", "-c", default="客户", help="客户名称")
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("多肽AI辅助设计方案生成系统")
    print("=" * 60)
    print(f"需求: {args.query}")
    print(f"输出目录: {args.output}")
    print("-" * 60)
    
    # 1. 分析需求
    print("[1/3] 正在分析需求...")
    kb_path = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base.json")
    analyzer = PeptideAnalyzer(knowledge_base_path=kb_path)
    report_data = analyzer.analyze(args.query)
    
    # 设置客户名称
    report_data["project_info"]["client"] = args.client
    
    print("[2/3] 需求分析完成，正在生成报告...")
    
    # 2. 生成DOCX报告
    os.makedirs(args.output, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    docx_path = os.path.join(args.output, f"多肽设计方案_{timestamp}.docx")
    
    builder = PeptideReportBuilder()
    builder.build(report_data, docx_path)
    
    # 3. 可选：输出JSON
    if args.json:
        json_path = os.path.join(args.output, f"多肽设计方案_{timestamp}.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        print(f"[3/3] JSON数据已保存: {json_path}")
    
    print("-" * 60)
    print(f"方案生成完成!")
    print(f"DOCX报告: {docx_path}")
    print("=" * 60)
    
    return docx_path


if __name__ == "__main__":
    main()
