"use strict";

const screens = [...document.querySelectorAll("[data-screen]")];
const navigationTriggers = [...document.querySelectorAll("[data-screen-target]")];
const viewButtons = [...document.querySelectorAll("[data-view-mode]")];
const appScroller = document.querySelector(".main-panel");
const toast = document.querySelector("#toast");
const toastTitle = document.querySelector("#toast-title");
const toastMessage = document.querySelector("#toast-message");
const resourceModal = document.querySelector("#resource-modal");
const anonymityModal = document.querySelector("#anonymity-modal");

let activeScreen = "home";
let toastTimer;
let aliasSeed = 42;

const resourceContent = {
  breathing: {
    icon: "〰",
    kicker: "Pausa de 2 minutos",
    title: "Respiración 4 · 4",
    intro: "Una práctica breve para bajar el ritmo y volver al momento presente.",
    steps: [
      "Inhala suavemente por la nariz durante 4 segundos.",
      "Mantén el aire durante 4 segundos, sin forzar.",
      "Exhala lentamente durante 4 segundos.",
      "Repite el ciclo cuatro veces y observa cómo te sientes."
    ]
  },
  time: {
    icon: "◷",
    kicker: "Organización amable",
    title: "Tres pendientes, un paso a la vez",
    intro: "Cuando todo parece urgente, reducir el campo de atención puede devolver claridad.",
    steps: [
      "Escribe todos tus pendientes sin intentar ordenarlos.",
      "Elige solo tres: uno importante, uno corto y uno que puede esperar.",
      "Divide el primero en una tarea de 25 minutos.",
      "Al terminar, haz una pausa breve antes de decidir el paso siguiente."
    ]
  },
  study: {
    icon: "✎",
    kicker: "Aprendizaje activo",
    title: "Estudia comprobando, no solo leyendo",
    intro: "Recordar mejora cuando intentas recuperar la información con tus propias palabras.",
    steps: [
      "Define un objetivo concreto para la sesión.",
      "Lee un bloque breve y luego cierra el material.",
      "Explícalo en voz alta o escríbelo con tus palabras.",
      "Revisa lo que faltó y vuelve a intentarlo después de una pausa."
    ]
  },
  stress: {
    icon: "♧",
    kicker: "Cuidado cotidiano",
    title: "Reconoce tus señales de estrés",
    intro: "Notar las señales temprano permite responder antes de llegar al agotamiento.",
    steps: [
      "Identifica una señal física, una emocional y una conductual.",
      "Pregúntate qué necesidad podría haber detrás.",
      "Elige una acción pequeña: pausar, comer, moverte o hablar con alguien.",
      "Si las señales persisten, considera un canal de apoyo profesional."
    ]
  },
  ask: {
    icon: "♡",
    kicker: "Conversaciones que ayudan",
    title: "Una forma de pedir ayuda",
    intro: "No necesitas tener las palabras perfectas. Una frase sencilla puede abrir la conversación.",
    steps: [
      "Elige a una persona o canal que te inspire confianza.",
      "Comienza con: “No lo estoy pasando bien y me serviría hablar”.",
      "Explica qué necesitas: escucha, orientación o compañía.",
      "Si la primera respuesta no ayuda, intenta con otra persona o canal."
    ]
  },
  crisis: {
    icon: "!",
    kicker: "Orientación académica",
    title: "Cuando la carga se vuelve insostenible",
    intro: "Detenerse y pedir orientación es una forma responsable de cuidar tu continuidad académica.",
    steps: [
      "Anota las evaluaciones, plazos y dificultades más urgentes.",
      "Evita tomar decisiones definitivas en un momento de máxima presión.",
      "Contacta orientación académica o bienestar estudiantil.",
      "Pregunta qué alternativas formales ofrece tu universidad."
    ]
  }
};

function showToast(title, message) {
  window.clearTimeout(toastTimer);
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function scrollAppToTop() {
  if (document.body.dataset.view === "mobile") {
    appScroller.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function setScreen(screenName, updateHash = true) {
  const nextScreen = screens.find((screen) => screen.dataset.screen === screenName);
  if (!nextScreen) return;

  activeScreen = screenName;
  screens.forEach((screen) => screen.classList.toggle("is-active", screen === nextScreen));

  document.querySelectorAll(".nav-item, .mobile-bottom-nav button").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.screenTarget === screenName);
  });

  if (updateHash) {
    history.replaceState(null, "", `#${screenName}`);
  }

  scrollAppToTop();
  window.setTimeout(() => {
    const heading = nextScreen.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
  }, 80);
}

navigationTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => setScreen(trigger.dataset.screenTarget));
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.viewMode;
    document.body.dataset.view = mode;

    viewButtons.forEach((candidate) => {
      const isActive = candidate === button;
      candidate.classList.toggle("is-active", isActive);
      candidate.setAttribute("aria-pressed", String(isActive));
    });

    scrollAppToTop();
    showToast(
      mode === "mobile" ? "Vista celular activada" : "Vista web activada",
      mode === "mobile"
        ? "Ahora puedes recorrer el prototipo dentro del marco móvil."
        : "Ahora puedes recorrer el prototipo en formato de escritorio."
    );
  });
});

document.querySelector("#vent-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const message = form.elements.message.value.trim();
  const category = form.elements.category.value;
  if (!message || !category) return;

  aliasSeed += Math.floor(Math.random() * 7) + 1;
  const aliasNumber = String(aliasSeed % 100).padStart(2, "0");
  const post = document.createElement("article");
  post.className = "post-card is-new";
  post.innerHTML = `
    <div class="post-meta">
      <span class="anon-avatar small">${aliasNumber}</span>
      <div><strong>Estudiante anónimo ${aliasNumber}</strong><small>Ahora · ${escapeHtml(category)}</small></div>
    </div>
    <p>${escapeHtml(message)}</p>
    <span class="support-count">♡ Tu mensaje ya forma parte del muro</span>
  `;

  document.querySelector("#vent-feed").prepend(post);
  form.reset();
  showToast("Publicación anónima creada", `Tu mensaje apareció como Estudiante anónimo ${aliasNumber}.`);
});

document.querySelector("#academic-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const question = form.elements.question.value.trim();
  if (!question) return;

  aliasSeed += 3;
  const aliasNumber = String(aliasSeed % 100).padStart(2, "0");
  const card = document.createElement("article");
  card.className = "qa-card";
  card.innerHTML = `
    <div class="question-line">
      <span class="anon-avatar small">${aliasNumber}</span>
      <div><strong>${escapeHtml(question)}</strong><small>Estudiante anónimo ${aliasNumber} · Ahora</small></div>
    </div>
    <div class="answer-box"><span>Consulta recibida</span><p>En una plataforma real, la comunidad o un recurso moderado podría responder aquí.</p></div>
  `;

  document.querySelector("#academic-list").prepend(card);
  form.reset();
  showToast("Consulta publicada", "Tu pregunta se agregó sin mostrar tu identidad.");
});

document.querySelectorAll("[data-support-reply]").forEach((button) => {
  button.addEventListener("click", () => {
    const post = button.closest("[data-community-post]");
    const existingDemoReply = post.querySelector(".demo-reply");

    if (existingDemoReply) {
      showToast("Tu apoyo ya está visible", "En este prototipo se simula una respuesta por publicación.");
      return;
    }

    const reply = document.createElement("div");
    reply.className = "support-reply demo-reply";
    reply.innerHTML = "<strong>Tú · Estudiante anónimo</strong><p>Gracias por compartirlo. Estoy contigo y espero que puedas darte el tiempo que necesitas 💚</p>";
    button.before(reply);
    button.textContent = "Apoyo enviado";
    button.disabled = true;
    showToast("Respuesta de apoyo enviada", "Tu mensaje apareció con identidad anónima.");
  });
});

document.querySelectorAll(".resource-link").forEach((button) => {
  button.addEventListener("click", () => openResource(button.dataset.resource));
});

function openResource(resourceId) {
  const resource = resourceContent[resourceId];
  if (!resource) return;

  document.querySelector("#resource-modal-icon").textContent = resource.icon;
  document.querySelector("#resource-modal-kicker").textContent = resource.kicker;
  document.querySelector("#resource-modal-title").textContent = resource.title;
  document.querySelector("#resource-modal-intro").textContent = resource.intro;
  document.querySelector("#resource-modal-content").innerHTML = resource.steps
    .map((step, index) => `<div><span>${index + 1}</span><p>${escapeHtml(step)}</p></div>`)
    .join("");

  resourceModal.showModal();
}

document.querySelectorAll(".open-anonymity").forEach((button) => {
  button.addEventListener("click", () => anonymityModal.showModal());
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[resourceModal, anonymityModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
});

document.querySelectorAll(".institution-action").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(
      button.dataset.channel,
      "En una versión real, aquí aparecería el contacto oficial definido por tu universidad."
    );
  });
});

document.querySelector("#orientation-request").addEventListener("click", () => {
  showToast(
    "Solicitud simulada",
    "La plataforma te orientaría hacia el canal institucional más adecuado, sin inventar contactos."
  );
});

document.querySelector("#feedback-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = Object.fromEntries(new FormData(form).entries());

  console.info("Feedback simulado del prototipo:", feedback);
  form.reset();
  showToast("¡Gracias por ayudarnos!", "Tu feedback fue registrado visualmente para esta prueba.");
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

const initialScreen = window.location.hash.slice(1);
setScreen(screens.some((screen) => screen.dataset.screen === initialScreen) ? initialScreen : "home", false);
