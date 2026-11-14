export {};
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
const helps = {
  id: "Usa letras, números, guiones o guiones bajos. No repitas identificadores en la misma lista.",
  price: "En el catálogo deja el precio vacío si aún no está definido.",
  imageFit:
    "Usa cover para recortar o contain para mostrar la imagen completa.",
  currency:
    "PEN para soles o USD para dólares. No se mezclan monedas en una cotización.",
  source:
    "Referencia informativa. Revisa el precio del catálogo si cambias el precio público.",
  download: "La subida de Dr. Click mantiene /downloads/DrClickSolutions.exe.",
  nextNumber:
    "Número inicial. El contador posterior se guarda en este navegador.",
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
    throw new Error(result.error || "No se pudo completar la operación.");
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

function renderField(state, value, path, label) {
  if (Array.isArray(value)) {
    const group = element(
      "fieldset",
      { class: "group" },
      element("legend", {}, label + " (" + value.length + ")"),
    );
    const min =
      state.name === "drone-quote" && schemaKey(path) === "overview.items"
        ? 2
        : 0;
    if (min)
      group.append(
        element(
          "p",
          { class: "help" },
          "Conserva al menos dos elementos: las fichas públicas usan los dos primeros.",
        ),
      );
    value.forEach((item, index) => {
      const card = element("div", { class: "list-item" });
      const move = (to) => {
        const [entry] = value.splice(index, 1);
        value.splice(to, 0, entry);
        shiftImages(state, path, index, to);
        markDirty(state);
        render();
      };
      const tools = element(
        "div",
        { class: "list-tools" },
        element(
          "strong",
          {},
          item && typeof item === "object" && !Array.isArray(item)
            ? item.title || item.name || item.label || "Elemento " + (index + 1)
            : "Elemento " + (index + 1),
        ),
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
      card.append(
        tools,
        renderField(state, item, [...path, index], "Elemento " + (index + 1)),
      );
      group.append(card);
    });
    const sample = state.templates[schemaKey(path)] ?? value[0];
    group.append(
      element(
        "button",
        {
          type: "button",
          disabled: sample === undefined,
          onclick: () => {
            value.push(blank(sample));
            markDirty(state);
            render();
          },
        },
        "Agregar elemento",
      ),
    );
    return group;
  }
  if (value && typeof value === "object") {
    const group = element(
      "fieldset",
      { class: "group" },
      element("legend", {}, label),
    );
    for (const [key, item] of Object.entries(value))
      group.append(renderField(state, item, [...path, key], titleFor(key)));
    return group;
  }
  const id = "field-" + ++fieldCounter,
    field = element("div", { class: "field" }),
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
  const input = element(long ? "textarea" : "input", {
    id,
    type: long ? undefined : typeof value === "number" ? "number" : "text",
    maxlength: 10000,
    step: "any",
    min: 0,
    max: key === "depositPercent" ? 100 : 1000000000,
  });
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
        element("option", { value: name }, name),
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
      element(
        "small",
        { class: "help" },
        "Reemplazar: JPG, PNG o WebP, máximo 8 MB. La vista previa es local hasta guardar.",
      ),
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
  main.append(
    pageHead(
      title,
      "Edita los campos y guarda este apartado. Las listas permiten agregar, quitar y cambiar el orden.",
    ),
  );
  if (name === "quote-catalog")
    main.append(
      element(
        "p",
        { class: "notice" },
        "Solo servicios: software y licencias son venta directa. Los precios vacíos se completan en el catálogo o en cada cotización. Los precios copiados de la web son referenciales; revísalos si cambias los JSON de origen.",
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
    fields = element("fieldset", { class: "card", disabled: state.saving });
  fields.append(element("legend", {}, "Contenido"));
  for (const [key, value] of Object.entries(state.data))
    fields.append(renderField(state, value, [key], titleFor(key)));
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
    fields,
    message,
    element("div", { class: "save-bar" }, save, indicator),
  );
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.saving) return;
    state.saving = true;
    state.message = "Guardando…";
    state.messageKind = "";
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
function initQuote() {
  const catalog = config.documents["quote-catalog"].data,
    first = quoteServices()[0];
  const fresh = {
    number: quoteNumber(),
    date: localDate(),
    clientName: "",
    clientCompany: "",
    clientContact: "",
    project: "",
    location: "",
    service: first?.id || "",
    serviceTitle: first?.name || "Servicio",
    currency: first?.currency || "PEN",
    lines: [],
    discount: 0,
    depositPercent: catalog.document.depositPercent,
    validityDays: catalog.document.validityDays,
    notes: "",
    terms: (first?.terms || []).join("\n\n"),
  };
  const draft = stored("clicksolutions_quote_draft_v2", null);
  quote =
    draft && typeof draft === "object" && Array.isArray(draft.lines)
      ? { ...fresh, ...draft }
      : fresh;
  if (!["PEN", "USD"].includes(quote.currency)) quote.currency = "PEN";
}
function fieldInput(label, value, oninput, type = "text", attrs = {}) {
  const id = "field-" + ++fieldCounter,
    input = element(type === "textarea" ? "textarea" : "input", {
      id,
      type: type === "textarea" ? undefined : type,
      ...attrs,
    });
  input.value = value;
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
    { class: "field" },
    element("label", { for: id }, label),
    input,
  );
}
function quoteTotals() {
  const subtotal = quote.lines.reduce(
      (sum, line) =>
        sum + (Number(line.price) || 0) * (Number(line.quantity) || 0),
      0,
    ),
    total = Math.max(0, subtotal - (Number(quote.discount) || 0));
  return {
    subtotal,
    total,
    deposit: (total * (Number(quote.depositPercent) || 0)) / 100,
  };
}
function quoteView() {
  main.append(
    pageHead(
      "Cotizador",
      "Cotiza servicios con partidas del catálogo o manuales. Software y licencias son venta directa. Los datos del cliente solo se guardan en este navegador.",
    ),
  );
  const message = element("div", { class: "status", role: "status" }),
    layout = element("div", { class: "quote-layout" }),
    form = element("div"),
    preview = element("aside", {
      class: "card quote-preview",
      "aria-live": "polite",
      "data-quote-preview": "",
    });
  const update = (key, value) => {
    quote[key] = value;
    quoteDirty = true;
    renderQuotePreview(preview);
  };
  const documentCard = element(
    "section",
    { class: "card" },
    element("h2", {}, "Documento y cliente"),
    element(
      "div",
      { class: "field-row" },
      fieldInput("Número", quote.number, (v) => update("number", v)),
      fieldInput("Fecha", quote.date, (v) => update("date", v), "date"),
    ),
    fieldInput("Nombre del cliente", quote.clientName, (v) =>
      update("clientName", v),
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
  );
  const select = element(
    "select",
    { "aria-label": "Servicio a cotizar" },
    quoteServices().map((s) => element("option", { value: s.id }, s.name)),
  );
  select.value = quote.service;
  select.addEventListener("change", () => {
    if (
      quote.lines.length &&
      !window.confirm(
        "Cambiar de servicio quitará las partidas para evitar mezclar monedas. ¿Continuar?",
      )
    ) {
      select.value = quote.service;
      return;
    }
    quote.service = select.value;
    const service = selectedService();
    quote.serviceTitle = service.name;
    quote.currency = service.currency;
    quote.terms = service.terms.join("\n\n");
    quote.lines = [];
    quoteDirty = true;
    render();
  });
  const serviceCard = element(
    "section",
    { class: "card" },
    element("h2", {}, "Servicio y partidas"),
    element("label", {}, "Servicio", select),
    fieldInput("Nombre del servicio en la propuesta", quote.serviceTitle, (v) =>
      update("serviceTitle", v),
    ),
    element(
      "p",
      { class: "help" },
      "Moneda: " +
        quote.currency +
        ". Los precios vacíos requieren un importe antes de generar el PDF.",
    ),
  );
  const service = selectedService();
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
            : money(item.price, quote.currency)) +
          (item.restriction ? " · " + item.restriction : ""),
      ),
    ),
  );
  const addCatalog = button("Agregar del catálogo", () => {
    if (catalogSelect.value === "") {
      status(message, "Selecciona una partida del catálogo.", "error");
      return;
    }
    const item = service.items[Number(catalogSelect.value)];
    quote.lines.push({
      name: item.name,
      quantity: 1,
      price: item.price,
      unit: item.unit,
      scope: [item.description, ...item.scope, item.restriction]
        .filter(Boolean)
        .join("\n"),
    });
    quoteDirty = true;
    render();
  });
  serviceCard.append(
    element(
      "div",
      { class: "stack" },
      catalogSelect,
      element(
        "div",
        { class: "quote-actions" },
        addCatalog,
        button("Agregar partida manual", () => {
          quote.lines.push({
            name: "",
            quantity: 1,
            price: "",
            unit: "servicio",
            scope: "",
          });
          quoteDirty = true;
          render();
        }),
      ),
    ),
  );
  quote.lines.forEach((line, index) => {
    const updateLine = (key, value) => {
      line[key] = value;
      quoteDirty = true;
      renderQuotePreview(preview);
    };
    serviceCard.append(
      element(
        "div",
        { class: "list-item" },
        element(
          "div",
          { class: "quote-line" },
          fieldInput("Partida", line.name, (v) => updateLine("name", v)),
          fieldInput(
            "Cantidad",
            line.quantity,
            (v) => updateLine("quantity", v),
            "number",
            { min: 0.01, step: "any" },
          ),
          fieldInput(
            "Precio unitario",
            line.price,
            (v) => updateLine("price", v),
            "number",
            { min: 0, step: 0.01 },
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
        fieldInput("Unidad", line.unit, (v) => updateLine("unit", v)),
        fieldInput(
          "Alcance de esta partida",
          line.scope,
          (v) => updateLine("scope", v),
          "textarea",
        ),
      ),
    );
  });
  const conditions = element(
    "section",
    { class: "card" },
    element("h2", {}, "Condiciones"),
    element(
      "div",
      { class: "field-row" },
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
    ),
    fieldInput(
      "Validez (días)",
      quote.validityDays,
      (v) => update("validityDays", v),
      "number",
      { min: 1, step: 1 },
    ),
    fieldInput("Notas", quote.notes, (v) => update("notes", v), "textarea"),
    fieldInput(
      "Términos y condiciones",
      quote.terms,
      (v) => update("terms", v),
      "textarea",
    ),
  );
  const actions = element(
    "div",
    { class: "quote-actions" },
    button("Guardar borrador", () => {
      try {
        localStorage.setItem(
          "clicksolutions_quote_draft_v2",
          JSON.stringify(quote),
        );
        quoteDirty = false;
        status(message, "Borrador guardado solo en este navegador.", "success");
      } catch {
        status(
          message,
          "No se pudo guardar el borrador en este navegador.",
          "error",
        );
      }
    }),
    button("Nueva cotización", () => {
      if (
        !window.confirm(
          "¿Limpiar esta cotización? El borrador guardado se eliminará.",
        )
      )
        return;
      try {
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
          const counter = nextCounter();
          localStorage.setItem(
            "clicksolutions_quote_counter",
            JSON.stringify(counter + 1),
          );
          localStorage.setItem(
            "clicksolutions_quote_draft_v2",
            JSON.stringify(quote),
          );
          quoteDirty = false;
          status(
            message,
            "PDF generado. La numeración avanzará en la próxima cotización.",
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
  );
  form.append(documentCard, serviceCard, conditions, message, actions);
  layout.append(form, preview);
  main.append(layout);
  renderQuotePreview(preview);
}
function renderQuotePreview(container) {
  const totals = quoteTotals(),
    currency = quote.currency;
  const table = element(
    "table",
    { class: "totals" },
    element(
      "thead",
      {},
      element(
        "tr",
        {},
        element("th", {}, "Partida"),
        element("th", {}, "Importe"),
      ),
    ),
    element(
      "tbody",
      {},
      quote.lines.map((line) =>
        element(
          "tr",
          {},
          element(
            "td",
            {},
            line.quantity + " × " + (line.name || "Sin nombre"),
          ),
          element(
            "td",
            {},
            line.price === ""
              ? "Precio pendiente"
              : money(
                  (Number(line.price) || 0) * (Number(line.quantity) || 0),
                  currency,
                ),
          ),
        ),
      ),
      element(
        "tr",
        {},
        element("td", {}, "Subtotal"),
        element("td", {}, money(totals.subtotal, currency)),
      ),
      element(
        "tr",
        {},
        element("td", {}, "Descuento"),
        element("td", {}, money(quote.discount, currency)),
      ),
      element(
        "tr",
        { class: "total-row" },
        element("td", {}, "Total"),
        element("td", {}, money(totals.total, currency)),
      ),
      element(
        "tr",
        {},
        element("td", {}, "Adelanto (" + quote.depositPercent + "%)"),
        element("td", {}, money(totals.deposit, currency)),
      ),
    ),
  );
  container.replaceChildren(
    element("h2", {}, "Vista previa"),
    element("p", {}, quote.number + " · " + quote.date),
    element("h3", {}, quote.clientName || "Nombre del cliente"),
    element(
      "p",
      { class: "muted" },
      [quote.clientCompany, quote.clientContact, quote.project, quote.location]
        .filter(Boolean)
        .join(" · "),
    ),
    element("h3", {}, quote.serviceTitle),
    table,
    element(
      "p",
      { class: "help" },
      "Validez: " + quote.validityDays + " días.",
    ),
    element("h3", {}, "Alcance"),
    ...quote.lines.map((line) =>
      element("p", { class: "muted" }, line.name + ": " + line.scope),
    ),
    element("h3", {}, "Términos"),
    element("p", { class: "muted" }, quote.terms),
    quote.notes ? element("p", {}, "Notas: " + quote.notes) : null,
    element("h3", {}, "Contacto"),
    element("p", { class: "muted" }, contactText()),
  );
}
function contactText() {
  const business = config.documents.business.data;
  return [
    business.legalName,
    business.contact.phone,
    business.contact.email,
    business.contact.area,
  ]
    .filter(Boolean)
    .join(" · ");
}

async function generatePdf() {
  if (
    !quote.clientName.trim() ||
    !quote.number.trim() ||
    !quote.date ||
    !quote.serviceTitle.trim()
  )
    throw new Error("Completa el cliente, número, fecha y servicio.");
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
  const totals = quoteTotals();
  if (
    !Number.isFinite(totals.subtotal) ||
    !Number.isFinite(Number(quote.discount)) ||
    Number(quote.discount) < 0 ||
    Number(quote.discount) > totals.subtotal ||
    quote.depositPercent === "" ||
    Number(quote.depositPercent) < 0 ||
    Number(quote.depositPercent) > 100 ||
    !Number.isFinite(Number(quote.depositPercent)) ||
    !Number.isInteger(Number(quote.validityDays)) ||
    Number(quote.validityDays) < 1
  )
    throw new Error("Revisa el descuento, adelanto (0 a 100%) y validez.");
  if (!window.jspdf?.jsPDF)
    throw new Error("No se pudo cargar el generador de PDF. Recarga el panel.");
  const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
  let y = 20;
  const width = 174,
    left = 18;
  function paragraph(text, size = 10, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(35, 49, 65);
    const lines = doc.splitTextToSize(String(text || ""), width);
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, left, y);
      y += size * 0.45 + 1.4;
    }
    y += 3;
  }
  paragraph("COTIZACIÓN", 17, true);
  paragraph(quote.number + " | " + quote.date);
  paragraph(quote.serviceTitle, 13, true);
  paragraph(
    "Cliente: " +
      quote.clientName +
      (quote.clientCompany ? " — " + quote.clientCompany : ""),
  );
  paragraph(
    [quote.clientContact, quote.project, quote.location]
      .filter(Boolean)
      .join(" | "),
  );
  paragraph("PARTIDAS Y ALCANCE", 11, true);
  for (const [index, line] of quote.lines.entries()) {
    paragraph(index + 1 + ". " + line.name, 11, true);
    paragraph(
      line.quantity +
        " " +
        line.unit +
        " × " +
        money(line.price, quote.currency) +
        " = " +
        money(Number(line.quantity) * Number(line.price), quote.currency),
    );
    paragraph(line.scope);
  }
  paragraph("Subtotal: " + money(totals.subtotal, quote.currency));
  paragraph("Descuento: " + money(quote.discount, quote.currency));
  paragraph("TOTAL: " + money(totals.total, quote.currency), 13, true);
  paragraph(
    "Adelanto (" +
      quote.depositPercent +
      "%): " +
      money(totals.deposit, quote.currency),
    11,
    true,
  );
  paragraph(
    "Validez: " + quote.validityDays + " días a partir de la fecha de emisión.",
  );
  paragraph("TÉRMINOS Y CONDICIONES", 11, true);
  paragraph(quote.terms);
  if (quote.notes) {
    paragraph("NOTAS", 11, true);
    paragraph(quote.notes);
  }
  paragraph("CONTACTO", 11, true);
  paragraph(contactText());
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(90);
    doc.text("Página " + page + " de " + doc.getNumberOfPages(), 192, 287, {
      align: "right",
    });
  }
  doc.save(
    (quote.number + "-" + quote.clientName)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 110) + ".pdf",
  );
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
