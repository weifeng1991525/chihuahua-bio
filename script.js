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

    // --- Form Submit with Email ---
    const form = document.getElementById('inquiryForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.textContent = '提交中...';
            btn.disabled = true;

            // Get form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                sequence: formData.get('sequence'),
                details: formData.get('details')
            };

            // Send email using EmailJS (or similar service)
            // Using mailto as fallback for static site
            const subject = encodeURIComponent(`【吉娃娃生物】在线询价 - ${data.name}`);
            const body = encodeURIComponent(
                `姓名：${data.name}\n` +
                `电话：${data.phone}\n` +
                `邮箱：${data.email || '未填写'}\n` +
                `多肽序列/需求：${data.sequence || '未填写'}\n` +
                `详细需求：\n${data.details || '未填写'}\n\n` +
                `---\n此邮件来自吉娃娃生物官网在线询价表单`
            );

            // Try to send via mailto
            const mailtoLink = `mailto:29152039@qq.com?subject=${subject}&body=${body}`;
            
            // Open mailto link
            window.location.href = mailtoLink;

            // Show success message
            setTimeout(() => {
                btn.textContent = '✓ 提交成功！';
                btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                
                // Also try to send via Formspree as backup (if configured)
                sendToFormspree(data);
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    form.reset();
                }, 3000);
            }, 1000);
        });
    }

    // Helper function to send to Formspree (free form backend)
    async function sendToFormspree(data) {
        try {
            // Using Formspree - you need to sign up and replace the endpoint
            // For now, this is a placeholder that will fail gracefully
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    _replyto: data.email,
                    _subject: `【吉娃娃生物】在线询价 - ${data.name}`
                })
            });
        } catch (e) {
            // Silently fail - mailto is the primary method
            console.log('Formspree not configured, using mailto');
        }
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

});
