/* KHALED.EXE — Vanilla JS, module-based, fail-safe init */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function themeSystem() {
    const THEMES = ["signal", "matrix", "amber", "lumen"];
    const STORAGE_KEY = "khaled-exe-theme";
    const colorMap = {
      signal: "#04050a",
      matrix: "#030805",
      amber: "#0b0603",
      lumen: "#f5f7fb",
    };
    const root = document.documentElement;
    const metaTheme = document.getElementById("themeColorMeta");
    const buttons = document.querySelectorAll("[data-theme-btn]");

    function applyTheme(name) {
      if (!THEMES.includes(name)) name = "signal";
      root.setAttribute("data-theme", name);
      try {
        localStorage.setItem(STORAGE_KEY, name);
      } catch (e) {}
      if (metaTheme)
        metaTheme.setAttribute("content", colorMap[name] || "#04050a");
      buttons.forEach((btn) => {
        btn.setAttribute(
          "aria-pressed",
          btn.getAttribute("data-theme-btn") === name ? "true" : "false",
        );
      });
    }

    let current = root.getAttribute("data-theme");
    if (!current) {
      try {
        current = localStorage.getItem(STORAGE_KEY);
      } catch (e) {}
    }
    applyTheme(current || "signal");

    buttons.forEach((btn) =>
      btn.addEventListener("click", () =>
        applyTheme(btn.getAttribute("data-theme-btn")),
      ),
    );

    document.addEventListener("keydown", (e) => {
      const tag =
        (document.activeElement && document.activeElement.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key.toLowerCase() === "t") {
        const now = root.getAttribute("data-theme") || "signal";
        applyTheme(THEMES[(THEMES.indexOf(now) + 1) % THEMES.length]);
      }
    });
  }

  function loader() {
    const loaderEl = document.getElementById("loader");
    if (!loaderEl) return;
    const bootLog = document.getElementById("bootLog");
    const fill = document.getElementById("loaderFill");
    const lines = [
      "booting khaled.exe",
      "loading modules :: profile, projects, skills",
      "compiling interface",
      "connection secure",
      "ready.",
    ];

    let hidden = false;
    function hideLoader() {
      if (hidden) return;
      hidden = true;
      loaderEl.classList.add("is-hidden");
      document.body.classList.remove("is-loading");
      setTimeout(() => {
        loaderEl.style.display = "none";
      }, 700);
    }
    window.__forceHideLoader = hideLoader;

    if (bootLog) {
      if (reducedMotion) {
        lines.forEach((l) => {
          const d = document.createElement("div");
          d.textContent = l;
          bootLog.appendChild(d);
        });
      } else {
        let lineIndex = 0;
        const typeLine = () => {
          if (lineIndex >= lines.length) return;
          const line = lines[lineIndex];
          const lineEl = document.createElement("div");
          bootLog.appendChild(lineEl);
          let charIndex = 0;
          (function typeChar() {
            if (charIndex < line.length) {
              lineEl.textContent += line.charAt(charIndex++);
              setTimeout(typeChar, 18);
            } else {
              lineIndex++;
              setTimeout(typeLine, 120);
            }
          })();
        };
        typeLine();
      }
    }

    if (fill) {
      fill.style.transition = reducedMotion ? "none" : "width 2.2s ease";
      requestAnimationFrame(() => {
        fill.style.width = "100%";
      });
    }

    if (document.readyState === "complete") {
      setTimeout(hideLoader, reducedMotion ? 0 : 900);
    } else {
      window.addEventListener("load", () =>
        setTimeout(hideLoader, reducedMotion ? 0 : 900),
      );
    }
    setTimeout(hideLoader, 2600);
  }

  function cursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    const cursorEl = document.getElementById("cursor");
    const coordsEl = document.getElementById("cursorCoords");
    if (!cursorEl) return;

    document.documentElement.classList.add("has-cursor");

    document.addEventListener("mousemove", (e) => {
      cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      if (coordsEl) {
        coordsEl.textContent = `X:${String(e.clientX).padStart(3, "0")} Y:${String(e.clientY).padStart(3, "0")}`;
      }
    });

    const hoverTargets =
      "a, button, .skill-card, [data-cursor-hover], input, textarea";
    document.addEventListener("mouseover", (e) => {
      if (!e.target.closest(hoverTargets)) return;
      if (e.target.closest("input, textarea"))
        cursorEl.classList.add("is-hidden");
      else cursorEl.classList.add("is-hovering");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.remove("is-hovering", "is-hidden");
      }
    });
  }

  function headerScroll() {
    const header = document.querySelector("header");
    if (!header) return;
    const onScroll = () =>
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function hudRail() {
    const fill = document.getElementById("hudFill");
    const sectionLabel = document.getElementById("hudSection");
    const sections = document.querySelectorAll("section[data-log]");

    if (fill) {
      const onScroll = () => {
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
        fill.style.height = `${Math.min(100, Math.max(0, pct))}%`;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (sectionLabel && sections.length && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting)
              sectionLabel.textContent = entry.target.getAttribute("data-log");
          });
        },
        { threshold: 0.4 },
      );
      sections.forEach((s) => obs.observe(s));
    }
  }

  function mobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mobileNav");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      document.body.style.overflow = "";
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      nav.classList.add("is-open");
      document.body.style.overflow = "hidden";
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", () =>
      nav.classList.contains("is-open") ? close() : open(),
    );
    nav
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  function smoothAnchors() {
    const header = document.querySelector("header");
    const headerH = header ? header.offsetHeight : 0;

    document.querySelectorAll("[data-nav], #scrollIndicator").forEach((el) => {
      el.addEventListener("click", (e) => {
        let href = el.getAttribute("href");
        if (el.id === "scrollIndicator") href = "#about";
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top =
          target.getBoundingClientRect().top + window.scrollY - headerH + 1;
        window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
      });
    });
  }

  function reveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );

    items.forEach((el) => obs.observe(el));
  }

  function activeNav() {
    const links = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll("section[id]");
    if (
      !links.length ||
      !sections.length ||
      !("IntersectionObserver" in window)
    )
      return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove("is-active"));
          const match = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`,
          );
          if (match) match.classList.add("is-active");
        });
      },
      { threshold: 0.4 },
    );

    sections.forEach((s) => obs.observe(s));
  }

  function heroTyping() {
    const el = document.getElementById("heroTyped");
    if (!el) return;
    const text = "deploy --target=real_world --mode=problem_solving";

    if (reducedMotion) {
      el.textContent = text;
      return;
    }

    setTimeout(() => {
      let i = 0;
      (function typeChar() {
        if (i < text.length) {
          el.textContent += text.charAt(i++);
          setTimeout(typeChar, 32);
        }
      })();
    }, 2600);
  }

  function parallax() {
    const isFine = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const frame = document.getElementById("portraitFrame");
    const heroSection = document.querySelector(".hero");
    if (!isFine || reducedMotion || !frame || !heroSection) return;

    let targetX = 0,
      targetY = 0,
      curX = 0,
      curY = 0;

    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    });

    (function loop() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      frame.style.transform = `rotateY(${curX}deg) rotateX(${curY}deg)`;
      requestAnimationFrame(loop);
    })();
  }

  function portraitFallback() {
    const img = document.getElementById("portraitImg");
    const fallback = document.getElementById("portraitFallback");
    if (!img || !fallback) return;
    const showFallback = () => {
      img.style.display = "none";
      fallback.removeAttribute("hidden");
    };
    img.addEventListener("error", showFallback);
    // Agei load fail hoye thakle (JS ashar age error fire hoye gele)
    if (img.complete && img.naturalWidth === 0) showFallback();
  }

  function projectImages() {
    // Project screenshot na thakle (404) image lukiye gradient preview dekhabe
    document
      .querySelectorAll(".project__preview img, .photo-card img")
      .forEach((img) => {
        const hide = () => {
          img.style.display = "none";
        };
        img.addEventListener("error", hide);
        if (img.complete && img.naturalWidth === 0) hide();
      });
  }

  function skills() {
    const grid = document.getElementById("skillsGrid");
    if (!grid) return;

    const data = [
      { cat: "programming", code: "PY", name: "Python" },
      { cat: "programming", code: "JV", name: "Java" },
      { cat: "programming", code: "C", name: "C" },
      { cat: "programming", code: "C++", name: "C++" },
      { cat: "programming", code: "JS", name: "JavaScript" },
      { cat: "programming", code: "TS", name: "TypeScript" },
      { cat: "frontend", code: "H5", name: "HTML5" },
      { cat: "frontend", code: "C3", name: "CSS3" },
      { cat: "frontend", code: "RX", name: "React" },
      { cat: "frontend", code: "TW", name: "Tailwind CSS" },
      { cat: "frontend", code: "FM", name: "Framer Motion" },
      { cat: "backend", code: "ND", name: "Node.js" },
      { cat: "backend", code: "EX", name: "Express.js" },
      { cat: "backend", code: "API", name: "REST API Design" },
      { cat: "database", code: "SQL", name: "MySQL" },
      { cat: "database", code: "PG", name: "PostgreSQL" },
      { cat: "database", code: "DB", name: "Schema Design" },
      { cat: "database", code: "QRY", name: "SQL Queries" },
      { cat: "tools", code: "GIT", name: "Git" },
      { cat: "tools", code: "GH", name: "GitHub" },
      { cat: "tools", code: "VT", name: "Vite" },
      { cat: "tools", code: "ML", name: "Machine Learning" },
    ];

    // Real tech logos (Devicon CDN). Icon na pele code text fallback dekhabe.
    const DEVICON = (slug) =>
      `https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/${slug}/${slug}-original.svg`;
    const ICONS = {
      Python: "python",
      Java: "java",
      C: "c",
      "C++": "cplusplus",
      JavaScript: "javascript",
      TypeScript: "typescript",
      HTML5: "html5",
      CSS3: "css3",
      React: "react",
      "Tailwind CSS": "tailwindcss",
      "Framer Motion": "framermotion",
      "Node.js": "nodejs",
      "Express.js": "express",
      MySQL: "mysql",
      PostgreSQL: "postgresql",
      Git: "git",
      GitHub: "github",
      Vite: "vitejs",
    };
    const INVERT = ["Express.js", "GitHub"]; // black logos: dark theme e invert hobe

    const frag = document.createDocumentFragment();
    data.forEach((item) => {
      const card = document.createElement("div");
      card.className = "skill-card";
      card.setAttribute("data-category", item.cat);
      card.innerHTML = `
        <div class="skill-card__ico">${ICONS[item.name] ? `<img class="skill-card__icon${INVERT.includes(item.name) ? " invert" : ""}" src="${DEVICON(ICONS[item.name])}" alt="" loading="lazy" data-code="${item.code}" />` : `<span class="skill-card__code">${item.code}</span>`}</div>
        <div class="skill-card__name">${item.name}</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="1" y="1" width="98" height="98" rx="8" /></svg>
      `;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    grid.querySelectorAll(".skill-card__icon").forEach((img) => {
      img.addEventListener("error", () => {
        const s = document.createElement("span");
        s.className = "skill-card__code";
        s.textContent = img.dataset.code || "";
        img.replaceWith(s);
      });
    });

    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = grid.querySelectorAll(".skill-card");

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const filter = btn.getAttribute("data-filter");
        cards.forEach((card) => {
          const show =
            filter === "all" || card.getAttribute("data-category") === filter;
          if (show) card.removeAttribute("hidden");
          else card.setAttribute("hidden", "");
        });
      });
    });
  }

  function backToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener(
      "scroll",
      () => btn.classList.toggle("is-visible", window.scrollY > 500),
      { passive: true },
    );
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }),
    );
  }

  function copyEmail() {
    const btn = document.getElementById("copyEmailBtn");
    const feedback = document.getElementById("copyFeedback");
    if (!btn) return;

    function say(msg) {
      if (!feedback) return;
      feedback.textContent = msg;
      setTimeout(() => {
        feedback.textContent = "";
      }, 3000);
    }

    btn.addEventListener("click", async () => {
      const email = btn.getAttribute("data-email") || "kh.milu338@gmail.com";
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = document.createElement("textarea");
          ta.value = email;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        say("> email copied to clipboard \u2713");
      } catch (err) {
        say("> copy failed, please copy manually");
      }
    });
  }

  function contactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const messageInput = document.getElementById("messageInput");
    const statusEl = document.getElementById("formStatus");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(input, msg) {
      const group = input.closest(".form-group");
      if (!group) return;
      group.classList.toggle("has-error", !!msg);
      const errEl = group.querySelector(".form-error");
      if (errEl) errEl.textContent = msg || "";
    }
    function validateName() {
      if (nameInput.value.trim().length < 2) {
        setError(nameInput, "Name must be at least 2 characters.");
        return false;
      }
      setError(nameInput, "");
      return true;
    }
    function validateEmail() {
      if (!emailRegex.test(emailInput.value.trim())) {
        setError(emailInput, "Enter a valid email address.");
        return false;
      }
      setError(emailInput, "");
      return true;
    }
    function validateMessage() {
      if (messageInput.value.trim().length < 10) {
        setError(messageInput, "Message must be at least 10 characters.");
        return false;
      }
      setError(messageInput, "");
      return true;
    }

    nameInput && nameInput.addEventListener("blur", validateName);
    emailInput && emailInput.addEventListener("blur", validateEmail);
    messageInput && messageInput.addEventListener("blur", validateMessage);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = [validateName(), validateEmail(), validateMessage()].every(
        Boolean,
      );
      if (ok) {
        if (statusEl) {
          statusEl.textContent =
            "> form validated locally. NOTE: no backend or email service is connected — this message was NOT sent anywhere. Please email kh.milu338@gmail.com directly, or connect a service like Formspree / EmailJS / Web3Forms to enable delivery.";
        }
        form.reset();
      } else if (statusEl) {
        statusEl.textContent = "> please fix the highlighted fields above.";
      }
    });
  }

  function liveClock() {
    const el = document.getElementById("liveClock");
    if (!el) return;
    let formatter = null;
    try {
      formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (err) {}
    function tick() {
      el.textContent = formatter
        ? `${formatter.format(new Date())} GMT+6`
        : new Date().toLocaleTimeString();
    }
    tick();
    setInterval(tick, 1000);
  }

  function footerYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const inits = [
      themeSystem,
      loader,
      cursor,
      headerScroll,
      hudRail,
      mobileNav,
      smoothAnchors,
      reveal,
      activeNav,
      heroTyping,
      parallax,
      portraitFallback,
      projectImages,
      skills,
      backToTop,
      copyEmail,
      liveClock,
      footerYear,
    ];
    inits.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error("[KHALED.EXE] module failed:", fn.name, err);
      }
    });
  });

  function forceHideLoaderAbsolute() {
    if (typeof window.__forceHideLoader === "function") {
      window.__forceHideLoader();
      return;
    }
    const loaderEl = document.getElementById("loader");
    if (loaderEl) {
      loaderEl.classList.add("is-hidden");
      loaderEl.style.display = "none";
    }
    document.body.classList.remove("is-loading");
  }
  window.addEventListener("error", forceHideLoaderAbsolute);
  setTimeout(forceHideLoaderAbsolute, 3500);
})();

/* KHALED.EXE — features: terminal (Ctrl+K), case studies, contact form, extras */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );

  /* ====== EDIT HERE ====== */
  const EMAIL = "kh.milu338@gmail.com";
  const WEB3FORMS_KEY = "9abb4711-f748-411b-a5cf-e1ff82c3da91"; // free key: https://web3forms.com (email diye nao)

  // Real details thakle "highlights" e likho (khali thakle section dekhabe na)
  const CASES = {
    oab: {
      name: "OAB Express",
      status: "LIVE",
      summary:
        "A courier and logistics platform built for real-world shipment and delivery operations.",
      problem:
        "Shipment and delivery work has many moving parts — bookings, tracking and coordination. This product brings them into one web platform.",
      arch: "[ Browser ]\n   │  React + TypeScript + Tailwind CSS\n   ▼\n[ REST API ]  Node.js + Express.js",
      stack: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express.js"],
      links: [
        { label: "Visit Live Site →", href: "https://www.oab-express.com/" },
      ],
      highlights: [],
    },
    lifesync: {
      name: "LifeSync",
      status: "REPOSITORY",
      summary:
        "A personal productivity and habit-tracking application for organizing daily routines and goals.",
      problem:
        "Routines and goals are easy to lose track of when they live in scattered notes. LifeSync keeps them in one place.",
      arch: "[ Browser ]\n   │  React\n   ▼\n[ REST API ]  Node.js + Express.js\n   │\n   ▼\n[ MySQL ]",
      stack: ["React", "Node.js", "Express.js", "MySQL"],
      links: [
        {
          label: "View on GitHub →",
          href: "https://github.com/khaledhasanmilu/LifeSync",
        },
      ],
      highlights: [],
    },
    unihub: {
      name: "UniHub",
      status: "REPOSITORY",
      summary:
        "A university resource and community hub built to centralize student information and tools.",
      problem:
        "Student information is spread across many places. UniHub centralizes resources and tools for the community.",
      arch: "[ Browser ]\n   │  HTML + JavaScript + Tailwind CSS\n   ▼\n[ REST API ]  Express.js\n   │\n   ▼\n[ MySQL ]",
      stack: ["HTML", "JavaScript", "Tailwind CSS", "Express.js", "MySQL"],
      links: [
        {
          label: "View on GitHub →",
          href: "https://github.com/khaledhasanmilu/UniHub",
        },
      ],
      highlights: [],
    },
    phishguard: {
      name: "PhishGuard",
      status: "PROJECT",
      summary:
        "Check if that SMS is safe. Paste it into PhishGuard and get a clear answer in seconds — safe or scam.",
      problem:
        "Got a strange SMS? A prize message, a bank warning, an unknown link? It is hard to tell what is real. PhishGuard gives a quick, clear verdict.",
      arch: "",
      stack: [],
      links: [
        {
          label: "View on GitHub →",
          href: "https://github.com/khaledhasanmilu/SMS-Phising-Detection ",
        },
      ],
      highlights: [
        "No signup",
        "No fees",
        "Nothing is stored",
        "Works on your phone",
      ],
    },
    spak: {
      name: "SPAK — Agriculture Rover",
      status: "DEMO",
      summary:
        "Our team’s agricultural rover — a project that taught us the power of teamwork, innovation, and perseverance.",
      problem:
        "Farming involves repetitive field work — preparing soil, watering, cutting grass, testing soil and planting seeds. SPAK brings these tasks together in a single rover.",
      arch: "",
      stack: [],
      links: [{ label: "Watch Demo →", href: "https://youtu.be/jeDA5cLB57M" }],
      highlights: [
        "Soil cultivation: automated tools for effective soil preparation",
        "Water spray system: precise and efficient watering for crops",
        "Grass cutting module: clean and eco-friendly grass maintenance",
        "Soil testing: sensors to analyze soil properties for better crop decisions",
        "Seeding mechanism: accurate seed placement for optimized farming",
      ],
    },
  };
  /* ======================== */

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast mono";
    t.textContent = "> " + msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("is-on"));
    setTimeout(() => {
      t.classList.remove("is-on");
      setTimeout(() => t.remove(), 400);
    }, 3000);
  }

  /* ---------- Case study modal ---------- */
  function caseStudies() {
    const m = document.createElement("div");
    m.className = "modal";
    m.hidden = true;
    m.innerHTML =
      '<div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="caseTitle"><button class="modal__close" aria-label="Close">×</button><div id="caseBody"></div></div>';
    document.body.appendChild(m);
    let last = null;

    function open(key) {
      const c = CASES[key];
      if (!c) return;
      last = document.activeElement;
      $("#caseBody").innerHTML =
        `<div class="eyebrow">CASE STUDY // ${esc(c.status)}</div>
         <h3 id="caseTitle">${esc(c.name)}</h3>
         <p class="case__lead">${esc(c.summary)}</p>
         <h4 class="mono">PROBLEM</h4><p>${esc(c.problem)}</p>
         ${c.arch ? `<h4 class="mono">ARCHITECTURE</h4><pre class="arch mono">${esc(c.arch)}</pre>` : ""}
         ${c.stack.length ? `<h4 class="mono">STACK</h4><div class="tags mono">${c.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
         ${c.highlights.length ? `<h4 class="mono">HIGHLIGHTS</h4><ul class="case__list">${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
         <div class="project__links">${c.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>`;
      m.hidden = false;
      document.body.style.overflow = "hidden";
      $(".modal__close", m).focus();
    }
    function close() {
      if (m.hidden) return;
      m.hidden = true;
      document.body.style.overflow = "";
      if (last && last.focus) last.focus();
    }
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest(".modal__close")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
    $$(".case-btn").forEach((b) =>
      b.addEventListener("click", () => open(b.dataset.case)),
    );
    window.__openCase = open;
  }

  /* ---------- Terminal ---------- */
  function terminal() {
    const el = document.createElement("div");
    el.className = "term-overlay";
    el.hidden = true;
    el.innerHTML = `<div class="term-overlay__box" role="dialog" aria-modal="true" aria-label="Terminal">
      <div class="term-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span>khaled@dhaka — zsh</span><button class="modal__close" data-x aria-label="Close terminal">×</button></div>
      <div class="term-overlay__out" id="tOut" aria-live="polite"></div>
      <label class="term-overlay__in"><span class="prompt">❯</span><input id="tIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command" /></label></div>`;
    document.body.appendChild(el);

    const fab = document.createElement("button");
    fab.id = "termFab";
    fab.className = "mono";
    fab.textContent = ">_";
    fab.setAttribute("aria-label", "Open terminal (Ctrl+K)");
    document.body.appendChild(fab);

    const out = $("#tOut"),
      input = $("#tIn");
    const hist = [];
    let hi = 0,
      booted = false;

    const print = (html, cls = "") => {
      const d = document.createElement("div");
      d.className = "t-line " + cls;
      d.innerHTML = html;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
    };
    const theme = () =>
      document.documentElement.getAttribute("data-theme") || "signal";

    const cmds = {
      help: () =>
        print(
          `<span class="t-key">help</span> commands:\n` +
            [
              ["about", "who I am"],
              ["neofetch", "quick system info"],
              ["ls", "list projects"],
              ["open &lt;name&gt;", "case study: oab | lifesync | unihub"],
              ["skills", "tech stack"],
              ["git log", "experience as commits"],
              ["contact", "email / links"],
              ["theme &lt;name&gt;", "signal | matrix | amber | lumen"],
              ["resume", "view CV"],
              ["clear", "clear screen"],
              ["exit", "close terminal"],
            ]
              .map(
                (r) =>
                  `  <span class="t-key">${r[0].padEnd(18).replace(/ /g, "&nbsp;")}</span><span class="t-dim">${r[1]}</span>`,
              )
              .join("\n"),
          "pre",
        ),
      about: () =>
        print(
          "Khaled Hasan Milu — software engineer from Dhaka. CSE (Data Science) at UIU, CGPA 3.83 / 4.00. I build full-stack products: clean, scalable, useful.",
        ),
      whoami: () => print("khaled — software engineer"),
      neofetch: () =>
        print(
          `<span class="t-key">khaled</span>@<span class="t-key">dhaka</span>\n---------------\n<span class="t-key">Role</span>     Software Engineer\n<span class="t-key">Edu</span>      BSc CSE (Data Science), UIU\n<span class="t-key">CGPA</span>     3.83 / 4.00\n<span class="t-key">Stack</span>    React · Node.js · TypeScript · MySQL\n<span class="t-key">Shell</span>    KHALED.EXE v2.0\n<span class="t-key">Theme</span>    ${esc(theme())}\n<span class="t-key">Uptime</span>   ${Math.floor((Date.now() - t0) / 1000)}s`,
          "pre",
        ),
      ls: () =>
        print(
          Object.keys(CASES)
            .map(
              (k) =>
                `<span class="t-key">${k.padEnd(10).replace(/ /g, "&nbsp;")}</span><span class="t-dim">${esc(CASES[k].name)} — ${esc(CASES[k].status.toLowerCase())}</span>`,
            )
            .join("\n"),
          "pre",
        ),
      skills: () =>
        print(
          $$(".skill-card__name")
            .map((s) => esc(s.textContent))
            .join(" · "),
        ),
      contact: () =>
        print(
          `<span class="t-key">email</span>    <a href="mailto:${EMAIL}">${EMAIL}</a>\n<span class="t-key">linkedin</span> <a href="https://www.linkedin.com/in/khaledhasanmilu/" target="_blank" rel="noopener">linkedin.com/in/khaledhasanmilu</a>\n<span class="t-key">github</span>   <a href="https://github.com/khaledhasanmilu/" target="_blank" rel="noopener">github.com/khaledhasanmilu</a>`,
          "pre",
        ),
      resume: () => {
        print("opening resume.pdf in a new tab …", "t-ok");
        window.open("resume.pdf", "_blank", "noopener");
      },
      clear: () => {
        out.innerHTML = "";
      },
      exit: () => close(),
      date: () => print(new Date().toString()),
      open: (a) => {
        const k = (a[0] || "").toLowerCase();
        if (!CASES[k])
          return print(
            `usage: open &lt;${Object.keys(CASES).join(" | ")}&gt;`,
            "t-err",
          );
        close();
        window.__openCase(k);
      },
      theme: (a) => {
        const n = (a[0] || "").toLowerCase(),
          b = $(`[data-theme-btn="${n}"]`);
        if (!b)
          return print(
            "usage: theme &lt;signal | matrix | amber | lumen&gt;",
            "t-err",
          );
        b.click();
        print(`theme set to ${esc(n)}`, "t-ok");
      },
      echo: (a) => print(esc(a.join(" "))),
      git: (a) => {
        if (a[0] !== "log") return print("usage: git log", "t-err");
        const hashes = ["a3f9c21", "7be04d8", "1c5e8fa"];
        print(
          $$(".timeline__item")
            .map(
              (it, i) =>
                `<span class="t-warn">${hashes[i % 3]}</span> ${esc($("h3", it).textContent)} <span class="t-dim">— ${esc($(".org", it).textContent)} [${esc($(".timeline__date", it).textContent)}]</span>`,
            )
            .join("\n"),
          "pre",
        );
      },
      sudo: (a) => {
        if (a.join(" ").toLowerCase() !== "hire khaled")
          return print(
            "sudo: you can't do that… try: sudo hire khaled",
            "t-err",
          );
        print(
          "[sudo] password for recruiter: ********\nAccess granted. Drafting offer…",
          "pre t-ok",
        );
        setTimeout(() => {
          location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's work together")}`;
        }, 900);
      },
    };

    function run(raw) {
      const line = raw.trim();
      if (!line) return;
      hist.push(line);
      hi = hist.length;
      const e = document.createElement("div");
      e.className = "t-line";
      e.innerHTML = '<span class="prompt">❯</span> ';
      e.append(line);
      out.appendChild(e);
      const [c, ...args] = line.split(/\s+/);
      const fn = cmds[c.toLowerCase()];
      if (fn) fn(args);
      else
        print(
          `command not found: ${esc(c)} — type <span class="t-key">help</span>`,
          "t-err",
        );
      out.scrollTop = out.scrollHeight;
    }

    function openT() {
      el.hidden = false;
      document.body.style.overflow = "hidden";
      if (!booted) {
        booted = true;
        print(
          'Welcome to <span class="t-key">KHALED.EXE</span> terminal. Type <span class="t-key">help</span> to start.',
          "t-dim",
        );
      }
      input.focus();
    }
    function close() {
      el.hidden = true;
      document.body.style.overflow = "";
    }
    window.__toggleTerm = () => (el.hidden ? openT() : close());

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hi > 0) input.value = hist[--hi];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        input.value =
          hi < hist.length - 1 ? hist[++hi] : ((hi = hist.length), "");
      } else if (e.key === "Tab") {
        e.preventDefault();
        const v = input.value.trim().toLowerCase(),
          m = Object.keys(cmds).filter((k) => v && k.startsWith(v));
        if (m.length === 1) input.value = m[0] + " ";
      }
    });
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.closest("[data-x]")) close();
      else input.focus();
    });
    fab.addEventListener("click", openT);
    $$("[data-term-open]").forEach((b) => b.addEventListener("click", openT));
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.__toggleTerm();
      } else if (e.key === "Escape" && !el.hidden) close();
      else if (
        e.key === "/" &&
        el.hidden &&
        !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || "")
      ) {
        e.preventDefault();
        openT();
      }
    });
  }

  /* ---------- Contact form (Web3Forms, mailto fallback) ---------- */
  function contactForm() {
    const f = $("#contactForm");
    if (!f) return;
    const n = $("#nameInput"),
      e = $("#emailInput"),
      m = $("#messageInput"),
      st = $("#formStatus"),
      btn = $("button[type=submit]", f);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rules = [
      [n, (v) => v.length >= 2, "Name must be at least 2 characters."],
      [e, (v) => re.test(v), "Enter a valid email address."],
      [m, (v) => v.length >= 10, "Message must be at least 10 characters."],
    ];
    const check = ([i, ok, msg]) => {
      const good = ok(i.value.trim()),
        g = i.closest(".form-group");
      g.classList.toggle("has-error", !good);
      $(".form-error", g).textContent = good ? "" : msg;
      return good;
    };
    rules.forEach((r) => r[0].addEventListener("blur", () => check(r)));

    f.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!rules.map(check).every(Boolean)) {
        st.textContent = "> please fix the highlighted fields above.";
        return;
      }
      if ($("#botcheck", f) && $("#botcheck", f).checked) return;
      const d = {
        name: n.value.trim(),
        email: e.value.trim(),
        message: m.value.trim(),
      };
      if (WEB3FORMS_KEY === "YOUR_ACCESS_KEY") {
        st.textContent = "> opening your email app…";
        location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Portfolio message from " + d.name)}&body=${encodeURIComponent(d.message + "\n\n— " + d.name + " (" + d.email + ")")}`;
        return;
      }
      btn.disabled = true;
      st.textContent = "> sending…";
      try {
        const r = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: "Portfolio message from " + d.name,
            ...d,
          }),
        });
        const j = await r.json();
        if (!j.success) throw new Error(j.message);
        st.textContent = "> message sent \u2713 I'll reply soon.";
        f.reset();
      } catch (x) {
        st.textContent =
          "> failed to send. Please email " + EMAIL + " directly.";
      } finally {
        btn.disabled = false;
      }
    });
  }

  /* ---------- GitHub section (stats + contribution heatmap) ---------- */
  function github() {
    const USER = "khaledhasanmilu";
    const heat = $("#ghHeat");
    if (!heat) return;
    const TTL = 6 * 3600 * 1000; // 6 ghonta cache (API rate limit er jonno)
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    async function cached(key, url) {
      try {
        const c = JSON.parse(localStorage.getItem(key) || "null");
        if (c && Date.now() - c.t < TTL) return c.d;
      } catch (e) {}
      const r = await fetch(url);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      try {
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), d }));
      } catch (e) {}
      return d;
    }
    function countUp(el, n) {
      if (!el) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = n.toLocaleString();
        return;
      }
      const t0 = performance.now();
      (function step(now) {
        const p = Math.min(1, (now - t0) / 1200);
        el.textContent = Math.round(
          n * (1 - Math.pow(1 - p, 3)),
        ).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    function go() {
      cached("gh-user", "https://api.github.com/users/" + USER)
        .then((u) => {
          countUp($('[data-gh="repos"]'), u.public_repos);
          countUp($('[data-gh="followers"]'), u.followers);
        })
        .catch(() => {});

      cached(
        "gh-heat",
        `https://github-contributions-api.jogruber.de/v4/${USER}?y=last`,
      )
        .then((d) => {
          const days = d.contributions;
          if (!days || !days.length) throw new Error("empty");
          const total = days.reduce((s, x) => s + x.count, 0);
          const pad = new Date(days[0].date + "T00:00:00").getDay();
          const weeks = Math.ceil((pad + days.length) / 7);
          let cells = "",
            labels = "",
            lastM = -1,
            lastW = -10;
          for (let i = 0; i < pad; i++)
            cells += '<i class="gh-cell gh-empty"></i>';
          days.forEach((x, i) => {
            cells += `<i class="gh-cell l${x.level}" title="${x.count} contributions on ${x.date}"></i>`;
            if ((pad + i) % 7 === 0) {
              const w = Math.floor((pad + i) / 7),
                m = +x.date.slice(5, 7) - 1;
              if (m !== lastM && w - lastW >= 3) {
                labels += `<span style="grid-column:${w + 1} / span ${Math.min(3, weeks - w)}">${months[m]}</span>`;
                lastM = m;
                lastW = w;
              }
            }
          });
          heat.innerHTML = `<div class="gh__months" style="--w:${weeks}">${labels}</div><div class="gh__grid" style="--w:${weeks}">${cells}</div>`;
          $("#ghTotal").textContent =
            `${total.toLocaleString()} contributions in the last year`;
          countUp($('[data-gh="total"]'), total);
        })
        .catch(() => {
          heat.innerHTML =
            '<p class="gh__err mono">Couldn’t load the contribution graph right now — see it live on GitHub below.</p>';
        });
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (es, o) => {
          if (es[0].isIntersecting) {
            o.disconnect();
            go();
          }
        },
        { rootMargin: "200px" },
      ).observe(heat);
    } else go();
  }

  /* ---------- Projects explorer (left tree + right cards) ---------- */
  function projects() {
    const side = $("#pjTabs"),
      main = $("#pjMain");
    if (!side || !main) return;
    const USER = "khaledhasanmilu";
    const gh = (n) => `https://github.com/${USER}/${n}`;
    const repo = (n) => [{ label: "View on GitHub →", href: gh(n) }];
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

    const CATS = [
      { k: "software", hint: "full-stack products" },
      { k: "hardware", hint: "robotics & embedded" },
      { k: "research", hint: "papers & experiments" },
      { k: "sqa", hint: "testing & quality assurance" },
      { k: "learning", hint: "practice, notes & fundamentals" },
      { k: "competitive", hint: "problem solving" },
    ];

    /* ====== EDIT HERE: project gulo ekhane add koro ======
       Notun repo auto-ashbe jodi GitHub repo te topic dao: software / hardware / research / sqa / learning */
    const items = {
      software: [
        {
          name: "OAB Express",
          status: "LIVE",
          desc: "A courier and logistics platform built for real-world shipment and delivery operations.",
          tags: [
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Node.js",
            "Express.js",
          ],
          img: "images/oab-express.png",
          case: "oab",
          links: [
            {
              label: "Visit Live Site →",
              href: "https://www.oab-express.com/",
            },
          ],
        },
        {
          name: "PhishGuard",
          status: "PROJECT",
          desc: "Got a strange SMS? Prize message? Bank warning? Unknown link? Paste it into PhishGuard and get a clear answer in seconds — safe or scam. No signup, no fees, nothing is stored.",
          tags: ["SMS Safety", "Phishing", "No Signup"],
          img: "images/phishguard.jpg",
          case: "phishguard",
          links: repo("SMS-Phising-Detection"),
        },
        {
          name: "LifeSync",
          repo: "LifeSync",
          status: "REPO",
          desc: "A personal productivity and habit-tracking application for organizing daily routines and goals.",
          tags: ["React", "Node.js", "Express.js", "MySQL"],
          img: "images/lifesync.png",
          case: "lifesync",
          links: repo("LifeSync"),
        },
        {
          name: "UniHub",
          repo: "UniHub",
          status: "REPO",
          desc: "A university resource and community hub built to centralize student information and tools.",
          tags: ["HTML", "JavaScript", "Tailwind CSS", "Express.js", "MySQL"],
          img: "images/unihub.png",
          case: "unihub",
          links: repo("UniHub"),
        },
        {
          name: "Self Management",
          repo: "Self_Management",
          status: "REPO",
          desc: "A Java-based project designed to help individuals manage and organize various aspects of their lives, from task management and goal setting to habit tracking, on a flexible and customizable platform.",
          tags: ["Java"],
          img: "images/self-management.jpg",
          links: repo("Self_Management"),
        },
      ],
      hardware: [
        {
          name: "SPAK — Agriculture Rover",
          status: "DEMO",
          desc: "An agricultural rover built by our team for soil cultivation, water spraying, grass cutting, soil testing and seeding.",
          tags: [
            "Soil Cultivation",
            "Water Spray",
            "Grass Cutting",
            "Soil Testing",
            "Seeding",
          ],
          img: "https://img.youtube.com/vi/jeDA5cLB57M/mqdefault.jpg",
          case: "spak",
          links: [
            { label: "Watch Demo →", href: "https://youtu.be/jeDA5cLB57M" },
          ],
        },
      ],
      research: [],
      sqa: [
        {
          name: "API Testing",
          repo: "API_Testing",
          status: "REPO",
          desc: "A simple Flask API testing project to practice building and testing RESTful endpoints using tools like Postman or cURL.",
          tags: ["Python", "Flask", "Postman", "cURL"],
          img: "images/demo-api-testing.png",
          links: repo("API_Testing"),
        },
        {
          name: "Selenium Automation Testing",
          repo: "Selenium_autometic_testing",
          status: "REPO",
          desc: "Automated browser testing with Selenium, fully Python-based.",
          tags: ["Python", "Selenium"],
          img: "images/demo-selenium.png",
          links: repo("Selenium_autometic_testing"),
        },
      ],
      learning: [
        {
          name: "Python: Beginner to Advanced",
          repo: "Python-Beginner-to-Advanced",
          status: "REPO",
          desc: "My target to complete the Python programming language and explore different types of projects with it.",
          tags: ["Python"],
          img: "images/demo-python.png",
          links: repo("Python-Beginner-to-Advanced"),
        },
        {
          name: "Data Structures & Algorithms with C++",
          repo: "Data-Structure-and-Algorithm-With-CPP",
          status: "REPO",
          desc: "Implementations, notes and solutions covering a wide range of data structures and algorithms topics.",
          tags: ["C++"],
          img: "images/demo-dsa.png",
          links: repo("Data-Structure-and-Algorithm-With-CPP"),
        },
        {
          name: "Complete C++ Programming",
          repo: "Complete_CPP_Programming",
          status: "REPO",
          desc: "C++ from basic syntax to advanced concepts like OOP, algorithms and data structures.",
          tags: ["C++"],
          img: "images/demo-cpp.png",
          links: repo("Complete_CPP_Programming"),
        },
        {
          name: "Complete C Programming",
          repo: "Complete-C-Programming",
          status: "REPO",
          desc: "A comprehensive resource for learning C, from basic syntax and concepts to advanced topics and projects.",
          tags: ["C"],
          img: "images/demo-c.png",
          links: repo("Complete-C-Programming"),
        },
      ],
      competitive: [
        {
          name: "Competitive Programming Solutions",
          repo: "Competitive-Programming-Solutions",
          status: "REPO",
          desc: "Solutions to problems from Codeforces, CodeChef, LeetCode and beecrowd, shared for fellow beginner C++ learners.",
          tags: ["C++", "Codeforces", "CodeChef", "LeetCode", "beecrowd"],
          img: "images/demo-competitive.png",
          links: repo("Competitive-Programming-Solutions"),
        },
      ],
    };
    Object.values(items)
      .flat()
      .forEach((p) => {
        p.key = norm(p.repo || p.name);
      });
    /* ===================================================== */

    let cur = "software",
      showAll = false;

    function renderSide() {
      const hint = (CATS.find((c) => c.k === cur) || {}).hint || "";
      side.innerHTML =
        '<div class="pj__path mono">~/projects</div>' +
        CATS.map(
          (c, i) =>
            `<button type="button" role="tab" class="pj__tab mono${c.k === cur ? " is-active" : ""}" data-k="${c.k}" aria-selected="${c.k === cur}"><span class="pj__branch">${i === CATS.length - 1 ? "└─" : "├─"}</span><span class="pj__name">${c.k}/</span><span class="pj__count">${items[c.k].length}</span></button>`,
        ).join("") +
        `<div class="pj__hint mono"># ${esc(hint)}</div>`;
    }

    function renderMain() {
      const all = items[cur],
        list = showAll ? all : all.slice(0, 12);
      if (!list.length) {
        main.innerHTML = `<div class="pj__empty mono">$ ls ${esc(cur)}/<br>(empty) — coming soon.<br>Meanwhile: <a href="https://github.com/${USER}?tab=repositories" target="_blank" rel="noopener">browse all repositories →</a></div>`;
        return;
      }
      main.innerHTML =
        list
          .map(
            (p, i) => `
        <article class="pj-card" style="--i:${i}">
          ${p.img ? `<div class="pj-card__img"><img src="${esc(p.img)}" alt="${esc(p.name)} screenshot" loading="lazy" /></div>` : ""}
          <div class="pj-card__body">
            <div class="pj-card__top mono"><span>[0x${(i + 1).toString(16).toUpperCase().padStart(2, "0")}]</span><span class="pj-card__status${p.status === "LIVE" ? " is-live" : ""}"><i></i>${esc(p.status)}</span></div>
            <h3>${esc(p.name)}</h3>
            ${p.desc ? `<p>${esc(p.desc)}</p>` : ""}
            <div class="tags mono">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
            <div class="project__links">${p.links.map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}${p.case ? `<button type="button" class="case-btn" data-case="${esc(p.case)}">Case Study</button>` : ""}</div>
          </div>
        </article>`,
          )
          .join("") +
        (all.length > list.length
          ? `<button type="button" class="pj__more mono" data-more>show all ${all.length} →</button>`
          : "");
      $$(".pj-card__img img", main).forEach((im) =>
        im.addEventListener("error", () =>
          im.closest(".pj-card__img").remove(),
        ),
      );
    }

    function select(k) {
      cur = k;
      showAll = false;
      renderSide();
      renderMain();
    }
    side.addEventListener("click", (e) => {
      const b = e.target.closest(".pj__tab");
      if (b) select(b.dataset.k);
    });
    side.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      const ks = CATS.map((c) => c.k),
        i = ks.indexOf(cur);
      select(ks[(i + (e.key === "ArrowDown" ? 1 : ks.length - 1)) % ks.length]);
      const a = $(".pj__tab.is-active", side);
      if (a) a.focus();
    });
    main.addEventListener("click", (e) => {
      if (e.target.closest("[data-more]")) {
        showAll = true;
        renderMain();
        return;
      }
      const b = e.target.closest(".case-btn");
      if (b && window.__openCase) window.__openCase(b.dataset.case);
    });
    select("software");

    // GitHub repo te topic (software/hardware/research/sqa/learning/competitive) dile auto-ashbe
    async function fetchRepos() {
      try {
        const c = JSON.parse(localStorage.getItem("gh-repos") || "null");
        if (c && Date.now() - c.t < 6 * 3600 * 1000) return c.d;
      } catch (e) {}
      const r = await fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
      );
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = (await r.json()).map((x) => ({
        name: x.name,
        description: x.description,
        language: x.language,
        html_url: x.html_url,
        topics: x.topics || [],
        fork: x.fork,
      }));
      try {
        localStorage.setItem("gh-repos", JSON.stringify({ t: Date.now(), d }));
      } catch (e) {}
      return d;
    }
    fetchRepos()
      .then((list) => {
        const have = new Set(
          Object.values(items)
            .flat()
            .map((p) => p.key),
        );
        list.forEach((r) => {
          if (r.fork || r.name.toLowerCase() === USER) return;
          const k = norm(r.name);
          if (have.has(k)) return;
          const cat = CATS.map((c) => c.k).find((c) => r.topics.includes(c));
          if (!cat) return;
          have.add(k);
          items[cat].push({
            key: k,
            name: r.name.replace(/[-_]+/g, " "),
            desc: r.description || "",
            tags: r.language ? [r.language] : [],
            status: "REPO",
            links: [{ label: "View on GitHub →", href: r.html_url }],
          });
        });
        renderSide();
        renderMain();
      })
      .catch(() => {});
  }

  /* ---------- Background FX (dots + binary, on/off) ---------- */
  function bgFx() {
    const box = $("#bgFx");
    if (!box) return;
    const KEY = "khaled-exe-fx",
      root = document.documentElement;
    const apply = (on) => {
      root.classList.toggle("fx-off", !on);
      $$("[data-fx-toggle]").forEach((b) =>
        b.setAttribute("aria-pressed", on ? "true" : "false"),
      );
    };
    let saved = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch (e) {}
    const n = matchMedia("(max-width: 700px)").matches ? 8 : 16;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "bin";
      s.textContent = Array.from(
        { length: 6 + Math.floor(Math.random() * 8) },
        () => (Math.random() < 0.5 ? "0" : "1"),
      ).join("");
      s.style.left = Math.random() * 96 + "%";
      s.style.fontSize = 10 + Math.random() * 4 + "px";
      s.style.animationDuration = 22 + Math.random() * 28 + "s";
      s.style.animationDelay = -Math.random() * 40 + "s";
      box.appendChild(s);
    }
    apply(saved !== "off");
    $$("[data-fx-toggle]").forEach((b) =>
      b.addEventListener("click", () => {
        const on = root.classList.contains("fx-off");
        apply(on);
        try {
          localStorage.setItem(KEY, on ? "on" : "off");
        } catch (e) {}
        toast("background fx :: " + (on ? "on" : "off"));
      }),
    );
  }

  /* ---------- Extras: konami, console message, session uptime ---------- */
  const t0 = Date.now();
  function extras() {
    console.log("%cKHALED.EXE", "font:700 20px monospace;color:#3d7bff");
    console.log("Reading the source? Let's talk → " + EMAIL);

    const seq = [
      "arrowup",
      "arrowup",
      "arrowdown",
      "arrowdown",
      "arrowleft",
      "arrowright",
      "arrowleft",
      "arrowright",
      "b",
      "a",
    ];
    let i = 0;
    document.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      i = k === seq[i] ? i + 1 : k === seq[0] ? 1 : 0;
      if (i === seq.length) {
        i = 0;
        const b = $('[data-theme-btn="matrix"]');
        if (b) b.click();
        toast("konami unlocked :: matrix mode");
      }
    });

    const info = $(".build-info");
    if (info) {
      const s = document.createElement("span");
      info.appendChild(s);
      setInterval(() => {
        const d = Math.floor((Date.now() - t0) / 1000);
        s.textContent =
          " · SESSION :: " +
          String(Math.floor(d / 60)).padStart(2, "0") +
          ":" +
          String(d % 60).padStart(2, "0");
      }, 1000);
    }
  }

  [caseStudies, projects, terminal, contactForm, github, bgFx, extras].forEach(
    (fn) => {
      try {
        fn();
      } catch (err) {
        console.error("[KHALED.EXE] feature failed:", fn.name, err);
      }
    },
  );
})();
