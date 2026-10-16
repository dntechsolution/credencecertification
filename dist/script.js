const body = document.body;
const header = document.querySelector('.site-header');
const mobileNav = document.querySelector('.mobile-nav');
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenuLabel = mobileToggle.querySelector('.menu-label');
const navigationLinks = [...document.querySelectorAll('header a[href^="#"]')];
const backToTop = document.querySelector('#back-to-top');
const timelineProgress = document.querySelector('.timeline-progress');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

requestAnimationFrame(() => body.classList.add('is-ready'));

function setMobileMenu(open) {
  mobileNav.classList.toggle('open', open);
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobileToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileMenuLabel.textContent = open ? 'Close navigation' : 'Open navigation';
  header.classList.toggle('menu-open', open);
  body.classList.toggle('overflow-hidden', open);
}

mobileToggle.addEventListener('click', () => {
  const open = mobileToggle.getAttribute('aria-expanded') !== 'true';
  setMobileMenu(open);
  if (open) requestAnimationFrame(() => mobileNav.querySelector('a')?.focus());
});

navigationLinks.forEach((link) => link.addEventListener('click', () => setMobileMenu(false)));

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || mobileToggle.getAttribute('aria-expanded') !== 'true') return;
  setMobileMenu(false);
  mobileToggle.focus();
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1280) setMobileMenu(false);
  updateScrollControls();
}, { passive: true });

function updateScrollControls() {
  header.classList.toggle('scrolled', window.scrollY > 24);
  const backToTopThreshold = Math.min(600, window.innerHeight * 0.75);
  backToTop.classList.toggle('show', window.scrollY > backToTopThreshold);
}

updateScrollControls();
window.addEventListener('scroll', updateScrollControls, { passive: true });

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

const revealElements = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('visible'));
  timelineProgress?.classList.add('drawn');
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));

  if (timelineProgress) {
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      timelineProgress.classList.add('drawn');
      observer.disconnect();
    }, { threshold: 0.2 });
    timelineObserver.observe(timelineProgress.parentElement);
  }
}

const sections = [...document.querySelectorAll('main section[id]')];
const desktopNavLinks = [...document.querySelectorAll('.nav-link')];
const sectionObserver = new IntersectionObserver((entries) => {
  const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!current) return;
  desktopNavLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current.target.id}`));
}, { rootMargin: '-30% 0px -60% 0px', threshold: [0, .25, .7] });

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll('.service-row').forEach((row) => {
  row.addEventListener('toggle', () => {
    if (!row.open) return;
    document.querySelectorAll('.service-row[open]').forEach((openRow) => {
      if (openRow !== row) openRow.open = false;
    });
  });
});

const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    formStatus.textContent = 'Complete your name, organisation and certification scheme.';
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const organisation = String(data.get('organisation') || '').trim();
  const employees = String(data.get('employees') || '').trim();
  const scheme = String(data.get('scheme') || '').trim();
  const message = String(data.get('message') || '').trim();

  const enquiry = [
    '*Certification enquiry*',
    `*Name:* ${name}`,
    `*Organisation:* ${organisation}`,
    employees ? `*Employee count:* ${employees}` : '',
    `*Certification scheme:* ${scheme}`,
    message ? `*Message:* ${message}` : '*Message:* No additional details provided.'
  ].filter(Boolean).join('\n');

  const whatsappUrl = `https://wa.me/917873112221?text=${encodeURIComponent(enquiry)}`;
  const whatsappLink = document.createElement('a');
  whatsappLink.href = whatsappUrl;
  whatsappLink.target = '_blank';
  whatsappLink.rel = 'noopener noreferrer';
  document.body.append(whatsappLink);
  whatsappLink.click();
  whatsappLink.remove();

  formStatus.textContent = 'WhatsApp opened. Review the details, then send your enquiry.';
});

document.querySelector('#year').textContent = new Date().getFullYear();
