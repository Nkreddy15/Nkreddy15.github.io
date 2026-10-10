"use strict";

(() => {
  const nav = document.querySelector(".main-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const dialog = document.querySelector("#project-dialog");
  const dialogContent = document.querySelector("#dialog-content");
  let lastProjectTrigger = null;
  let scrollFramePending = false;

  const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));

  const closeMenu = () => {
    nav.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(expanded));
    nav.classList.toggle("menu-open", expanded);
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 640) closeMenu();
  });

  const cards = Array.from(document.querySelectorAll(".project-card[data-category]"));
  const filters = Array.from(document.querySelectorAll(".filter"));
  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const category = filter.dataset.filter;
      filters.forEach((button) => {
        const active = button === filter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      let visible = 0;
      cards.forEach((card) => {
        const matches = category === "all" || card.dataset.category.split(" ").includes(category);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      document.querySelector("#project-count").textContent = `${visible} PUBLIC PROJECT${visible === 1 ? "" : "S"}`;
    });
  });

  const openProject = (projectKey, trigger) => {
    const project = PORTFOLIO_PROJECTS[projectKey];
    if (!project) return;
    lastProjectTrigger = trigger;
    const metrics = project.metrics ? `
      <section class="dialog-section" aria-labelledby="metrics-title">
        <h3 id="metrics-title">VERIFIED INDIVIDUAL RESULTS</h3>
        <table class="dialog-metrics"><caption class="sr-only">Historical held-out regression results from the individual HW4A experiment</caption><thead><tr><th scope="col">Endpoint</th><th scope="col">Model</th><th scope="col">Spearman ρ</th></tr></thead><tbody>${project.metrics.map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>
        <p class="dialog-source">${escapeHTML(project.metricCaption)}</p>
      </section>` : "";
    const privateNote = project.private ? '<p class="dialog-private-note">Private repository. GitHub access is required to view the code; contact me for a project walkthrough.</p>' : "";
    const evidenceLink = project.evidence ? `<a class="text-link" href="${escapeHTML(project.evidence)}" target="_blank" rel="noopener noreferrer">${escapeHTML(project.evidenceLabel)} <span aria-hidden="true">↗</span></a>` : "";
    dialogContent.innerHTML = `
      <p class="dialog-category">${escapeHTML(project.category)}</p>
      <h2 id="dialog-title">${escapeHTML(project.title)}</h2>
      <p class="dialog-summary">${escapeHTML(project.summary)}</p>
      <ul class="tags" aria-label="Project technologies">${project.technologies.map((technology) => `<li>${escapeHTML(technology)}</li>`).join("")}</ul>
      ${privateNote}
      <section class="dialog-section"><h3>WORK & CONTRIBUTION</h3><ul>${project.contributions.map((contribution) => `<li>${escapeHTML(contribution)}</li>`).join("")}</ul></section>
      ${metrics}
      <section class="dialog-section"><h3>WHAT I LEARNED / CURRENT SCOPE</h3><p>${escapeHTML(project.learning)}</p></section>
      <div class="dialog-buttons"><a class="button button-dark" href="${escapeHTML(project.repo)}" target="_blank" rel="noopener noreferrer">${project.private ? "Private GitHub" : "View on GitHub"} <span aria-hidden="true">↗</span></a>${evidenceLink}</div>`;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      document.body.classList.add("modal-open");
      dialog.scrollTop = 0;
      dialog.querySelector(".dialog-close").focus();
    } else {
      // All project summaries and repository links remain readable on old browsers.
      window.open(project.repo, "_blank", "noopener,noreferrer");
    }
  };

  document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.project, button));
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    if (lastProjectTrigger) lastProjectTrigger.focus();
  });

  document.querySelector("#copy-email").addEventListener("click", async () => {
    const status = document.querySelector("#copy-status");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(PORTFOLIO_EMAIL);
      } else {
        const field = document.createElement("textarea");
        field.value = PORTFOLIO_EMAIL;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.left = "-9999px";
        document.body.appendChild(field);
        let copied = false;
        try {
          field.select();
          copied = typeof document.execCommand === "function" && document.execCommand("copy");
        } finally {
          field.remove();
          document.querySelector("#copy-email").focus();
        }
        if (!copied) throw new Error("Clipboard unavailable");
      }
      status.textContent = "EMAIL ADDRESS COPIED";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.querySelector(".email-address"));
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      status.textContent = "ADDRESS SELECTED — USE YOUR COPY SHORTCUT";
    }
  });

  document.querySelector("#year").textContent = String(new Date().getFullYear());

  const updateReadingProgress = () => {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    document.querySelector(".reading-progress").style.width = `${fraction * 100}%`;
    scrollFramePending = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollFramePending) {
      scrollFramePending = true;
      window.requestAnimationFrame(updateReadingProgress);
    }
  }, { passive: true });
  updateReadingProgress();

  // Pointer motion is event-driven: no continuous JavaScript rendering loop.
  const motionQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const finePointer = typeof window.matchMedia === "function"
    && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionPaused = () => Boolean(motionQuery?.matches) || document.body.classList.contains("motion-paused");
  const heroArt = document.querySelector(".hero-art");
  const motionSurfaces = Array.from(document.querySelectorAll(".project-card, .lab-card"));
  const resetPointerMotion = () => {
    heroArt.style.setProperty("--drift-x", "0px");
    heroArt.style.setProperty("--drift-y", "0px");
    motionSurfaces.forEach((surface) => {
      surface.style.setProperty("--tilt-x", "0deg");
      surface.style.setProperty("--tilt-y", "0deg");
      surface.style.setProperty("--pointer-x", "50%");
      surface.style.setProperty("--pointer-y", "50%");
    });
  };

  if (finePointer) {
    const addPointerMotion = (surface, isHero) => {
      let pointerFramePending = false;
      let x = .5;
      let y = .5;
      let pointerInside = false;
      surface.addEventListener("pointermove", (event) => {
        if (motionPaused()) return;
        const bounds = surface.getBoundingClientRect();
        x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / Math.max(1, bounds.width)));
        y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / Math.max(1, bounds.height)));
        pointerInside = true;
        if (pointerFramePending) return;
        pointerFramePending = true;
        window.requestAnimationFrame(() => {
          pointerFramePending = false;
          if (motionPaused() || !pointerInside) return;
          if (isHero) {
            surface.style.setProperty("--drift-x", `${((x - .5) * 22).toFixed(2)}px`);
            surface.style.setProperty("--drift-y", `${((y - .5) * 18).toFixed(2)}px`);
          } else {
            surface.style.setProperty("--tilt-x", `${((.5 - y) * 3).toFixed(2)}deg`);
            surface.style.setProperty("--tilt-y", `${((x - .5) * 3).toFixed(2)}deg`);
            surface.style.setProperty("--pointer-x", `${(x * 100).toFixed(1)}%`);
            surface.style.setProperty("--pointer-y", `${(y * 100).toFixed(1)}%`);
          }
        });
      });
      surface.addEventListener("pointerleave", () => {
        pointerInside = false;
        if (isHero) {
          surface.style.setProperty("--drift-x", "0px");
          surface.style.setProperty("--drift-y", "0px");
        } else {
          surface.style.setProperty("--tilt-x", "0deg");
          surface.style.setProperty("--tilt-y", "0deg");
          surface.style.setProperty("--pointer-x", "50%");
          surface.style.setProperty("--pointer-y", "50%");
        }
      });
    };
    addPointerMotion(heroArt, true);
    motionSurfaces.forEach((surface) => addPointerMotion(surface, false));
  }

  const motionToggle = document.querySelector("#motion-toggle");
  motionToggle.hidden = Boolean(motionQuery?.matches);
  motionToggle.addEventListener("click", () => {
    const paused = document.body.classList.toggle("motion-paused");
    motionToggle.setAttribute("aria-pressed", String(paused));
    document.querySelector("#motion-label").textContent = paused ? "Resume motion" : "Pause motion";
    if (paused) {
      resetPointerMotion();
      document.querySelectorAll(".reveal").forEach((surface) => surface.classList.add("is-visible"));
    }
  });
  if (motionQuery && typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", () => {
      motionToggle.hidden = motionQuery.matches;
      if (motionQuery.matches) resetPointerMotion();
    });
  }
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("tab-inactive", Boolean(document.hidden));
  });

  if ("IntersectionObserver" in window && !motionQuery?.matches) {
    const revealTargets = document.querySelectorAll(".section-heading, .project-card, .research-paper, .about-title-column, .about-content, .lab-card, .experience-list article, .beyond-section, .contact-section");
    try {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: .08, rootMargin: "0px 0px -24px 0px" });
      revealTargets.forEach((surface) => {
        surface.classList.add("reveal");
        revealObserver.observe(surface);
      });
    } catch {
      revealTargets.forEach((surface) => surface.classList.remove("reveal"));
    }
  }

  if ("IntersectionObserver" in window) {
    const sections = document.querySelectorAll("#work, #about, #research, #contact");
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll('a[href^="#"]').forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-15% 0px -60% 0px", threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
