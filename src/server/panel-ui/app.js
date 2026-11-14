import {
  proposalModel,
  proposalMoney,
  proposalPdf,
  longDate,
} from "./proposal.js";
const sections = [
  ["business", "Datos del negocio"],
  ["home", "Página de inicio"],
  ["service-visibility", "Servicios visibles"],
  ["web-development", "Desarrollo web"],
  ["web-projects", "Portafolio / fotos del carrusel"],
  ["drone-quote", "Drones"],
  ["click-software", "Software"],
  ["quote-catalog", "Catálogo del cotizador"],
];
const labels = {
  legalName: "Razón social",
  ruc: "RUC",
  contact: "Contacto",
  email: "Correo electrónico",
  phone: "Teléfono",
  whatsapp: "WhatsApp",
  area: "Zona de atención",
  address: "Dirección",
  hours: "Horario",
  social: "Redes sociales",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  support: "Soporte",
  onsite: "Presencial",
  remote: "Remoto",
  badge: "Etiqueta",
  title: "Título",
  titleAccent: "Texto destacado del título",
  lead: "Introducción",
  projectsEyebrow: "Etiqueta de proyectos",
  projectsTitle: "Título de proyectos",
  projectsLead: "Introducción de proyectos",
  aboutEyebrow: "Etiqueta de presentación",
  aboutTitle: "Título de presentación",
  aboutLead: "Texto de presentación",
  aboutCta: "Botón de presentación",
  drones: "Drones",
  desarrolloWeb: "Desarrollo web",
  soporteTecnico: "Soporte técnico",
  licenciasSoftware: "Software y licencias",
  hero: "Presentación",
  eyebrow: "Etiqueta superior",
  ctaLabel: "Texto del botón",
  signals: "Características",
  showcase: "Muestras",
  id: "Identificador",
  label: "Etiqueta",
  metric: "Indicador",
  solutions: "Soluciones y precios",
  number: "Número",
  description: "Descripción",
  idealFor: "Público recomendado",
  price: "Precio",
  timing: "Plazo o duración",
  icon: "Icono",
  includes: "Incluye",
  demos: "Demostraciones",
  features: "Características",
  process: "Proceso",
  text: "Texto",
  cta: "Llamada a la acción",
  priceNote: "Nota sobre precios",
  projects: "Proyectos",
  category: "Categoría",
  image: "Imagen",
  alt: "Texto alternativo",
  visible: "Visible",
  document: "Opciones del documento",
  prefix: "Prefijo",
  nextNumber: "Número inicial",
  currency: "Moneda",
  currencySymbol: "Símbolo monetario",
  depositPercent: "Adelanto (%)",
  minimumNoticeDays: "Anticipación mínima (días)",
  validityDays: "Validez (días)",
  overview: "Servicios de drones",
  items: "Partidas o elementos",
  imageAlt: "Texto alternativo de la imagen",
  imageFit: "Ajuste de imagen",
  imageCaption: "Pie de imagen",
  tags: "Etiquetas",
  customBuild: "Armado de drones por encargo",
  name: "Nombre",
  priceLabel: "Precio mostrado",
  paymentLabel: "Condiciones de pago",
  terms: "Términos",
  whatsappMessage: "Mensaje de WhatsApp",
  packages: "Paquetes y precios",
  unit: "Unidad",
  featured: "Destacado",
  addons: "Servicios adicionales",
  standardOnly: "Solo con el paquete estándar",
  note: "Nota",
  resetEpson: "Reset Epson",
  version: "Versión",
  compatibility: "Compatibilidad",
  featuredModels: "Modelos destacados",
  plans: "Planes",
  duration: "Duración",
  recommended: "Recomendado",
  drClick: "Dr. Click",
  download: "Ruta de descarga",
  filename: "Nombre del archivo",
  available: "Descarga disponible",
  size: "Tamaño (bytes)",
  antivirus: "Imágenes de antivirus",
  eset: "ESET",
  panda: "Panda",
  bitdefender: "Bitdefender",
  services: "Servicios cotizables",
  scope: "Alcance",
  source: "Referencia de origen",
  restriction: "Condición de la partida",
};
Object.assign(labels, {
  signature: "Firma",
  role: "Cargo",
  footerSlogan: "Eslogan del pie",
  greeting: "Saludo",
  presentation: "Presentación",
  additionalNote: "Nota de alcances adicionales",
  additionalTitle: "Título de adicionales",
  closing: "Texto de cierre",
  packageGroups: "Paquetes y opciones",
  optionsLabel: "Título de las opciones",
  type: "Tipo de partida",
  shortDescription: "Descripción corta",
  modality: "Modalidad",
  highlight: "Dato destacado",
  value: "Valor",
  group: "Paquete al que pertenece",
  priceDisplay: "Presentación del precio",
  lead: "Texto en negrita",
  source: "Referencia del contenido",
});
const helps = {
  price: "Deja vacío si aún no hay precio.",
  nextNumber: "Inicio de la numeración de este navegador.",
  group: "Identificador del paquete; vacío si no pertenece a uno.",
};
const main = document.querySelector("#main"),
  navigation = document.querySelector("#navigation"),
  sidebar = document.querySelector("#sidebar"),
  menuToggle = document.querySelector("#menu-toggle");
const states = new Map(),
  savedPreviews = new Map();
let config,
  active = "inicio",
  quote,
  quoteDirty = false,
  fieldCounter = 0;
const clone = (value) => structuredClone(value);
const keyFor = (path) => JSON.stringify(path);
const schemaKey = (path) =>
  path.map((key) => (typeof key === "number" ? "*" : key)).join(".");
const titleFor = (key) =>
  labels[key] ||
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ");
const money = (amount, currency) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(
    Number(amount) || 0,
  );
const localDate = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};
function element(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (key === "class") node.className = value;
    else if (value !== undefined && value !== false)
      node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat(Infinity))
    if (child !== undefined && child !== null)
      node.append(
        child instanceof Node ? child : document.createTextNode(String(child)),
      );
  return node;
}
const button = (text, action, className = "") =>
  element(
    "button",
    { type: "button", class: className, onclick: action },
    text,
  );
function status(node, message, kind = "") {
  node.className = "status " + kind;
  node.textContent = message;
}
async function api(path, options = {}) {
  const response = await fetch("/api/panel/" + path, options);
  if (response.status === 401) {
    window.location.assign("/login");
    throw new Error("La sesión ha terminado.");
  }
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(
      new Error(result.error || "No se pudo completar la operación."),
      { field: result.field },
    );
  return result;
}
function at(data, path) {
  return path.reduce((value, key) => value[key], data);
}
function put(data, path, value) {
  at(data, path.slice(0, -1))[path.at(-1)] = value;
}
function anyDirty() {
  return quoteDirty || [...states.values()].some((state) => state.dirty);
}
function closeMenu() {
  sidebar.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}
