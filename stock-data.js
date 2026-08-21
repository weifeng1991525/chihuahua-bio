/* ============================================
   吉娃娃生物 - 现货目录 (Stock Catalog)
   数据 + 在线搜索/筛选/分页渲染
   ============================================ */
(function () {
  'use strict';

  const funcCatMap = {
    '多肽激素': '多肽激素',
    '活性多肽': '活性多肽',
    '多肽底物': '多肽底物',
    '竞争性多肽': '竞争性多肽'
  };
  const catColor = {
    '多肽激素': '#0891B2',
    '活性多肽': '#00C9A7',
    '多肽底物': '#6366F1',
    '竞争性多肽': '#EC4899'
  };

  const PRICE_PER = 15;

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderPrice() {
    const box = document.getElementById('stockPriceRoot');
    if (!box) return;

    const state = box._state || { cat: '全部', kw: '', page: 1 };
    box._state = state;

    var kw = state.kw.trim().toLowerCase();
    var rows = window.STOCK_PRICE.filter(function (r) {
      if (state.cat !== '全部' && r.cat !== state.cat) return false;
      if (!kw) return true;
      return (r.cat + r.code + r.name + r.pack + r.price).toLowerCase().indexOf(kw) > -1;
    });

    var pages = Math.max(1, Math.ceil(rows.length / PRICE_PER));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * PRICE_PER;
    var pageRows = rows.slice(start, start + PRICE_PER);

    var cats = ['全部'].concat(Object.keys(catColor));
    var catBtns = cats.map(function (c) {
      var active = c === state.cat ? ' active' : '';
      var dot = c === '全部' ? '' :
        '<span class="sc-cat-dot" style="background:' + esc(catColor[c]) + '"></span>';
      return '<button type="button" class="sc-chip' + active + '" data-cat="' + esc(c) + '">' +
        dot + esc(c) + '</button>';
    }).join('');

    var sumRows = pageRows.map(function (r) {
      return '<tr>' +
        '<td class="sc-cat"><span class="sc-badge" style="background:' + esc(catColor[r.cat]) + '">' + esc(r.cat) + '</span></td>' +
        '<td class="sc-code"><strong>' + esc(r.code) + '</strong></td>' +
        '<td class="sc-name">' + esc(r.name) + '</td>' +
        '<td class="sc-pack">' + esc(r.pack) + '</td>' +
        '<td class="sc-price">¥ ' + esc(r.price) + '</td>' +
        '</tr>';
    }).join('');

    var empty = rows.length === 0 ?
      '<tr><td colspan="5" class="sc-empty">未找到匹配产品，可下载下方完整目录查看或致电咨询</td></tr>' : '';

    var pag = '';
    if (pages > 1) {
      var pArr = [];
      for (var p = 1; p <= pages; p++) {
        pArr.push('<button type="button" class="sc-page' + (p === state.page ? ' active' : '') + '" data-page="' + p + '">' + p + '</button>');
      }
      pag = '<div class="sc-pagination"><span class="sc-count">共 ' + rows.length + ' 条规格 · 第 ' +
        state.page + '/' + pages + ' 页</span><div class="sc-pages">' + pArr.join('') + '</div></div>';
    } else if (rows.length > 0) {
      pag = '<div class="sc-pagination"><span class="sc-count">共 ' + rows.length + ' 条规格</span></div>';
    }

    box.innerHTML =
      '<div class="sc-toolbar">' +
        '<div class="sc-cats">' + catBtns + '</div>' +
        '<div class="sc-search">' +
          '<input type="text" class="sc-input" placeholder="搜索产品名称 / 编号 / 包装…" value="' + esc(state.kw) + '">' +
          '<button type="button" class="sc-clear">清除</button>' +
        '</div>' +
      '</div>' +
      '<div class="sc-table-wrap"><table class="sc-table">' +
        '<thead><tr><th>类别</th><th>产品编号</th><th>产品名称</th><th>包装</th><th>价格(元)</th></tr></thead>' +
        '<tbody>' + sumRows + empty + '</tbody></table></div>' +
      pag;

    // bind events
    box.querySelectorAll('.sc-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        state.cat = b.getAttribute('data-cat');
        state.page = 1;
        renderPrice();
      });
    });
    var inp = box.querySelector('.sc-input');
    var timer;
    inp.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        state.kw = inp.value;
        state.page = 1;
        renderPrice();
      }, 250);
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); state.kw = inp.value; state.page = 1; renderPrice(); }
    });
    var clr = box.querySelector('.sc-clear');
    if (clr) clr.addEventListener('click', function () {
      state.kw = ''; state.page = 1; renderPrice();
    });
    box.querySelectorAll('.sc-page').forEach(function (b) {
      b.addEventListener('click', function () {
        state.page = parseInt(b.getAttribute('data-page'), 10);
        renderPrice();
      });
    });
  }

  /* ---- 功能目录：分类折叠卡片 ---- */
  function renderFunc() {
    var box = document.getElementById('stockFuncRoot');
    if (!box) return;
    var kw = box._kw || '';
    box._kw = kw;

    var cats = ['多肽激素', '活性多肽', '多肽底物', '竞争性多肽'];
    var html = '';
    cats.forEach(function (cname) {
      var items = window.STOCK_FUNC.filter(function (r) {
        if (r.cat !== cname) return false;
        if (!kw) return true;
        return (r.code + r.name + r.desc + r.app).toLowerCase().indexOf(kw) > -1;
      });
      if (items.length === 0) return;
      html += '<div class="sc-func-cat">' +
        '<div class="sc-func-head">' +
          '<span class="sc-badge" style="background:' + esc(catColor[cname]) + '">' + esc(cname) + '</span>' +
          '<span class="sc-func-n">' + items.length + ' 个品种</span>' +
        '</div>';
      items.forEach(function (r) {
        html += '<div class="sc-func-item">' +
          '<div class="sc-func-title">' +
            '<span class="sc-func-code">' + esc(r.code) + '</span>' +
            '<span class="sc-func-name">' + esc(r.name) + '</span>' +
          '</div>' +
          (r.desc ? '<p class="sc-func-desc">' + esc(r.desc) + '</p>' : '') +
          (r.app ? '<p class="sc-func-app"><strong>应用：</strong>' + esc(r.app) + '</p>' : '') +
        '</div>';
      });
      html += '</div>';
    });

    var empty = html ? '' : '<p class="sc-empty">未找到匹配产品</p>';
    box.innerHTML =
      '<div class="sc-toolbar sc-toolbar-func">' +
        '<div class="sc-search"><input type="text" class="sc-input" placeholder="搜索功能目录（名称/编号/用途）…" value="' + esc(kw) + '">' +
        '<button type="button" class="sc-clear">清除</button></div>' +
      '</div>' +
      '<div class="sc-func-list">' + html + empty + '</div>';

    var inp = box.querySelector('.sc-input');
    var timer;
    inp.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { box._kw = inp.value; renderFunc(); }, 250);
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); box._kw = inp.value; renderFunc(); }
    });
    var clr = box.querySelector('.sc-clear');
    if (clr) clr.addEventListener('click', function () { box._kw = ''; renderFunc(); });
  }

  function init() {
    renderPrice();
    renderFunc();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


// ---- DATA ----
window.STOCK_FUNC = [{"cat": "多肽激素", "code": "P9019", "name": "ACTH(1-24) human", "desc": "人促肾上腺皮质激素(1-24)", "app": "ACTH/POMC来源的N端1-24活性肽，保留了完整ACTH的生物学活性，是公认的具有类ACTH全活性的肽段。通过与黑色素皮质素受体2(MC2R)结合，激活cAMP-PKA信号，刺激肾上腺皮质合成与分泌糖皮质激素（皮质醇/皮质酮）。", "sci": "主要用于下丘脑-垂体-肾上腺(HPA)轴功能研究、肾上腺类固醇合成通路研究、ACTH刺激实验（评估肾上腺储备功能）及黑色素皮质素受体药理学研究。"}, {"cat": "多肽激素", "code": "P9023", "name": "ACTH(1-39) human", "desc": "人促肾上腺皮质激素(1-39)", "app": "全长的内源性促肾上腺皮质激素（39个氨基酸），是体内发挥经典生理作用的完整激素，生理学上最真实的ACTH形式。可模拟内源性配体用于受体实验，反映天然激素的完整结构与功能。", "sci": "用于最接近生理状态的ACTH信号研究、HPA轴整体功能评估、垂体-肾上腺相互作用研究，以及ACTH受体(MC2R)结合与激动实验的阳性对照。"}, {"cat": "多肽激素", "code": "P9028", "name": "ACTH(18-39) human", "desc": "人促肾上腺皮质激素(18-39)", "app": "ACTH的C端18-39片段，即促肾上腺皮质素样中叶肽(CLIP)。该片段不保留经典的促类固醇生成活性，是POMC加工产生的中间片段，主要用作多肽加工产物研究工具。", "sci": "用于POMC蛋白水解加工、组织特异性肽段切割与分泌机制研究，作为ACTH各功能区段作比较的结构-活性对照。"}, {"cat": "多肽激素", "code": "P9032", "name": "ACTH(1-17) human", "desc": "人促肾上腺皮质激素(1-17)", "app": "ACTH的N端1-17短片段，保留了部分生物学活性结构，较1-24更短，用于研究ACTH激活MC2R所需的最小有效结构域。", "sci": "用于ACTH结构-活性关系(SAR)研究、确定受体激活所需核心序列、缩短肽段的活性对比实验。"}, {"cat": "多肽激素", "code": "P9037", "name": "ACTH(1-10) human", "desc": "人促肾上腺皮质激素(1-10)", "app": "ACTH最N端的1-10短肽，其核心区域(4-10，HFRW motif)是与α-MSH等黑色素皮质素成员共享的促黑素/信号核心。作为最短的功能核心片段，用于解析最小活性单位。", "sci": "用于黑色素皮质素系统核心序列研究、ACTH与α-MSH共同活性结构域的功能定位、肽段活性阈值探索。"}, {"cat": "多肽激素", "code": "P9041", "name": "ACTH(7-38) human", "desc": "人促肾上腺皮质激素(7-38)", "app": "ACTH受体(MC2R)的竞争性拮抗肽，可阻断ACTH与受体的结合从而抑制其下游信号，是ACTH信号转导领域的功能性工具肽。", "sci": "用于拮抗ACTH作用、MC2R介导信号通路的功能研究、探讨ACTH对肾上腺皮质及其他靶组织的依赖机制。"}, {"cat": "多肽激素", "code": "P9046", "name": "Octreotide Acetate", "desc": "醋酸奥曲肽", "app": "合成的生长抑素类似物（八肽），对生长抑素受体2/5(SSTR2/SSTR5)具高亲和力且体内作用更长效。可抑制生长激素(GH)、胰高血糖素、胰岛素及胃肠内分泌的分泌。", "sci": "用于肢端肥大症与神经内分泌肿瘤(NET)研究、生长抑素受体介导的激素分泌抑制机制、代谢与胃肠内分泌调控研究。"}, {"cat": "多肽激素", "code": "P9050", "name": "Desmopressin Acetate", "desc": "醋酸去氨加压素", "app": "加压素(抗利尿激素,AVP)的合成类似物，对V2受体具高选择性激动作用，主要发挥抗利尿效应，并可诱导内皮释放凝血因子VIII(FVIII)与血管性血友病因子(vWF)。", "sci": "用于中枢性尿崩症、血管性血友病(vWD)与血友病A相关机制研究、V2受体药理学、肾脏水代谢/浓缩功能研究。"}, {"cat": "多肽激素", "code": "P9055", "name": "Leuprorelin Acetate", "desc": "醋酸亮丙瑞林", "app": "促性腺激素释放激素(GnRH/LHRH)激动剂（D-Leu6-GnRH）。持续给药会下调垂体GnRH受体，从而抑制LH/FSH分泌并降低性腺类固醇激素水平，实现可逆的性激素抑制。", "sci": "用于前列腺癌、子宫内膜异位症、性早熟等雌激素/雄激素依赖性疾病研究、GnRH受体信号与下丘脑-垂体-性腺(HPG)轴研究。"}, {"cat": "多肽激素", "code": "P9059", "name": "Mechano Growth Factor", "desc": "机械生长因子(MGF)", "app": "机械生长因子为IGF-1的剪切变体(IGF-1Eb)，在机械负荷、肌肉损伤或运动刺激下局部表达。可激活卫星细胞、促进肌纤维肥大、增生与损伤后再生。", "sci": "用于肌肉生物学、运动生理学、肌肉损伤与再生、增肌/抗萎缩机制以及机械应力信号转导研究。"}, {"cat": "多肽激素", "code": "P9064", "name": "Cetrorelix Acetate", "desc": "醋酸西曲瑞克", "app": "促性腺激素释放激素(GnRH)拮抗剂，可即时、可逆地阻断GnRH受体，快速抑制垂体LH/FSH分泌，用于预防辅助生殖周期中过早的LH峰。", "sci": "用于辅助生殖(IVF/控制性促排卵)方案研究、GnRH拮抗剂机制、即时效应的下丘脑-垂体-性腺轴调控研究。"}, {"cat": "多肽激素", "code": "P9068", "name": "Deslorelin Acetate", "desc": "醋酸德舍瑞林", "app": "强效的GnRH激动剂，作用机制与亮丙瑞林类似，通过持续激动并下调GnRH受体抑制性激素分泌，广泛应用于生殖内分泌与兽医生殖领域。", "sci": "用于生殖内分泌调控、雌激素依赖性疾病的抑制研究、兽医领域发情诱导与同步化、GnRH受体长时程激动研究。"}, {"cat": "多肽激素", "code": "P9073", "name": "Teriparatide Acetate", "desc": "醋酸特立帕肽", "app": "重组人甲状旁腺激素PTH(1-34)，是经典的骨合成代谢药物。间歇性给药可激活PTH1受体，通过刺激成骨细胞活性促进骨形成，用于骨质疏松的合成代谢治疗。", "sci": "用于骨质疏松症与骨合成代谢研究、PTH1受体信号通路、成骨细胞分化与骨形成机制研究。"}, {"cat": "多肽激素", "code": "P9077", "name": "Somatostatin Acetate", "desc": "醋酸生长抑素", "app": "内源性生长抑素-14，广谱抑制性激素，可抑制生长激素(GH)、促甲状腺激素(TSH)、胰岛素、胰高血糖素及多种胃肠激素的分泌。", "sci": "用于内分泌与代谢调控研究、激素分泌抑制模型、胃肠道功能与消化生理研究。"}, {"cat": "多肽激素", "code": "P9082", "name": "Oxytocin Acetate", "desc": "醋酸催产素", "app": "催产素为九肽激素，经典作用是促进子宫收缩与泌乳（射乳反射），并在中枢神经系统中调控亲社会行为、依恋、焦虑与应激。", "sci": "用于生殖与分娩机制研究、泌乳生理、神经科学领域的社会行为/依恋/焦虑/自闭症模型研究。"}, {"cat": "多肽激素", "code": "P9085", "name": "Semaglutide", "desc": "司美格鲁肽(BioReagent)", "app": "长效胰高血糖素样肽-1(GLP-1)受体激动剂，呈葡萄糖依赖性促进胰岛素分泌并抑制胰高血糖素，同时通过中枢机制抑制食欲、延缓胃排空，实现降糖与减重。", "sci": "用于2型糖尿病、肥胖症、能量代谢与食欲调控研究、GLP-1受体药理学及心血管代谢保护机制研究。"}, {"cat": "多肽激素", "code": "P9087", "name": "Semaglutide Intermediate P29", "desc": "司美格鲁肽中间体P29", "app": "司美格鲁肽合成过程中的中间肽段（P29），为多肽固相/液相合成工艺中的关键构建单元，化学序列上作为司美格鲁肽结构的一部分。", "sci": "主要用于多肽合成工艺研究、合成路线与中间体纯度分析方法开发、多肽药制备工艺质量研究。"}, {"cat": "多肽激素", "code": "P9089", "name": "Tirzepatide", "desc": "替尔泊肽(BioReagent)", "app": "对GIP和GLP-1受体均有强激动活性的双受体激动剂。协同增强葡萄糖依赖的胰岛素分泌、降低胰高血糖素并抑制食欲，兼具显著的降糖与减重作用。", "sci": "用于2型糖尿病、肥胖与超重、肠促胰素(GIP/GLP-1)双受体药理学、能量代谢与胰脂肪代谢研究。"}, {"cat": "活性多肽", "code": "P9001", "name": "Amyloid β Peptide(1-42) human", "desc": "淀粉样β肽(1-42)", "app": "阿尔茨海默病(AD)老年斑的核心组分，共42个氨基酸，是最易聚集、神经毒性最强、与AD病理最紧密相关的Aβ亚型。易自我组装形成β-折叠和纤维，具有种子聚集与神经毒性。", "sci": "用于阿尔茨海默病发病机制研究、Aβ聚集/纤维化动力学研究、神经毒性体外模型、AD药物（β分泌酶/γ分泌酶抑制剂、抗体等）评价。"}, {"cat": "活性多肽", "code": "P9005", "name": "Amyloid β Peptide(42-1) human", "desc": "淀粉样β肽(42-1)", "app": "Aβ(1-42)的反向氨基酸序列对照肽，具有相同氨基酸组成但不形成典型毒性聚集，作为聚集与毒性实验的阴性对照工具。", "sci": "用于Aβ聚集与毒性实验的阴性对照、验证实验体系特异性的质量控制。"}, {"cat": "活性多肽", "code": "P9010", "name": "Amyloid β Peptide(1-40) human", "desc": "淀粉样β肽(1-40)", "app": "Aβ的40个氨基酸形式，是血浆与脑脊液中最丰富的Aβ亚型，聚集倾向与神经毒性相对低于Aβ(1-42)，但在斑块形成与AD进展中同样重要。", "sci": "用于AD生物标志物研究、Aβ聚集动力学对比、脑脊液/血浆Aβ检测、β/γ-分泌酶切割产物分析。"}, {"cat": "活性多肽", "code": "P9014", "name": "Amyloid β Peptide(40-1) human", "desc": "淀粉样β肽(40-1)", "app": "Aβ(1-40)的反向序列阴性对照肽，氨基酸组成相同但顺序逆转，不产生典型Aβ聚集行为，用于对照实验。", "sci": "用于Aβ(1-40)聚集与毒性研究中的阴性对照、检测体系特异性验证。"}, {"cat": "多肽底物", "code": "P9701", "name": "Ac-YVAD-pNA", "desc": "Caspase 1显色底物", "app": "Caspase-1的特异性显色底物(含YVAD识别序列)。Caspase-1为炎性Caspase，切割pro-IL-1β/pro-IL-18介导炎症与焦亡(pyroptosis)；水解后释放pNA显黄色，用于活性测定。", "sci": "用于Caspase-1活性测定、炎症小体(inflammasome)激活研究、焦亡(pyroptosis)研究、IL-1β成熟加工检测。"}, {"cat": "多肽底物", "code": "P9703", "name": "Ac-YVAD-AFC", "desc": "Caspase 1荧光底物", "app": "Caspase-1的特异性荧光底物(AMC标记)，敏感性高于显色底物，用于Caspase-1活性的高灵敏荧光定量检测。", "sci": "用于Caspase-1活性精确定量、炎症小体与焦亡研究中低丰度样本的检测、抑制剂IC50测定。"}, {"cat": "多肽底物", "code": "P9705", "name": "Ac-VDQQD-pNA", "desc": "Caspase 2显色底物", "app": "Caspase-2的特异性显色底物(VDQQD序列)。Caspase-2参与内质网应激/DNA损伤诱发的凋亡信号，为早期应激反应的Caspase，水解后释放pNA显色定量。", "sci": "用于Caspase-2活性测定、内质网应激与基因毒性应激引起的凋亡研究、半胱天冬酶网络功能研究。"}, {"cat": "多肽底物", "code": "P9707", "name": "Ac-VDVAD-AFC", "desc": "Caspase 2荧光底物", "app": "Caspase-2的荧光底物(AMC标记)，水解后释放荧光，灵敏度高，用于Caspase-2活性的精确荧光定量。", "sci": "用于Caspase-2高灵敏活性检测、应激性凋亡通路研究的定量分析、抑制剂活性评价。"}, {"cat": "多肽底物", "code": "P9710", "name": "Ac-DEVD-pNA", "desc": "Caspase 3显色底物", "app": "Caspase-3的特异性显色底物(DEVD序列)。Caspase-3是凋亡过程中最重要的效应Caspase(executioner)，切割多种底物执行凋亡，是凋亡检测的金标准指标之一；水解释放pNA显色。", "sci": "用于Caspase-3活性测定、细胞凋亡检测与定量、凋亡信号通路研究、促凋亡/抗凋亡药物活性评价。"}, {"cat": "多肽底物", "code": "P9712", "name": "Ac-DEVD-AFC", "desc": "Caspase 3荧光底物", "app": "Caspase-3的荧光底物(AMC)，灵敏度高于比色底物，用于Caspase-3活性的高灵敏荧光定量与动态监测。", "sci": "用于Caspase-3活性的精确荧光测定、凋亡定量研究、高灵敏药物筛选。"}, {"cat": "多肽底物", "code": "P9714", "name": "Ac-LEVD-pNA", "desc": "Caspase 4显色底物", "app": "Caspase-4的特异性显色底物(LEVD序列)。Caspase-4为非经典炎症Caspase，参与内质网应激相关炎症与固有免疫应答，水解释放pNA显色。", "sci": "用于Caspase-4活性测定、内质网应激炎症研究、非经典炎症小体(人Caspase-4/5)研究。"}, {"cat": "多肽底物", "code": "P9716", "name": "Ac-LEVD-AFC", "desc": "Caspase 4荧光底物", "app": "Caspase-4的荧光底物(AMC标记)，灵敏高效，用于Caspase-4活性的荧光定量与动态检测。", "sci": "用于Caspase-4高灵敏活性测定、内质网应激与炎症机制研究中的精确定量。"}, {"cat": "多肽底物", "code": "P9719", "name": "Ac-VEID-pNA", "desc": "Caspase 6显色底物", "app": "Caspase-6的特异性显色底物(VEID序列)。Caspase-6为效应Caspase，参与凋亡执行，并在衰老、神经退行性疾病(纤丝切割)中被研究；水解释放pNA显色。", "sci": "用于Caspase-6活性测定、凋亡执行阶段研究、衰老与神经退行性疾病相关的Caspase-6功能研究。"}, {"cat": "多肽底物", "code": "P9721", "name": "Ac-VEID-AFC", "desc": "Caspase 6荧光底物", "app": "Caspase-6的荧光底物(AMC标记)，高灵敏度检测Caspase-6活性，适用于微量与动态监测。", "sci": "用于Caspase-6活性精确定量、神经退行与衰老研究中的信号分析、抑制剂筛选。"}, {"cat": "多肽底物", "code": "P9723", "name": "Ac-IETD-pNA", "desc": "Caspase 8显色底物", "app": "Caspase-8的特异性显色底物(IETD序列)。Caspase-8是死亡受体(外源性)凋亡通路的起始Caspase(initiator)，接收Fas/TRAIL等死亡信号激活并级联执行凋亡；水解释放pNA显色。", "sci": "用于Caspase-8活性测定、死亡受体介导的外源性凋亡研究、TNF/Fas/TRAIL信号通路研究、抑制性酶的活性评价。"}, {"cat": "多肽底物", "code": "P9725", "name": "Ac-IETD-AFC", "desc": "Caspase 8荧光底物", "app": "Caspase-8的荧光底物(AMC标记)，灵敏度高，用于Caspase-8活性的荧光定量与动态监测。", "sci": "用于Caspase-8高灵敏活性测定、外源性凋亡通路的量化研究、死亡受体信号研究。"}, {"cat": "多肽底物", "code": "P9728", "name": "Ac-LEHD-pNA", "desc": "Caspase 9显色底物", "app": "Caspase-9的特异性显色底物(LEHD序列)。Caspase-9是线粒体(内源性)凋亡通路的起始Caspase(initiator)，在cytochrome c/apaf-1凋亡小体中激活后启动Caspase级联；水解释放pNA显色。", "sci": "用于Caspase-9活性测定、线粒体/内源性凋亡通路研究、凋亡小体(apoptosome)与Bcl-2家族功能研究。"}, {"cat": "多肽底物", "code": "P9730", "name": "Ac-LEHD-AFC", "desc": "Caspase 9荧光底物", "app": "Caspase-9的荧光底物(AMC标记)，高灵敏定量线粒体凋亡通路起始Caspase活性。", "sci": "用于Caspase-9活性精确定量、内源性凋亡通路研究中的动态监测、抑制剂IC50测定。"}, {"cat": "多肽底物", "code": "P9731", "name": "MCA-AVLQSGFR-Lys(Dnp)-Lys-NH2", "desc": "冠状病毒主蛋白酶荧光底物", "app": "基于FRET(荧光共振能量转移)的肽底物，含MCA荧光供体与Dnp淬灭基团。被冠状病毒（如SARS-CoV-2）主蛋白酶3CLpro/Mpro在第178位Gln-Ser间特异性切割后释放荧光，用于检测蛋白酶活性。", "sci": "用于冠状病毒主蛋白酶(Mpro/3CLpro)活性测定、广谱抗病毒药物/抑制剂高通量筛选、蛋白酶动力学研究。"}, {"cat": "多肽底物", "code": "P9733", "name": "Dabcyl-KTSAVLQSGFRKME-Edans", "desc": "冠状病毒主蛋白酶荧光底物", "app": "另一种FRET荧光底物，采用Dabcyl(淬灭基团)/Edans(荧光基团)配对，含Mpro切割位点(AVLQSGFR)，被主蛋白酶切割后荧光增强，用于病毒蛋白酶活性定量。", "sci": "用于冠状病毒3CLpro/Mpro活性检测、复方抑制剂筛选、高灵敏度荧光蛋白酶测定。"}, {"cat": "多肽底物", "code": "P9735", "name": "MCA-YVADAPK(Dnp)-OH", "desc": "ACE2荧光底物", "app": "血管紧张素转换酶2(ACE2)的荧光肽底物，含YVAD序列并被ACE2水解，用于检测ACE2酶活性。ACE2为肾素-血管紧张素系统(RAAS)关键酶，也是SARS-CoV-2进入细胞的受体。", "sci": "用于ACE2酶活性测定、RAAS生理与病理研究、ACE2作为病毒侵入受体的功能研究、ACE2抑制剂/激活物筛选。"}, {"cat": "多肽底物", "code": "P9737", "name": "MCA-APK(Dnp)-OH", "desc": "ACE2荧光底物(短)", "app": "较短的ACE2荧光底物序列，同样以MCA/Dnp FRET对检测ACE2水解活性，序列更精简，便于成本控制与快捷检测。", "sci": "用于ACE2活性快速测定、RAAS研究、抗体与抑制剂作用评价中的简便检测工具。"}, {"cat": "多肽底物", "code": "P9739", "name": "MCA-EIDLMVLDK-Dnp", "desc": "BACE1荧光底物", "app": "β-分泌酶(BACE1)的荧光肽底物，含Mca/Dnp淬灭对。BACE1切割淀粉样前体蛋白(APP)生成Aβ是AD发生的关键起始步骤，该底物用于检测BACE1活性。", "sci": "用于BACE1活性测定、以β-分泌酶为靶点的抗阿尔茨海默病药物筛选、Aβ生成起始环节研究。"}, {"cat": "多肽底物", "code": "P9742", "name": "Z-GGR-pNA", "desc": "尿激酶显色底物", "app": "尿激酶型纤溶酶原激活物(uPA)的显色底物。uPA水解后释放对硝基苯胺(pNA)，在405 nm产生黄色，用于比色法定量尿激酶活性。", "sci": "用于尿激酶uPA/纤溶酶原激活系统活性测定、纤溶与血栓研究、uPA相关肿瘤侵袭转移研究。"}, {"cat": "多肽底物", "code": "P9745", "name": "Z-GGR-AMC", "desc": "尿激酶荧光底物", "app": "尿激酶uPA的荧光底物，水解后释放AMC产生荧光，较显色底物灵敏度更高，适用于微量活性的荧光定量检测。", "sci": "用于uPA活性的高灵敏荧光测定、抑制剂筛选、纤溶酶原激活系统的精细动力学研究。"}, {"cat": "竞争性多肽", "code": "P9801", "name": "3X Flag Peptide", "desc": "3X Flag多肽(竞争肽)", "app": "合成的3xFLAG表位肽(DYKDHDGDYKDHDIDYKDDDDK)，可与抗FLAG抗体/M2亲和凝胶特异性结合，作为竞争性多肽用于将FLAG标签融合蛋白从亲和树脂上洗脱。", "sci": "用于FLAG标签蛋白的亲和纯化洗脱（竞争性洗脱FLAG融合蛋白）、免疫沉淀(IP)/免疫印迹(WB)中的表位竞争对照。"}, {"cat": "竞争性多肽", "code": "P9805", "name": "c-Myc Peptide", "desc": "Myc标签多肽(竞争肽)", "app": "合成的c-Myc表位肽(EQKLISEEDL)，作为竞争性多肽竞争洗脱Myc标签融合蛋白，或在实验中竞争性阻断抗Myc抗体结合。", "sci": "用于Myc标签蛋白的竞争性洗脱与亲和纯化、抗c-Myc抗体的竞争对照、Myc融合蛋白鉴定。"}, {"cat": "竞争性多肽", "code": "P9808", "name": "HA Peptide", "desc": "HA多肽(竞争肽)", "app": "合成的HA表位肽(YPYDVPDYA)，来自流感病毒血凝素，作为竞争性多肽用于竞争洗脱HA标签融合蛋白并阻断抗HA抗体结合。", "sci": "用于HA标签蛋白的亲和纯化洗脱、抗HA抗体竞争性对照、HA融合蛋白的鉴定与分离。"}, {"cat": "竞争性多肽", "code": "P9811", "name": "6X His Peptide", "desc": "6X His多肽(竞争肽)", "app": "合成的六聚组氨酸(His6)肽，作为竞争性多肽用于竞争洗脱或表征His标签蛋白，也可用于抗His抗体的竞争性阻断与检测体系验证。", "sci": "用于His标签蛋白的竞争性洗脱、Ni亲和层析的对照、抗His抗体的竞争性验证与标签识别研究。"}, {"cat": "竞争性多肽", "code": "P9813", "name": "V5 Tag Peptide", "desc": "V5 Tag多肽(竞争肽)", "app": "合成的V5表位肽(GKPIPNPLLGLDST)，来自猴病毒5副粘病毒，作为竞争性多肽用于竞争洗脱V5标签蛋白并阻断抗V5抗体结合。", "sci": "用于V5标签融合蛋白的亲和纯化洗脱、抗V5抗体竞争对照、V5标签蛋白的鉴定。"}, {"cat": "竞争性多肽", "code": "P9816", "name": "S Tag Peptide", "desc": "S Tag多肽(竞争肽)", "app": "合成的S-tag表位肽(KETAAAKFERQHMDS)，来自RNase A的15肽片段，作为竞争性多肽用于竞争洗脱S-tag标签蛋白。", "sci": "用于S-tag融合蛋白的竞争性洗脱与纯化、抗S-tag抗体的竞争性对照、S-tag检测系统验证。"}, {"cat": "竞争性多肽", "code": "P9819", "name": "T7 Tag Peptide", "desc": "T7 Tag多肽(竞争肽)", "app": "合成的T7表位肽(MASMTGGQQMG)，来自T7衣壳蛋白，作为竞争性多肽用于竞争洗脱T7标签蛋白并阻断抗T7抗体结合。", "sci": "用于T7标签蛋白的竞争性洗脱、抗T7抗体竞争验证、T7融合蛋白纯化。"}, {"cat": "竞争性多肽", "code": "P9822", "name": "VSV-G Tag Peptide", "desc": "VSV-G Tag多肽(竞争肽)", "app": "合成的VSV-G表位肽(YTDIEMNRLGK)，来自水疱性口炎病毒G蛋白，作为竞争性多肽洗脱VSV-G标签蛋白并阻断抗VSV-G抗体结合。", "sci": "用于VSV-G标签蛋白的竞争性洗脱、抗VSV-G抗体竞争性对照、融合蛋白的鉴定纯化。"}, {"cat": "竞争性多肽", "code": "P9825", "name": "PA Tag Peptide", "desc": "PA Tag多肽(竞争肽)", "app": "合成的PA表位肽(GVAMPGAEDDVV)，常用于单域抗体/纳米抗体亲和体系，作为竞争性多肽竞争洗脱PA标签融合蛋白。", "sci": "用于PA标签蛋白的亲和纯化洗脱、单域抗体亲和体系的竞争性洗脱、抗PA抗体竞争对照。"}];
window.STOCK_PRICE = [{"cat": "多肽激素", "code": "P9019-1mg", "name": "ACTH(1-24) human", "pack": "1mg", "price": "306"}, {"cat": "多肽激素", "code": "P9019-5mg", "name": "ACTH(1-24) human", "pack": "5mg", "price": "1131"}, {"cat": "多肽激素", "code": "P9019-25mg", "name": "ACTH(1-24) human", "pack": "25mg", "price": "4239"}, {"cat": "多肽激素", "code": "P9023-1mg", "name": "ACTH(1-39) human", "pack": "1mg", "price": "591"}, {"cat": "多肽激素", "code": "P9023-5mg", "name": "ACTH(1-39) human", "pack": "5mg", "price": "2197"}, {"cat": "多肽激素", "code": "P9023-25mg", "name": "ACTH(1-39) human", "pack": "25mg", "price": "8229"}, {"cat": "多肽激素", "code": "P9028-1mg", "name": "ACTH(18-39) human", "pack": "1mg", "price": "338"}, {"cat": "多肽激素", "code": "P9028-5mg", "name": "ACTH(18-39) human", "pack": "5mg", "price": "1269"}, {"cat": "多肽激素", "code": "P9028-25mg", "name": "ACTH(18-39) human", "pack": "25mg", "price": "4753"}, {"cat": "多肽激素", "code": "P9032-1mg", "name": "ACTH(1-17) human", "pack": "1mg", "price": "227"}, {"cat": "多肽激素", "code": "P9032-5mg", "name": "ACTH(1-17) human", "pack": "5mg", "price": "836"}, {"cat": "多肽激素", "code": "P9032-25mg", "name": "ACTH(1-17) human", "pack": "25mg", "price": "3139"}, {"cat": "多肽激素", "code": "P9037-1mg", "name": "ACTH(1-10) human", "pack": "1mg", "price": "95"}, {"cat": "多肽激素", "code": "P9037-5mg", "name": "ACTH(1-10) human", "pack": "5mg", "price": "347"}, {"cat": "多肽激素", "code": "P9037-25mg", "name": "ACTH(1-10) human", "pack": "25mg", "price": "1291"}, {"cat": "多肽激素", "code": "P9041-1mg", "name": "ACTH(7-38) human", "pack": "1mg", "price": "456"}, {"cat": "多肽激素", "code": "P9041-5mg", "name": "ACTH(7-38) human", "pack": "5mg", "price": "1665"}, {"cat": "多肽激素", "code": "P9041-25mg", "name": "ACTH(7-38) human", "pack": "25mg", "price": "6238"}, {"cat": "多肽激素", "code": "P9046-5mg", "name": "Octreotide Acetate", "pack": "5mg", "price": "106"}, {"cat": "多肽激素", "code": "P9046-25mg", "name": "Octreotide Acetate", "pack": "25mg", "price": "398"}, {"cat": "多肽激素", "code": "P9046-100mg", "name": "Octreotide Acetate", "pack": "100mg", "price": "1268"}, {"cat": "多肽激素", "code": "P9050-5mg", "name": "Desmopressin Acetate", "pack": "5mg", "price": "131"}, {"cat": "多肽激素", "code": "P9050-25mg", "name": "Desmopressin Acetate", "pack": "25mg", "price": "496"}, {"cat": "多肽激素", "code": "P9050-100mg", "name": "Desmopressin Acetate", "pack": "100mg", "price": "1585"}, {"cat": "多肽激素", "code": "P9055-5mg", "name": "Leuprorelin Acetate", "pack": "5mg", "price": "157"}, {"cat": "多肽激素", "code": "P9055-25mg", "name": "Leuprorelin Acetate", "pack": "25mg", "price": "601"}, {"cat": "多肽激素", "code": "P9055-100mg", "name": "Leuprorelin Acetate", "pack": "100mg", "price": "1912"}, {"cat": "多肽激素", "code": "P9059-1mg", "name": "Mechano Growth Factor", "pack": "1mg", "price": "102"}, {"cat": "多肽激素", "code": "P9059-5mg", "name": "Mechano Growth Factor", "pack": "5mg", "price": "378"}, {"cat": "多肽激素", "code": "P9059-25mg", "name": "Mechano Growth Factor", "pack": "25mg", "price": "1427"}, {"cat": "多肽激素", "code": "P9064-1mg", "name": "Cetrorelix Acetate", "pack": "1mg", "price": "120"}, {"cat": "多肽激素", "code": "P9064-5mg", "name": "Cetrorelix Acetate", "pack": "5mg", "price": "453"}, {"cat": "多肽激素", "code": "P9064-25mg", "name": "Cetrorelix Acetate", "pack": "25mg", "price": "1719"}, {"cat": "多肽激素", "code": "P9068-1mg", "name": "Deslorelin Acetate", "pack": "1mg", "price": "212"}, {"cat": "多肽激素", "code": "P9068-5mg", "name": "Deslorelin Acetate", "pack": "5mg", "price": "793"}, {"cat": "多肽激素", "code": "P9068-25mg", "name": "Deslorelin Acetate", "pack": "25mg", "price": "2969"}, {"cat": "多肽激素", "code": "P9073-1mg", "name": "Teriparatide Acetate", "pack": "1mg", "price": "109"}, {"cat": "多肽激素", "code": "P9073-5mg", "name": "Teriparatide Acetate", "pack": "5mg", "price": "405"}, {"cat": "多肽激素", "code": "P9073-25mg", "name": "Teriparatide Acetate", "pack": "25mg", "price": "1498"}, {"cat": "多肽激素", "code": "P9077-5mg", "name": "Somatostatin Acetate", "pack": "5mg", "price": "111"}, {"cat": "多肽激素", "code": "P9077-25mg", "name": "Somatostatin Acetate", "pack": "25mg", "price": "418"}, {"cat": "多肽激素", "code": "P9077-100mg", "name": "Somatostatin Acetate", "pack": "100mg", "price": "1339"}, {"cat": "多肽激素", "code": "P9082-5mg", "name": "Oxytocin Acetate", "pack": "5mg", "price": "181"}, {"cat": "多肽激素", "code": "P9082-25mg", "name": "Oxytocin Acetate", "pack": "25mg", "price": "680"}, {"cat": "多肽激素", "code": "P9082-100mg", "name": "Oxytocin Acetate", "pack": "100mg", "price": "2178"}, {"cat": "多肽激素", "code": "P9085-5mg", "name": "Semaglutide", "pack": "5mg", "price": "298"}, {"cat": "多肽激素", "code": "P9085-25mg", "name": "Semaglutide", "pack": "25mg", "price": "698"}, {"cat": "多肽激素", "code": "P9085-100mg", "name": "Semaglutide", "pack": "100mg", "price": "1398"}, {"cat": "多肽激素", "code": "P9087-5mg", "name": "Semaglutide Intermediate P29", "pack": "5mg", "price": "189"}, {"cat": "多肽激素", "code": "P9087-25mg", "name": "Semaglutide Intermediate P29", "pack": "25mg", "price": "448"}, {"cat": "多肽激素", "code": "P9087-100mg", "name": "Semaglutide Intermediate P29", "pack": "100mg", "price": "886"}, {"cat": "多肽激素", "code": "P9089-5mg", "name": "Tirzepatide", "pack": "5mg", "price": "478"}, {"cat": "多肽激素", "code": "P9089-25mg", "name": "Tirzepatide", "pack": "25mg", "price": "1698"}, {"cat": "多肽激素", "code": "P9089-100mg", "name": "Tirzepatide", "pack": "100mg", "price": "4998"}, {"cat": "活性多肽", "code": "P9001-0.2mg", "name": "Amyloid β Peptide(1-42) human", "pack": "0.2mg", "price": "240"}, {"cat": "活性多肽", "code": "P9001-1mg", "name": "Amyloid β Peptide(1-42) human", "pack": "1mg", "price": "906"}, {"cat": "活性多肽", "code": "P9001-5mg", "name": "Amyloid β Peptide(1-42) human", "pack": "5mg", "price": "3388"}, {"cat": "活性多肽", "code": "P9001-20mg", "name": "Amyloid β Peptide(1-42) human", "pack": "20mg", "price": "7698"}, {"cat": "活性多肽", "code": "P9005-0.2mg", "name": "Amyloid β Peptide(42-1) human", "pack": "0.2mg", "price": "240"}, {"cat": "活性多肽", "code": "P9005-1mg", "name": "Amyloid β Peptide(42-1) human", "pack": "1mg", "price": "906"}, {"cat": "活性多肽", "code": "P9005-5mg", "name": "Amyloid β Peptide(42-1) human", "pack": "5mg", "price": "3388"}, {"cat": "活性多肽", "code": "P9010-0.2mg", "name": "Amyloid β Peptide(1-40) human", "pack": "0.2mg", "price": "233"}, {"cat": "活性多肽", "code": "P9010-1mg", "name": "Amyloid β Peptide(1-40) human", "pack": "1mg", "price": "871"}, {"cat": "活性多肽", "code": "P9010-5mg", "name": "Amyloid β Peptide(1-40) human", "pack": "5mg", "price": "3261"}, {"cat": "活性多肽", "code": "P9014-0.2mg", "name": "Amyloid β Peptide(40-1) human", "pack": "0.2mg", "price": "233"}, {"cat": "活性多肽", "code": "P9014-1mg", "name": "Amyloid β Peptide(40-1) human", "pack": "1mg", "price": "871"}, {"cat": "活性多肽", "code": "P9014-5mg", "name": "Amyloid β Peptide(40-1) human", "pack": "5mg", "price": "3261"}, {"cat": "活性多肽", "code": "P9085-5mg", "name": "Semaglutide", "pack": "5mg", "price": "298"}, {"cat": "活性多肽", "code": "P9085-25mg", "name": "Semaglutide", "pack": "25mg", "price": "698"}, {"cat": "活性多肽", "code": "P9085-100mg", "name": "Semaglutide", "pack": "100mg", "price": "1398"}, {"cat": "活性多肽", "code": "P9087-5mg", "name": "Semaglutide Intermediate P29", "pack": "5mg", "price": "189"}, {"cat": "活性多肽", "code": "P9087-25mg", "name": "Semaglutide Intermediate P29", "pack": "25mg", "price": "448"}, {"cat": "活性多肽", "code": "P9087-100mg", "name": "Semaglutide Intermediate P29", "pack": "100mg", "price": "886"}, {"cat": "活性多肽", "code": "P9089-5mg", "name": "Tirzepatide", "pack": "5mg", "price": "478"}, {"cat": "活性多肽", "code": "P9089-25mg", "name": "Tirzepatide", "pack": "25mg", "price": "1698"}, {"cat": "活性多肽", "code": "P9089-100mg", "name": "Tirzepatide", "pack": "100mg", "price": "4998"}, {"cat": "多肽底物", "code": "P9731-0.1ml", "name": "MCA-AVLQSGFR-Lys(Dnp)-Lys-NH2", "pack": "20mM×0.1ml", "price": "621"}, {"cat": "多肽底物", "code": "P9731-5mg", "name": "MCA-AVLQSGFR-Lys(Dnp)-Lys-NH2", "pack": "5mg", "price": "726"}, {"cat": "多肽底物", "code": "P9731-25mg", "name": "MCA-AVLQSGFR-Lys(Dnp)-Lys-NH2", "pack": "25mg", "price": "2900"}, {"cat": "多肽底物", "code": "P9733-0.1ml", "name": "Dabcyl-KTSAVLQSGFRKME-Edans", "pack": "20mM×0.1ml", "price": "652"}, {"cat": "多肽底物", "code": "P9733-5mg", "name": "Dabcyl-KTSAVLQSGFRKME-Edans", "pack": "5mg", "price": "726"}, {"cat": "多肽底物", "code": "P9733-25mg", "name": "Dabcyl-KTSAVLQSGFRKME-Edans", "pack": "25mg", "price": "2900"}, {"cat": "多肽底物", "code": "P9735-0.1ml", "name": "MCA-YVADAPK(Dnp)-OH", "pack": "20mM×0.1ml", "price": "621"}, {"cat": "多肽底物", "code": "P9735-5mg", "name": "MCA-YVADAPK(Dnp)-OH", "pack": "5mg", "price": "726"}, {"cat": "多肽底物", "code": "P9735-25mg", "name": "MCA-YVADAPK(Dnp)-OH", "pack": "25mg", "price": "2900"}, {"cat": "多肽底物", "code": "P9737-0.1ml", "name": "MCA-APK(Dnp)-OH", "pack": "20mM×0.1ml", "price": "621"}, {"cat": "多肽底物", "code": "P9737-5mg", "name": "MCA-APK(Dnp)-OH", "pack": "5mg", "price": "726"}, {"cat": "多肽底物", "code": "P9737-25mg", "name": "MCA-APK(Dnp)-OH", "pack": "25mg", "price": "2900"}, {"cat": "多肽底物", "code": "P9739-0.5ml", "name": "MCA-EIDLMVLDK-Dnp", "pack": "2mM×0.5ml", "price": "628"}, {"cat": "多肽底物", "code": "P9739-5mg", "name": "MCA-EIDLMVLDK-Dnp", "pack": "5mg", "price": "729"}, {"cat": "多肽底物", "code": "P9739-25mg", "name": "MCA-EIDLMVLDK-Dnp", "pack": "25mg", "price": "2908"}, {"cat": "多肽底物", "code": "P9742-5mg", "name": "Z-GGR-pNA", "pack": "5mg", "price": "168"}, {"cat": "多肽底物", "code": "P9742-0.1ml", "name": "Z-GGR-pNA", "pack": "20mM×0.1ml", "price": "196"}, {"cat": "多肽底物", "code": "P9742-25mg", "name": "Z-GGR-pNA", "pack": "25mg", "price": "696"}, {"cat": "多肽底物", "code": "P9745-5mg", "name": "Z-GGR-AMC", "pack": "5mg", "price": "169"}, {"cat": "多肽底物", "code": "P9745-0.1ml", "name": "Z-GGR-AMC", "pack": "20mM×0.1ml", "price": "198"}, {"cat": "多肽底物", "code": "P9745-25mg", "name": "Z-GGR-AMC", "pack": "25mg", "price": "698"}, {"cat": "多肽底物", "code": "P9701-0.1ml", "name": "Ac-YVAD-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9701-5mg", "name": "Ac-YVAD-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9701-25mg", "name": "Ac-YVAD-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9703-0.1ml", "name": "Ac-YVAD-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9703-5mg", "name": "Ac-YVAD-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9703-25mg", "name": "Ac-YVAD-AFC", "pack": "25mg", "price": "2198"}, {"cat": "多肽底物", "code": "P9705-0.1ml", "name": "Ac-VDQQD-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9705-5mg", "name": "Ac-VDQQD-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9705-25mg", "name": "Ac-VDQQD-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9707-0.1ml", "name": "Ac-VDVAD-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9707-5mg", "name": "Ac-VDVAD-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9707-25mg", "name": "Ac-VDVAD-AFC", "pack": "25mg", "price": "2198"}, {"cat": "多肽底物", "code": "P9710-0.1ml", "name": "Ac-DEVD-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9710-5mg", "name": "Ac-DEVD-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9710-25mg", "name": "Ac-DEVD-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9712-0.1ml", "name": "Ac-DEVD-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9712-5mg", "name": "Ac-DEVD-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9712-25mg", "name": "Ac-DEVD-AFC", "pack": "25mg", "price": "2198"}, {"cat": "多肽底物", "code": "P9714-0.1ml", "name": "Ac-LEVD-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9714-5mg", "name": "Ac-LEVD-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9714-25mg", "name": "Ac-LEVD-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9716-0.1ml", "name": "Ac-LEVD-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9716-5mg", "name": "Ac-LEVD-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9716-25mg", "name": "Ac-LEVD-AFC", "pack": "25mg", "price": "2198"}, {"cat": "多肽底物", "code": "P9719-0.1ml", "name": "Ac-VEID-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9719-5mg", "name": "Ac-VEID-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9719-25mg", "name": "Ac-VEID-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9721-0.1ml", "name": "Ac-VEID-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9721-5mg", "name": "Ac-VEID-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9721-25mg", "name": "Ac-VEID-AFC", "pack": "25mg", "price": "2198"}, {"cat": "多肽底物", "code": "P9723-0.1ml", "name": "Ac-IETD-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9723-5mg", "name": "Ac-IETD-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9723-25mg", "name": "Ac-IETD-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9725-0.1ml", "name": "Ac-IETD-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9725-5mg", "name": "Ac-IETD-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9725-25mg", "name": "Ac-IETD-AFC", "pack": "25mg", "price": "2198"}, {"cat": "多肽底物", "code": "P9728-0.1ml", "name": "Ac-LEHD-pNA", "pack": "20mM×0.1ml", "price": "431"}, {"cat": "多肽底物", "code": "P9728-5mg", "name": "Ac-LEHD-pNA", "pack": "5mg", "price": "441"}, {"cat": "多肽底物", "code": "P9728-25mg", "name": "Ac-LEHD-pNA", "pack": "25mg", "price": "1539"}, {"cat": "多肽底物", "code": "P9730-0.1ml", "name": "Ac-LEHD-AFC", "pack": "20mM×0.1ml", "price": "498"}, {"cat": "多肽底物", "code": "P9730-5mg", "name": "Ac-LEHD-AFC", "pack": "5mg", "price": "728"}, {"cat": "多肽底物", "code": "P9730-25mg", "name": "Ac-LEHD-AFC", "pack": "25mg", "price": "2198"}, {"cat": "竞争性多肽", "code": "P9801-1mg", "name": "3X Flag Peptide", "pack": "5mg/ml×0.2ml", "price": "208"}, {"cat": "竞争性多肽", "code": "P9801-5mg", "name": "3X Flag Peptide", "pack": "5mg/ml×1ml", "price": "658"}, {"cat": "竞争性多肽", "code": "P9801-25mg", "name": "3X Flag Peptide", "pack": "25mg", "price": "2089"}, {"cat": "竞争性多肽", "code": "P9805-1mg", "name": "c-Myc Peptide", "pack": "5mg/ml×0.2ml", "price": "196"}, {"cat": "竞争性多肽", "code": "P9805-5mg", "name": "c-Myc Peptide", "pack": "5mg/ml×1ml", "price": "620"}, {"cat": "竞争性多肽", "code": "P9805-25mg", "name": "c-Myc Peptide", "pack": "25mg", "price": "2070"}, {"cat": "竞争性多肽", "code": "P9808-1mg", "name": "HA Peptide", "pack": "5mg/ml×0.2ml", "price": "203"}, {"cat": "竞争性多肽", "code": "P9808-5mg", "name": "HA Peptide", "pack": "5mg/ml×1ml", "price": "621"}, {"cat": "竞争性多肽", "code": "P9808-25mg", "name": "HA Peptide", "pack": "25mg", "price": "2071"}, {"cat": "竞争性多肽", "code": "P9811-1mg", "name": "6X His Peptide", "pack": "5mg/ml×0.2ml", "price": "182"}, {"cat": "竞争性多肽", "code": "P9811-5mg", "name": "6X His Peptide", "pack": "5mg/ml×1ml", "price": "617"}, {"cat": "竞争性多肽", "code": "P9811-25mg", "name": "6X His Peptide", "pack": "25mg", "price": "2068"}, {"cat": "竞争性多肽", "code": "P9813-1mg", "name": "V5 Tag Peptide", "pack": "5mg/ml×0.2ml", "price": "185"}, {"cat": "竞争性多肽", "code": "P9813-5mg", "name": "V5 Tag Peptide", "pack": "5mg/ml×1ml", "price": "617"}, {"cat": "竞争性多肽", "code": "P9813-25mg", "name": "V5 Tag Peptide", "pack": "25mg", "price": "2070"}, {"cat": "竞争性多肽", "code": "P9816-1mg", "name": "S Tag Peptide", "pack": "5mg/ml×0.2ml", "price": "185"}, {"cat": "竞争性多肽", "code": "P9816-5mg", "name": "S Tag Peptide", "pack": "5mg/ml×1ml", "price": "617"}, {"cat": "竞争性多肽", "code": "P9816-25mg", "name": "S Tag Peptide", "pack": "25mg", "price": "2068"}, {"cat": "竞争性多肽", "code": "P9819-1mg", "name": "T7 Tag Peptide", "pack": "5mg/ml×0.2ml", "price": "183"}, {"cat": "竞争性多肽", "code": "P9819-5mg", "name": "T7 Tag Peptide", "pack": "5mg/ml×1ml", "price": "618"}, {"cat": "竞争性多肽", "code": "P9819-25mg", "name": "T7 Tag Peptide", "pack": "25mg", "price": "2069"}, {"cat": "竞争性多肽", "code": "P9822-1mg", "name": "VSV-G Tag Peptide", "pack": "5mg/ml×0.2ml", "price": "186"}, {"cat": "竞争性多肽", "code": "P9822-5mg", "name": "VSV-G Tag Peptide", "pack": "5mg/ml×1ml", "price": "609"}, {"cat": "竞争性多肽", "code": "P9822-25mg", "name": "VSV-G Tag Peptide", "pack": "25mg", "price": "2060"}, {"cat": "竞争性多肽", "code": "P9825-1mg", "name": "PA Tag Peptide", "pack": "5mg/ml×0.2ml", "price": "196"}, {"cat": "竞争性多肽", "code": "P9825-5mg", "name": "PA Tag Peptide", "pack": "5mg/ml×1ml", "price": "620"}, {"cat": "竞争性多肽", "code": "P9825-25mg", "name": "PA Tag Peptide", "pack": "25mg", "price": "2070"}];
