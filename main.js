// Setup Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
    lerp: 0.1, // Added for extra smoothness control
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

// Marquee speed based on scroll - throttled for performance
const marqueeTrack = document.querySelector('.marquee-track');
let marqueeSpeed = 1;
let lastUpdate = 0;

lenis.on('scroll', ({ velocity }) => {
    const now = Date.now();
    if (now - lastUpdate > 100) { // Throttle updates to every 100ms
        marqueeSpeed = 1 + Math.abs(velocity) * 0.01;
        marqueeTrack.style.animationDuration = `${30 / marqueeSpeed}s`;
        lastUpdate = now;
    }
});

// Subtle skew on scroll – reduced intensity
const mainWrapper = document.querySelector('#main-wrapper');
let proxy = { skew: 0 },
    skewSetter = gsap.quickSetter(mainWrapper, "skewY", "deg"),
    clamp = gsap.utils.clamp(-1.5, 1.5);   // was -10…10

ScrollTrigger.create({
    onUpdate: (self) => {
        let skew = clamp(self.getVelocity() / -600);   // halved the sensitivity
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => skewSetter(proxy.skew) });
        }
    }
});

// Horizontal Scroll for Showcase - Desktop only
const horizontalSection = document.querySelector('#showcase');
const horizontalTrack = document.querySelector('.horizontal-track');

if (horizontalTrack) {
    let scrollTween;
    ScrollTrigger.matchMedia({
        "(min-width: 769px)": function () {
            // Pin the track more precisely
            scrollTween = gsap.to(horizontalTrack, {
                x: () => -(horizontalTrack.scrollWidth - window.innerWidth + window.innerWidth * 0.1),
                ease: "none",
                scrollTrigger: {
                    trigger: ".horizontal-showcase",
                    pin: true,
                    start: "top top",
                    end: () => `+=${horizontalTrack.scrollWidth}`,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });

            // Reveal triggers synced to horizontal movement
            const revealMasks = document.querySelectorAll('.reveal-mask');
            revealMasks.forEach(mask => {
                ScrollTrigger.create({
                    trigger: mask,
                    containerAnimation: scrollTween,
                    start: "left 90%", // Start reveal earlier
                    onEnter: () => mask.classList.add('in-view'),
                    onLeaveBack: () => mask.classList.remove('in-view'),
                });
            });
        },
        "(max-width: 768px)": function () {
            const revealMasks = document.querySelectorAll('.reveal-mask');
            revealMasks.forEach(mask => {
                ScrollTrigger.create({
                    trigger: mask,
                    start: "top 85%",
                    onEnter: () => mask.classList.add('in-view'),
                });
            });
        }
    });
}

// Dynamic image skew based on scroll
// Dynamic image skew – reduced multiplier
const productImages = document.querySelectorAll('.product-image-inner');
lenis.on('scroll', ({ velocity }) => {
    const skew = velocity * 0.015;   // was 0.05
    productImages.forEach(img => {
        gsap.to(img, {
            skewY: skew,
            duration: 0.5,
            ease: "power2.out",
            overwrite: true
        });
    });
});

// Preloader simulation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

