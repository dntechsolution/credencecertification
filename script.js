const body = document.body;
const header = document.querySelector('.site-header');
const mobileNav = document.querySelector('.mobile-nav');
const mobileToggle = document.querySelector('.mobile-toggle');
const mobileMenuLabel = mobileToggle?.querySelector('.menu-label');
const navigationLinks = [...document.querySelectorAll('.mobile-nav a')];
const backToTop = document.querySelector('#back-to-top');
const timelineProgress = document.querySelector('.timeline-progress');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

requestAnimationFrame(() => body.classList.add('is-ready'));

function setMobileMenu(open) {
  if (!mobileNav || !mobileToggle) return;
  mobileNav.classList.toggle('open', open);
  mobileToggle.setAttribute('aria-expanded', String(open));
  mobileToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (mobileMenuLabel) mobileMenuLabel.textContent = open ? 'Close navigation' : 'Open navigation';
  header?.classList.toggle('menu-open', open);
  body.classList.toggle('overflow-hidden', open);
}

mobileToggle?.addEventListener('click', () => {
  const open = mobileToggle.getAttribute('aria-expanded') !== 'true';
  setMobileMenu(open);
  if (open) requestAnimationFrame(() => mobileNav?.querySelector('a')?.focus());
});

navigationLinks.forEach((link) => link.addEventListener('click', () => setMobileMenu(false)));

// Desktop Services dropdown
const dropdownContainers = [...document.querySelectorAll('[data-dropdown]')];

function closeAllDropdowns(except = null) {
  dropdownContainers.forEach((container) => {
    if (container === except) return;
    container.classList.remove('is-open');
    const toggle = container.querySelector('[data-dropdown-toggle]');
    toggle?.setAttribute('aria-expanded', 'false');
  });
}

dropdownContainers.forEach((container) => {
  const toggle = container.querySelector('[data-dropdown-toggle]');
  const panel = container.querySelector('[data-dropdown-panel]');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const isOpen = container.classList.contains('is-open');
    closeAllDropdowns(container);
    container.classList.toggle('is-open', !isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  container.addEventListener('mouseenter', () => {
    if (window.innerWidth < 1280) return;
    closeAllDropdowns(container);
    container.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  });

  container.addEventListener('mouseleave', () => {
    if (window.innerWidth < 1280) return;
    container.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });

  panel.querySelectorAll('a').forEach((item) => {
    item.addEventListener('click', () => closeAllDropdowns());
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-dropdown]')) closeAllDropdowns();
});

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  closeAllDropdowns();
  if (mobileToggle?.getAttribute('aria-expanded') === 'true') {
    setMobileMenu(false);
    mobileToggle.focus();
  }
  const activeModal = document.querySelector('[data-modal].is-open');
  if (activeModal) closeModal(activeModal);
});

window.addEventListener('resize', () => {
  if (window.innerWidth >= 1280) setMobileMenu(false);
  updateScrollControls();
}, { passive: true });

function updateScrollControls() {
  header?.classList.toggle('scrolled', window.scrollY > 24);
  const backToTopThreshold = Math.min(600, window.innerHeight * 0.75);
  backToTop?.classList.toggle('show', window.scrollY > backToTopThreshold);
}

updateScrollControls();
window.addEventListener('scroll', updateScrollControls, { passive: true });

backToTop?.addEventListener('click', () => {
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
if (sections.length && desktopNavLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    desktopNavLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === `#${current.target.id}`);
    });
  }, { rootMargin: '-30% 0px -60% 0px', threshold: [0, .25, .7] });

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelectorAll('.service-row').forEach((row) => {
  row.addEventListener('toggle', () => {
    if (!row.open) return;
    document.querySelectorAll('.service-row[open]').forEach((openRow) => {
      if (openRow !== row) openRow.open = false;
    });
  });
});

// Pre-fill scheme in contact / quote forms
function applySchemePreset(schemeValue, shouldScroll = true, shouldFocus = true) {
  const form = document.querySelector('#contact-form') || document.querySelector('#cbam-quote-form');
  if (!form) return;
  const select = form.querySelector('select[name="scheme"]');
  if (select && schemeValue) {
    const normalized = schemeValue.toLowerCase();
    const matchedOption = [...select.options].find((opt) =>
      opt.value.toLowerCase() === normalized ||
      opt.textContent.toLowerCase().includes(normalized)
    );
    if (matchedOption) {
      select.value = matchedOption.value;
      select.classList.add('ring-2', 'ring-gold');
      setTimeout(() => select.classList.remove('ring-2', 'ring-gold'), 2000);
    }
  }
  if (shouldScroll) {
    const targetSection = form.closest('section') || form;
    targetSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }
  if (shouldFocus) {
    const nameInput = form.querySelector('input[name="name"]');
    setTimeout(() => nameInput?.focus({ preventScroll: true }), 350);
  }
}

document.querySelectorAll('[data-preset-scheme]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    const targetHref = trigger.getAttribute('href') || '';
    const scheme = trigger.getAttribute('data-preset-scheme');
    if (!scheme) return;
    if (targetHref.startsWith('#') && document.querySelector('#contact-form, #cbam-quote-form')) {
      event.preventDefault();
      applySchemePreset(scheme, true, true);
    }
  });
});

const urlParams = new URLSearchParams(window.location.search);
const presetParam = urlParams.get('scheme');
if (presetParam) {
  requestAnimationFrame(() => applySchemePreset(presetParam, window.location.hash === '#contact', false));
}

// WhatsApp enquiry form handler (supports #contact-form and #cbam-quote-form)
document.querySelectorAll('#contact-form, #cbam-quote-form').forEach((form) => {
  const statusEl = form.querySelector('#form-status, .form-status') || document.querySelector('#form-status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      if (statusEl) statusEl.textContent = 'Complete your name, organisation and certification scheme.';
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const organisation = String(data.get('organisation') || '').trim();
    const employees = String(data.get('employees') || '').trim();
    const scheme = String(data.get('scheme') || '').trim();
    const sector = String(data.get('sector') || '').trim();
    const message = String(data.get('message') || '').trim();

    const enquiry = [
      '*Certification / Verification enquiry*',
      `*Name:* ${name}`,
      `*Organisation:* ${organisation}`,
      employees ? `*Employee count:* ${employees}` : '',
      sector ? `*Sector / Products:* ${sector}` : '',
      `*Service / Scheme:* ${scheme}`,
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

    if (statusEl) statusEl.textContent = 'WhatsApp opened. Review the details, then send your enquiry.';
  });
});

// Checklist / Modal support
function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex', 'is-open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('overflow-hidden');
  modal.querySelector('[data-modal-close]')?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex', 'is-open');
  modal.setAttribute('aria-hidden', 'true');
  body.classList.remove('overflow-hidden');
}

document.querySelectorAll('[data-open-modal]').forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const modalId = btn.getAttribute('data-open-modal');
    const modal = document.getElementById(modalId);
    if (!modal) return;
    event.preventDefault();
    openModal(modal);
  });
});

document.querySelectorAll('[data-modal]').forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-modal-close]')) {
      closeModal(modal);
    }
  });
});

document.querySelector('#print-checklist')?.addEventListener('click', () => {
  window.print();
});

const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
