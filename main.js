// ============================================
// SIVAR — Craft Rebels
// Main Animation Controller
// ============================================

// --- Lenis Smooth Scroll ---
const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);

// Temporarily stop Lenis during preloader
lenis.stop();

// ============================================
// PRELOADER
// ============================================
const preloader = document.getElementById('preloader');
const plLetters = document.querySelectorAll('.pl-letter');
const plSub = document.querySelector('.preloader-sub');
const plFill = document.querySelector('.preloader-fill');

// Animate preloader letters in
const plTl = gsap.timeline({ delay: 0.3 });

plTl.to(plLetters, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out'
})
    .to(plSub, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .to(plFill, { width: '100%', duration: 1.2, ease: 'power2.inOut' }, '-=0.3');

window.addEventListener('load', () => {
    // Ensure minimum preloader time
    gsap.delayedCall(Math.max(0, 2.2), () => {
        preloader.classList.add('done');
        document.body.classList.add('loaded');
        lenis.start();
        revealHero();
    });
});

// ============================================
// HERO REVEAL
// ============================================
function revealHero() {
    const chars = document.querySelectorAll('.hero-title .char');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const words = document.querySelectorAll('.word-reveal');
    const heroBottom = document.querySelector('.hero-bottom');

    const tl = gsap.timeline({ delay: 0.4 });

    // Stagger chars from center out
    const charArray = Array.from(chars);
    const line1 = charArray.slice(0, 5);  // CRAFT
    const line2 = charArray.slice(5);     // REBELS

    function centerStagger(arr) {
        const mid = (arr.length - 1) / 2;
        return arr.map((el, i) => ({ el, dist: Math.abs(i - mid) }))
            .sort((a, b) => a.dist - b.dist)
            .map(o => o.el);
    }

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to(centerStagger(line1), {
            y: 0, duration: 1, stagger: 0.06, ease: 'power3.out'
        }, '-=0.4')
        .to(centerStagger(line2), {
            y: 0, duration: 1, stagger: 0.06, ease: 'power3.out'
        }, '-=0.7')
        .to(words, {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
        }, '-=0.4')
        .to(heroBottom, {
            opacity: 1, duration: 0.6, ease: 'power2.out'
        }, '-=0.2');
}

// ============================================
// SCROLL PROGRESS
// ============================================
const progressFill = document.querySelector('.progress-fill');
const progressDots = document.querySelectorAll('.progress-dot');
const sectionIds = ['hero', 'story', 'transform', 'showcase'];

lenis.on('scroll', ({ progress }) => {
    if (progressFill) {
        progressFill.style.height = `${progress * 100}%`;
    }
});

sectionIds.forEach((id, i) => {
    ScrollTrigger.create({
        trigger: `#${id}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveDot(i),
        onEnterBack: () => setActiveDot(i),
    });
});

function setActiveDot(index) {
    progressDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// ============================================
// HERO PARALLAX
// ============================================
gsap.to('.hero-content', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
    },
    y: 180,
    opacity: 0,
    ease: 'none'
});

gsap.to('.hero-deco-ring', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
    },
    y: -100,
    rotation: 90,
    scale: 0.7,
    ease: 'none'
});

gsap.to('.hero-deco-cross', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
    },
    y: 150,
    rotation: -180,
    ease: 'none'
});

// Navbar hide/show on scroll
let lastScroll = 0;
const navbar = document.getElementById('navbar');

lenis.on('scroll', ({ scroll }) => {
    if (scroll > 200 && scroll > lastScroll) {
        navbar.style.transform = 'translateY(-100%)';
        navbar.style.transition = 'transform 0.4s ease';
    } else {
        navbar.style.transform = 'translateY(0)';
        navbar.style.transition = 'transform 0.4s ease';
    }
    lastScroll = scroll;
});

// ============================================
// STORY SECTION
// ============================================
const storySection = document.querySelector('.story-section');
const storyTitle = storySection.querySelector('.section-title');

ScrollTrigger.create({
    trigger: storySection,
    start: 'top 65%',
    onEnter: () => {
        storyTitle.classList.add('in-view');

        // Reveal ups
        storySection.querySelectorAll('.reveal-up').forEach(el => el.classList.add('in-view'));

        // Animate stat numbers
        storySection.querySelectorAll('.stat-number').forEach(numEl => {
            const target = parseInt(numEl.dataset.value);
            gsap.to({ val: 0 }, {
                val: target,
                duration: 2.5,
                ease: 'power2.out',
                onUpdate() {
                    const v = Math.round(this.targets()[0].val);
                    numEl.textContent = v + (target === 100 ? '%' : '+');
                }
            });
        });
    },
    once: true,
});

// Parallax on story bg number
gsap.to('.story-bg-number', {
    scrollTrigger: {
        trigger: storySection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
    },
    y: -200,
    ease: 'none'
});

// ============================================
// VISUAL DIVIDER ANIMATION
// ============================================
const divider = document.querySelector('.visual-divider');
if (divider) {
    gsap.from(divider.querySelectorAll('.divider-word'), {
        scrollTrigger: {
            trigger: divider,
            start: 'top 80%',
            once: true,
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
    });

    gsap.from('.divider-arrow', {
        scrollTrigger: {
            trigger: divider,
            start: 'top 80%',
            once: true,
        },
        scaleX: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
        transformOrigin: 'left center'
    });
}

// ============================================
// TRANSFORM SECTION
// ============================================
const transformSection = document.querySelector('.transform-section');

ScrollTrigger.create({
    trigger: transformSection,
    start: 'top 55%',
    onEnter: () => {
        transformSection.classList.add('in-view');
    },
});

// Morph path draw on scroll
gsap.to('.morph-path', {
    scrollTrigger: {
        trigger: transformSection,
        start: 'top 60%',
        end: 'center center',
        scrub: 1,
    },
    strokeDashoffset: 0,
    ease: 'none'
});

// ============================================
// PROCESS SECTION
// ============================================
const processSteps = document.querySelectorAll('.process-step');
const timelineFill = document.querySelector('.timeline-fill');

processSteps.forEach((step, i) => {
    ScrollTrigger.create({
        trigger: step,
        start: 'top 75%',
        onEnter: () => {
            step.classList.add('in-view');
            // Update timeline fill
            const progress = ((i + 1) / processSteps.length) * 100;
            if (timelineFill) {
                gsap.to(timelineFill, { height: `${progress}%`, duration: 0.6, ease: 'power2.out' });
            }
        },
        once: true,
    });
});

// Process title reveal
const processTitle = document.querySelector('.process-title');
if (processTitle) {
    ScrollTrigger.create({
        trigger: '.process-header',
        start: 'top 70%',
        onEnter: () => processTitle.classList.add('in-view'),
        once: true,
    });
}

// ============================================
// SHOWCASE — HORIZONTAL CAROUSEL
// ============================================
const showcaseContainer = document.querySelector('.horizontal-showcase');
const showcaseTitle = document.querySelector('.showcase-title');

// Title reveal
if (showcaseTitle) {
    ScrollTrigger.create({
        trigger: '.showcase-header',
        start: 'top 70%',
        onEnter: () => showcaseTitle.classList.add('in-view'),
        once: true,
    });
}

// Reveal cards as they enter viewport (via IntersectionObserver on the horizontal scroll)
const revealMasks = document.querySelectorAll('.reveal-mask');
const maskObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, { threshold: 0.15 });

revealMasks.forEach(mask => maskObserver.observe(mask));

// Drag-to-scroll on desktop
if (showcaseContainer) {
    let isDown = false, startX, scrollLeft;

    showcaseContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        showcaseContainer.style.cursor = 'grabbing';
        startX = e.pageX - showcaseContainer.offsetLeft;
        scrollLeft = showcaseContainer.scrollLeft;
    });

    showcaseContainer.addEventListener('mouseleave', () => {
        isDown = false;
        showcaseContainer.style.cursor = '';
    });

    showcaseContainer.addEventListener('mouseup', () => {
        isDown = false;
        showcaseContainer.style.cursor = '';
    });

    showcaseContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - showcaseContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        showcaseContainer.scrollLeft = scrollLeft - walk;
    });

    // Set grab cursor
    showcaseContainer.style.cursor = 'grab';
}

// ============================================
// CTA SECTION
// ============================================
const ctaSection = document.querySelector('.cta-section');

ScrollTrigger.create({
    trigger: ctaSection,
    start: 'top 65%',
    onEnter: () => ctaSection.classList.add('in-view'),
    once: true,
});

// ============================================
// GLOBAL — MARQUEE SPEED SHIFT
// ============================================
const marqueeTrack = document.querySelector('.marquee-track');
let mCurrent = 35, mTarget = 35;

lenis.on('scroll', ({ velocity }) => {
    mTarget = 35 / (1 + Math.abs(velocity) * 0.003);
});

(function tickMarquee() {
    mCurrent += (mTarget - mCurrent) * 0.04;
    if (marqueeTrack) marqueeTrack.style.animationDuration = `${mCurrent}s`;
    requestAnimationFrame(tickMarquee);
})();

// ============================================
// FOOTER REVEAL
// ============================================
gsap.from('.footer-content > *', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 85%',
        once: true,
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
});

// ============================================
// MENU TOGGLE
// ============================================
const menuBtn = document.querySelector('.menu-btn');
const menuOverlay = document.getElementById('menu-overlay');
const menuLinks = document.querySelectorAll('.menu-link');
let menuOpen = false;

function openMenu() {
    menuOpen = true;
    document.body.classList.add('menu-open');
    menuOverlay.classList.add('open');
    lenis.stop();
}

function closeMenu() {
    menuOpen = false;
    document.body.classList.remove('menu-open');
    menuOverlay.classList.remove('open');
    lenis.start();
}

menuBtn.addEventListener('click', () => {
    if (menuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
});

// Menu links — scroll to section on click
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            closeMenu();
            // Small delay for menu close animation
            setTimeout(() => {
                lenis.scrollTo(targetEl, { offset: 0, duration: 1.5 });
            }, 400);
        }
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
});