menuToggle.addEventListener("click", () =>
  menuToggle.setAttribute(
    "aria-expanded",
    String(sidebar.classList.toggle("is-open")),
  ),
);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
window.addEventListener("beforeunload", (event) => {
  if (anyDirty()) {
    event.preventDefault();
  }
});
document.querySelector("#logout").addEventListener("submit", (event) => {
  if (anyDirty() && !window.confirm("Hay cambios sin guardar. ¿Cerrar sesión?"))
    event.preventDefault();
});
function navLink(id, label) {
  return element(
    "a",
    {
      href: "#" + id,
      class: "nav-link",
      "data-view": id,
      onclick: (event) => {
        event.preventDefault();
        navigate(id);
      },
    },
    label,
  );
}
navigation.append(
  navLink("inicio", "Inicio"),
  element("p", { class: "nav-group" }, "Contenido"),
  ...sections.map(([id, label]) => navLink(id, label)),
  element("p", { class: "nav-group" }, "Ventas"),
  navLink("cotizador", "Cotizador"),
);
function navigate(id, ask = true) {
  if (!["inicio", "cotizador", ...sections.map((s) => s[0])].includes(id))
    id = "inicio";
  const dirty = active === "cotizador" ? quoteDirty : states.get(active)?.dirty;
  if (
    ask &&
    active !== id &&
    dirty &&
    !window.confirm(
      "Hay cambios sin guardar. ¿Cambiar de sección? Se conservarán aquí hasta que recargues el panel.",
    )
  )
    return;
  active = id;
  history.replaceState(null, "", "#" + id);
  closeMenu();
  navigation.querySelectorAll("[data-view]").forEach((link) => {
    if (link.dataset.view === id) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  render();
  main.focus();
  window.scrollTo(0, 0);
  if (id === "inicio" && config.syncConfigured) {
    api("status")
      .then((result) => {
        config.syncConfigured = result.syncConfigured;
        config.lastCommit = result.lastCommit;
        if (active === "inicio") render();
      })
      .catch((error) => {
        if (active === "inicio")
          status(
            main.querySelector("[data-sync-status]"),
            error.message,
            "error",
          );
      });
  }
}
function pageHead(title, description) {
  return element(
    "header",
    { class: "page-head" },
    element("h1", {}, title),
    element("p", { class: "muted" }, description),
  );
}
function dashboard() {
  main.append(
    element("p", { class: "status", role: "status", "data-sync-status": "" }),
  );
  const visibility = config.documents["service-visibility"].data,
    projects = config.documents["web-projects"].data.projects,
    doctor = config.documents["click-software"].data.drClick,
    commit = config.lastCommit;
  main.append(
    pageHead(
      "Inicio",
      "Estado del sitio y accesos a las herramientas de administración.",
    ),
  );
  main.append(
    element(
      "section",
      { class: "card" },
      element("h2", {}, "Sincronización"),
      element(
        "div",
        { class: "notice " + (config.syncConfigured ? "success" : "warning") },
        config.syncConfigured
          ? "GITHUB_TOKEN configurado. Los cambios se guardan en GitHub."
          : "GITHUB_TOKEN no configurado. Puedes consultar y preparar cambios; guardar devolverá un error.",
      ),
      element(
        "p",
        {},
        commit
          ? "Último commit: " +
              (commit.date
                ? new Date(commit.date).toLocaleString("es-PE")
                : "Fecha no disponible")
          : "Último commit: no disponible sin conexión a GitHub.",
      ),
      commit ? element("p", { class: "muted" }, commit.message) : null,
      element(
        "p",
        { class: "help" },
        "El sitio y las imágenes nuevas se actualizarán al terminar el redespliegue.",
      ),
    ),
  );
  const shown = Object.entries(visibility)
    .filter(([, value]) => value)
    .map(([key]) => titleFor(key));
  main.append(
    element(
      "div",
      { class: "grid" },
      element(
        "section",
        { class: "card" },
        element("h2", {}, "Servicios visibles"),
        element("p", { class: "stat" }, shown.length),
        element("p", { class: "muted" }, shown.join(", ") || "Ninguno"),
      ),
      element(
        "section",
        { class: "card" },
        element("h2", {}, "Proyectos"),
        element("p", { class: "stat" }, projects.length),
        element(
          "p",
          { class: "muted" },
          projects.filter((p) => p.visible).length + " visibles",
        ),
      ),
      element(
        "section",
        { class: "card" },
        element("h2", {}, "Dr. Click"),
        element(
          "p",
          { class: "stat" },
          doctor.available ? "Disponible" : "Sin publicar",
        ),
        element(
          "p",
          { class: "muted" },
          doctor.filename + " · " + (doctor.size / 1000000).toFixed(1) + " MB",
        ),
      ),
    ),
  );
  main.append(
    element(
      "section",
      { class: "card" },
      element("h2", {}, "Accesos rápidos"),
      element(
        "div",
        { class: "quick-links" },
        sections.map(([id, label]) => navLink(id, label)),
        navLink("cotizador", "Cotizador"),
        element(
          "a",
          { href: "/", target: "_blank", rel: "noopener" },
          "Ver sitio ↗",
        ),
      ),
    ),
  );
}
function markDirty(state) {
  state.dirty = true;
  if (state.onDirty) {
    state.onDirty();
    if (active === "cotizador") {
      const preview = main.querySelector("[data-quote-preview]");
      if (preview) renderQuotePreview(preview);
    }
  }
  const indicator = main.querySelector("[data-save-state]");
  if (indicator) indicator.textContent = "Cambios sin guardar";
}
function blank(sample, key = "") {
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === "object")
    return Object.fromEntries(
      Object.entries(sample).map(([k, v]) => [k, blank(v, k)]),
    );
  if (key === "id") return "nuevo-" + crypto.randomUUID().slice(0, 8);
  if (typeof sample === "string")
    return sample.startsWith("/images/") ||
      [
        "currency",
        "currencySymbol",
        "type",
        "priceDisplay",
        "unit",
        "icon",
        "imageFit",
        "download",
        "filename",
      ].includes(key)
      ? sample
      : "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  return null;
}
function shiftImages(state, path, from, to = null) {
  const next = new Map();
  for (const upload of state.images.values()) {
    const field = [...upload.field];
    if (
      path.every((key, i) => field[i] === key) &&
      typeof field[path.length] === "number"
    ) {
      const index = field[path.length];
      if (to === null) {
        if (index === from) continue;
        if (index > from) field[path.length]--;
      } else if (index === from) field[path.length] = to;
      else if (from < to && index > from && index <= to) field[path.length]--;
      else if (to < from && index >= to && index < from) field[path.length]++;
    }
    next.set(keyFor(field), { ...upload, field });
  }
  state.images = next;
}

function errorIn(state, path) {
  if (!state.errorPath?.length) return false;
  if (path[0] === "$general") {
    const value = state.data[state.errorPath[0]];
    return !value || typeof value !== "object";
  }
  return path.every((key, index) => state.errorPath[index] === key);
}
function fold(state, path, label, body, open = false) {
  state.openBlocks ??= new Map();
  const key = keyFor(path),
    bad = errorIn(state, path);
  const node = element("details", {
    class: "editor-fold" + (bad ? " has-error" : ""),
    name: state.name + ":" + keyFor(path.slice(0, -1)),
    "data-block-path": key,
  });
  node.open = Boolean(
    bad || (state.openBlocks.has(key) ? state.openBlocks.get(key) : open),
  );
  node.append(element("summary", {}, label), body);
  node.addEventListener("toggle", () => state.openBlocks.set(key, node.open));
  return node;
}
function objectFields(state, value, path) {
  const grid = element("div", { class: "editor-grid" });
  for (const [key, item] of Object.entries(value))
    grid.append(renderField(state, item, [...path, key], titleFor(key)));
  return grid;
}
function rowSummary(state, item, path, index) {
  const name =
    item && typeof item === "object" && !Array.isArray(item)
      ? item.title ||
        item.name ||
        item.label ||
        item.id ||
        "Elemento " + (index + 1)
      : String(item || "Elemento " + (index + 1));
  const summary = element("summary", { class: "row-summary" });
  if (item?.image) {
    const src =
      state.images.get(keyFor([...path, "image"]))?.dataUrl ||
      savedPreviews.get(item.image) ||
      item.image;
    summary.append(element("img", { src, alt: "", class: "row-thumb" }));
  }
  summary.append(element("span", { class: "row-title" }, name));
  if (item && typeof item === "object" && Object.hasOwn(item, "price")) {
    let currency = state.data.document?.currency || "PEN";
    for (let i = 1; i < path.length; i++) {
      const parent = at(state.data, path.slice(0, i));
      if (parent?.currency) currency = parent.currency;
    }
    const value =
      item.price === ""
        ? "Sin precio"
        : /^\d+(\.\d+)?$/.test(String(item.price))
          ? money(item.price, currency)
          : item.price;
    summary.append(element("span", { class: "row-price" }, value));
  }
  return summary;
}
function renderField(state, value, path, label, open = false) {
  if (Array.isArray(value)) {
    const body = element("div", { class: "fold-body list-body" }),
      min =
        state.name === "drone-quote" && schemaKey(path) === "overview.items"
          ? 2
          : 0;
    if (min)
      body.append(
        element("p", { class: "help" }, "Conserva al menos dos fichas."),
      );
    value.forEach((item, index) => {
      const itemPath = [...path, index],
        key = keyFor(itemPath),
        details = element("details", {
          class: "list-editor" + (errorIn(state, itemPath) ? " has-error" : ""),
          name: state.name + ":rows:" + keyFor(path),
        });
      state.openBlocks ??= new Map();
      details.open = Boolean(
        errorIn(state, itemPath) || state.openBlocks.get(key),
      );
      details.addEventListener("toggle", () =>
        state.openBlocks.set(key, details.open),
      );
      const summary = rowSummary(state, item, itemPath, index);
      details.append(
        summary,
        element(
          "div",
          { class: "row-body" },
          item && typeof item === "object" && !Array.isArray(item)
            ? objectFields(state, item, itemPath)
            : renderField(state, item, itemPath, "Valor"),
        ),
      );
      const move = (to) => {
        const [entry] = value.splice(index, 1);
        value.splice(to, 0, entry);
        shiftImages(state, path, index, to);
        state.openBlocks.set(key, false);
        state.openBlocks.set(keyFor([...path, to]), true);
        markDirty(state);
        render();
      };
      const tools = element(
        "div",
        { class: "row-tools" },
        element(
          "button",
          {
            type: "button",
            disabled: index === 0,
            "aria-label": "Subir elemento",
            onclick: () => move(index - 1),
          },
          "↑",
        ),
        element(
          "button",
          {
            type: "button",
            disabled: index === value.length - 1,
            "aria-label": "Bajar elemento",
            onclick: () => move(index + 1),
          },
          "↓",
        ),
        element(
          "button",
          {
            type: "button",
            class: "danger",
            disabled: value.length <= min,
            onclick: () => {
              if (!window.confirm("¿Quitar este elemento?")) return;
              value.splice(index, 1);
              shiftImages(state, path, index);
              markDirty(state);
              render();
            },
          },
          "Quitar",
        ),
      );
      body.append(element("div", { class: "compact-row" }, details, tools));
    });
    const sample = state.templates[schemaKey(path)] ?? value[0];
    body.append(
      element(
        "button",
        {
          type: "button",
          disabled: sample === undefined,
          onclick: () => {
            const index = value.length;
            value.push(blank(sample));
            state.openBlocks.set(keyFor(path), true);
            state.openBlocks.set(keyFor([...path, index]), true);
            markDirty(state);
            render();
          },
        },
        "Agregar elemento",
      ),
    );
    return fold(state, path, label + " (" + value.length + ")", body, open);
  }
  if (value && typeof value === "object")
    return fold(
      state,
      path,
      label,
      element("div", { class: "fold-body" }, objectFields(state, value, path)),
      open,
    );
  const id = "field-" + ++fieldCounter,
    field = element("div", { class: "field", "data-field-path": keyFor(path) }),
    key = path.at(-1);
  if (typeof value === "boolean") {
    const input = element("input", {
      type: "checkbox",
      id,
      onchange: () => {
        put(state.data, path, input.checked);
        markDirty(state);
      },
    });
    input.checked = value;
    field.append(element("label", { for: id }, input, label));
    return field;
  }
  const imageField =
    typeof value === "string" &&
    (value.startsWith("/images/") || key === "image");
  const nullable =
    state.name === "business" &&
    (value === null ||
      [
        "legalName",
        "ruc",
        "contact.address",
        "contact.hours",
        "social.facebook",
        "social.instagram",
        "social.tiktok",
        "social.linkedin",
        "social.youtube",
      ].includes(schemaKey(path)));
  const long =
    typeof value === "string" &&
    (value.length > 100 ||
      [
        "description",
        "text",
        "lead",
        "note",
        "terms",
        "scope",
        "whatsappMessage",
      ].includes(key));
  if (long || imageField) field.classList.add("field-wide");
  const choices =
    state.name === "quote-catalog" && key === "type"
      ? [
          ["paquete", "Paquete u opción"],
          ["adicional", "Adicional"],
        ]
      : key === "priceDisplay"
        ? [
            ["tarifa", "Tarifa por unidad"],
            ["barra", "Barra de inversión"],
          ]
        : null;
  const input = element(choices ? "select" : long ? "textarea" : "input", {
    id,
    type: long ? undefined : typeof value === "number" ? "number" : "text",
    maxlength: 10000,
    step: "any",
    min: 0,
    max: key === "depositPercent" ? 100 : 1000000000,
  });
  if (choices)
    input.append(
      ...choices.map(([value, text]) => element("option", { value }, text)),
    );
  input.value = value === null ? "" : String(value);
  input.disabled = value === null;
  const preview = imageField
    ? element("img", {
        class: "image-preview",
        alt: "Vista previa de " + label,
      })
    : null;
  const updatePreview = () => {
    if (!preview) return;
    const src =
      state.images.get(keyFor(path))?.dataUrl ||
      savedPreviews.get(input.value) ||
      input.value;
    preview.src =
      src.startsWith("/images/") || src.startsWith("data:image/") ? src : "";
  };
  input.addEventListener("input", () => {
    put(
      state.data,
      path,
      typeof value === "number" ? Number(input.value) : input.value,
    );
    markDirty(state);
    if (imageField) {
      state.images.delete(keyFor(path));
      updatePreview();
    }
  });
  field.append(element("label", { for: id }, label), input);
  if (helps[key]) field.append(element("small", { class: "help" }, helps[key]));
  if (nullable) {
    const unset = element("input", { type: "checkbox" });
    unset.checked = value === null;
    unset.addEventListener("change", () => {
      input.disabled = unset.checked;
      put(state.data, path, unset.checked ? null : input.value);
      markDirty(state);
    });
    field.append(
      element("label", { class: "nullable" }, unset, "Sin valor (opcional)"),
    );
  }
  if (imageField) {
    const file = element("input", {
      type: "file",
      accept: "image/jpeg,image/png,image/webp",
      "aria-label": "Reemplazar " + label,
    });
    const message = element("div", { class: "status", role: "status" });
    const folder = element(
      "select",
      { "aria-label": "Carpeta de la imagen" },
      config.imageFolders.map((name) =>
        element(
          "option",
          { value: name },
          {
            hero: "Fotos principales",
            drones: "Drones",
            "proyectos-web": "Proyectos web",
            "software/antivirus": "Antivirus",
          }[name],
        ),
      ),
    );
    folder.value =
      config.imageFolders.find((name) =>
        value.startsWith("/images/" + name + "/"),
      ) || (state.name === "web-projects" ? "proyectos-web" : "hero");
    folder.addEventListener("change", () => {
      const upload = state.images.get(keyFor(path));
      if (upload) {
        upload.folder = folder.value;
        markDirty(state);
      }
    });
    file.addEventListener("change", async () => {
      try {
        const selected = file.files[0];
        if (!selected) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type))
          throw new Error("Selecciona una imagen JPG, PNG o WebP.");
        if (selected.size > 8000000)
          throw new Error("La imagen supera el límite de 8 MB.");
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () =>
            reject(new Error("No se pudo leer la imagen."));
          reader.readAsDataURL(selected);
        });
        state.images.set(keyFor(path), {
          field: [...path],
          folder: folder.value,
          dataUrl,
        });
        markDirty(state);
        updatePreview();
        status(
          message,
          "Imagen preparada. Se guardará junto con este apartado.",
        );
      } catch (error) {
        file.value = "";
        status(message, error.message, "error");
      }
    });
    updatePreview();
    field.append(
      preview,
      element("small", { class: "help" }, "JPG, PNG o WebP · máximo 8 MB."),
      file,
      element("small", { class: "help" }, "Carpeta de destino"),
      folder,
      message,
    );
  }
  return field;
}
function editor(name) {
  const state = states.get(name),
    title = sections.find((s) => s[0] === name)[1];
  main.append(pageHead(title, "Abre una subsección para editarla."));
  if (name === "quote-catalog")
    main.append(
      element(
        "p",
        { class: "notice" },
        "Solo servicios. Los precios vacíos se completan al cotizar. El teléfono y correo de la firma se editan en Datos del negocio.",
      ),
    );
  if (!config.syncConfigured)
    main.append(
      element(
        "p",
        { class: "notice warning" },
        "GITHUB_TOKEN no configurado: el guardado no está disponible.",
      ),
    );
  const message = element("div", {
    class: "status",
    role: "status",
    "aria-live": "polite",
  });
  status(message, state.message || "", state.messageKind || "");
  const form = element("form"),
    fields = element("fieldset", {
      class: "editor-shell",
      disabled: state.saving,
    });
  const primitive = Object.entries(state.data).filter(
    ([, value]) => !value || typeof value !== "object",
  );
  let first = true,
    commonAdded = false;
  for (const [key, value] of Object.entries(state.data)) {
    if (!value || typeof value !== "object") {
      if (commonAdded) continue;
      commonAdded = true;
      fields.append(
        fold(
          state,
          ["$general"],
          "Información general",
          element(
            "div",
            { class: "fold-body" },
            objectFields(state, Object.fromEntries(primitive), []),
          ),
          first,
        ),
      );
    } else
      fields.append(renderField(state, value, [key], titleFor(key), first));
    first = false;
  }
  form.addEventListener(
    "invalid",
    (event) => {
      let parent = event.target.parentElement;
      while (parent) {
        if (parent.tagName === "DETAILS") parent.open = true;
        parent = parent.parentElement;
      }
    },
    true,
  );
  const save = element(
    "button",
    { type: "submit", class: "primary", disabled: state.saving },
    state.saving ? "Guardando…" : "Guardar",
  );
  const indicator = element(
    "span",
    { "data-save-state": "", class: "muted" },
    state.dirty ? "Cambios sin guardar" : "Sin cambios pendientes",
  );
  form.append(
    message,
    fields,
    element("div", { class: "save-bar" }, save, indicator),
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.saving) return;
    state.saving = true;
    state.message = "Guardando…";
    state.messageKind = "";
    state.errorPath = null;
    render();
    try {
      const result = await api("data/" + name, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: state.data,
          images: [...state.images.values()],
        }),
      });
      for (const upload of state.images.values())
        savedPreviews.set(at(result.data, upload.field), upload.dataUrl);
      state.data = result.data;
      state.dirty = false;
      state.images.clear();
      state.message =
        "Guardado en GitHub; el sitio se actualizará al terminar el redespliegue.";
      state.messageKind = "success";
      config.documents[name].data = clone(result.data);
    } catch (error) {
      state.message = error.message;
      state.messageKind = "error";
      state.errorPath = error.field || [];
    } finally {
      state.saving = false;
      if (active === name) render();
    }
  });
  main.append(form);
  if (name === "click-software") softwareUpload(state);
}
function softwareUpload(state) {
  const message = element("div", { class: "status", role: "status" }),
    file = element("input", {
      type: "file",
      accept: ".exe",
      required: true,
      "aria-label": "Ejecutable de Dr. Click",
    }),
    submit = element(
      "button",
      { type: "submit", class: "primary" },
      "Subir o reemplazar .exe",
    );
  const form = element(
    "form",
    { class: "card" },
    element("h2", {}, "Ejecutable de Dr. Click"),
    element(
      "p",
      { class: "help" },
      "Archivo .exe de hasta 60 MB. La subida guarda el ejecutable y sus datos en un solo commit. Guarda primero los otros cambios de Software.",
    ),
    file,
    element("p"),
    submit,
    message,
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      if (state.dirty)
        throw new Error(
          "Guarda primero los cambios del formulario de Software.",
        );
      const selected = file.files[0];
      if (!selected) throw new Error("Selecciona un archivo .exe.");
      if (
        !selected.name.toLowerCase().endsWith(".exe") ||
        selected.size > 60000000 ||
        !selected.size
      )
        throw new Error("Selecciona un archivo .exe no vacío de hasta 60 MB.");
      submit.disabled = true;
      status(message, "Subiendo programa…");
      const result = await api("software/dr-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "x-file-name": encodeURIComponent(selected.name),
        },
        body: selected,
      });
      state.data = result.software;
      config.documents["click-software"].data = clone(result.software);
      state.message =
        "Guardado en GitHub; el sitio se actualizará al terminar el redespliegue.";
      state.messageKind = "success";
      render();
    } catch (error) {
      status(message, error.message, "error");
    } finally {
      submit.disabled = false;
    }
  });
  main.append(form);
}

