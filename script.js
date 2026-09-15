/**
 * anirban® — Luxury Editorial Portfolio Interactive Engine
 * Matches styling and behaviors from D:\Port.mp4 (norell® aesthetic)
 */

(function () {
  'use strict';

  // ── 1. Custom Magnetic Project Cursor ──
  const cursor = document.getElementById('project-cursor');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      // Smooth lerp (linear interpolation)
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Attach hover triggers to editorial project cards and media frames
    const hoverTargets = document.querySelectorAll('.editorial-card, .card-media-wrap, .media-banner-frame');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('visible'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    });
  }

  // ── 2. Fullscreen Drawer Navigation Menu ──
  const menuToggle = document.getElementById('menu-toggle');
  const menuClose = document.getElementById('menu-close');
  const fullscreenMenu = document.getElementById('fullscreen-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  function openMenu() {
    if (!fullscreenMenu) return;
    fullscreenMenu.classList.add('open');
    fullscreenMenu.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!fullscreenMenu) return;
    fullscreenMenu.classList.remove('open');
    fullscreenMenu.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);

  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fullscreenMenu?.classList.contains('open')) {
      closeMenu();
    }
  });

  // ── 3. Sticky Header Scroll Behavior ──
  const siteHeader = document.getElementById('site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 120) {
      siteHeader?.classList.add('hidden');
    } else {
      siteHeader?.classList.remove('hidden');
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  // ── 4. Interactive Core Expertise Section (00:23 in video) ──
  const SKILLS_DATA = [
    {
      title: 'Backend Architecture',
      category: 'FastAPI · Python · REST APIs',
      desc: 'High-performance asynchronous backend architecture with FastAPI and Python. Scalable microservices, automated JWT auth, rate limiting, and robust production-ready API routes.',
      img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Database Engineering',
      category: 'PostgreSQL · Relational Modeling',
      desc: 'Relational schema architecture with PostgreSQL. Transactional integrity, ACID compliance, optimized indexing, query performance tuning, and structured data pipelines.',
      img: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Machine Learning & NLP',
      category: 'NLP · Scikit-Learn · Classification',
      desc: 'Automated machine learning pipelines for textual analysis and classification. Real-world dataset preprocessing, TF-IDF vectorization, feature extraction, and NLP misinformation detection.',
      img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop'
    },
    {
      title: 'Full-Stack & Web Systems',
      category: 'Modern JavaScript · HTML5/CSS3 · Vercel',
      desc: 'End-to-end full stack web platforms with clean modern JavaScript, responsive interfaces, state management, seamless third-party API integrations, and continuous cloud deployments.',
      img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  const skillItems = document.querySelectorAll('.skill-interactive-item');
  const skillImg = document.getElementById('skill-preview-img');
  const skillCat = document.getElementById('skill-preview-category');
  const skillDesc = document.getElementById('skill-preview-desc');

  function activateSkill(index) {
    const data = SKILLS_DATA[index];
    if (!data) return;

    skillItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === index);
    });

    if (skillImg) {
      skillImg.style.opacity = '0';
      setTimeout(() => {
        skillImg.src = data.img;
        skillImg.style.opacity = '1';
      }, 200);
    }
    if (skillCat) skillCat.textContent = data.category;
    if (skillDesc) skillDesc.textContent = data.desc;
  }

  skillItems.forEach((item) => {
    const idx = parseInt(item.getAttribute('data-index') || '0', 10);
    item.addEventListener('mouseenter', () => activateSkill(idx));
    item.addEventListener('click', () => activateSkill(idx));
  });

  // ── 5. Metric Counter Animations ──
  const metricNumbers = document.querySelectorAll('.metric-number[data-target]');
  let metricsAnimated = false;

  function runCounters() {
    metricNumbers.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const duration = 1600;
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(easeOut * target);

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(updateNumber);
    });
  }

  const metricsSection = document.querySelector('.metrics-grid');
  if (metricsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !metricsAnimated) {
        metricsAnimated = true;
        runCounters();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(metricsSection);
  }

  // ── 6. Engagement Models Toggle (00:32 in video) ──
  const tabProject = document.getElementById('tab-project');
  const tabFulltime = document.getElementById('tab-fulltime');

  const p1Sym = document.getElementById('p1-sym');
  const p1Title = document.getElementById('p1-title');
  const p1Sub = document.getElementById('p1-sub');
  const p1Desc = document.getElementById('p1-desc');
  const p1Features = document.getElementById('p1-features');

  const p2Sym = document.getElementById('p2-sym');
  const p2Title = document.getElementById('p2-title');
  const p2Sub = document.getElementById('p2-sub');
  const p2Desc = document.getElementById('p2-desc');
  const p2Features = document.getElementById('p2-features');

  function setEngagementMode(mode) {
    if (mode === 'project') {
      tabProject?.classList.add('active');
      tabFulltime?.classList.remove('active');

      if (p1Sym) p1Sym.textContent = '🚀';
      if (p1Title) p1Title.textContent = 'Sprint';
      if (p1Sub) p1Sub.textContent = '/MVP Launch';
      if (p1Desc) p1Desc.textContent = 'Ideal for early-stage prototypes, hackathons, or standalone backend/frontend features.';
      if (p1Features) {
        p1Features.innerHTML = `
          <li><span class="check-icon">✓</span> Rapid FastAPI or Web MVP Development</li>
          <li><span class="check-icon">✓</span> PostgreSQL Database Modeling &amp; Migration</li>
          <li><span class="check-icon">✓</span> REST API Endpoints &amp; Documentation</li>
          <li><span class="check-icon">✓</span> Vercel or Cloud Deployment Setup</li>
        `;
      }

      if (p2Sym) p2Sym.textContent = '⚡';
      if (p2Title) p2Title.textContent = 'Full-Stack';
      if (p2Sub) p2Sub.textContent = '/End-to-End';
      if (p2Desc) p2Desc.textContent = 'Complete product engineering from database schemas to client-side interface and intelligence.';
      if (p2Features) {
        p2Features.innerHTML = `
          <li><span class="check-icon">✓</span> Full-Stack Architecture &amp; Implementation</li>
          <li><span class="check-icon">✓</span> Machine Learning &amp; NLP Model Integration</li>
          <li><span class="check-icon">✓</span> PostgreSQL Performance &amp; Query Optimization</li>
          <li><span class="check-icon">✓</span> Authentication, RBAC &amp; API Security</li>
          <li><span class="check-icon">✓</span> Ongoing Support &amp; Feature Expansion</li>
        `;
      }
    } else {
      tabProject?.classList.remove('active');
      tabFulltime?.classList.add('active');

      if (p1Sym) p1Sym.textContent = '💼';
      if (p1Title) p1Title.textContent = 'Internship';
      if (p1Sub) p1Sub.textContent = '/Summer & Winter';
      if (p1Desc) p1Desc.textContent = 'Available for Software Engineering, Backend Developer, or Machine Learning internships.';
      if (p1Features) {
        p1Features.innerHTML = `
          <li><span class="check-icon">✓</span> Full-Time or Part-Time Flexibility</li>
          <li><span class="check-icon">✓</span> FastAPI, Python &amp; PostgreSQL Expertise</li>
          <li><span class="check-icon">✓</span> Git, Agile &amp; Remote Team Workflow</li>
          <li><span class="check-icon">✓</span> Fast Learner with Strong CS Fundamentals</li>
        `;
      }

      if (p2Sym) p2Sym.textContent = '🌟';
      if (p2Title) p2Title.textContent = 'Full-Time';
      if (p2Sub) p2Sub.textContent = '/Junior SWE';
      if (p2Desc) p2Desc.textContent = 'High-ownership engineering role building reliable backends, web systems, and data pipelines.';
      if (p2Features) {
        p2Features.innerHTML = `
          <li><span class="check-icon">✓</span> Backend Engineering &amp; Systems Architecture</li>
          <li><span class="check-icon">✓</span> Scalable Relational Database Engineering</li>
          <li><span class="check-icon">✓</span> Applied AI/ML &amp; Data Pipeline Development</li>
          <li><span class="check-icon">✓</span> Open to Onsite (Kolkata) &amp; Remote Global</li>
        `;
      }
    }
  }

  tabProject?.addEventListener('click', () => setEngagementMode('project'));
  tabFulltime?.addEventListener('click', () => setEngagementMode('fulltime'));

  // ── 7. Interactive Contact Form Submission ──
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');

  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const msgInput = document.getElementById('contact-msg');

    if (!nameInput?.value.trim() || !emailInput?.value.trim()) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
    }

    // Direct mailto fallback or simulated success
    setTimeout(() => {
      if (formFeedback) {
        formFeedback.textContent = '✓ Thank you! Your message has been prepared. Reaching out directly...';
        formFeedback.style.color = '#10b981';
      }

      const subject = encodeURIComponent(`Portfolio Inquiry from ${nameInput.value}`);
      const body = encodeURIComponent(`Name: ${nameInput.value}\nEmail: ${emailInput.value}\n\nMessage:\n${msgInput?.value}`);
      window.location.href = `mailto:sarkaranirban405@gmail.com?subject=${subject}&body=${body}`;

      contactForm.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submitted ✓</span>';
        setTimeout(() => {
          submitBtn.innerHTML = '<span>Submit</span>';
        }, 3000);
      }
    }, 600);
  });

})();
