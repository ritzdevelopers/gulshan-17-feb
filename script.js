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
            // Scrolled down - add black background and decrease logo size
            navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navLinks.forEach(link => {
                link.style.color = '#ffffff';
            });
            // Logo size: mobile < 768 | tablet/laptop >= 768
            if (logoContainer) {
                logoContainer.style.width = width >= TABLET_BREAKPOINT ? '140px' : '100px';
            }
        } else {
            // At top - transparent background and restore logo size
            navbar.style.backgroundColor = 'transparent';
            navbar.style.backdropFilter = 'none';
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

}

// Initialize when DOM is ready and scripts are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already loaded
    initApp();
}

