document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const navbar = document.querySelector(".navbar");
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section, header");

  // 1. Mobile Menu Toggle
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      // Animate hamburger to X
      const bars = mobileToggle.querySelectorAll(".bar");
      if (navLinks.classList.contains("active")) {
        bars[0].style.transform = "rotate(45deg) translate(5px, 6px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(-45deg) translate(5px, -6px)";
      } else {
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      }
    });
  }

  // Close mobile menu when a link is clicked
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        const bars = mobileToggle.querySelectorAll(".bar");
        bars[0].style.transform = "none";
        bars[1].style.opacity = "1";
        bars[2].style.transform = "none";
      }
    });
  });

  // 2. Navbar Scroll Effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // 3. Active Section Highlight & Smooth Scroll
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -50% 0px", // Trigger when section is near middle of viewport
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Remove active class from all links
        navItems.forEach((link) => link.classList.remove("active"));

        // Add active class to corresponding link
        const id = entry.target.getAttribute("id");
        const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // 4. Scroll Reveal Animation
  const revealObserverOptions = {
    root: null,
    rootMargin: "0px 0px -100px 0px", // Trigger slightly before element enters view
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, revealObserverOptions);

  const revealElements = document.querySelectorAll(".scroll-reveal");
  revealElements.forEach((el) => revealObserver.observe(el));
});
