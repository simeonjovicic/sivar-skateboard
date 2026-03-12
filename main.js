// Setup Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// gsap ScrollTrigger configuration with lenis
gsap.registerPlugin(ScrollTrigger);

// Update scroll progress
lenis.on('scroll', ({ progress }) => {
    document.documentElement.style.setProperty('--scroll-progress', `${progress * 100}%`);
});

// ----------------------------------------------------
// GSAP SCROLL ANIMATIONS
// ----------------------------------------------------

// Scroll progress dots update
const progressDots = document.querySelectorAll('.progress-dot');
const sections = ['hero', 'story', 'transform', 'showcase'];

sections.forEach((sectionId, index) => {
    ScrollTrigger.create({
        trigger: `#${sectionId}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateProgressDots(index),
        onEnterBack: () => updateProgressDots(index)
    });
});

function updateProgressDots(activeIndex) {
    progressDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === activeIndex);
    });
}

// Hero parallax
gsap.to('.hero-content', {
    scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    },
    y: 200,
    opacity: 0.3
});

// Story section reveal
const storySection = document.querySelector('.story-section');
const storyTitle = storySection.querySelector('.section-title');
const storyTexts = storySection.querySelectorAll('.story-text');
const storyStats = storySection.querySelectorAll('.stat');

ScrollTrigger.create({
    trigger: storySection,
    start: 'top 70%',
    onEnter: () => {
        storyTitle.classList.add('in-view');
        storyTexts.forEach(text => text.classList.add('in-view'));
        storyStats.forEach(stat => stat.classList.add('in-view'));

        // Animate stat numbers
        storyStats.forEach(stat => {
            const numberEl = stat.querySelector('.stat-number');
            const targetValue = parseInt(numberEl.dataset.value);
            gsap.to({ val: 0 }, {
                val: targetValue,
                duration: 2,
                ease: 'power2.out',
                onUpdate: function () {
                    numberEl.textContent = Math.round(this.targets()[0].val) + (numberEl.dataset.value === '100' ? '%' : '+');
                }
            });
        });
    },
    once: true
});

// Transform section - title reveal only
const transformSection = document.querySelector('.transform-section');

ScrollTrigger.create({
    trigger: transformSection,
    start: 'top center',
    onEnter: () => transformSection.classList.add('in-view')
});

// Process section steps reveal
const processSteps = document.querySelectorAll('.process-step');
processSteps.forEach((step, index) => {
    ScrollTrigger.create({
        trigger: step,
        start: 'top 80%',
        onEnter: () => step.classList.add('in-view'),
        once: true
    });
});

// Product cards reveal
const productCards = document.querySelectorAll('.product-card');
productCards.forEach((card, index) => {
    ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => card.classList.add('in-view'),
        once: true
    });
});

// CTA section animation
const ctaSection = document.querySelector('.cta-section');
const ctaTitle = ctaSection.querySelector('.cta-title');

ScrollTrigger.create({
    trigger: ctaSection,
    start: 'top 70%',
    onEnter: () => {
        ctaTitle.classList.add('in-view');
    }
});

// Marquee speed based on scroll
const marqueeTrack = document.querySelector('.marquee-track');
let marqueeSpeed = 1;

lenis.on('scroll', ({ velocity }) => {
    marqueeSpeed = 1 + Math.abs(velocity) * 0.01;
    marqueeTrack.style.animationDuration = `${30 / marqueeSpeed}s`;
});

// Preloader simulation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

