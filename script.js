document.addEventListener('DOMContentLoaded', function () {

    /* ─── CUSTOM CURSOR ─── */
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) {
        let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX; mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top  = mouseY + 'px';
        });
        (function animateRing() {
            ringX += (mouseX - ringX) * 0.14;
            ringY += (mouseY - ringY) * 0.14;
            ring.style.left = ringX + 'px';
            ring.style.top  = ringY + 'px';
            requestAnimationFrame(animateRing);
        })();
    }

    /* ─── PARTICLE CONSTELLATION ─── */
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];
        const PARTICLE_COUNT = 80;
        const CONNECT_DIST = 130;
        let mouse = { x: null, y: null };

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W) this.vx *= -1;
                if (this.y < 0 || this.y > H) this.vy *= -1;
                // Mouse repulsion
                if (mouse.x !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 100) {
                        this.x += dx / dist * 1.5;
                        this.y += dy / dist * 1.5;
                    }
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99,179,237,${this.alpha})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

        function drawParticles() {
            ctx.clearRect(0, 0, W, H);
            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < CONNECT_DIST) {
                        const alpha = (1 - dist / CONNECT_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(99,179,237,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    /* ─── TYPED TEXT ─── */
    const typedEl = document.getElementById('typedText');
    if (typedEl) {
        const phrases = [
            'elegant web apps.',
            'ML solutions.',
            'clean UI/UX.',
            'robust backends.',
            'data pipelines.'
        ];
        let phraseIdx = 0, charIdx = 0, isDeleting = false;
        function type() {
            const current = phrases[phraseIdx];
            typedEl.textContent = isDeleting
                ? current.substring(0, charIdx--)
                : current.substring(0, charIdx++);
            let delay = isDeleting ? 50 : 90;
            if (!isDeleting && charIdx > current.length) {
                delay = 1600; isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
                delay = 300;
            }
            setTimeout(type, delay);
        }
        setTimeout(type, 1000);
    }

    /* ─── COUNT-UP STATS ─── */
    const statNums = document.querySelectorAll('.stat-num');
    function countUp(el) {
        const target = parseFloat(el.dataset.target);
        const duration = 1200;
        const step = target / (duration / 16);
        let current = 0;
        const tick = () => {
            current = Math.min(current + step, target);
            el.textContent = Number.isInteger(target) ? Math.floor(current) : current.toFixed(0);
            if (current < target) requestAnimationFrame(tick);
        };
        tick();
    }

    /* ─── REVEAL ON SCROLL ─── */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Trigger count-up if it's a stat
                if (entry.target.classList.contains('reveal-stat')) {
                    const num = entry.target.querySelector('.stat-num');
                    if (num && !num.dataset.counted) {
                        num.dataset.counted = 'true';
                        countUp(num);
                    }
                }
                // Trigger skill bars
                const bars = entry.target.querySelectorAll('.skill-bar-fill');
                bars.forEach((bar, i) => {
                    setTimeout(() => bar.classList.add('animated'), i * 100 + 200);
                });
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-stat').forEach(el => revealObserver.observe(el));

    // Make stats count on load if already visible
    statNums.forEach(el => {
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !el.dataset.counted) {
                el.dataset.counted = 'true';
                countUp(el);
                obs.disconnect();
            }
        });
        obs.observe(el);
    });

    /* ─── SKILLS CHART ─── */
    const skillsData = {
        all: {
            labels: ['Java', 'Python', 'JavaScript', 'HTML/CSS', 'Tailwind', 'Git/GitHub', 'VS Code'],
            data: [85, 80, 85, 95, 85, 90, 95]
        },
        languages: {
            labels: ['Java', 'Python', 'C', 'JavaScript'],
            data: [85, 80, 75, 85]
        },
        frontend: {
            labels: ['HTML', 'CSS', 'Tailwind CSS', 'JavaScript'],
            data: [95, 90, 85, 85]
        },
        tools: {
            labels: ['Git', 'GitHub', 'VS Code'],
            data: [90, 90, 95]
        }
    };

    const chartEl = document.getElementById('skillsChart');
    if (!chartEl) return;
    const ctx2 = chartEl.getContext('2d');

    Chart.defaults.color = '#8892a4';
    Chart.defaults.font.family = "'Space Mono', monospace";

    const skillsChart = new Chart(ctx2, {
        type: 'radar',
        data: {
            labels: skillsData.all.labels,
            datasets: [{
                label: 'Proficiency',
                data: skillsData.all.data,
                backgroundColor: 'rgba(99,179,237,0.12)',
                borderColor: '#63b3ed',
                borderWidth: 1.5,
                pointBackgroundColor: '#63b3ed',
                pointBorderColor: '#090e1c',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#90cdf4',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700, easing: 'easeInOutQuart' },
            scales: {
                r: {
                    min: 0, max: 100,
                    angleLines: { color: 'rgba(255,255,255,0.05)', lineWidth: 1 },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    pointLabels: {
                        font: { size: 12, weight: '700', family: "'Space Mono', monospace" },
                        color: '#f0f4ff',
                        padding: 12
                    },
                    ticks: { display: false, stepSize: 20 }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(13,21,38,0.96)',
                    titleColor: '#63b3ed',
                    bodyColor: '#f0f4ff',
                    borderColor: 'rgba(99,179,237,0.3)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: ctx => ` ${ctx.raw}% proficiency`
                    }
                }
            }
        }
    });

    // Skill Bars
    function renderSkillBars(category) {
        const container = document.getElementById('skillBars');
        if (!container) return;
        const d = skillsData[category];
        container.innerHTML = d.labels.map((label, i) => `
            <div class="skill-bar-item">
                <div class="skill-bar-header">
                    <span class="skill-bar-name">${label}</span>
                    <span class="skill-bar-pct">${d.data[i]}%</span>
                </div>
                <div class="skill-bar-track">
                    <div class="skill-bar-fill" style="--target: ${d.data[i] / 100}"></div>
                </div>
            </div>
        `).join('');
        // Animate bars
        requestAnimationFrame(() => {
            container.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
                bar.style.transform = 'scaleX(0)';
                setTimeout(() => {
                    bar.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
                    bar.style.transform = `scaleX(${parseFloat(bar.style.getPropertyValue('--target'))})`;
                }, i * 80 + 100);
            });
        });
    }
    renderSkillBars('all');

    // Skill Buttons
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const cat = this.dataset.category;
            const d = skillsData[cat];
            skillsChart.data.labels = d.labels;
            skillsChart.data.datasets[0].data = d.data;
            skillsChart.update();
            renderSkillBars(cat);
        });
    });

    /* ─── SCROLL SPY ─── */
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (pageYOffset >= section.offsetTop - section.clientHeight / 3) {
                current = section.id;
            }
        });
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            current = 'contact';
        }
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href').includes(current));
        });
    });

    /* ─── SMOOTH SCROLL ─── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, this.getAttribute('href'));
            }
        });
    });

    /* ─── DRAG TO SCROLL (Projects) ─── */
    const slider = document.querySelector('.grid-container');
    if (slider) {
        let isDown = false, startX, scrollLeft;
        slider.addEventListener('mousedown', e => {
            isDown = true;
            slider.classList.add('active');
            slider.style.scrollSnapType = 'none';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        const stop = () => {
            isDown = false;
            slider.classList.remove('active');
            slider.style.scrollSnapType = 'x mandatory';
        };
        slider.addEventListener('mouseleave', stop);
        slider.addEventListener('mouseup', stop);
        slider.addEventListener('mousemove', e => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            slider.scrollLeft = scrollLeft - (x - startX) * 2;
        });
    }

    /* ─── ARROW SCROLL BUTTONS ─── */
    const leftBtn  = document.getElementById('scrollLeft');
    const rightBtn = document.getElementById('scrollRight');
    if (leftBtn && rightBtn && slider) {
        const getCardW = () => (slider.querySelector('.card')?.offsetWidth ?? 300) + 24;
        leftBtn.addEventListener('click', () => slider.scrollBy({ left: -getCardW(), behavior: 'smooth' }));
        rightBtn.addEventListener('click', () => slider.scrollBy({ left:  getCardW(), behavior: 'smooth' }));
    }

    /* ─── 3D CARD TILT ─── */
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -8;
            const rotY = ((x - cx) / cx) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
            // Update shine position
            const shine = card.querySelector('.card-shine');
            if (shine) {
                shine.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
                shine.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
            }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ─── SKILL BARS INTERSECTION OBSERVER ─── */
    const skillBarsContainer = document.getElementById('skillBars');
    if (skillBarsContainer) {
        const barObs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                skillBarsContainer.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
                    setTimeout(() => bar.classList.add('animated'), i * 80 + 100);
                });
                barObs.disconnect();
            }
        }, { threshold: 0.2 });
        barObs.observe(skillBarsContainer);
    }

    /* ─── ACHIEVEMENT CARDS STAGGER ─── */
    const achCards = document.querySelectorAll('.achievement-card, .edu-card');
    const staggerObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseFloat(getComputedStyle(entry.target).getPropertyValue('--delay')) * 1000 || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                staggerObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    achCards.forEach(el => staggerObs.observe(el));

});