function stored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function nextCounter() {
  return Math.max(
    Number(stored("clicksolutions_quote_counter", 0)) || 0,
    config.documents["quote-catalog"].data.document.nextNumber,
  );
}
function quoteNumber() {
  return (
    config.documents["quote-catalog"].data.document.prefix +
    "-" +
    new Date().getFullYear() +
    "-" +
    String(nextCounter()).padStart(3, "0")
  );
}
function quoteServices() {
  return config.documents["quote-catalog"].data.services.filter(
    (service) =>
      !/software|licenc|antivirus|epson|dr.?click/i.test(
        service.id + " " + service.name,
      ),
  );
}
function selectedService() {
  return quoteServices().find((service) => service.id === quote.service);
}

let quoteUi;
const DRAFT_KEY = "clicksolutions_quote_draft_v3";
function termsList(value) {
  if (Array.isArray(value))
    return value.map((term) =>
      typeof term === "string" ? { title: "", text: term } : term,
    );
  return typeof value === "string"
    ? value
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((text) => ({ title: "", text }))
    : [];
}
function quoteDefaults(service) {
  return {
    service: service?.id || "",
    serviceTitle: service?.name || "Servicio",
    currency: service?.currency || "PEN",
    greeting: service?.greeting || "Estimado/a {nombre}:",
    presentation: service?.presentation || "",
    additionalNote: service?.additionalNote || "",
    closing: service?.closing || "",
    terms: clone(service?.terms || []),
  };
}
function initQuote() {
  const catalog = config.documents["quote-catalog"].data,
    first = quoteServices()[0];
  const fresh = {
    ...quoteDefaults(first),
    number: quoteNumber(),
    date: localDate(),
    clientName: "",
    greetingName: "",
    clientCompany: "",
    clientContact: "",
    project: "",
    location: "",
    mode: "opciones",
    lines: [],
    discount: 0,
    depositPercent: catalog.document.depositPercent,
    validityDays: catalog.document.validityDays,
    notes: "",
  };
  const draft =
    stored(DRAFT_KEY, null) || stored("clicksolutions_quote_draft_v2", null);
  quote =
    draft && typeof draft === "object" && Array.isArray(draft.lines)
      ? { ...fresh, ...draft }
      : fresh;
  quote.terms = termsList(quote.terms);
  quote.mode = quote.mode === "presupuesto" ? "presupuesto" : "opciones";
  quote.lines = quote.lines.map((line) => ({
    type: "paquete",
    shortDescription: "",
    modality: line.unit || "",
    highlight: { label: "", value: "" },
    group: "",
    priceDisplay: "barra",
    ...line,
    scope:
      typeof line.scope === "string"
        ? line.scope
            .split("\n")
            .filter(Boolean)
            .map((text) => ({ lead: "", text }))
        : line.scope || [],
  }));
  if (!["PEN", "USD"].includes(quote.currency)) quote.currency = "PEN";
  quoteUi = {
    name: "cotizador",
    data: quote,
    templates: {
      terms: { title: "", text: "" },
      "lines.*.scope": { lead: "", text: "" },
    },
    images: new Map(),
    openBlocks: new Map(),
    onDirty: () => {
      quoteDirty = true;
    },
  };
}
function fieldInput(label, value, oninput, type = "text", attrs = {}) {
  const id = "field-" + ++fieldCounter,
    input = element(type === "textarea" ? "textarea" : "input", {
      id,
      type: type === "textarea" ? undefined : type,
      ...attrs,
    });
  input.value = value ?? "";
  input.addEventListener("input", () =>
    oninput(
      type === "number"
        ? input.value === ""
          ? ""
          : Number(input.value)
        : input.value,
    ),
  );
  return element(
    "div",
    { class: "field" + (type === "textarea" ? " field-wide" : "") },
    element("label", { for: id }, label),
    input,
  );
}
function selectInput(label, value, options, change) {
  const id = "field-" + ++fieldCounter,
    select = element(
      "select",
      { id },
      options.map(([value, text]) => element("option", { value }, text)),
    );
  select.value = value;
  select.addEventListener("change", () => change(select.value));
  return element(
    "div",
    { class: "field" },
    element("label", { for: id }, label),
    select,
  );
}
function currentProposal() {
  return proposalModel(
    quote,
    config.documents["quote-catalog"].data,
    config.documents.business.data,
  );
}
function quoteView() {
  main.append(
    pageHead(
      "Cotizador",
      "Prepara opciones o un presupuesto. Los borradores se guardan solo en este navegador.",
    ),
  );
  const message = element("div", { class: "status", role: "status" }),
    layout = element("div", { class: "quote-layout" }),
    form = element("div"),
    preview = element("aside", {
      class: "quote-preview proposal-preview",
      "aria-live": "polite",
      "data-quote-preview": "",
    });
  const update = (key, value) => {
    quote[key] = value;
    quoteDirty = true;
    renderQuotePreview(preview);
  };
  const documentFields = element(
    "div",
    { class: "editor-grid" },
    fieldInput("N.° de cotización", quote.number, (v) => update("number", v)),
    fieldInput(
      "Fecha de emisión",
      quote.date,
      (v) => update("date", v),
      "date",
    ),
    fieldInput("Nombre del cliente", quote.clientName, (v) =>
      update("clientName", v),
    ),
    fieldInput("Nombre para el saludo", quote.greetingName, (v) =>
      update("greetingName", v),
    ),
    fieldInput("Empresa", quote.clientCompany, (v) =>
      update("clientCompany", v),
    ),
    fieldInput("Correo o teléfono", quote.clientContact, (v) =>
      update("clientContact", v),
    ),
    fieldInput("Proyecto / solicitud", quote.project, (v) =>
      update("project", v),
    ),
    fieldInput("Ubicación", quote.location, (v) => update("location", v)),
    selectInput(
      "Presentación de las partidas",
      quote.mode,
      [
        ["opciones", "Opciones: inversiones independientes"],
        ["presupuesto", "Presupuesto: partidas sumadas"],
      ],
      (value) => {
        quote.mode = value;
        quoteDirty = true;
        render();
      },
    ),
  );
  form.append(
    fold(
      quoteUi,
      ["documento"],
      "Documento y cliente",
      element("div", { class: "fold-body" }, documentFields),
      true,
    ),
  );
  const serviceBody = element("div", { class: "fold-body" }),
    service = selectedService();
  serviceBody.append(
    selectInput(
      "Servicio",
      quote.service,
      quoteServices().map((s) => [s.id, s.name]),
      (value) => {
        if (
          quote.lines.length &&
          !window.confirm(
            "Cambiar de servicio quitará sus partidas. ¿Continuar?",
          )
        ) {
          render();
          return;
        }
        const next = quoteServices().find((s) => s.id === value);
        Object.assign(quote, quoteDefaults(next), { lines: [] });
        quoteDirty = true;
        render();
      },
    ),
  );
  const catalogSelect = element(
    "select",
    { "aria-label": "Partida del catálogo" },
    element("option", { value: "" }, "Selecciona una partida"),
    (service?.items || []).map((item, index) =>
      element(
        "option",
        { value: String(index) },
        item.name +
          " · " +
          (item.price === ""
            ? "Precio pendiente"
            : proposalMoney(item.price, quote.currency)) +
          (item.type === "adicional" ? " · Adicional" : ""),
      ),
    ),
  );
  const openLine = (index) => {
    quoteUi.openBlocks.set(keyFor(["partidas"]), true);
    quoteUi.openBlocks.set(keyFor(["lines", index]), true);
  };
  serviceBody.append(
    element(
      "div",
      { class: "catalog-picker" },
      catalogSelect,
      button("Agregar", () => {
        if (catalogSelect.value === "") {
          status(message, "Selecciona una partida.", "error");
          return;
        }
        quote.lines.push({
          ...clone(service.items[Number(catalogSelect.value)]),
          quantity: 1,
        });
        openLine(quote.lines.length - 1);
        quoteDirty = true;
        render();
      }),
      button("Partida manual", () => {
        quote.lines.push({
          name: "",
          type: "paquete",
          shortDescription: "",
          price: "",
          quantity: 1,
          unit: "servicio",
          scope: [],
          modality: "",
          highlight: { label: "", value: "" },
          group: "",
          priceDisplay: "barra",
        });
        openLine(quote.lines.length - 1);
        quoteDirty = true;
        render();
      }),
    ),
  );
  serviceBody.append(
    element(
      "p",
      { class: "help" },
      quote.mode === "opciones"
        ? "Cada opción tiene su propia inversión; no se calcula una suma conjunta."
        : "Se suman todas las partidas y adicionales en " +
            quote.currency +
            ".",
    ),
  );
  quote.lines.forEach((line, index) => {
    const updateLine = (key, value) => {
      line[key] = value;
      quoteDirty = true;
      renderQuotePreview(preview);
    };
    const body = element(
      "div",
      { class: "fold-body" },
      element(
        "div",
        { class: "editor-grid" },
        fieldInput("Nombre de la partida", line.name, (v) =>
          updateLine("name", v),
        ),
        selectInput(
          "Tipo",
          line.type,
          [
            ["paquete", "Paquete u opción"],
            ["adicional", "Adicional"],
          ],
          (v) => {
            line.type = v;
            quoteDirty = true;
            render();
          },
        ),
        fieldInput(
          "Cantidad",
          line.quantity,
          (v) => updateLine("quantity", v),
          "number",
          { min: 0.01, step: "any" },
        ),
        fieldInput(
          "Precio unitario (" + quote.currency + ")",
          line.price,
          (v) => updateLine("price", v),
          "number",
          { min: 0, step: 0.01 },
        ),
        fieldInput("Unidad", line.unit, (v) => updateLine("unit", v)),
        fieldInput("Modalidad", line.modality, (v) =>
          updateLine("modality", v),
        ),
        fieldInput(
          "Descripción corta",
          line.shortDescription,
          (v) => updateLine("shortDescription", v),
          "textarea",
        ),
        fieldInput("Etiqueta destacada", line.highlight.label, (v) => {
          line.highlight.label = v;
          quoteDirty = true;
          renderQuotePreview(preview);
        }),
        fieldInput("Valor destacado", line.highlight.value, (v) => {
          line.highlight.value = v;
          quoteDirty = true;
          renderQuotePreview(preview);
        }),
      ),
      renderField(quoteUi, line.scope, ["lines", index, "scope"], "Alcance"),
    );
    const details = fold(
      quoteUi,
      ["lines", index],
      line.name || "Nueva partida",
      body,
    );
    details
      .querySelector("summary")
      .append(
        element(
          "span",
          { class: "row-price" },
          line.price === ""
            ? "Sin precio"
            : proposalMoney(
                Number(line.price) * Number(line.quantity),
                quote.currency,
              ),
        ),
      );
    const move = (to) => {
      const [item] = quote.lines.splice(index, 1);
      quote.lines.splice(to, 0, item);
      openLine(to);
      quoteDirty = true;
      render();
    };
    serviceBody.append(
      element(
        "div",
        { class: "compact-row" },
        details,
        element(
          "div",
          { class: "row-tools" },
          element(
            "button",
            {
              type: "button",
              disabled: index === 0,
              "aria-label": "Subir partida",
              onclick: () => move(index - 1),
            },
            "↑",
          ),
          element(
            "button",
            {
              type: "button",
              disabled: index === quote.lines.length - 1,
              "aria-label": "Bajar partida",
              onclick: () => move(index + 1),
            },
            "↓",
          ),
          button(
            "Quitar",
            () => {
              quote.lines.splice(index, 1);
              quoteDirty = true;
              render();
            },
            "danger",
          ),
        ),
      ),
    );
  });
  form.append(
    fold(
      quoteUi,
      ["partidas"],
      "Servicio y partidas (" + quote.lines.length + ")",
      serviceBody,
    ),
  );
  const conditions = element("div", { class: "fold-body" }),
    conditionFields = element(
      "div",
      { class: "editor-grid" },
      fieldInput(
        "Saludo ({nombre} se reemplaza automáticamente)",
        quote.greeting,
        (v) => update("greeting", v),
      ),
      fieldInput(
        "Validez (días)",
        quote.validityDays,
        (v) => update("validityDays", v),
        "number",
        { min: 1, step: 1 },
      ),
      fieldInput(
        "Presentación",
        quote.presentation,
        (v) => update("presentation", v),
        "textarea",
      ),
      fieldInput(
        "Nota de alcances adicionales",
        quote.additionalNote,
        (v) => update("additionalNote", v),
        "textarea",
      ),
      fieldInput(
        "Texto de cierre",
        quote.closing,
        (v) => update("closing", v),
        "textarea",
      ),
      fieldInput(
        "Notas de la propuesta",
        quote.notes,
        (v) => update("notes", v),
        "textarea",
      ),
    );
  if (quote.mode === "presupuesto")
    conditionFields.append(
      fieldInput(
        "Descuento (" + quote.currency + ")",
        quote.discount,
        (v) => update("discount", v),
        "number",
        { min: 0, step: 0.01 },
      ),
      fieldInput(
        "Adelanto (%)",
        quote.depositPercent,
        (v) => update("depositPercent", v),
        "number",
        { min: 0, max: 100, step: 0.01 },
      ),
    );
  conditions.append(
    conditionFields,
    renderField(quoteUi, quote.terms, ["terms"], "Términos y condiciones"),
  );
  form.append(
    fold(quoteUi, ["condiciones"], "Presentación y condiciones", conditions),
    message,
  );
  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(quote));
      quoteDirty = false;
      status(message, "Borrador guardado en este navegador.", "success");
    } catch {
      status(message, "No se pudo guardar el borrador.", "error");
    }
  };
  form.append(
    element(
      "div",
      { class: "quote-actions" },
      button("Guardar borrador", saveDraft),
      button("Nueva cotización", () => {
        if (!window.confirm("¿Limpiar esta cotización y su borrador?")) return;
        try {
          localStorage.removeItem(DRAFT_KEY);
          localStorage.removeItem("clicksolutions_quote_draft_v2");
          initQuote();
          quoteDirty = false;
          render();
        } catch {
          status(message, "No se pudo limpiar el borrador.", "error");
        }
      }),
      button(
        "Generar PDF",
        async () => {
          try {
            await generatePdf();
            localStorage.setItem(
              "clicksolutions_quote_counter",
              JSON.stringify(nextCounter() + 1),
            );
            localStorage.setItem(DRAFT_KEY, JSON.stringify(quote));
            quoteDirty = false;
            status(
              message,
              "PDF generado. La próxima cotización usará el siguiente número.",
              "success",
            );
          } catch (error) {
            status(
              message,
              error.message || "No se pudo generar el PDF.",
              "error",
            );
          }
        },
        "primary",
      ),
    ),
  );
  layout.append(form, preview);
  main.append(layout);
  renderQuotePreview(preview);
}

