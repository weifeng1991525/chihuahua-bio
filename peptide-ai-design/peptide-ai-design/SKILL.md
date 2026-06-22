---
name: peptide-ai-design
description: "多肽AI辅助设计技能。输入多肽合成/修饰/定制需求，自动生成专业docx设计方案。触发词：多肽合成、多肽修饰、多肽定制、多肽设计、peptide synthesis、peptide modification。"
metadata:
  short-description: 多肽AI辅助设计
  language: zh
  startup-target: under-5-min
  category: 生物医学与多肽工程
---

<!-- ROUTING-CARD:START -->
## 技能路由卡片

- 技能名称：`peptide-ai-design`
- 展示名称：多肽AI辅助设计
- 技能类型：入口技能
- 分类：生物医学与多肽工程
- 入口脚本：`src/main.py`
- 适用任务：多肽合成方案设计、多肽修饰方案设计、多肽定制服务方案生成
- 避免误调：如果任务是蛋白质结构预测或分子动力学模拟，优先用 bioinformatics-best-practices

### 高命中关键词
`多肽合成`、`多肽修饰`、`多肽定制`、`多肽设计`、`peptide synthesis`、`peptide modification`、`固相合成`、`Fmoc`、`多肽标记`、`环肽`、`穿膜肽`

### 最佳简短提示词
```text
请使用 $peptide-ai-design，设计一个10mg的RKKRRQRRR穿膜肽合成方案，N端FITC标记，纯度95%。
```

### 标准提示词模板
```text
请使用 $peptide-ai-design 执行任务。
任务目标：根据多肽需求生成专业设计方案docx文档。
输入资料：多肽序列、修饰要求、需求量、纯度要求等。
输出要求：专业docx方案，包含合成/修饰/质控/报价等内容。
质量标准：格式规范、内容专业、可直接交付客户。
约束条件：中文宋体小四/英文Times New Roman小四/1.5倍行距。
```

### 最小输入 / 主要输出
- 最小输入：多肽设计需求描述（自然语言）
- 主要输出：专业docx设计方案文档
<!-- ROUTING-CARD:END -->

# 多肽AI辅助设计技能 v1.0

## When To Use

当用户需要以下服务时激活本技能：
- 多肽合成方案设计（固相合成SPPS、液相合成、重组表达）
- 多肽修饰方案设计（N端/C端/侧链修饰、荧光标记、PEG化、环化等）
- 多肽定制服务方案生成（可直接交付客户的正式方案）
- 多肽理化性质分析（分子量、等电点、疏水性、溶解性预测）

Chinese triggers: `多肽合成`、`多肽修饰`、`多肽定制`、`多肽设计`、`固相合成`、`Fmoc合成`、`多肽标记`、`环肽设计`、`穿膜肽`、`订书肽`。

## Quick Start

```bash
# 基础用法
python src/main.py "合成10mg纯度95%的RKKRRQRRR穿膜肽，N端FITC标记"

# 指定输出目录
python src/main.py "环肽c(CRGDC)合成，10mg，98%纯度" -o ./output

# 指定客户名称
python src/main.py "乙酰化修饰的多肽合成" -c "XX生物公司"

# 同时输出JSON数据
python src/main.py "生物素化多肽定制" --json
```

## Required Inputs

- `query` (required): 多肽设计需求描述，支持自然语言
  - 可包含：序列、长度、修饰类型、需求量、纯度、特殊要求等
- `--output` (optional): 输出目录，默认 `./output`
- `--client` (optional): 客户名称，默认 "客户"
- `--json` (optional): 同时输出JSON数据文件

## Main Entry Points

- 标准运行: `python src/main.py "<需求描述>"`
- 指定客户: `python src/main.py "<需求>" -c "客户名称"`
- 完整输出: `python src/main.py "<需求>" --json -o ./output`

## Outputs

- `output/多肽设计方案_YYYYMMDD_HHMMSS.docx`: 专业设计方案文档
- `output/多肽设计方案_YYYYMMDD_HHMMSS.json` (可选): 结构化数据

## 文档格式规范

- **中文字体**：宋体，小四号（12pt）
- **英文字体**：Times New Roman，小四号（12pt）
- **标题字体**：黑体
- **行间距**：1.5倍
- **段前段后**：0
- **首行缩进**：2字符
- **页边距**：上下2.54cm，左右3.17cm
- **页眉**：多肽AI辅助设计方案
- **页脚**：页码
- **字体颜色**：黑色（正文）

## 报告章节结构

1. 封面（项目标题、编号、客户信息）
2. 项目概述（背景、目标、原则）
3. 需求分析（功能/技术/约束）
4. 多肽设计方案（序列、理化参数、设计原理）
5. 合成方案（策略、方法、步骤、纯化）
6. 修饰方案（修饰类型、位置、步骤）
7. 质量控制方案（检测项目、标准）
8. 项目周期与报价
9. 风险评估与建议
10. 附录（术语表、参考文献、免责声明）

## 专业知识库覆盖

### 合成方法
- 固相多肽合成（SPPS）：Fmoc/Boc策略、树脂选择、偶联试剂
- 液相多肽合成（LPPS）
- 重组表达合成

### 修饰类型
- N端修饰：乙酰化、生物素化、FITC/Cy3/Cy5标记、PEG化、脂肪酸偶联
- C端修饰：酰胺化、AFC/pNA、CMK/CHO
- 侧链修饰：磷酸化、乙酰化、甲基化、泛素化、糖基化、二硫键、环化、D型氨基酸、N-甲基化、订书肽
- 同位素标记、非天然氨基酸

### 设计原则
- 稳定性优化、细胞通透性、靶点结合、免疫原性控制、溶解性优化

### 质量控制
- HPLC、LC-MS/ESI-MS、MALDI-TOF、AAA、Edman降解、CD、NMR、SPR/BLI、ITC

## 文件结构

```
peptide-ai-design/
├── SKILL.md                    # 技能描述文件
├── data/
│   └── knowledge_base.json     # 多肽专业知识库
├── src/
│   ├── main.py                 # 主入口
│   ├── analyzer.py             # 需求分析器
│   ├── report_builder.py       # DOCX报告构建器
│   └── docx_utils.py           # DOCX格式工具
└── output/                     # 输出目录
```

## 依赖

- python-docx >= 0.8.11
- Python >= 3.8

## 注意事项

- 本技能生成的方案为技术参考方案，实际合成以实验数据为准
- 报价为估算价格，实际价格以商务确认为准
- 序列分析基于简化算法，精确计算请使用专业软件
