document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.project-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    function createParticles() {
        const container = document.getElementById('particles-container');
        if (container) {
            const particleCount = 30;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');

                const size = Math.random() * 8 + 4;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDelay = `${Math.random() * 12}s`;
                particle.style.animationDuration = `${8 + Math.random() * 12}s`;

                container.appendChild(particle);
            }
        }
    }

    function createWaterParticles() {
        const container = document.getElementById('water-particles-container');
        if (container) {
            const particleCount = 50;
            const containerWidth = container.offsetWidth || 400; // fallback width

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('water-particle');

                const size = Math.random() * 10 + 5;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Spawn from the sides
                const isLeft = Math.random() > 0.5;
                particle.style.bottom = `${Math.random() * 80 - 20}px`;

                // Calculate middle target + some random spread
                const targetX = (containerWidth / 2) + (Math.random() * 60 - 30);

                if (isLeft) {
                    particle.style.left = `-20px`;
                    particle.style.setProperty('--target-x', `${targetX}px`);
                } else {
                    particle.style.right = `-20px`;
                    particle.style.setProperty('--target-x', `-${targetX}px`);
                }

                particle.style.setProperty('--target-y', `-${Math.random() * 150 + 150}px`);
                particle.style.animationDelay = `${Math.random() * 4}s`;
                particle.style.animationDuration = `${3 + Math.random() * 3}s`;

                container.appendChild(particle);
            }
        }
    }

    createParticles();
    createWaterParticles();
});