function previewBullets(bullets) {
  return element(
    "ul",
    { class: "proposal-bullets" },
    bullets.map((b) =>
      element("li", {}, element("strong", {}, b.lead), b.text),
    ),
  );
}
function proposalHeading(text) {
  return element("h3", { class: "proposal-section" }, text);
}
function previewInvestment(item, model) {
  const values = [
    [
      "Inversión total",
      item.price === ""
        ? "Precio pendiente"
        : proposalMoney(item.amount, model.currency),
    ],
    item.highlight?.value
      ? [item.highlight.label, item.highlight.value]
      : ["Cantidad", item.quantity + " " + item.unit],
    ["Modalidad", item.modality || item.unit],
  ];
  return element(
    "div",
    { class: "investment-bar" },
    values.map(([label, value]) =>
      element(
        "div",
        {},
        element("small", {}, label),
        element("strong", {}, value),
      ),
    ),
  );
}
function renderQuotePreview(container) {
  const model = currentProposal(),
    seen = new Set();
  container.replaceChildren(
    element(
      "div",
      { class: "proposal-header" },
      element("img", {
        src: "/brand/clicksolutions-logo.png",
        alt: "Click Solutions",
        class: "proposal-logo",
      }),
      element("h2", {}, "PROPUESTA COMERCIAL"),
    ),
    element(
      "div",
      { class: "proposal-recipient" },
      element(
        "div",
        {},
        element("small", {}, "PARA:"),
        element("strong", {}, model.clientName || "Nombre del cliente"),
        element(
          "span",
          {},
          [model.clientCompany, model.clientContact]
            .filter(Boolean)
            .join(" · "),
        ),
      ),
      element(
        "div",
        {},
        element(
          "p",
          {},
          "N.° de cotización: ",
          element("strong", {}, model.number),
        ),
        element(
          "p",
          {},
          "Fecha de emisión: ",
          element("strong", {}, longDate(model.date)),
        ),
      ),
    ),
  );
  if (model.project || model.location)
    container.append(
      element(
        "p",
        {},
        [model.project, model.location].filter(Boolean).join(" · "),
      ),
    );
  container.append(
    proposalHeading("PRESENTACIÓN"),
    element("p", {}, model.greeting),
    element("p", {}, model.presentation),
  );
  for (const item of model.packages) {
    const group = model.groups.find((g) => g.id === item.group),
      tariff = item.priceDisplay === "tarifa" && model.mode === "opciones";
    if (group && !seen.has(group.id)) {
      container.append(
        proposalHeading(group.title),
        element(
          "div",
          { class: "proposal-package" },
          element("strong", {}, group.description),
          previewBullets(group.scope),
        ),
        element("h4", { class: "options-label" }, group.optionsLabel),
      );
      seen.add(group.id);
    }
    if (!group) container.append(proposalHeading(item.name));
    else container.append(element("h4", {}, item.name));
    const body = element("div", {
      class: group ? "proposal-option" : "proposal-package",
    });
    if (item.shortDescription)
      body.append(element(tariff ? "strong" : "p", {}, item.shortDescription));
    if (tariff)
      body.append(
        element(
          "p",
          {},
          "Tarifa: ",
          element(
            "strong",
            {},
            item.price === ""
              ? "Precio pendiente"
              : proposalMoney(item.price, model.currency),
          ),
          " " + item.modality,
        ),
      );
    if (tariff && item.quantity !== 1)
      body.append(
        element(
          "p",
          {},
          "Inversión total: ",
          element("strong", {}, proposalMoney(item.amount, model.currency)),
          " · " + item.quantity + " " + item.unit,
        ),
      );
    body.append(previewBullets(item.scope));
    container.append(body);
    if (!tariff) container.append(previewInvestment(item, model));
  }
  if (model.additionalNote)
    container.append(
      element("p", { class: "proposal-note" }, model.additionalNote),
    );
  if (model.additions.length) {
    container.append(
      proposalHeading(model.additionalTitle),
      element(
        "table",
        { class: "proposal-additions" },
        element(
          "thead",
          {},
          element(
            "tr",
            {},
            element("th", {}, "Servicio"),
            element("th", {}, "Inversión adicional"),
          ),
        ),
        element(
          "tbody",
          {},
          model.additions.map((item) =>
            element(
              "tr",
              {},
              element(
                "td",
                {},
                (item.quantity !== 1 ? item.quantity + " × " : "") + item.name,
                item.shortDescription
                  ? element("small", {}, item.shortDescription)
                  : null,
                item.scope.length ? previewBullets(item.scope) : null,
              ),
              element(
                "td",
                {},
                item.price === ""
                  ? "Precio pendiente"
                  : "+ " + proposalMoney(item.amount, model.currency),
              ),
            ),
          ),
        ),
      ),
    );
  }
  if (model.mode === "presupuesto") {
    container.append(
      proposalHeading("RESUMEN DEL PRESUPUESTO"),
      element(
        "table",
        { class: "proposal-totals" },
        element(
          "tbody",
          {},
          [
            ["Subtotal", model.subtotal],
            ["Descuento", model.discount],
            ["Total", model.total],
            ["Adelanto (" + model.depositPercent + "%)", model.deposit],
          ].map(([label, amount], index) =>
            element(
              "tr",
              { class: index > 1 ? "total-row" : "" },
              element("td", {}, label),
              element("td", {}, proposalMoney(amount, model.currency)),
            ),
          ),
        ),
      ),
      element(
        "p",
        { class: "help" },
        "Validez: " +
          model.validityDays +
          " días a partir de la fecha de emisión.",
      ),
    );
  }
  if (model.terms.length)
    container.append(
      proposalHeading("TÉRMINOS Y CONDICIONES DEL SERVICIO"),
      element(
        "ol",
        { class: "proposal-terms" },
        model.terms.map((term) =>
          element(
            "li",
            {},
            term.title ? element("strong", {}, term.title + ": ") : null,
            term.text,
          ),
        ),
      ),
    );
  if (model.notes)
    container.append(
      proposalHeading("OBSERVACIONES"),
      element("p", {}, model.notes),
    );
  container.append(
    element("p", {}, model.closing),
    element("p", {}, "Atentamente,"),
    element(
      "div",
      { class: "proposal-signature" },
      element("strong", {}, model.signature.name),
      element("span", {}, model.signature.role),
      model.phone
        ? element("span", {}, "Teléfono / WhatsApp: " + model.phone)
        : null,
      model.email ? element("span", {}, "Correo: " + model.email) : null,
    ),
    element("footer", {}, model.footerSlogan),
  );
}
let logoPromise;
async function generatePdf() {
  if (
    !quote.clientName.trim() ||
    !quote.number.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(quote.date) ||
    !Number.isFinite(Date.parse(quote.date + "T12:00:00Z"))
  )
    throw new Error("Completa el cliente, número y fecha.");
  if (
    !quote.lines.length ||
    quote.lines.some(
      (line) =>
        !line.name.trim() ||
        line.price === "" ||
        !Number.isFinite(Number(line.price)) ||
        Number(line.price) < 0 ||
        !Number.isFinite(Number(line.quantity)) ||
        Number(line.quantity) <= 0,
    )
  )
    throw new Error(
      "Completa el nombre, cantidad y precio de todas las partidas.",
    );
  const model = currentProposal();
  if (
    !Number.isFinite(model.subtotal) ||
    !Number.isInteger(Number(quote.validityDays)) ||
    Number(quote.validityDays) < 1
  )
    throw new Error("Revisa los importes y la validez.");
  if (
    model.mode === "presupuesto" &&
    (!Number.isFinite(model.discount) ||
      model.discount < 0 ||
      model.discount > model.subtotal ||
      quote.depositPercent === "" ||
      !Number.isFinite(model.depositPercent) ||
      model.depositPercent < 0 ||
      model.depositPercent > 100)
  )
    throw new Error("Revisa el descuento y el adelanto (0 a 100%).");
  if (!window.jspdf?.jsPDF)
    throw new Error("No se pudo cargar el generador PDF. Recarga el panel.");
  if (!logoPromise)
    logoPromise = fetch("/brand/clicksolutions-logo.png")
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar el logo oficial.");
        return new Uint8Array(await response.arrayBuffer());
      })
      .catch((error) => {
        logoPromise = null;
        throw error;
      });
  const doc = proposalPdf(model, window.jspdf.jsPDF, await logoPromise);
  doc.save(
    (quote.number + "-" + quote.clientName)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 110) + ".pdf",
  );
  return doc;
}

function render() {
  main.replaceChildren();
  fieldCounter = 0;
  if (active === "inicio") dashboard();
  else if (active === "cotizador") quoteView();
  else editor(active);
}
async function init() {
  config = await api("config");
  for (const [name, entry] of Object.entries(config.documents))
    states.set(name, {
      name,
      data: clone(entry.data),
      templates: entry.templates,
      images: new Map(),
      dirty: false,
      saving: false,
      message: "",
      messageKind: "",
    });
  initQuote();
  navigate(location.hash.slice(1) || "inicio", false);
}
init().catch((error) =>
  main.replaceChildren(
    pageHead("No se pudo cargar el panel", error.message),
    button("Reintentar", () => window.location.reload()),
  ),
);
