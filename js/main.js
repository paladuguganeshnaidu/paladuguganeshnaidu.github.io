const fullName = "Paladugu Ganesh Naidu";
const typedNameEl = document.getElementById("typed-name");
const scrollIndicator = document.getElementById("scroll-indicator");
const footerYear = document.getElementById("year");

let currentIndex = 0;
let deleting = false;

function runTypewriter() {
  if (!typedNameEl) return;

  let nextDelay = 100;

  if (!deleting) {
    currentIndex += 1;
    typedNameEl.textContent = fullName.slice(0, currentIndex);

    if (currentIndex >= fullName.length) {
      deleting = true;
      nextDelay = 1500;
    } else {
      nextDelay = 90;
    }
  } else {
    currentIndex -= 1;
    typedNameEl.textContent = fullName.slice(0, currentIndex);

    if (currentIndex <= 0) {
      deleting = false;
      nextDelay = 450;
    } else {
      nextDelay = 55;
    }
  }

  window.setTimeout(runTypewriter, nextDelay);
}

function updateScrollIndicator() {
  if (!scrollIndicator) return;

  const fadeDistance = 220;
  const progress = Math.min(window.scrollY / fadeDistance, 1);
  const opacity = 1 - progress;

  scrollIndicator.style.opacity = String(opacity);
  scrollIndicator.style.pointerEvents = opacity < 0.1 ? "none" : "auto";
}

function setupScrollIndicator() {
  if (!scrollIndicator) return;

  let framePending = false;

  scrollIndicator.addEventListener("click", () => {
    const target = document.getElementById("skills");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  window.addEventListener("scroll", () => {
    if (framePending) return;

    framePending = true;
    window.requestAnimationFrame(() => {
      updateScrollIndicator();
      framePending = false;
    });
  });

  updateScrollIndicator();
}

function setupKeyboardRevealCards() {
  const revealCards = document.querySelectorAll(".reveal-card");

  revealCards.forEach((card) => {
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.classList.toggle("is-active");
      }
    });

    card.addEventListener("blur", () => {
      card.classList.remove("is-active");
    });
  });
}

function setupCurrentYear() {
  if (!footerYear) return;
  footerYear.textContent = String(new Date().getFullYear());
}

runTypewriter();
setupScrollIndicator();
setupKeyboardRevealCards();
setupCurrentYear();
