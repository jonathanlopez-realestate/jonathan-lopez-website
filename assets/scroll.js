(function () {
const nav = document.querySelector('.nav');
if (nav) {
const updateNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
updateNav();
window.addEventListener('scroll', updateNav, { passive: true });
}

if (!('IntersectionObserver' in window) ||
window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

const targets = document.querySelectorAll(
'.post > .buyer-step, .post > .faq-item'
);
const riseTargets = document.querySelectorAll(
'.group-proof .group-proof-inner, .services .services-inner, .about-teaser .about-inner'
);
if (!targets.length && !riseTargets.length) return;

const observer = new IntersectionObserver((entries) => {
for (const entry of entries) {
if (entry.isIntersecting) {
entry.target.classList.add('is-visible');
observer.unobserve(entry.target);
}
}
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

targets.forEach((target) => {
target.classList.add('reveal');
observer.observe(target);
});
document.documentElement.classList.add('motion-ready');

if (riseTargets.length) {
riseTargets.forEach(el => el.classList.add('scroll-rise'));
const updateRise = () => {
const viewport = window.innerHeight;
const distance = window.innerWidth <= 710 ? 90 : 120;
for (const el of riseTargets) {
const sectionTop = el.closest('section').getBoundingClientRect().top;
const progress = Math.max(0, Math.min(1, (viewport * 0.92 - sectionTop) / (viewport * 0.52)));
const eased = (1 - Math.cos(Math.PI * progress)) / 2;
el.style.setProperty('--rise-offset', `${Math.round(distance * (1 - eased))}px`);
}
};
let framePending = false;
const scheduleRise = () => {
if (framePending) return;
framePending = true;
requestAnimationFrame(() => {
updateRise();
framePending = false;
});
};
updateRise();
window.addEventListener('scroll', scheduleRise, { passive: true });
window.addEventListener('resize', scheduleRise);
}

const countObserver = new IntersectionObserver((entries) => {
for (const entry of entries) {
if (!entry.isIntersecting) continue;
const el = entry.target;
countObserver.unobserve(el);
const end = Number(el.dataset.countTo);
const decimals = Number(el.dataset.countDecimals || 0);
const prefix = el.dataset.countPrefix || '';
const suffix = el.dataset.countSuffix || '';
const duration = 3200;
let start;
const render = (value) => {
const number = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US');
el.textContent = prefix + number + suffix;
};
const frame = (time) => {
if (start === undefined) start = time;
const progress = Math.min((time - start) / duration, 1);
const eased = 1 - Math.pow(1 - progress, 2);
render(progress === 1 ? end : end * eased);
if (progress < 1) requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
}
}, { threshold: 0.45 });
const armCountsOnScroll = () => {
if (window.scrollY < 120) return;
window.removeEventListener('scroll', armCountsOnScroll);
document.querySelectorAll('.group-proof-stat [data-count-to]').forEach(el => countObserver.observe(el));
};
if (riseTargets.length) window.addEventListener('scroll', armCountsOnScroll, { passive: true });
})();
