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
const ventFeed = document.querySelector("#vent-feed");
const academicList = document.querySelector("#academic-list");
const feedbackForm = document.querySelector("#feedback-form");
const savedFeedbackSummary = document.querySelector("#saved-feedback-summary");
const savedFeedbackList = document.querySelector("#saved-feedback-list");
const downloadFeedbackButton = document.querySelector("#download-feedback");
const clearFeedbackButton = document.querySelector("#clear-feedback");

const STORAGE_KEY = "apoyo-estudiantil-prototipo-v1";
// Pega aquí la URL de Google Apps Script que termina en /exec para activar el envío a Google Sheets.
const GOOGLE_SHEETS_WEB_APP_URL = "";
const GOOGLE_SHEETS_ENABLED = GOOGLE_SHEETS_WEB_APP_URL.startsWith("https://script.google.com/macros/s/")
  && GOOGLE_SHEETS_WEB_APP_URL.endsWith("/exec");
let activeScreen = "home";
let toastTimer;
let storedData = loadStoredData();
let aliasSeed = getStoredAliasSeed(storedData);

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

function createEmptyStoredData() {
  return {
    feedback: [],
    vents: [],
    academic: [],
    supportReplies: []
  };
}

function loadStoredData() {
  try {
    const rawData = window.localStorage.getItem(STORAGE_KEY);
    if (!rawData) return createEmptyStoredData();

    const parsedData = JSON.parse(rawData);
    return {
      feedback: Array.isArray(parsedData.feedback) ? parsedData.feedback : [],
      vents: Array.isArray(parsedData.vents) ? parsedData.vents : [],
      academic: Array.isArray(parsedData.academic) ? parsedData.academic : [],
      supportReplies: Array.isArray(parsedData.supportReplies) ? parsedData.supportReplies : []
    };
  } catch (error) {
    console.warn("No se pudo leer el almacenamiento local del prototipo:", error);
    return createEmptyStoredData();
  }
}

function saveStoredData() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
    return true;
  } catch (error) {
    console.warn("No se pudo guardar en el almacenamiento local del prototipo:", error);
    showToast("No se pudo guardar", "Tu navegador bloqueó el almacenamiento local.");
    return false;
  }
}

function getStoredAliasSeed(data) {
  const aliases = [...data.vents, ...data.academic]
    .map((item) => Number.parseInt(item.aliasNumber, 10))
    .filter((number) => Number.isFinite(number));

  return Math.max(42, ...aliases);
}

function createRecordId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatStoredDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function createVentPostElement(record, isStored = false) {
  const post = document.createElement("article");
  post.className = `post-card${isStored ? "" : " is-new"}`;
  post.innerHTML = `
    <div class="post-meta">
      <span class="anon-avatar small">${escapeHtml(record.aliasNumber)}</span>
      <div><strong>Estudiante anónimo ${escapeHtml(record.aliasNumber)}</strong><small>${escapeHtml(isStored ? `${formatStoredDate(record.createdAt)} · ${record.category}` : `Ahora · ${record.category}`)}</small></div>
    </div>
    <p>${escapeHtml(record.message)}</p>
    <span class="support-count">${isStored ? "♡ Mensaje guardado en este navegador" : "♡ Tu mensaje ya forma parte del muro"}</span>
  `;

  return post;
}

function createAcademicCardElement(record, isStored = false) {
  const card = document.createElement("article");
  card.className = "qa-card";
  card.innerHTML = `
    <div class="question-line">
      <span class="anon-avatar small">${escapeHtml(record.aliasNumber)}</span>
      <div><strong>${escapeHtml(record.question)}</strong><small>Estudiante anónimo ${escapeHtml(record.aliasNumber)} · ${isStored ? formatStoredDate(record.createdAt) : "Ahora"}</small></div>
    </div>
    <div class="answer-box"><span>Consulta recibida</span><p>En una plataforma real, la comunidad o un recurso moderado podría responder aquí.</p></div>
  `;

  return card;
}

function renderStoredVentPosts() {
  storedData.vents
    .slice()
    .reverse()
    .forEach((record) => ventFeed.prepend(createVentPostElement(record, true)));
}

function renderStoredAcademicQuestions() {
  storedData.academic
    .slice()
    .reverse()
    .forEach((record) => academicList.prepend(createAcademicCardElement(record, true)));
}

function addSupportReply(post, button, isStored = false) {
  const reply = document.createElement("div");
  reply.className = `support-reply demo-reply${isStored ? " is-stored" : ""}`;
  reply.innerHTML = "<strong>Tú · Estudiante anónimo</strong><p>Gracias por compartirlo. Estoy contigo y espero que puedas darte el tiempo que necesitas 💚</p>";
  button.before(reply);
  button.textContent = isStored ? "Apoyo guardado" : "Apoyo enviado";
  button.disabled = true;
}

function renderStoredSupportReplies() {
  const posts = [...document.querySelectorAll("[data-community-post]")];

  storedData.supportReplies.forEach((record) => {
    const post = posts[record.postIndex];
    const button = post?.querySelector("[data-support-reply]");
    if (post && button && !post.querySelector(".demo-reply")) {
      addSupportReply(post, button, true);
    }
  });
}

