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

    // Set initial logo size on load: big at top, small only after scroll
    updateNavbarOnScroll(window.scrollY || 0);

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
    if (!mobileSlides.length && !desktopSlides.length) return;
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

// --- Form validation helpers ---
const formValidation = {
    name(value) {
        const v = (value || '').trim();
        if (v.length < 2) return 'Please enter at least 2 characters';
        if (!/^[a-zA-Z\s\u0900-\u097F]+$/.test(v)) return 'Name should contain only letters';
        return '';
    },
    phone(value) {
        const v = (value || '').replace(/\s/g, '');
        if (!v) return 'Phone number is required';
        const digits = v.replace(/\D/g, '');
        if (digits.length < 10) return 'Enter a valid 10-digit phone number';
        return '';
    },
    email(value) {
        const v = (value || '').trim();
        if (!v) return 'Email is required';
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(v)) return 'Enter a valid email address';
        return '';
    },
    message(value) {
        return ''; // optional
    }
};

function setFieldError(inputEl, errEl, message) {
    if (errEl) errEl.textContent = message || '';
    if (inputEl) {
        inputEl.classList.toggle('input-error', !!message);
        inputEl.setAttribute('aria-invalid', !!message);
    }
}

function validateAndSubmitForm(config, onValid) {
    const { form, fields } = config;
    let firstInvalid = null;
    let valid = true;

    fields.forEach(({ name, id, errId, validator }) => {
        const input = form.querySelector(id);
        const errEl = document.getElementById(errId);
        const value = input ? input.value : '';
        const error = validator ? validator(value) : '';
        setFieldError(input, errEl, error);
        if (error && !firstInvalid) firstInvalid = input;
        if (error) valid = false;
    });

    if (firstInvalid) {
        firstInvalid.focus();
        return false;
    }
    if (valid && onValid) onValid();
    return valid;
}

function attachFormValidation(form, fieldsConfig, onValidSubmit) {
    if (!form) return;

    // Clear error on input
    form.querySelectorAll('.form-input').forEach((input) => {
        input.addEventListener('input', () => {
            const errId = input.id ? input.id + '-err' : null;
            const errEl = errId ? document.getElementById(errId) : null;
            setFieldError(input, errEl, '');
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        validateAndSubmitForm({ form, fields: fieldsConfig }, () => {
            form.reset();
            fieldsConfig.forEach(({ id, errId }) => {
                const input = form.querySelector(id);
                const errEl = document.getElementById(errId);
                setFieldError(input, errEl, '');
            });
            if (typeof onValidSubmit === 'function') onValidSubmit();
        });
    });
}

// Global function to open enquiry modal
function openEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    if (!modal) return;
    
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

// Global function to close enquiry modal
function closeEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    if (!modal) return;
    
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// Enquiry popup modal
function initEnquiryModal() {
    const modal = document.getElementById('enquiry-modal');
    const overlay = document.getElementById('enquiry-modal-overlay');
    const closeBtn = document.getElementById('enquiry-modal-close');
    const form = document.getElementById('enquiry-modal-form');

    if (!modal) return;

    // Open modal on any button/link with class open-enquiry-modal
    document.querySelectorAll('.open-enquiry-modal').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            openEnquiryModal();
        });
    });
    overlay.addEventListener('click', closeEnquiryModal);
    if (closeBtn) closeBtn.addEventListener('click', closeEnquiryModal);

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeEnquiryModal();
    });

    if (form) {
        const enquiryFields = [
            { name: 'name', id: '#enquiry-name', errId: 'enquiry-name-err', validator: formValidation.name },
            { name: 'phone', id: '#enquiry-phone', errId: 'enquiry-phone-err', validator: formValidation.phone },
            { name: 'email', id: '#enquiry-email', errId: 'enquiry-email-err', validator: formValidation.email },
            { name: 'message', id: '#enquiry-message', errId: 'enquiry-message-err', validator: formValidation.message }
        ];
        attachFormValidation(form, enquiryFields, () => closeEnquiryModal());
    }
}

// Contact section form validation
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const contactFields = [
        { name: 'name', id: '#contact-name', errId: 'contact-name-err', validator: formValidation.name },
        { name: 'phone', id: '#contact-phone', errId: 'contact-phone-err', validator: formValidation.phone },
        { name: 'email', id: '#contact-email', errId: 'contact-email-err', validator: formValidation.email },
        { name: 'message', id: '#contact-message', errId: 'contact-message-err', validator: formValidation.message }
    ];
    attachFormValidation(form, contactFields);
}

// Directional fill effect: fill originates from cursor entry point
function initButtonFillHover() {
    document.querySelectorAll('.btn-fill-hover').forEach((btn) => {
        btn.addEventListener('mouseenter', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--mouse-x', x + '%');
            btn.style.setProperty('--mouse-y', y + '%');
        });
    });
}

// Initialize when DOM is ready and scripts are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        initHeroSlider();
        initEnquiryModal();
        initContactForm();
        initButtonFillHover();
        // Auto-open enquiry modal after 5 seconds
        autoOpenEnquiryModal();
    });
} else {
    initApp();
    initHeroSlider();
    initEnquiryModal();
    initContactForm();
    initButtonFillHover();
    // Auto-open enquiry modal after 5 seconds
    autoOpenEnquiryModal();
}

// Auto-open enquiry modal after 5 seconds of page load
function autoOpenEnquiryModal() {
    // Wait for 5 seconds (5000 milliseconds) after page load
    setTimeout(() => {
        openEnquiryModal();
    }, 5000);
}