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

    // Breakpoints: tablet 768px, laptop 1024px (Tailwind md / lg)
    const TABLET_BREAKPOINT = 768;

    // Function to update navbar and logo on scroll
    function updateNavbarOnScroll(scrollY) {
        const width = window.innerWidth;
        if (scrollY > 100) {
            // Scrolled down - add black background, decrease logo size, compact header
            navbar.classList.add('navbar-scrolled');
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.paddingTop = '8px';
            navbar.style.paddingBottom = '8px';
            navLinks.forEach(link => {
                link.style.color = '#ffffff';
            });
            // Logo size: mobile < 768 | tablet/laptop >= 768
            if (logoContainer) {
                logoContainer.style.width = width >= TABLET_BREAKPOINT ? '140px' : '100px';
            }
        } else {
            // At top - transparent background, restore logo size and header padding
            navbar.classList.remove('navbar-scrolled');
            navbar.style.backgroundColor = 'transparent';
            navbar.style.backdropFilter = 'none';
            navbar.style.paddingTop = '';
            navbar.style.paddingBottom = '';
            navLinks.forEach(link => {
                link.style.color = '#ffffff';
            });
            // Logo: mobile < 768px | tablet/laptop >= 768px
            if (logoContainer) {
                logoContainer.style.width = width >= TABLET_BREAKPOINT ? '177px' : '120px';
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

    // Data counter
    const counterEls = document.querySelectorAll('[data-counter]');
    const animatedCounters = new Set();

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function animateCounter(el) {
        const to = parseInt(el.getAttribute('data-to'), 10);
        const duration = parseInt(el.getAttribute('data-duration'), 10) || 2000;
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        if (isNaN(to) || animatedCounters.has(el)) return;
        animatedCounters.add(el);

        const startTime = performance.now();
        const startVal = 0;

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = Math.floor(startVal + (to - startVal) * eased);
            el.textContent = prefix + current + suffix;
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = prefix + to + suffix;
        }
        requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) animateCounter(entry.target);
            });
        },
        { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    counterEls.forEach((el) => counterObserver.observe(el));
}

// Hero banner slider
function initHeroSlider() {
    const mobileSlides = document.querySelectorAll('.hero-slider-mobile .hero-slide');
    const desktopSlides = document.querySelectorAll('.hero-slider-desktop .hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const totalSlides = 3;
    let currentIndex = 0;
    let autoplayTimer = null;

    function goToSlide(index) {
        currentIndex = (index + totalSlides) % totalSlides;
        mobileSlides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
        desktopSlides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
        dots.forEach((dot, i) => dot.setAttribute('aria-current', i === currentIndex));
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            goToSlide(i);
            startAutoplay();
        });
    });

    startAutoplay();
}

// Enquiry popup modal
function initEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    const openBtn = document.getElementById('enquire-now-btn');
    const overlay = document.getElementById('enquiry-modal-overlay');
    const closeBtn = document.getElementById('enquiry-modal-close');
    const form = document.getElementById('enquiry-modal-form');

    if (!modal || !openBtn) return;

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', openModal);
    overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Optional: send form data or show thank you
            closeModal();
            form.reset();
        });
    }
}

// Initialize when DOM is ready and scripts are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        initHeroSlider();
        initEnquiryModal();
    });
} else {
    initApp();
    initHeroSlider();
    initEnquiryModal();
}

