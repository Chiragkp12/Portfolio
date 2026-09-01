/* =========================================================
   PORTFOLIO — INTERACTIVE SCRIPT
   Particle network, custom cursor, navigation, scroll reveal
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  /* =========================================================
     1. PARTICLE NETWORK BACKGROUND (Canvas)
     ========================================================= */
  (() => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width, height, particles;
    const PARTICLE_COUNT = isMobile ? 35 : 85;
    const MAX_CONNECTION_DISTANCE = isMobile ? 110 : 150;
    let rafId = null;
    let isVisible = !document.hidden;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
          vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4),
          r: Math.random() * 1.8 + 0.7,
          hue: Math.random() < 0.5 ? 270 : 190,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function step(t) {
      ctx.clearRect(0, 0, width, height);

      // update + draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.001 + p.pulse);
        const alpha = 0.35 + 0.35 * pulse;
        const color =
          p.hue === 270
            ? `rgba(168, 85, 247, ${alpha})`
            : `rgba(34, 211, 238, ${alpha * 0.9})`;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor =
          p.hue === 270 ? "rgba(168, 85, 247, 0.6)" : "rgba(34, 211, 238, 0.5)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_CONNECTION_DISTANCE) {
            const strength = 1 - dist / MAX_CONNECTION_DISTANCE;
            const lineAlpha = strength * 0.18;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(168, 85, 247, ${lineAlpha})`);
            grad.addColorStop(1, `rgba(34, 211, 238, ${lineAlpha})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = strength * 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (isVisible && !prefersReducedMotion) {
        rafId = requestAnimationFrame(step);
      }
    }

    function start() {
      resize();
      createParticles();
      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(step);
      } else {
        // reduced motion: draw a single static frame
        step(0);
      }
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    document.addEventListener("visibilitychange", () => {
      isVisible = !document.hidden;
      if (isVisible && !prefersReducedMotion) {
        if (!rafId) rafId = requestAnimationFrame(step);
      } else if (!isVisible) {
        stop();
      }
    });

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    start();
  })();

  /* =========================================================
     2. CUSTOM CURSOR
     ========================================================= */
  (() => {
    if (isMobile || prefersReducedMotion) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);

    const interactive =
      "a, button, input, textarea, select, [role='button'], .skill-chip, .project-card, .cert-card, .profile-card, .timeline-card, .skill-category, .contact-method";
    document.querySelectorAll(interactive).forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });

    // hide when leaving window
    document.addEventListener("mouseleave", () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    });
  })();

  /* =========================================================
     3. NAVIGATION — Mobile toggle, scroll state, active link
     ========================================================= */
  (() => {
    const navbar = document.querySelector(".navbar");
    const mobileToggle = document.querySelector(".mobile-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navItems = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id], header[id]");

    // Mobile toggle
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener("click", () => {
        const isActive = navLinks.classList.toggle("active");
        mobileToggle.setAttribute("aria-expanded", String(isActive));
        const bars = mobileToggle.querySelectorAll(".bar");
        if (isActive) {
          bars[0].style.transform = "rotate(45deg) translate(5px, 6px)";
          bars[1].style.opacity = "0";
          bars[2].style.transform = "rotate(-45deg) translate(5px, -6px)";
        } else {
          bars[0].style.transform = "none";
          bars[1].style.opacity = "1";
          bars[2].style.transform = "none";
        }
      });

      // Close on link click
      navItems.forEach((item) => {
        item.addEventListener("click", () => {
          if (navLinks.classList.contains("active")) {
            navLinks.classList.remove("active");
            mobileToggle.setAttribute("aria-expanded", "false");
            const bars = mobileToggle.querySelectorAll(".bar");
            bars[0].style.transform = "none";
            bars[1].style.opacity = "1";
            bars[2].style.transform = "none";
          }
        });
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (
          navLinks.classList.contains("active") &&
          !navLinks.contains(e.target) &&
          !mobileToggle.contains(e.target)
        ) {
          navLinks.classList.remove("active");
          mobileToggle.setAttribute("aria-expanded", "false");
          const bars = mobileToggle.querySelectorAll(".bar");
          bars[0].style.transform = "none";
          bars[1].style.opacity = "1";
          bars[2].style.transform = "none";
        }
      });
    }

    // Scroll state
    const onScroll = () => {
      if (navbar) {
        if (window.scrollY > 50) navbar.classList.add("scrolled");
        else navbar.classList.remove("scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Active section
    if (
      "IntersectionObserver" in window &&
      sections.length &&
      navItems.length
    ) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("id");
              navItems.forEach((link) => {
                link.classList.remove("active");
                if (link.getAttribute("href") === `#${id}`) {
                  link.classList.add("active");
                }
              });
            }
          });
        },
        { root: null, rootMargin: "-40% 0px -50% 0px", threshold: 0 },
      );
      sections.forEach((s) => observer.observe(s));
    }
  })();

  /* =========================================================
     4. SCROLL REVEAL ANIMATIONS
     ========================================================= */
  (() => {
    if (prefersReducedMotion) {
      document
        .querySelectorAll(".scroll-reveal")
        .forEach((el) => el.classList.add("visible"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      document
        .querySelectorAll(".scroll-reveal")
        .forEach((el) => el.classList.add("visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -60px 0px", threshold: 0.08 },
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      revealObserver.observe(el);
    });
  })();

  /* =========================================================
     5. BUTTON — Mouse-tracked radial glow
     ========================================================= */
  (() => {
    const btns = document.querySelectorAll(".btn");
    btns.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty("--mouse-x", `${x}%`);
        btn.style.setProperty("--mouse-y", `${y}%`);
      });
    });
  })();

  /* =========================================================
     6. CONTACT FORM — Basic validation + mailto fallback
     ========================================================= */
  (() => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = (
        document.getElementById("subject")?.value || "Portfolio Contact"
      ).trim();
      const message = document.getElementById("message").value.trim();

      const statusEl = form.querySelector(".form-status");

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.innerHTML =
            '<span class="status-indicator" style="background:#EF4444; box-shadow: 0 0 6px rgba(239,68,68,.6);" aria-hidden="true"></span><span>Please fill in all required fields.</span>';
        }
        return;
      }

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailValid) {
        if (statusEl) {
          statusEl.innerHTML =
            '<span class="status-indicator" style="background:#EF4444; box-shadow: 0 0 6px rgba(239,68,68,.6);" aria-hidden="true"></span><span>Please enter a valid email address.</span>';
        }
        return;
      }

      // Build mailto link (simple fallback)
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`,
      );
      const mailtoSubject = encodeURIComponent(subject || "Portfolio Contact");
      const to = "chirag@example.com";
      window.location.href = `mailto:${to}?subject=${mailtoSubject}&body=${body}`;

      if (statusEl) {
        statusEl.innerHTML =
          '<span class="status-indicator" aria-hidden="true"></span><span>Opening your email client...</span>';
      }

      form.reset();
    });
  })();

  /* =========================================================
     7. SMOOTH SCROLL for anchor links (extra polish)
     ========================================================= */
  (() => {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((a) => {
      a.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          (window.innerWidth < 860 ? 70 : 90);
        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      });
    });
  })();
});
