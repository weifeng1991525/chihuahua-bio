#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
analyzer.py - 多肽需求分析器
基于用户输入进行专业分析，生成设计方案JSON
"""

import json
import os
import re
from typing import Dict, Any, List, Optional
from datetime import datetime


class PeptideAnalyzer:
    """多肽需求分析器"""

    def __init__(self, knowledge_base_path: str = None):
        self.kb = self._load_knowledge_base(knowledge_base_path)
        self.aa_props = self.kb.get("calculator_data", {}).get("amino_acid_properties", {})
        self.mod_masses = self.kb.get("calculator_data", {}).get("modification_masses", {})

    def _load_knowledge_base(self, path: str = None) -> Dict:
        """加载知识库"""
        if path is None:
            path = os.path.join(os.path.dirname(__file__), "..", "data", "knowledge_base.json")
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def analyze(self, query: str) -> Dict[str, Any]:
        """
        分析用户需求，生成完整的设计方案

        Args:
            query: 用户输入的需求描述

        Returns:
            完整的设计方案字典
        """
        print(f"  [分析] 正在分析需求: {query}")

        # 1. 解析需求
        parsed = self._parse_requirements(query)

        # 2. 生成项目信息
        project_info = self._generate_project_info(parsed)

        # 3. 生成项目概述
        overview = self._generate_overview(parsed)

        # 4. 生成需求分析
        requirements = self._generate_requirements(parsed)

        # 5. 设计多肽
        peptide_designs = self._design_peptides(parsed)

        # 6. 生成合成方案
        synthesis = self._generate_synthesis_plan(parsed, peptide_designs)

        # 7. 生成修饰方案
        modifications = self._generate_modifications(parsed, peptide_designs)

        # 8. 生成质控方案
        quality_control = self._generate_qc_plan(parsed)

        # 9. 生成时间线和报价
        timeline = self._generate_timeline(parsed, peptide_designs, modifications)
        pricing = self._generate_pricing(parsed, peptide_designs, modifications)

        # 10. 风险评估和建议
        risks = self._generate_risks(parsed, peptide_designs)
        suggestions = self._generate_suggestions(parsed, peptide_designs)

        # 11. 附录
        appendix = self._generate_appendix()

        return {
            "project_info": project_info,
            "overview": overview,
            "requirements": requirements,
            "peptide_designs": peptide_designs,
            "synthesis": synthesis,
            "modifications": modifications,
            "quality_control": quality_control,
            "timeline": timeline,
            "pricing": pricing,
            "risks": risks,
            "suggestions": suggestions,
            "appendix": appendix
        }

    def _parse_requirements(self, query: str) -> Dict[str, Any]:
        """解析用户需求"""
        parsed = {
            "original_query": query,
            "peptide_type": self._detect_peptide_type(query),
            "sequence": self._extract_sequence(query),
            "length": self._extract_length(query),
            "modifications": self._extract_modifications(query),
            "applications": self._detect_applications(query),
            "quantity": self._extract_quantity(query),
            "purity": self._extract_purity(query),
            "special_requirements": self._extract_special_requirements(query)
        }
        return parsed

    def _detect_peptide_type(self, query: str) -> str:
        """检测多肽类型"""
        query_lower = query.lower()
        if any(kw in query_lower for kw in ["环肽", "cycl", "环化"]):
            return "cyclic_peptide"
        elif any(kw in query_lower for kw in ["订书", "staple"]):
            return "stapled_peptide"
        elif any(kw in query_lower for kw in ["穿膜", "cpp", "cell penetrating"]):
            return "cell_penetrating_peptide"
        elif any(kw in query_lower for kw in ["抗菌", "antimicrobial", "amp"]):
            return "antimicrobial_peptide"
        elif any(kw in query_lower for kw in ["抗原", "表位", "epitope"]):
            return "epitope_peptide"
        elif any(kw in query_lower for kw in ["荧光", "标记", "label", "fluor"]):
            return "labeled_peptide"
        else:
            return "linear_peptide"

    def _extract_sequence(self, query: str) -> Optional[str]:
        """提取氨基酸序列"""
        # 匹配标准单字母代码序列
        pattern = r'[ACDEFGHIKLMNPQRSTVWY]{5,}'
        match = re.search(pattern, query.upper().replace(" ", ""))
        if match:
            return match.group(0)
        return None

    def _extract_length(self, query: str) -> Optional[int]:
        """提取长度要求"""
        patterns = [
            r'(\d+)\s*个氨基酸',
            r'(\d+)\s*aa',
            r'长度\s*(\d+)',
            r'(\d+)\s*mer',
        ]
        for pattern in patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                return int(match.group(1))
        return None

    def _extract_modifications(self, query: str) -> List[Dict]:
        """提取修饰要求"""
        mods = []
        query_lower = query.lower()

        mod_keywords = {
            "乙酰化": {"name": "Acetylation", "type": "N-terminal", "mass_shift": 42.01},
            "酰胺化": {"name": "Amidation", "type": "C-terminal", "mass_shift": -0.98},
            "生物素": {"name": "Biotinylation", "type": "N-terminal", "mass_shift": 226.08},
            "荧光素": {"name": "FITC labeling", "type": "N-terminal", "mass_shift": 389.38},
            "磷酸化": {"name": "Phosphorylation", "type": "side-chain", "mass_shift": 79.98},
            "甲基化": {"name": "Methylation", "type": "side-chain", "mass_shift": 14.02},
            "泛素化": {"name": "Ubiquitination", "type": "side-chain", "mass_shift": 114.04},
            "二硫键": {"name": "Disulfide bond", "type": "cyclization", "mass_shift": -2.02},
            "环化": {"name": "Cyclization", "type": "cyclization", "mass_shift": -18.02},
            "peg": {"name": "PEGylation", "type": "N-terminal", "mass_shift": 0},
            "棕榈酰": {"name": "Palmitoylation", "type": "N-terminal", "mass_shift": 238.41},
        }

        for keyword, mod_info in mod_keywords.items():
            if keyword in query_lower:
                mods.append(mod_info)

        return mods

    def _detect_applications(self, query: str) -> List[str]:
        """检测应用领域"""
        apps = []
        query_lower = query.lower()

        app_keywords = {
            "治疗": "therapeutic",
            "药物": "therapeutic",
            "诊断": "diagnostic",
            "检测": "diagnostic",
            "研究": "research",
            "工具": "research",
            "疫苗": "vaccine",
            "免疫": "vaccine",
            "化妆品": "cosmetic",
            "美容": "cosmetic",
        }

        for keyword, app in app_keywords.items():
            if keyword in query_lower:
                apps.append(app)

        if not apps:
            apps.append("research")

        return apps

    def _extract_quantity(self, query: str) -> str:
        """提取需求量"""
        patterns = [
            r'(\d+(?:\.\d+)?)\s*(mg|g|kg|ug)',
            r'量[:：]\s*(\d+(?:\.\d+)?)\s*(mg|g|kg|ug)',
        ]
        for pattern in patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                return f"{match.group(1)}{match.group(2)}"
        return "10mg"

    def _extract_purity(self, query: str) -> str:
        """提取纯度要求"""
        patterns = [
            r'(\d+)%\s*纯度',
            r'纯度[:：]\s*(\d+)%',
            r'(\d+)%\s*purity',
            r'purity[:：]\s*(\d+)%',
        ]
        for pattern in patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                return f"{match.group(1)}%"
        return "95%"

    def _extract_special_requirements(self, query: str) -> List[str]:
        """提取特殊要求"""
        specials = []
        query_lower = query.lower()

        if any(kw in query_lower for kw in ["gmp", "药典"]):
            specials.append("GMP级别")
        if any(kw in query_lower for kw in ["内毒素", "endotoxin"]):
            specials.append("低内毒素")
        if any(kw in query_lower for kw in ["无菌", "sterile"]):
            specials.append("无菌处理")
        if any(kw in query_lower for kw in ["冻干", "lyophilized"]):
            specials.append("冻干交付")

        return specials

    def _generate_project_info(self, parsed: Dict) -> Dict[str, str]:
        """生成项目信息"""
        now = datetime.now()
        return {
            "title": "多肽AI辅助设计方案",
            "title_en": "Peptide AI-Assisted Design Proposal",
            "project_id": f"PAD-{now.strftime('%Y%m%d')}-{now.strftime('%H%M')}",
            "date": now.strftime("%Y年%m月%d日"),
            "client": "客户",
            "version": "V1.0",
            "confidentiality": "机密"
        }

    def _generate_overview(self, parsed: Dict) -> Dict[str, Any]:
        """生成项目概述"""
        peptide_type = parsed.get("peptide_type", "linear_peptide")
        applications = parsed.get("applications", ["research"])

        type_descriptions = {
            "cyclic_peptide": "环肽设计项目，通过头尾环化或二硫键环化提高多肽的稳定性和靶点亲和力。",
            "stapled_peptide": "订书肽设计项目，通过烯烃复分解反应稳定alpha-螺旋构象，增强蛋白-蛋白相互作用。",
            "cell_penetrating_peptide": "穿膜肽设计项目，优化细胞摄取效率，适用于胞内靶点递送。",
            "antimicrobial_peptide": "抗菌肽设计项目，优化抗菌谱和选择性，降低细胞毒性。",
            "epitope_peptide": "表位肽设计项目，用于免疫学研究和疫苗开发。",
            "labeled_peptide": "标记多肽设计项目，用于成像、检测和示踪研究。",
            "linear_peptide": "线性多肽设计项目，根据目标功能优化序列和理化性质。"
        }

        background = type_descriptions.get(peptide_type, type_descriptions["linear_peptide"])

        objectives = [
            "设计符合功能需求的多肽序列",
            "优化多肽的理化性质和稳定性",
            "制定可行的合成和修饰方案",
            "确保产品质量符合应用要求"
        ]

        principles = [
            "序列设计遵循结构-活性关系(SAR)原则",
            "优先选择成熟的合成策略和偶联试剂",
            "充分考虑多肽的溶解性、稳定性和生物活性",
            "质量控制覆盖合成、纯化和分析全过程"
        ]

        return {
            "background": background,
            "objectives": objectives,
            "principles": principles
        }

    def _generate_requirements(self, parsed: Dict) -> Dict[str, Any]:
        """生成需求分析"""
        functional = [
            f"多肽类型: {parsed.get('peptide_type', 'linear_peptide')}",
            f"氨基酸序列: {parsed.get('sequence', '待设计') or '待设计'}",
            f"需求量: {parsed.get('quantity', '10mg')}",
            f"纯度要求: {parsed.get('purity', '95%')}"
        ]

        technical = [
            "固相多肽合成(SPPS)技术",
            "高效液相色谱(HPLC)纯化",
            "质谱(MS)分子量确认"
        ]

        if parsed.get("modifications"):
            technical.append("定点化学修饰技术")

        constraints = parsed.get("special_requirements", [])
        if not constraints:
            constraints.append("无特殊约束")

        summary_table = [
            ["多肽类型", parsed.get("peptide_type", "linear_peptide"), "高", ""],
            ["需求量", parsed.get("quantity", "10mg"), "高", ""],
            ["纯度", parsed.get("purity", "95%"), "高", ""],
            ["修饰", ", ".join([m["name"] for m in parsed.get("modifications", [])]) or "无", "中", ""],
            ["特殊要求", ", ".join(parsed.get("special_requirements", [])) or "无", "中", ""]
        ]

        return {
            "functional": functional,
            "technical": technical,
            "constraints": constraints,
            "summary_table": summary_table
        }

    def _design_peptides(self, parsed: Dict) -> List[Dict]:
        """设计多肽序列"""
        designs = []
        sequence = parsed.get("sequence")

        if sequence:
            # 用户提供序列，进行分析
            design = self._analyze_sequence(sequence)
            design["name"] = "客户定制多肽"
            design["design_rationale"] = "基于客户提供的序列进行理化性质分析和优化建议。"
            designs.append(design)
        else:
            # 根据类型生成示例设计
            if parsed.get("peptide_type") == "cell_penetrating_peptide":
                designs.append(self._design_cpp())
            elif parsed.get("peptide_type") == "cyclic_peptide":
                designs.append(self._design_cyclic_peptide())
            else:
                designs.append(self._design_default_peptide())

        return designs

    def _analyze_sequence(self, sequence: str) -> Dict[str, Any]:
        """分析给定序列的理化性质"""
        length = len(sequence)
        mw = self._calculate_mw(sequence)
        pi = self._calculate_pi(sequence)
        net_charge = self._calculate_net_charge(sequence, 7.0)
        hydrophobicity = self._calculate_hydrophobicity(sequence)
        solubility_advice = self._predict_solubility(sequence)

        return {
            "name": "",
            "sequence": sequence,
            "length": length,
            "molecular_weight": mw,
            "pi": pi,
            "net_charge": net_charge,
            "hydrophobicity": hydrophobicity,
            "solubility_advice": solubility_advice,
            "structure_features": [
                f"序列长度: {length}个氨基酸",
                f"理论分子量: {mw:.2f} Da",
                f"等电点: {pi:.2f}",
                f"生理pH净电荷: {net_charge:+.0f}"
            ],
            "expected_properties": [
                "建议溶解于无菌水或缓冲液",
                "避免反复冻融",
                "建议分装保存于-20°C"
            ]
        }

    def _design_cpp(self) -> Dict[str, Any]:
        """设计穿膜肽示例"""
        sequence = "RKKRRQRRR"
        return {
            "name": "TAT衍生穿膜肽",
            "sequence": sequence,
            "length": len(sequence),
            "molecular_weight": self._calculate_mw(sequence),
            "pi": self._calculate_pi(sequence),
            "net_charge": self._calculate_net_charge(sequence, 7.0),
            "hydrophobicity": self._calculate_hydrophobicity(sequence),
            "solubility_advice": "溶于无菌水，终浓度1-10 mg/mL",
            "design_rationale": "基于HIV-1 TAT蛋白转导域(47-57)设计的经典穿膜肽，富含精氨酸残基，具有高效的细胞摄取能力。",
            "structure_features": [
                "富含阳离子氨基酸(Arg)",
                "两亲性结构",
                "无规卷曲构象"
            ],
            "expected_properties": [
                "高效细胞摄取",
                "适用于携带货物入胞",
                "低细胞毒性"
            ]
        }

    def _design_cyclic_peptide(self) -> Dict[str, Any]:
        """设计环肽示例"""
        sequence = "c(CRGDC)"
        return {
            "name": "RGD环肽",
            "sequence": sequence,
            "length": 5,
            "molecular_weight": 578.62,
            "pi": 5.5,
            "net_charge": 0,
            "hydrophobicity": -0.5,
            "solubility_advice": "溶于10% DMSO/PBS",
            "design_rationale": "通过头尾环化稳定RGD构象，增强与整合素受体的结合亲和力。",
            "structure_features": [
                "头尾酰胺键环化",
                "RGD药效团暴露",
                "构象限制"
            ],
            "expected_properties": [
                "增强整合素结合",
                "提高蛋白酶稳定性",
                "改善药代动力学"
            ]
        }

    def _design_default_peptide(self) -> Dict[str, Any]:
        """设计默认多肽"""
        sequence = "Gly-Ala-Val-Leu-Ile"
        return {
            "name": "示例多肽",
            "sequence": sequence,
            "length": 5,
            "molecular_weight": 443.55,
            "pi": 6.0,
            "net_charge": 0,
            "hydrophobicity": 2.5,
            "solubility_advice": "溶于含10%乙腈的水溶液",
            "design_rationale": "示例多肽序列，请根据具体需求提供目标序列。",
            "structure_features": [
                "疏水性序列",
                "中性电荷"
            ],
            "expected_properties": [
                "需优化溶解性",
                "建议添加亲水标签"
            ]
        }

    def _calculate_mw(self, sequence: str) -> float:
        """计算分子量"""
        mw = 18.015  # 水分子
        for aa in sequence.upper():
            if aa in self.aa_props:
                mw += self.aa_props[aa]["mw"]
        return mw

    def _calculate_pi(self, sequence: str) -> float:
        """简化计算等电点"""
        # 简化计算：基于氨基酸pI的平均值
        pi_values = []
        for aa in sequence.upper():
            if aa in self.aa_props:
                pi_values.append(self.aa_props[aa]["pi"])
        return sum(pi_values) / len(pi_values) if pi_values else 7.0

    def _calculate_net_charge(self, sequence: str, ph: float) -> int:
        """计算净电荷"""
        charge = 0
        for aa in sequence.upper():
            if aa in self.aa_props:
                charge += self.aa_props[aa]["charge_at_ph7"]
        return round(charge)

    def _calculate_hydrophobicity(self, sequence: str) -> float:
        """计算平均疏水性"""
        values = []
        for aa in sequence.upper():
            if aa in self.aa_props:
                values.append(self.aa_props[aa]["hydrophobicity"])
        return sum(values) / len(values) if values else 0.0

    def _predict_solubility(self, sequence: str) -> str:
        """预测溶解性"""
        hydrophobic = sum(1 for aa in sequence.upper() if aa in "VILFMWY")
        if hydrophobic > len(sequence) * 0.5:
            return "建议溶于含10-30%有机溶剂(DMSO/ACN)的缓冲液"
        elif hydrophobic > len(sequence) * 0.3:
            return "建议溶于含5-10% DMSO的水溶液"
        else:
            return "可溶于无菌水或PBS缓冲液"

    def _generate_synthesis_plan(self, parsed: Dict, designs: List[Dict]) -> Dict[str, Any]:
        """生成合成方案"""
        sequence = designs[0].get("sequence", "") if designs else ""
        length = len(sequence) if sequence else 10

        # 根据长度选择策略
        if length <= 50:
            strategy = "采用Fmoc固相多肽合成(SPPS)策略，从C端向N端逐步偶联。"
            method_name = "Fmoc-SPPS"
            method_desc = "使用Rink Amide树脂或Wang树脂，HBTU/HOBt/DIEA偶联体系，20%哌啶/DMF脱保护。"
        else:
            strategy = "采用片段缩合策略，先合成多个短片段，再液相缩合得到全长多肽。"
            method_name = "片段缩合"
            method_desc = "SPPS合成片段 + 液相片段缩合，适用于长肽合成。"

        parameters = {
            "树脂": "Rink Amide MBHA Resin" if "酰胺" in str(parsed.get("modifications", [])) else "Wang Resin",
            "偶联试剂": "HBTU/HOBt/DIEA",
            "脱保护试剂": "20% Piperidine/DMF",
            "切割试剂": "TFA/TIS/H2O (95:2.5:2.5)",
            "合成规模": "0.1-0.5 mmol",
            "预期粗品纯度": "60-80%"
        }

        steps = [
            {"step_number": "1", "title": "树脂溶胀", "description": "将树脂置于DCM中溶胀30分钟，然后用DMF洗涤3次。"},
            {"step_number": "2", "title": "第一个氨基酸偶联", "description": "将C端氨基酸(3 eq)、HBTU(2.9 eq)、HOBt(3 eq)和DIEA(6 eq)溶于DMF，加入树脂反应1-2小时。"},
            {"step_number": "3", "title": "Fmoc脱保护", "description": "用20%哌啶/DMF处理树脂(5 min + 15 min)，去除Fmoc保护基。"},
            {"step_number": "4", "title": "氨基酸偶联循环", "description": "重复偶联-脱保护循环，逐步延长肽链。每步偶联后用Kaiser测试监测反应完全性。"},
            {"step_number": "5", "title": "切割与脱保护", "description": "用TFA切割混合液处理树脂2-4小时，将多肽从树脂上切割下来并去除侧链保护基。"},
            {"step_number": "6", "title": "沉淀与洗涤", "description": "将切割液滴入冰乙醚中沉淀多肽，离心收集沉淀，用乙醚洗涤3次。"},
            {"step_number": "7", "title": "溶解与冻干", "description": "将粗肽溶于适量水或乙腈/水混合液，冷冻干燥得到粗品。"}
        ]

        purification = {
            "method": "反相高效液相色谱(RP-HPLC)",
            "details": [
                "色谱柱: C18制备柱(250 x 21.2 mm, 10 um)",
                "流动相A: 0.1% TFA/水",
                "流动相B: 0.1% TFA/乙腈",
                "梯度: 5-65% B over 60 min",
                "检测: UV 214 nm",
                "收集主峰馏分，冻干得到纯品"
            ]
        }

        return {
            "strategy": strategy,
            "method": {"name": method_name, "description": method_desc},
            "parameters": parameters,
            "steps": steps,
            "purification": purification
        }

    def _generate_modifications(self, parsed: Dict, designs: List[Dict]) -> List[Dict]:
        """生成修饰方案"""
        mods = []
        user_mods = parsed.get("modifications", [])

        for mod in user_mods:
            mod_plan = {
                "name": mod["name"],
                "type": mod["type"],
                "position": self._determine_mod_position(mod["type"]),
                "purpose": self._get_mod_purpose(mod["name"]),
                "parameters": [
                    {"name": "修饰试剂", "value": self._get_mod_reagent(mod["name"])},
                    {"name": "反应条件", "value": self._get_mod_conditions(mod["name"])},
                    {"name": "预期产率", "value": "80-95%"}
                ],
                "steps": [
                    {"step_number": "1", "description": f"准备{mod['name']}修饰试剂"},
                    {"step_number": "2", "description": "在适当溶剂中溶解多肽"},
                    {"step_number": "3", "description": "加入修饰试剂，控制反应条件"},
                    {"step_number": "4", "description": "反应完成后纯化产物"}
                ]
            }
            mods.append(mod_plan)

        return mods

    def _determine_mod_position(self, mod_type: str) -> str:
        """确定修饰位置"""
        positions = {
            "N-terminal": "N端",
            "C-terminal": "C端",
            "side-chain": "侧链",
            "cyclization": "头尾/侧链"
        }
        return positions.get(mod_type, "待定")

    def _get_mod_purpose(self, mod_name: str) -> str:
        """获取修饰目的"""
        purposes = {
            "Acetylation": "封闭N端，提高抗外肽酶能力",
            "Amidation": "封闭C端，模拟天然C端",
            "Biotinylation": "用于亲和检测和纯化",
            "FITC labeling": "用于荧光检测和成像",
            "Phosphorylation": "用于信号通路研究",
            "Methylation": "用于表观遗传研究",
            "Ubiquitination": "用于蛋白降解研究",
            "Disulfide bond": "稳定构象，提高稳定性",
            "Cyclization": "限制构象，提高稳定性",
            "PEGylation": "提高半衰期，降低免疫原性",
            "Palmitoylation": "膜靶向，延长半衰期"
        }
        return purposes.get(mod_name, "功能优化")

    def _get_mod_reagent(self, mod_name: str) -> str:
        """获取修饰试剂"""
        reagents = {
            "Acetylation": "乙酸酐/DIEA",
            "Amidation": "树脂自带(Rink Amide)",
            "Biotinylation": "Biotin-OSu/DMSO",
            "FITC labeling": "FITC/DIEA/DMSO",
            "Phosphorylation": "磷酸化氨基酸单体",
            "Methylation": "甲基化氨基酸单体",
            "Ubiquitination": "泛素化试剂盒",
            "Disulfide bond": "空气氧化或DMSO氧化",
            "Cyclization": "PyBOP/HOBt/DIEA",
            "PEGylation": "mPEG-NHS",
            "Palmitoylation": "棕榈酸NHS酯"
        }
        return reagents.get(mod_name, "专用修饰试剂")

    def _get_mod_conditions(self, mod_name: str) -> str:
        """获取修饰反应条件"""
        conditions = {
            "Acetylation": "DMF, RT, 30 min",
            "Amidation": "树脂切割时自动获得",
            "Biotinylation": "DMSO/PBS, RT, 2h",
            "FITC labeling": "DMSO/DMF, 暗处反应, 2h",
            "Phosphorylation": "标准SPPS偶联",
            "Methylation": "标准SPPS偶联",
            "Ubiquitination": "酶催化, 37C, 2h",
            "Disulfide bond": "pH 8.0缓冲液, 空气氧化, 过夜",
            "Cyclization": "DMF, RT, 2-4h",
            "PEGylation": "PBS, RT, 2h",
            "Palmitoylation": "DMSO, RT, 2h"
        }
        return conditions.get(mod_name, "RT, 1-2h")

    def _generate_qc_plan(self, parsed: Dict) -> Dict[str, Any]:
        """生成质控方案"""
        strategy = "采用多维度分析策略，确保多肽的序列正确性、纯度和理化性质符合要求。"

        tests = [
            {"name": "HPLC纯度分析", "method": "RP-HPLC (C18, 214 nm)", "standard": f">= {parsed.get('purity', '95%')}", "purpose": "确认产品纯度"},
            {"name": "质谱分子量确认", "method": "ESI-MS或MALDI-TOF", "standard": "理论分子量+-1 Da", "purpose": "确认序列正确性"},
            {"name": "氨基酸组成分析", "method": "AAA", "standard": "各氨基酸比例偏差<10%", "purpose": "验证氨基酸组成"}
        ]

        if parsed.get("modifications"):
            tests.append({"name": "修饰位点确认", "method": "MS/MS", "standard": "修饰位点正确", "purpose": "确认修饰位置"})

        standards = [
            f"HPLC纯度 >= {parsed.get('purity', '95%')}",
            "质谱分子量与理论值偏差 <= 1 Da",
            "外观: 白色或类白色粉末",
            "水分含量 <= 5%"
        ]

        return {
            "strategy": strategy,
            "tests": tests,
            "acceptance_standards": standards
        }

    def _generate_timeline(self, parsed: Dict, designs: List[Dict], modifications: List[Dict]) -> Dict[str, Any]:
        """生成项目时间线"""
        base_duration = 10
        if modifications:
            base_duration += 5
        if parsed.get("special_requirements"):
            base_duration += 3

        phases = [
            {"name": "序列设计与确认", "tasks": "序列分析、理化性质预测、设计确认", "duration": 2, "deliverables": "设计方案确认书"},
            {"name": "原料准备", "tasks": "氨基酸、树脂、试剂采购与质检", "duration": 2, "deliverables": "原料质检报告"},
            {"name": "多肽合成", "tasks": "固相合成、切割、沉淀", "duration": 5, "deliverables": "粗品多肽"},
            {"name": "纯化与分析", "tasks": "HPLC纯化、MS确认、冻干", "duration": 3, "deliverables": "纯品多肽+质检报告"}
        ]

        if modifications:
            phases.insert(3, {"name": "化学修饰", "tasks": "定点修饰、纯化、确认", "duration": 5, "deliverables": "修饰多肽"})

        return {
            "phases": phases,
            "total_duration": f"{sum(p['duration'] for p in phases)}个工作日"
        }

    def _generate_pricing(self, parsed: Dict, designs: List[Dict], modifications: List[Dict]) -> Dict[str, Any]:
        """生成报价"""
        quantity = parsed.get("quantity", "10mg")
        purity = parsed.get("purity", "95%")

        # 解析数量
        qty_match = re.match(r'(\d+(?:\.\d+)?)\s*(mg|g|kg|ug)', quantity, re.IGNORECASE)
        qty_num = float(qty_match.group(1)) if qty_match else 10
        qty_unit = qty_match.group(2).lower() if qty_match else "mg"

        # 基础价格计算
        base_price = 500  # 基础合成费
        length_factor = designs[0].get("length", 10) * 20 if designs else 200
        qty_factor = qty_num * 10 if qty_unit == "mg" else qty_num * 10000
        purity_factor = 100 if purity == "95%" else (200 if purity == "98%" else 50)

        items = [
            {"name": "多肽合成(粗品)", "unit_price": f"{base_price + length_factor}元", "quantity": "1项", "amount": f"{base_price + length_factor}元", "notes": f"长度: {designs[0].get('length', 10)}aa" if designs else ""},
            {"name": "HPLC纯化", "unit_price": f"{purity_factor}元", "quantity": "1项", "amount": f"{purity_factor}元", "notes": f"纯度: {purity}"},
            {"name": "质谱确认", "unit_price": "200元", "quantity": "1项", "amount": "200元", "notes": "ESI-MS"}
        ]

        if modifications:
            mod_price = len(modifications) * 300
            items.append({"name": "化学修饰", "unit_price": f"{mod_price}元", "quantity": f"{len(modifications)}项", "amount": f"{mod_price}元", "notes": ", ".join([m["name"] for m in modifications])})

        total = sum([
            base_price + length_factor,
            purity_factor,
            200,
            len(modifications) * 300 if modifications else 0
        ])

        return {
            "items": items,
            "total": f"{total}元",
            "payment_terms": "预付50%，交付后付清尾款"
        }

    def _generate_risks(self, parsed: Dict, designs: List[Dict]) -> List[Dict]:
        """生成风险评估"""
        risks = [
            {"category": "合成风险", "description": "长肽或困难序列可能导致偶联不完全", "impact": "中", "mitigation": "采用分段合成或更换偶联试剂"},
            {"category": "纯化风险", "description": "疏水性多肽可能难以纯化", "impact": "中", "mitigation": "优化纯化梯度，考虑添加增溶剂"},
            {"category": "稳定性风险", "description": "某些序列易于氧化或聚集", "impact": "低", "mitigation": "添加稳定剂，优化储存条件"}
        ]

        if parsed.get("modifications"):
            risks.append({"category": "修饰风险", "description": "修饰反应可能不完全或产生副产物", "impact": "中", "mitigation": "优化反应条件，增加纯化步骤"})

        return risks

    def _generate_suggestions(self, parsed: Dict, designs: List[Dict]) -> List[str]:
        """生成专业建议"""
        suggestions = [
            "建议在正式合成前进行小规模试合成，优化合成条件",
            "多肽粉末建议分装保存于-20°C，避免反复冻融",
            "溶解时建议使用无菌水或适当缓冲液，避免剧烈震荡"
        ]

        sequence = designs[0].get("sequence", "") if designs else ""
        if sequence and len(sequence) > 30:
            suggestions.append("长肽合成建议采用片段缩合策略，降低合成难度")

        if parsed.get("modifications"):
            suggestions.append("修饰多肽建议增加分析鉴定步骤，确保修饰位点正确")

        return suggestions

    def _generate_appendix(self) -> Dict[str, Any]:
        """生成附录"""
        glossary = [
            {"term": "SPPS", "term_cn": "固相多肽合成", "definition": "Solid Phase Peptide Synthesis，在固相载体上逐步偶联氨基酸的多肽合成方法"},
            {"term": "Fmoc", "term_cn": "芴甲氧羰基", "definition": "Fluorenylmethyloxycarbonyl，常用的氨基保护基"},
            {"term": "HPLC", "term_cn": "高效液相色谱", "definition": "High Performance Liquid Chromatography，用于多肽纯度和分析检测"},
            {"term": "MS", "term_cn": "质谱", "definition": "Mass Spectrometry，用于确认多肽分子量"},
            {"term": "TFA", "term_cn": "三氟乙酸", "definition": "Trifluoroacetic acid，常用于多肽切割和HPLC流动相"}
        ]

        references = [
            {"number": "1", "authors": "Merrifield RB.", "title": "Solid phase peptide synthesis. I. The synthesis of a tetrapeptide", "journal": "J Am Chem Soc", "year": "1963"},
            {"number": "2", "authors": "Fields GB, Noble RL.", "title": "Solid phase peptide synthesis utilizing 9-fluorenylmethoxycarbonyl amino acids", "journal": "Int J Pept Protein Res", "year": "1990"}
        ]

        return {
            "glossary": glossary,
            "references": references
        }
