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

    // Primary button spotlight effect
    document.querySelectorAll('.primary-btn').forEach((btn) => {
        const spotlight = document.createElement('span');
        spotlight.className = 'btn-spotlight';
        btn.appendChild(spotlight);

        btn.addEventListener('mousemove', (event) => {
            const rect = btn.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            spotlight.style.left = `${offsetX}px`;
            spotlight.style.top = `${offsetY}px`;
        });
    });

    // Rotary Dial Navigation
    const wheelContainer = document.getElementById('rotaryContainer');
    const wheel = document.getElementById('rotaryWheel');
    const label = document.getElementById('rotaryLabel');

    if (wheelContainer && wheel) {
        let isDragging = false;
        let startAngle = 0;
        let startRotation = 0;
        let currentRotation = 180; // Starts at Home (180 deg puts chamber 0 on the left)
        let labelTimeout = null;
        let idleTimeout = null;
        const rotaryNav = document.querySelector('.rotary-nav');
        const rotaryCenter = document.querySelector('.rotary-center');
        const centerIconContainer = document.querySelector('.center-icon-container');

        // Apply smooth snapping transition by default
        wheel.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';

        // Function to show label and set fade timeout
        const showLabel = (text = null) => {
            if (label) {
                if (text) {
                    label.innerText = text;
                }
                label.classList.add('visible');
                clearTimeout(labelTimeout);
                labelTimeout = setTimeout(() => {
                    label.classList.remove('visible');
                }, 800);
            }
        };

        // Function to set idle state (fades the wheel background, border, chambers)
        const setIdle = () => {
            if (rotaryNav) {
                const isHovered = rotaryNav.matches(':hover');
                if (!isHovered && !isDragging) {
                    rotaryNav.classList.add('idle');
                    if (label) {
                        label.classList.remove('visible');
                    }
                }
            }
        };

        // Function to reset the idle timer
        const resetIdleTimer = () => {
            if (rotaryNav) {
                rotaryNav.classList.remove('idle');
            }
            clearTimeout(idleTimeout);
            // 3 seconds of scrolling/drag/mouse inactivity will trigger idle fade
            idleTimeout = setTimeout(setIdle, 3000);
        };

        // Cybernetic Eye Idle State Logic (After 15s)
        let eyeTimer = null;
        let isEyeState = false;
        let randomEyeInterval = null;
        let mouseStopTimer = null;

        const startRandomEyeAnimations = () => {
            if (randomEyeInterval) return;
            randomEyeInterval = setInterval(() => {
                const pupil = document.querySelector('.eye-pupil');
                if (pupil) {
                    const angle = Math.random() * 2 * Math.PI;
                    const distMultiplier = Math.random();
                    const limitX = 8;
                    const limitY = 4;
                    const pupilX = Math.cos(angle) * limitX * distMultiplier;
                    const pupilY = Math.sin(angle) * limitY * distMultiplier;
                    pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
                }
            }, 1500);
        };

        const stopRandomEyeAnimations = () => {
            clearInterval(randomEyeInterval);
            randomEyeInterval = null;
        };

        const showEye = () => {
            if (isEyeState) return;
            isEyeState = true;
            if (rotaryCenter) {
                rotaryCenter.classList.add('eye-active');
                startRandomEyeAnimations();
            }
        };

        const hideEye = () => {
            if (!isEyeState) return;
            isEyeState = false;
            stopRandomEyeAnimations();
            clearTimeout(mouseStopTimer);
            if (rotaryCenter) {
                rotaryCenter.classList.remove('eye-active');
            }
            // Reset pupil inline transform so it scales back down to zero cleanly
            const pupil = document.querySelector('.eye-pupil');
            if (pupil) {
                pupil.style.transform = '';
            }
        };

        const resetEyeTimer = () => {
            if (!isEyeState) {
                clearTimeout(eyeTimer);
                eyeTimer = setTimeout(showEye, 15000);
            }
        };

        let hasInteracted = false;

        // Auto-transition from intro-state to roller after 10 seconds of inactivity on load
        let introAutoTimeout = setTimeout(() => {
            if (!hasInteracted) {
                hasInteracted = true;
                if (rotaryNav && rotaryNav.classList.contains('intro-state')) {
                    rotaryNav.classList.remove('intro-state');
                    showLabel();
                    resetIdleTimer();
                }
            }
        }, 10000);

        // Function to update the intro state based on scroll and hover
        const updateIntroState = () => {
            if (!rotaryNav) return;
            const isHovered = rotaryNav.matches(':hover');
            if (hasInteracted || window.scrollY > 10 || isHovered || isDragging) {
                if (!hasInteracted) {
                    hasInteracted = true;
                    clearTimeout(introAutoTimeout);
                }
                if (rotaryNav.classList.contains('intro-state')) {
                    rotaryNav.classList.remove('intro-state');
                }
            }
        };

        // Keep icons upright by applying counter-rotation
        const updateIconRotation = (rotation) => {
            const icons = wheel.querySelectorAll('.rotary-chamber i');
            icons.forEach(icon => {
                icon.style.transform = `rotate(${-rotation}deg)`;
            });
            if (rotaryCenter) {
                rotaryCenter.style.transform = `translate(-50%, -50%) rotate(${-rotation}deg)`;
            }
        };

        // Initialize rotation
        wheel.style.transform = `rotate(${currentRotation}deg)`;
        updateIconRotation(currentRotation);

        const getAngle = (clientX, clientY) => {
            const rect = wheelContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            return Math.atan2(clientY - centerY, clientX - centerX);
        };

        const onPointerDown = (e) => {
            isDragging = true;
            if (isEyeState) {
                hideEye();
            }
            clearTimeout(eyeTimer);
            if (rotaryNav) {
                rotaryNav.classList.remove('idle');
                if (rotaryNav.classList.contains('intro-state')) {
                    rotaryNav.classList.remove('intro-state');
                    hasInteracted = true;
                    clearTimeout(introAutoTimeout);
                }
            }
            clearTimeout(idleTimeout);
            wheel.style.transition = 'none'; // Disable transition for instant drag tracking
            if (rotaryCenter) {
                rotaryCenter.style.transition = 'none';
            }
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            startAngle = getAngle(clientX, clientY);
            startRotation = currentRotation;
            showLabel();
            e.preventDefault();
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            const currentAngle = getAngle(clientX, clientY);
            
            let angleDiff = currentAngle - startAngle;
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            const degDiff = angleDiff * (180 / Math.PI);
            const scrollDelta = degDiff * 10;

            const currentScroll = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            // Clamp new scroll value to match website boundaries exactly
            let newScrollY = currentScroll + scrollDelta;
            newScrollY = Math.max(0, Math.min(newScrollY, maxScroll));

            // Only rotate wheel if window can actually scroll
            if (newScrollY !== currentScroll) {
                window.scrollTo(0, newScrollY);
                currentRotation = startRotation + degDiff;
                wheel.style.transform = `rotate(${currentRotation}deg)`;
                updateIconRotation(currentRotation);
                
                startAngle = currentAngle;
                startRotation = currentRotation;
            }
            showLabel();
            resetIdleTimer();
            updateIntroState();
        };

        const onPointerUp = () => {
            isDragging = false;
            // Restore smooth snapping transitions
            wheel.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            if (rotaryCenter) {
                rotaryCenter.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            resetIdleTimer();
            updateIntroState();
        };

        wheelContainer.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        wheelContainer.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);

        // Track regular scrolls to reset idle timer and intro state
        window.addEventListener('scroll', () => {
            resetIdleTimer();
            updateIntroState();
            if (isEyeState) {
                hideEye();
            }
            clearTimeout(eyeTimer);
            eyeTimer = setTimeout(showEye, 15000);
        });

        // Add mouse hover triggers to handle idle state and show label
        if (rotaryNav) {
            rotaryNav.addEventListener('mouseenter', () => {
                showLabel();
                rotaryNav.classList.remove('idle');
                if (rotaryNav.classList.contains('intro-state')) {
                    rotaryNav.classList.remove('intro-state');
                    hasInteracted = true;
                    clearTimeout(introAutoTimeout);
                }
                clearTimeout(idleTimeout);
                if (isEyeState) {
                    hideEye();
                }
                clearTimeout(eyeTimer);
            });

            rotaryNav.addEventListener('mouseleave', () => {
                resetIdleTimer();
                updateIntroState();
                resetEyeTimer();
            });
        }

        // Window MouseMove listener for cursor tracking of the cybernetic eye
        window.addEventListener('mousemove', (e) => {
            if (!isEyeState) {
                clearTimeout(eyeTimer);
                eyeTimer = setTimeout(showEye, 15000);
            } else {
                stopRandomEyeAnimations();
                const pupil = document.querySelector('.eye-pupil');
                const eye = document.querySelector('.cyber-eyelid');
                if (pupil && eye) {
                    const rect = eye.getBoundingClientRect();
                    const eyeX = rect.left + rect.width / 2;
                    const eyeY = rect.top + rect.height / 2;
                    const dx = e.clientX - eyeX;
                    const dy = e.clientY - eyeY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0) {
                        const angle = Math.atan2(dy, dx);
                        const limitX = 8;
                        const limitY = 4;
                        const valX = Math.cos(angle) * Math.min(limitX, distance / 15);
                        const valY = Math.sin(angle) * Math.min(limitY, distance / 15);
                        pupil.style.transform = `translate(calc(-50% + ${valX}px), calc(-50% + ${valY}px))`;
                    }
                }
                
                // Restart random movements after 2 seconds of stillness
                clearTimeout(mouseStopTimer);
                mouseStopTimer = setTimeout(startRandomEyeAnimations, 2000);
            }
        });

        // Active Section Observer to update wheel label text and snap wheel rotation
        const sections = document.querySelectorAll('header[id], section[id]');
        const sectionNames = {
            'hero': 'Home',
            'about': 'About',
            'resume': 'Resume',
            'apps': 'Apps',
            'websites': 'Websites',
            'connect': 'Connect'
        };

        const sectionObserverOptions = {
            threshold: 0.3,
            rootMargin: '-20% 0px -40% 0px'
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    const displayName = sectionNames[sectionId] || sectionId;
                    const sectionKeys = Object.keys(sectionNames);
                    const activeIdx = sectionKeys.indexOf(sectionId);

                    if (label) {
                        showLabel(displayName);
                    }

                    // Snap the active section's icon chamber to 180 degrees (left position, next to label)
                    if (wheel && !isDragging) {
                        const targetRotation = 180 + activeIdx * 60;
                        currentRotation = targetRotation;
                        wheel.style.transform = `rotate(${targetRotation}deg)`;
                        updateIconRotation(targetRotation);
                    }

                    // Active chamber indicator highlight
                    const chambers = wheel.querySelectorAll('.rotary-chamber');
                    chambers.forEach((ch, idx) => {
                        ch.classList.toggle('active', idx === activeIdx);
                    });
                }
            });
        }, sectionObserverOptions);

        sections.forEach(sec => sectionObserver.observe(sec));

        // Hover configuration for each chamber (icon and neon color)
        const chamberHoverConfig = [
            { icon: 'fas fa-home', color: 'var(--accent-primary)' },
            { icon: 'fas fa-user', color: 'var(--accent-secondary)' },
            { icon: 'fas fa-file-alt', color: '#ff007f' },
            { icon: 'fas fa-mobile-alt', color: '#3DDC84' },
            { icon: 'fas fa-globe', color: '#ff003c' },
            { icon: 'fas fa-share-alt', color: 'var(--accent-secondary)' }
        ];



        // Handle chamber events for clicks and hover center dynamics
        const chambers = wheel.querySelectorAll('.rotary-chamber');
        chambers.forEach((chamber, idx) => {
            chamber.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent drag triggers
                const sectionId = Object.keys(sectionNames)[idx];
                const target = document.getElementById(sectionId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });

            chamber.addEventListener('mouseenter', () => {
                console.log(`Hovering chamber: ${idx} - Section: ${Object.keys(sectionNames)[idx]}`);
                if (!isEyeState) {
                    clearTimeout(eyeTimer);
                }
                if (rotaryCenter) {
                    rotaryCenter.classList.add('icon-hover-active');
                    const config = chamberHoverConfig[idx];
                    if (centerIconContainer) {
                        centerIconContainer.innerHTML = `<i class="${config.icon}"></i>`;
                    }

                    rotaryCenter.style.borderColor = config.color;
                    rotaryCenter.style.color = config.color;
                } else {
                    console.error("rotaryCenter element not found!");
                }
            });

            chamber.addEventListener('mouseleave', () => {
                console.log(`Leaving chamber: ${idx}`);
                if (rotaryCenter) {
                    rotaryCenter.classList.remove('icon-hover-active');
                    if (centerIconContainer) {
                        centerIconContainer.innerHTML = '';
                    }
                    rotaryCenter.style.borderColor = '';
                    rotaryCenter.style.color = '';
                }
                if (!isEyeState) {
                    resetEyeTimer();
                }
            });
        });

        // Handle project-card hovers to sync with the rotary center circle
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const iconClass = card.getAttribute('data-icon');
                const color = card.getAttribute('data-color');
                if (!isEyeState) {
                    clearTimeout(eyeTimer);
                }
                if (rotaryCenter && iconClass && color) {
                    console.log(`Hovering project card: ${card.querySelector('h3')?.innerText}`);
                    rotaryCenter.classList.add('icon-hover-active');
                    if (centerIconContainer) {
                        centerIconContainer.innerHTML = `<i class="${iconClass}"></i>`;
                    }

                    rotaryCenter.style.borderColor = color;
                    rotaryCenter.style.color = color;
                }
            });

            card.addEventListener('mouseleave', () => {
                console.log("Leaving project card");
                if (rotaryCenter) {
                    rotaryCenter.classList.remove('icon-hover-active');
                    if (centerIconContainer) {
                        centerIconContainer.innerHTML = '';
                    }
                    rotaryCenter.style.borderColor = '';
                    rotaryCenter.style.color = '';
                }
                if (!isEyeState) {
                    resetEyeTimer();
                }
            });
        });

        // Initialize the idle timer and intro state on load
        resetIdleTimer();
        updateIntroState();
        resetEyeTimer();
    }

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
