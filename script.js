// Wait for DOM and all scripts to be fully loaded
function initApp() {
    // Check if GSAP and Lenis are loaded
    if (typeof gsap === 'undefined' || typeof Lenis === 'undefined') {
        // If not loaded, wait a bit and try again
        setTimeout(initApp, 100);
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Navigation JavaScript
    const navbar = document.getElementById('navbar');
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const hamburgerLines = [
        document.getElementById('hamburger-line-1'),
        document.getElementById('hamburger-line-2'),
        document.getElementById('hamburger-line-3')
    ];
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    let isMenuOpen = false;

    // GSAP Timeline for mobile menu animation
    const menuTimeline = gsap.timeline({ paused: true });

    // Set initial state
    gsap.set(mobileMenu, { y: '-100%' });
    gsap.set('.mobile-nav-link', { opacity: 0, y: 20 });

    // Menu slide animation
    menuTimeline
        .to(mobileMenu, {
            y: '0%',
            duration: 0.6,
            ease: 'power3.inOut'
        })
        .to('.mobile-nav-link', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.3');

    // Hamburger button click handler
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;

            if (isMenuOpen) {
                menuTimeline.play();
                // Animate hamburger to X
                gsap.to(hamburgerLines[0], { rotation: 45, y: 8, duration: 0.3 });
                gsap.to(hamburgerLines[1], { opacity: 0, duration: 0.3 });
                gsap.to(hamburgerLines[2], { rotation: -45, y: -8, duration: 0.3 });
                document.body.style.overflow = 'hidden';
            } else {
                menuTimeline.reverse();
                // Animate X back to hamburger
                gsap.to(hamburgerLines[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(hamburgerLines[1], { opacity: 1, duration: 0.3 });
                gsap.to(hamburgerLines[2], { rotation: 0, y: 0, duration: 0.3 });
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when clicking on mobile nav links
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                isMenuOpen = false;
                menuTimeline.reverse();
                gsap.to(hamburgerLines[0], { rotation: 0, y: 0, duration: 0.3 });
                gsap.to(hamburgerLines[1], { opacity: 1, duration: 0.3 });
                gsap.to(hamburgerLines[2], { rotation: 0, y: 0, duration: 0.3 });
                document.body.style.overflow = '';
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80,
                    duration: 1.5
                });
            }
        });
    });

    // Scroll detection for navbar background change
    const logoContainer = document.getElementById('logo-container');
    let lastScroll = 0;

    // Function to update navbar and logo on scroll
    function updateNavbarOnScroll(scrollY) {
        if (scrollY > 100) {
            // Scrolled down - add black background and decrease logo size
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navLinks.forEach(link => {
                link.style.color = '#ffffff';
            });
            // Decrease logo size
            if (logoContainer) {
                logoContainer.style.width = window.innerWidth >= 768 ? '140px' : '100px';
            }
        } else {
            // At top - transparent background and restore logo size
            navbar.style.backgroundColor = 'transparent';
            navbar.style.backdropFilter = 'none';
            navLinks.forEach(link => {
                link.style.color = '#ffffff';
            });
            // Restore logo size
            if (logoContainer) {
                logoContainer.style.width = window.innerWidth >= 768 ? '177px' : '120px';
            }
        }
    }

    lenis.on('scroll', (e) => {
        const scrollY = window.scrollY || e.scroll;
        updateNavbarOnScroll(scrollY);
        lastScroll = scrollY;
    });

    // Also listen to window scroll for immediate feedback
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        updateNavbarOnScroll(scrollY);
    });

    // Update logo size on window resize
    window.addEventListener('resize', () => {
        const scrollY = window.scrollY;
        updateNavbarOnScroll(scrollY);
    });

    // Hero Slider Functionality
    const heroSlides = document.querySelectorAll('.hero-slide');
    const paginationDots = document.querySelectorAll('.pagination-dot');
    let currentSlide = 0; // Start with first slide
    let slideInterval;

    // Helper function to get responsive dot sizes
    function getDotSizes() {
        const width = window.innerWidth;
        if (width < 640) {
            // Mobile
            return { active: '14px', inactive: '10px', inner: '4px' };
        } else if (width < 768) {
            // Small tablet
            return { active: '16px', inactive: '12px', inner: '5px' };
        } else {
            // Desktop and above
            return { active: '18px', inactive: '12px', inner: '6px' };
        }
    }

    // Function to update slide
    function updateSlide(index) {
        // Remove active class from all slides and dots
        heroSlides.forEach((slide, i) => {
            if (i === index) {
                gsap.to(slide, { opacity: 1, duration: 1, ease: 'power2.inOut' });
            } else {
                gsap.to(slide, { opacity: 0, duration: 1, ease: 'power2.inOut' });
            }
        });

        // Get responsive sizes
        const sizes = getDotSizes();

        // Update pagination dots
        paginationDots.forEach((dot, i) => {
            const innerDot = dot.querySelector('div');
            if (i === index) {
                // Active dot styling
                dot.classList.add('active');
                dot.classList.remove('bg-[#DE8063]');
                dot.classList.add('border', 'border-[#ffffff]');
                dot.style.width = sizes.active;
                dot.style.height = sizes.active;
                if (innerDot) {
                    innerDot.classList.remove('hidden');
                    innerDot.style.width = sizes.inner;
                    innerDot.style.height = sizes.inner;
                }
            } else {
                // Inactive dot styling
                dot.classList.remove('active');
                dot.classList.add('bg-[#DE8063]');
                dot.classList.remove('border', 'border-[#ffffff]');
                dot.style.width = sizes.inactive;
                dot.style.height = sizes.inactive;
                if (innerDot) {
                    innerDot.classList.add('hidden');
                    innerDot.style.width = sizes.inner;
                    innerDot.style.height = sizes.inner;
                }
            }
        });

        currentSlide = index;
    }

    // Function to go to next slide
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % heroSlides.length;
        updateSlide(nextIndex);
    }

    // Function to start auto slide
    function startAutoSlide() {
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds
    }

    // Function to stop auto slide
    function stopAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Initialize slider - set first slide as active
    if (heroSlides.length > 0 && paginationDots.length > 0) {
        updateSlide(currentSlide);

        // Start auto slide
        startAutoSlide();

        // Add click event to pagination dots
        paginationDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                stopAutoSlide();
                updateSlide(index);
                startAutoSlide();
            });
        });

        // Pause on hover (optional)
        const heroSlider = document.getElementById('hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoSlide);
            heroSlider.addEventListener('mouseleave', startAutoSlide);
        }

        // Update dot sizes on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateSlide(currentSlide);
            }, 100);
        });
    }
}

// Initialize when DOM is ready and scripts are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already loaded
    initApp();
}

