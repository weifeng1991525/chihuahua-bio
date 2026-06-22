/* ============================================
   吉娃娃生物 - Genewawa
   Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Hero Canvas: Molecular Background Animation ---
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animFrame;

        function resize() {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        }

        function createParticles() {
            particles = [];
            const count = Math.min(Math.floor(canvas.width * canvas.height / 15000), 60);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    r: Math.random() * 3 + 1.5,
                    color: Math.random() > 0.5 ? 'rgba(0,201,167,' : 'rgba(8,145,178,'
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0,201,167,${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            // Draw & update particles
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.4)';
                ctx.fill();

                // Glow
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = p.color + '0.08)';
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });

            animFrame = requestAnimationFrame(draw);
        }

        resize();
        createParticles();
        draw();

        window.addEventListener('resize', () => {
            resize();
            createParticles();
        });
    }

    // --- Sticky Nav Shadow ---
    const nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // --- Mobile Menu ---
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navList = document.querySelector('.nav-list');
    if (mobileBtn && navList) {
        mobileBtn.addEventListener('click', () => {
            navList.classList.toggle('active');
            const spans = mobileBtn.querySelectorAll('span');
            if (navList.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // Close on link click
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                const spans = mobileBtn.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }

    // --- Active Nav on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');

    function updateActiveNav() {
        const scrollPos = window.scrollY + 120;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    const href = item.querySelector('a').getAttribute('href');
                    if (href === '#' + id) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // --- Floating Contact Toggle ---
    const floatBtn = document.getElementById('floatBtn');
    const floatPanel = document.getElementById('floatPanel');
    if (floatBtn && floatPanel) {
        floatBtn.addEventListener('click', () => {
            floatPanel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-contact')) {
                floatPanel.classList.remove('active');
            }
        });
    }

    // --- Back to Top ---
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Scroll Reveal Animation ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe service cards, product cards, advantage items
    document.querySelectorAll('.service-card, .product-card, .advantage-item, .tech-feature, .custom-card, .news-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Stagger animation for grid items
    document.querySelectorAll('.services-grid .service-card, .products-grid .product-card, .advantages-grid .advantage-item, .custom-grid .custom-card, .news-grid .news-card').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
    });

    // --- Tech Knowledge Tab Switching ---
    const techTabs = document.querySelectorAll('.tech-tab');
    const techContents = document.querySelectorAll('.tech-tab-content');
    if (techTabs.length > 0) {
        techTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                techTabs.forEach(t => t.classList.remove('active'));
                techContents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                const targetContent = document.getElementById('tab-' + target);
                if (targetContent) targetContent.classList.add('active');
            });
        });
    }

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // AI Plan Generator
    // ============================================

    // Helper: safely get element
    function $(id) { return document.getElementById(id); }

    const aiPlanBtn = $('aiPlanBtn');
    const aiModalOverlay = $('aiModalOverlay');
    const aiModalClose = $('aiModalClose');
    const aiGenerateBtn = $('aiGenerateBtn');
    const aiRegenerateBtn = $('aiRegenerateBtn');
    const aiDownloadBtn = $('aiDownloadBtn');
    const aiRetryBtn = $('aiRetryBtn');

    const aiStepInput = $('aiStepInput');
    const aiStepLoading = $('aiStepLoading');
    const aiStepResult = $('aiStepResult');
    const aiStepError = $('aiStepError');

    const aiDesc = $('aiDesc');
    const aiName = $('aiName');
    const aiPhone = $('aiPhone');
    const aiEmail = $('aiEmail');
    const aiLoadingText = $('aiLoadingText');
    const aiProgressFill = $('aiProgressFill');
    const aiResultContent = $('aiResultContent');
    const aiErrorText = $('aiErrorText');

    let currentPlanText = '';
    let currentPlanHtml = '';
    let currentCustomerInfo = {};

    // AGENS API Configuration
    const AGENS_API_URL = 'https://apihub.agnes-ai.com/v1/chat/completions';
    const AGENS_API_KEY = 'sk-wvjRUdJZUq37FzP1lZMLKgrL3tqtuaP7xqeNaEbc1pYjIonG';

    // EmailJS Configuration (for sending emails from frontend)
    const EMAILJS_SERVICE_ID = 'service_genewawa';
    const EMAILJS_TEMPLATE_ID = 'template_inquiry';
    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Will use mailto fallback

    // Knowledge base context for better AI responses
    const KB_CONTEXT = `你是一位资深多肽合成与设计专家，精通Fmoc固相多肽合成(SPPS)、多肽修饰、质量控制等领域。请基于以下专业知识生成方案：

【合成方法】
- Fmoc-SPPS: 主流方法，每步偶联效率70-95%，适合2-50aa
- 偶联试剂: HBTU/HOBt/DIEA(高效低成本), HATU/HOAt/DIEA(极高效率低消旋), PyBOP, Oxyma Pure/DIC(低毒性)
- 树脂: Wang(游离酸), Rink Amide(酰胺), 2-CTC(敏感序列)
- 裂解: TFA/TIS/H2O 95:2.5:2.5, 含Cys/Met/Trp需加清除剂

【常见修饰】
- N端: 乙酰化(+42.01), 生物素化(+226.08), FITC(+389.38), PEG化, 脂肪酸偶联
- C端: 酰胺化(-0.98)
- 侧链: 磷酸化(+79.98), 甲基化(+14.02), 二硫键(-2.02), 环化(-18.02)

【质控标准】
- HPLC纯度: >95%(研究级), >98%(药典级)
- MS分子量: 理论值+-1 Da
- AAA氨基酸分析: 偏差<10%

【设计原则】
- N端乙酰化+C端酰胺化提高稳定性
- D型氨基酸替换抗酶解
- 环化提高稳定性和亲和力
- PEGylation提高半衰期
- 避免长疏水序列(>5连续疏水aa)`;

    function openModal() {
        if (!aiModalOverlay) { console.error('Modal overlay not found'); return; }
        aiModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetForm();
    }

    function closeModal() {
        if (!aiModalOverlay) return;
        aiModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function resetForm() {
        showStep('input');
        if (aiDesc) aiDesc.value = '';
        if (aiName) aiName.value = '';
        if (aiPhone) aiPhone.value = '';
        if (aiEmail) aiEmail.value = '';
        currentPlanText = '';
        currentPlanHtml = '';
        currentCustomerInfo = {};
    }

    function showStep(step) {
        if (aiStepInput) aiStepInput.style.display = step === 'input' ? 'block' : 'none';
        if (aiStepLoading) aiStepLoading.style.display = step === 'loading' ? 'block' : 'none';
        if (aiStepResult) aiStepResult.style.display = step === 'result' ? 'block' : 'none';
        if (aiStepError) aiStepError.style.display = step === 'error' ? 'block' : 'none';
    }

    function setLoadingProgress(percent, text) {
        if (aiProgressFill) aiProgressFill.style.width = percent + '%';
        if (aiLoadingText && text) aiLoadingText.textContent = text;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function markdownToHtml(md) {
        let html = escapeHtml(md);
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">$1</code>');
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
        html = html.replace(/\n/g, '<br>');
        html = html.replace(/(<br>){3,}/g, '<br><br>');
        return html;
    }

    function buildPrompt(desc, name, phone, email) {
        return `请作为吉娃娃生物(Genewawa)的多肽技术专家，为客户生成一份专业的多肽定制设计方案报告。

【客户信息】
- 姓名: ${name || '未提供'}
- 电话: ${phone || '未提供'}
- 邮箱: ${email || '未提供'}

【客户需求】
${desc}

请生成一份结构完整、专业详细的多肽定制设计方案，包含以下章节：

# 一、项目概述
简要说明项目背景和目标。

# 二、需求分析
详细分析客户需求的各个维度（序列、长度、修饰、纯度、数量、用途等）。

# 三、多肽设计方案
- 推荐序列（如客户未提供）
- 理化参数分析：分子量(MW)、等电点(pI)、净电荷(@pH7.0)、疏水性
- 稳定性评估
- 溶解性建议

# 四、合成方案
- 合成策略（Fmoc-SPPS）
- 树脂选择建议
- 偶联试剂推荐
- 关键步骤注意事项
- 预期合成难度等级(A/B/C/D)

# 五、修饰方案（如适用）
详细说明每种修饰的引入方法和注意事项。

# 六、质量控制方案
- HPLC纯度检测
- MS分子量确认
- 其他必要检测

# 七、项目周期与报价估算
- 合成周期（工作日）
- 各阶段时间节点
- 预估报价范围（元）

# 八、风险评估与建议
- 潜在技术风险
- 应对策略
- 优化建议

# 九、交付内容
列出最终交付给客户的产品和文档清单。

请使用专业但易懂的语言，确保方案具有实际可操作性。所有参数和评估必须基于科学原理和行业经验。`;
    }

    async function callAgensAPI(prompt) {
        const response = await fetch(AGENS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AGENS_API_KEY}`
            },
            body: JSON.stringify({
                model: 'agnes-2.0-flash',
                messages: [
                    { role: 'system', content: KB_CONTEXT },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API错误 (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Send customer inquiry via mailto + form-submit fallback
    function sendCustomerInfo(name, phone, email, desc, planText) {
        const subject = encodeURIComponent(`[吉娃娃生物] 多肽定制方案咨询 - ${name || '新客户'}`);
        const body = encodeURIComponent(
            `客户信息：\n` +
            `姓名：${name || '未提供'}\n` +
            `电话：${phone || '未提供'}\n` +
            `邮箱：${email || '未提供'}\n\n` +
            `需求描述：\n${desc}\n\n` +
            `--- AI生成方案 ---\n${planText ? planText.substring(0, 2000) : '（方案生成中）'}\n\n` +
            `--- 系统信息 ---\n提交时间：${new Date().toLocaleString('zh-CN')}\n来源：吉娃娃生物官网AI方案生成器`
        );

        // Open mailto link
        window.open(`mailto:29152039@qq.com?subject=${subject}&body=${body}`, '_blank');
    }

    // Also try to submit to a form endpoint if available (Formspree as fallback)
    async function submitToFormspree(name, phone, email, desc) {
        try {
            const formData = new FormData();
            formData.append('name', name || '未提供');
            formData.append('phone', phone || '未提供');
            formData.append('email', email || '未提供');
            formData.append('message', desc);
            formData.append('_subject', `[吉娃娃生物] 多肽定制方案咨询 - ${name || '新客户'}`);

            await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
        } catch (e) {
            // Silently fail - mailto is the primary method
        }
    }

    async function generatePlan() {
        if (!aiDesc) return;
        const desc = aiDesc.value.trim();
        if (!desc) {
            alert('请填写需求描述');
            aiDesc.focus();
            return;
        }

        const name = aiName ? aiName.value.trim() : '';
        const phone = aiPhone ? aiPhone.value.trim() : '';
        const email = aiEmail ? aiEmail.value.trim() : '';

        // Save customer info for email
        currentCustomerInfo = { name, phone, email, desc };

        showStep('loading');
        setLoadingProgress(10, '正在分析需求...');

        const progressInterval = setInterval(() => {
            const current = parseInt(aiProgressFill ? aiProgressFill.style.width : '10') || 10;
            if (current < 80) {
                setLoadingProgress(current + Math.random() * 15,
                    current < 30 ? '正在分析需求...' :
                    current < 50 ? '正在设计多肽序列与参数...' :
                    current < 65 ? '正在制定合成与修饰方案...' :
                    '正在生成质控标准与报价...');
            }
        }, 800);

        try {
            const prompt = buildPrompt(desc, name, phone, email);
            const result = await callAgensAPI(prompt);

            clearInterval(progressInterval);
            setLoadingProgress(100, '方案生成完成！');

            currentPlanText = result;
            currentPlanHtml = markdownToHtml(result);

            // Send email with customer info and plan
            sendCustomerInfo(name, phone, email, desc, currentPlanText);

            setTimeout(() => {
                if (aiResultContent) aiResultContent.innerHTML = currentPlanHtml;
                showStep('result');
            }, 500);

        } catch (error) {
            clearInterval(progressInterval);
            console.error('AI Plan generation error:', error);
            if (aiErrorText) aiErrorText.textContent = error.message || '网络连接失败，请检查网络后重试';
            showStep('error');
        }
    }

    function downloadPlan() {
        if (!currentPlanText) return;

        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `吉娃娃生物_多肽定制方案_${timestamp}.html`;

        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>多肽定制设计方案 - 吉娃娃生物</title>
    <style>
        body { font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #334155; }
        h1 { font-size: 24px; color: #0F172A; border-bottom: 3px solid #00C9A7; padding-bottom: 10px; margin-top: 32px; }
        h2 { font-size: 20px; color: #0F172A; margin-top: 28px; border-left: 4px solid #0891B2; padding-left: 12px; }
        h3 { font-size: 17px; color: #1E293B; margin-top: 20px; }
        h4 { font-size: 15px; color: #334155; margin-top: 16px; }
        p { margin-bottom: 12px; }
        ul, ol { margin-bottom: 12px; padding-left: 24px; }
        li { margin-bottom: 6px; }
        strong { color: #0F172A; }
        code { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 13px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        th, td { padding: 10px 12px; border: 1px solid #e2e8f0; text-align: left; }
        th { background: linear-gradient(135deg, #00C9A7, #0891B2); color: white; font-weight: 600; }
        tr:nth-child(even) { background: #f8fafc; }
        .header { text-align: center; padding: 30px; background: linear-gradient(135deg, #0F172A, #1E293B); color: white; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { color: white; border: none; margin: 0; font-size: 28px; }
        .header p { color: rgba(255,255,255,0.7); margin: 8px 0 0; }
        .footer { text-align: center; margin-top: 40px; padding: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748B; }
        .footer strong { color: #00C9A7; }
        @media print { body { margin: 0; } .no-print { display: none; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>多肽定制设计方案</h1>
        <p>广西吉娃娃生物科技有限公司 (Genewawa) | 专业多肽技术服务</p>
    </div>
    <div class="content">
        ${currentPlanHtml}
    </div>
    <div class="footer">
        <p><strong>吉娃娃生物</strong> | 咨询电话: 13317714667 | 邮箱: genewawa@foxmail.com</p>
        <p>广西南宁市青秀区新岸路6号</p>
        <p style="font-size:12px;color:#94A3B8;margin-top:8px;">本方案由AI辅助生成，仅供参考。最终方案以技术团队评估为准。</p>
    </div>
</body>
</html>`;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Bind all event listeners with null checks
    function bindEvents() {
        if (aiPlanBtn) {
            aiPlanBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                openModal();
            });
        } else {
            console.error('aiPlanBtn not found');
        }

        if (aiModalClose) {
            aiModalClose.addEventListener('click', closeModal);
        }

        if (aiModalOverlay) {
            aiModalOverlay.addEventListener('click', (e) => {
                if (e.target === aiModalOverlay) closeModal();
            });
        }

        if (aiGenerateBtn) {
            aiGenerateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                generatePlan();
            });
        }

        if (aiRegenerateBtn) {
            aiRegenerateBtn.addEventListener('click', () => showStep('input'));
        }

        if (aiDownloadBtn) {
            aiDownloadBtn.addEventListener('click', downloadPlan);
        }

        if (aiRetryBtn) {
            aiRetryBtn.addEventListener('click', generatePlan);
        }

        if (aiDesc) {
            aiDesc.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    generatePlan();
                }
            });
        }
    }

    // Initialize
    bindEvents();

});