function renderFeedbackDashboard() {
  const count = storedData.feedback.length;
  const hasFeedback = count > 0;

  downloadFeedbackButton.disabled = !hasFeedback;
  clearFeedbackButton.disabled = !hasFeedback;
  savedFeedbackList.hidden = !hasFeedback;

  if (!hasFeedback) {
    savedFeedbackSummary.textContent = "Todavía no hay respuestas guardadas en este navegador.";
    savedFeedbackList.innerHTML = "";
    return;
  }

  const latest = storedData.feedback[0];
  savedFeedbackSummary.textContent = `${count} ${count === 1 ? "respuesta guardada" : "respuestas guardadas"} en este navegador. Último registro: ${formatStoredDate(latest.createdAt)}.`;
  savedFeedbackList.innerHTML = storedData.feedback
    .slice(0, 3)
    .map((record, index) => `
      <article>
        <span>${index + 1}</span>
        <div>
          <strong>${escapeHtml(record.mostUseful || "Sin función seleccionada")}</strong>
          <p>${escapeHtml(record.comments || "Sin comentarios adicionales.")}</p>
          <small>${escapeHtml(formatStoredDate(record.createdAt))} · ${escapeHtml(record.format || "Formato no indicado")}</small>
        </div>
      </article>
    `)
    .join("");
}

function downloadFeedbackCsv() {
  if (storedData.feedback.length === 0) return;

  const headers = [
    "Fecha",
    "Entendio la plataforma",
    "La usaria",
    "Funcion mas util",
    "Confia en el anonimato",
    "Formato preferido",
    "Comentarios"
  ];
  const rows = storedData.feedback.map((record) => [
    formatStoredDate(record.createdAt),
    record.understood,
    record.wouldUse,
    record.mostUseful,
    record.trust,
    record.format,
    record.comments
  ]);
  const csv = [headers, ...rows].map((row) => row.map(toCsvCell).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `feedback-apoyo-estudiantil-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Descarga lista", "Se generó un archivo CSV con las respuestas guardadas.");
}

function toCsvCell(value = "") {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function sendToGoogleSheets(type, record) {
  if (!GOOGLE_SHEETS_ENABLED) return false;

  const payload = {
    type,
    ...record,
    page: window.location.href,
    view: document.body.dataset.view || "web",
    userAgent: navigator.userAgent
  };

  try {
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (error) {
    console.warn("No se pudo enviar el registro a Google Sheets:", error);
    return false;
  }
}

function describeSaveTarget() {
  return GOOGLE_SHEETS_ENABLED ? "También se envió a Google Sheets." : "Quedó guardado localmente como respaldo.";
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
  const record = {
    id: createRecordId(),
    createdAt: new Date().toISOString(),
    aliasNumber,
    category,
    message
  };
  const post = createVentPostElement(record);

  storedData.vents.unshift(record);
  saveStoredData();
  sendToGoogleSheets("vent", record);
  ventFeed.prepend(post);
  form.reset();
  showToast("Publicación anónima guardada", `Tu mensaje apareció como Estudiante anónimo ${aliasNumber}. ${describeSaveTarget()}`);
});

document.querySelector("#academic-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const question = form.elements.question.value.trim();
  if (!question) return;

  aliasSeed += 3;
  const aliasNumber = String(aliasSeed % 100).padStart(2, "0");
  const record = {
    id: createRecordId(),
    createdAt: new Date().toISOString(),
    aliasNumber,
    question
  };
  const card = createAcademicCardElement(record);

  storedData.academic.unshift(record);
  saveStoredData();
  sendToGoogleSheets("academic", record);
  academicList.prepend(card);
  form.reset();
  showToast("Consulta guardada", `Tu pregunta se agregó sin mostrar tu identidad. ${describeSaveTarget()}`);
});

document.querySelectorAll("[data-support-reply]").forEach((button) => {
  button.addEventListener("click", () => {
    const post = button.closest("[data-community-post]");
    const existingDemoReply = post.querySelector(".demo-reply");

    if (existingDemoReply) {
      showToast("Tu apoyo ya está visible", "En este prototipo se simula una respuesta por publicación.");
      return;
    }

    const postIndex = [...document.querySelectorAll("[data-community-post]")].indexOf(post);
    const record = {
      id: createRecordId(),
      createdAt: new Date().toISOString(),
      postIndex
    };
    storedData.supportReplies.unshift(record);
    saveStoredData();
    sendToGoogleSheets("support", record);
    addSupportReply(post, button);
    showToast("Respuesta de apoyo guardada", `Tu mensaje apareció con identidad anónima. ${describeSaveTarget()}`);
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

feedbackForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = {
    id: createRecordId(),
    createdAt: new Date().toISOString(),
    ...Object.fromEntries(new FormData(form).entries())
  };

  storedData.feedback.unshift(feedback);
  saveStoredData();
  renderFeedbackDashboard();
  sendToGoogleSheets("feedback", feedback);
  console.info("Feedback guardado del prototipo:", feedback);
  form.reset();
  showToast("¡Gracias por ayudarnos!", `Tu feedback quedó guardado en este navegador. ${describeSaveTarget()}`);
});

downloadFeedbackButton.addEventListener("click", downloadFeedbackCsv);

clearFeedbackButton.addEventListener("click", () => {
  const shouldClear = window.confirm("¿Borrar las respuestas guardadas en este navegador?");
  if (!shouldClear) return;

  storedData.feedback = [];
  saveStoredData();
  renderFeedbackDashboard();
  showToast("Respuestas borradas", "El registro local de feedback quedó vacío.");
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
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
renderStoredVentPosts();
renderStoredAcademicQuestions();
renderStoredSupportReplies();
renderFeedbackDashboard();
setScreen(screens.some((screen) => screen.dataset.screen === initialScreen) ? initialScreen : "home", false);
