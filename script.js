document.addEventListener('DOMContentLoaded', function () {
    // Skill data extracted exactly from Resume
    const skillsData = {
        all: {
            labels: ['Java', 'Python', 'JavaScript', 'HTML/CSS', 'Tailwind', 'Git/GitHub', 'VS Code', 'Android Studio'],
            data: [85, 80, 85, 95, 85, 90, 95, 75]
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
            labels: ['Git', 'GitHub', 'VS Code', 'Android Studio'],
            data: [90, 90, 95, 75]
        }
    };

    const chartElement = document.getElementById('skillsChart');
    // Guard clause to prevent errors if chart element is missing
    if (!chartElement) return;

    const ctx = chartElement.getContext('2d');
    
    // Theme Constants
    const THEME = {
        primary: '#3b82f6',
        primaryGlass: 'rgba(59, 130, 246, 0.25)',
        text: '#cbd5e1',
        textLight: '#ffffff',
        grid: 'rgba(255, 255, 255, 0.08)',
        tooltipBg: 'rgba(15, 23, 42, 0.95)'
    };

    // Customizing Chart.js to match the dark glowing theme
    Chart.defaults.color = THEME.text;
    Chart.defaults.font.family = "'Inter', sans-serif";

    const skillsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: skillsData.all.labels,
            datasets: [{
                label: 'Proficiency',
                data: skillsData.all.data,
                backgroundColor: THEME.primaryGlass,
                borderColor: THEME.primary,
                borderWidth: 2,
                pointBackgroundColor: THEME.primary,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: THEME.primary,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: THEME.grid },
                    grid: { color: THEME.grid },
                    pointLabels: {
                        font: { size: 14, weight: '600', family: "'Inter', sans-serif" },
                        color: THEME.textLight
                    },
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20,
                        display: false // Hides numbers inside chart for cleaner look
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: THEME.tooltipBg,
                    titleColor: '#93c5fd',
                    bodyColor: '#fff',
                    borderColor: THEME.primary,
                    borderWidth: 1
                }
            }
        }
    });

    const skillButtons = document.querySelectorAll('.skill-btn');
    
    function updateChart(category) {
        const newData = skillsData[category];
        skillsChart.data.labels = newData.labels;
        skillsChart.data.datasets[0].data = newData.data;
        skillsChart.update();
    }

    // Handle filter button clicks
    skillButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all
            skillButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked
            this.classList.add('active');
            
            const category = this.dataset.category;
            updateChart(category);
        });
    });
    
    // Smooth scrolling logic for the Glass Navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                // Update URL history without jumping
                history.pushState(null, null, targetId);
            }
        });
    });

    // Scroll Spy: Highlight active nav link based on scroll position
    const sections = document.querySelectorAll('section, footer');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        // Ensure Contact highlights when reaching the bottom of the page
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            current = 'contact';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Drag to Scroll functionality for Projects
    const slider = document.querySelector('.grid-container');
    if (slider) {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            slider.style.scrollSnapType = 'none';
            slider.style.scrollBehavior = 'auto';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        const stopDragging = () => {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('active');
            slider.style.scrollSnapType = 'x mandatory';
            slider.style.scrollBehavior = 'smooth';
        };

        slider.addEventListener('mouseleave', stopDragging);
        slider.addEventListener('mouseup', stopDragging);

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Scroll speed multiplier
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    // Arrow Button Scrolling
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    
    if (scrollLeftBtn && scrollRightBtn && slider) {
        scrollLeftBtn.addEventListener('click', () => {
            const cardWidth = slider.querySelector('.card').offsetWidth + 25; // Card width + gap
            slider.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });

        scrollRightBtn.addEventListener('click', () => {
            const cardWidth = slider.querySelector('.card').offsetWidth + 25; // Card width + gap
            slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
    }
});