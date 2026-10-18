"use strict";
// Cinema Edition: lightweight interactions. No tracking, network, or external runtime.
(() => {
  const rail = document.getElementById("cinema-rail");
  if (!rail) return;

  const prefersLessMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const advance = (direction) => {
    const firstCard = rail.querySelector(".cinema-poster");
    const step = firstCard ? firstCard.getBoundingClientRect().width + 17 : rail.clientWidth * .8;
    rail.scrollBy({left: step * direction, behavior: prefersLessMotion() ? "instant" : "smooth"});
  };

  document.querySelectorAll(".cinema-arrow[data-rail-direction]").forEach((button) => {
    button.addEventListener("click", () => advance(Number(button.dataset.railDirection) || 1));
  });

  rail.addEventListener("keydown", (event) => {
    if (event.target !== rail) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      advance(event.key === "ArrowRight" ? 1 : -1);
    }
  });

  // Reuse the already-tested project dialog and case-study data from app.js.
  // Avoid duplicating project copy so the hero and detailed case studies cannot drift apart.
  const dialog = document.getElementById("project-dialog");
  let lastPosterTrigger = null;
  document.querySelectorAll(".cinema-open[data-cinema-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.cinemaProject;
      const original = document.querySelector('.detail-link[data-project="' + key + '"]');
      if (!original) return;
      lastPosterTrigger = button;
      original.click();
    });
  });
  dialog?.addEventListener("close", () => {
    if (lastPosterTrigger) {
      const focusTarget = lastPosterTrigger;
      lastPosterTrigger = null;
      requestAnimationFrame(() => focusTarget.focus({preventScroll:true}));
    }
  });
})();
