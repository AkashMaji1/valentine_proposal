const tapButton = document.querySelector(".tap-btn");
const intro = document.querySelector(".intro");
const grid = document.querySelector(".envelope-grid");

const messagePanel = document.querySelector(".message-panel");
const messageImage = document.querySelector(".message-image img");
const messageTitle = document.querySelector(".message-content h2");
const messageText = document.querySelector(".message-content p");

const backButton = document.querySelector(".back-btn");

const finalScreen = document.querySelector(".final-screen");
const restartButton = document.querySelector(".restart-btn");

const heartsLayer = document.querySelector(".hearts");
const envelopeCards = document.querySelectorAll(".envelope-card");

/* ✅ AUDIO */
const bgMusic = document.getElementById("bg-music");

let typeIntervalId = null;
const openedEnvelopes = new Set();
let isAnimating = false;

/* -----------------------
   HEARTS BACKGROUND
------------------------ */
const spawnHeart = () => {
  if (!heartsLayer) return;

  const heart = document.createElement("span");
  heart.className = "heart";

  const size = 8 + Math.random() * 10;
  heart.style.width = `${size}px`;
  heart.style.height = `${size}px`;
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${8 + Math.random() * 6}s`;
  heart.style.opacity = (0.4 + Math.random() * 0.5).toFixed(2);

  heartsLayer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 16000);
};

for (let i = 0; i < 30; i += 1) {
  setTimeout(spawnHeart, i * 300);
}
setInterval(spawnHeart, 500);

/* -----------------------
   INTRO TAP
------------------------ */
tapButton?.addEventListener("click", () => {
  /* ✅ PLAY MUSIC AFTER USER TAP (Mobile Safe) */
  if (bgMusic) {
    bgMusic.muted = false;
    bgMusic.volume = 0.8;

    bgMusic.play().catch((err) => {
      console.log("Music play failed:", err);
    });
  }

  intro?.classList.add("intro-hidden");

  grid?.classList.add("is-visible");
  grid?.classList.remove("is-hidden");

  grid?.scrollIntoView({ behavior: "smooth", block: "start" });
});

/* -----------------------
   TYPEWRITER
------------------------ */
const typeText = (element, text, speed = 40, onComplete) => {
  if (!element) return null;

  const safeText = String(text || "");
  let index = 0;

  element.textContent = "";

  const intervalId = setInterval(() => {
    element.textContent = safeText.slice(0, index + 1);
    index++;

    if (index >= safeText.length) {
      clearInterval(intervalId);
      if (onComplete) onComplete();
    }
  }, speed);

  return intervalId;
};

/* -----------------------
   OPEN MESSAGE
------------------------ */
const openMessage = (card) => {
  if (!card || !messagePanel || !messageImage || !messageTitle || !messageText)
    return;

  if (isAnimating) return;
  if (openedEnvelopes.has(card.dataset.title)) return;

  isAnimating = true;

  /* Envelope open animation */
  card.classList.add("opening");

  setTimeout(() => {
    card.classList.remove("opening");

    /* Save opened */
    openedEnvelopes.add(card.dataset.title);

    /* Reset content */
    messageTitle.textContent = "";
    messageText.textContent = "";

    /* Update image */
    messageImage.src = card.dataset.image || "";
    messageImage.alt = card.dataset.title || "Romantic moment";

    /* Hide grid */
    grid?.classList.add("is-hidden");
    grid?.classList.remove("is-visible");

    /* Stop any old typing */
    if (typeIntervalId) {
      clearInterval(typeIntervalId);
      typeIntervalId = null;
    }

    /* Show panel */
    messagePanel.classList.remove("active");
    messagePanel.offsetHeight; // force reflow
    messagePanel.classList.add("active");

    /* ✅ Mobile: scroll panel to top */
    messagePanel.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const titleText = card.dataset.title || "";
    const bodyText = card.dataset.text || "";

    /* Type title then body */
    typeText(messageTitle, titleText, 45, () => {
      typeText(messageText, bodyText, 30, () => {
        const supportLine = document.createElement("span");
        supportLine.className = "typewriter";
        messageText.appendChild(supportLine);

        const supportText = " 🥰";
        typeIntervalId = typeText(supportLine, supportText, 55, () => {
          typeIntervalId = null;
        });
      });
    });

    isAnimating = false;
  }, 900);
};

/* -----------------------
   CLICK ENVELOPES
------------------------ */
envelopeCards.forEach((card) => {
  card.addEventListener("click", () => openMessage(card));
});

/* -----------------------
   BACK BUTTON
------------------------ */
backButton?.addEventListener("click", () => {
  messagePanel?.classList.remove("active");

  /* Hide already opened envelopes (without breaking grid) */
  envelopeCards.forEach((card) => {
    if (openedEnvelopes.has(card.dataset.title)) {
      card.style.setProperty("display", "none", "important");
      card.style.pointerEvents = "none";
    } else {
      card.style.setProperty("display", "grid", "important");
      card.style.pointerEvents = "auto";
    }
  });

  /* If all opened -> final screen */
  if (openedEnvelopes.size === envelopeCards.length) {
    grid?.classList.add("is-hidden");
    grid?.classList.remove("is-visible");
    finalScreen?.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    grid?.classList.remove("is-hidden");
    grid?.classList.add("is-visible");
    finalScreen?.classList.remove("active");

    grid?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

/* -----------------------
   LOVE BUTTON -> FINAL SCREEN
------------------------ */
const loveBtn = document.querySelector(".love-btn");
loveBtn?.addEventListener("click", () => {
  messagePanel?.classList.remove("active");
  grid?.classList.add("is-hidden");
  grid?.classList.remove("is-visible");
  finalScreen?.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* -----------------------
   RESTART BUTTON
------------------------ */
restartButton?.addEventListener("click", () => {
  openedEnvelopes.clear();

  messagePanel?.classList.remove("active");
  finalScreen?.classList.remove("active");

  intro?.classList.remove("intro-hidden");

  grid?.classList.remove("is-visible");
  grid?.classList.remove("is-hidden");

  /* Restore all envelopes */
  envelopeCards.forEach((card) => {
    card.style.setProperty("display", "grid", "important");
    card.style.setProperty("opacity", "1", "important");
    card.style.setProperty("visibility", "visible", "important");
    card.style.pointerEvents = "auto";
  });

  /* Restart music */
  if (bgMusic) {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
});
