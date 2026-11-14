import business from "../data/business.json";
import home from "../data/home.json";
import visibility from "../data/service-visibility.json";
import web from "../data/web-development.json";
import portfolio from "../data/web-projects.json";
import drones from "../data/drone-quote.json";
import software from "../data/click-software.json";
import catalog from "../data/quote-catalog.json";
import { randomUUID } from "node:crypto";
import { PanelError } from "./panel-auth";

export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };
export const documents: Record<string, Json> = {
  business,
  home,
  "service-visibility": visibility,
  "web-development": web,
  "web-projects": portfolio,
  "drone-quote": drones,
  "click-software": software,
  "quote-catalog": catalog,
};
export const dataPath = (name: string) => `src/data/${name}.json`;
export const knownDocument = (name: string) => Object.hasOwn(documents, name);
export const imageFolders = [
  "hero",
  "drones",
  "proyectos-web",
  "software/antivirus",
] as const;
export const pathKey = (path: (string | number)[]) =>
  path.map((p) => (typeof p === "number" ? "*" : p)).join(".");
export function templates(
  value: Json,
  path: (string | number)[] = [],
  output: Record<string, Json> = {},
) {
  if (Array.isArray(value)) {
    if (value.length) output[pathKey(path)] = value[0]!;
    value.forEach((item) => templates(item, [...path, 0], output));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value))
      templates(item, [...path, key], output);
  }
  return output;
}
const invalid = (path: (string | number)[], reason: string): never => {
  throw new PanelError(400, `${path.join(".") || "Datos"}: ${reason}`);
};
const safeImage = (value: string) =>
  /^\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|svg)$/.test(
    value,
  ) && !value.includes("..");
// These existing nulls represent optional text, not an uneditable null-only field.
const nullableText = new Set([
  "legalName",
  "ruc",
  "contact.address",
  "contact.hours",
  "social.facebook",
  "social.instagram",
  "social.tiktok",
  "social.linkedin",
  "social.youtube",
]);
export function validate(name: string, value: Json, current: Json) {
  const defaults = templates(documents[name]!);
  let nodes = 0;
  function visit(next: Json, previous: Json, path: (string | number)[]) {
    if (++nodes > 30000 || path.length > 20)
      invalid(path, "Demasiados campos.");
    const nullable = name === "business" && nullableText.has(pathKey(path));
    if (nullable && next === null) return;
    if (previous === null) {
      if (!nullable || typeof next !== "string")
        invalid(path, "Tipo de dato no válido.");
      previous = "";
    }
    if (Array.isArray(previous)) {
      if (!Array.isArray(next)) invalid(path, "Debe ser una lista.");
      const list = next as Json[];
      if (list.length > 300) invalid(path, "Máximo 300 elementos.");
      const ids = list
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            !Array.isArray(item) &&
            typeof item.id === "string",
        )
        .map((item) => (item as { id: string }).id);
      if (new Set(ids).size !== ids.length)
        invalid(path, "No repitas identificadores dentro de una lista.");
      if (
        name === "drone-quote" &&
        pathKey(path) === "overview.items" &&
        list.length < 2
      )
        invalid(
          path,
          "Conserva al menos dos servicios para las fichas públicas.",
        );
      const examples = previous.length
        ? previous
        : defaults[pathKey(path)] === undefined
          ? []
          : [defaults[pathKey(path)]!];
      if (list.length && !examples.length)
        invalid(path, "No hay una estructura de referencia para esta lista.");
      list.forEach((item, i) => {
        // Existing lists can contain distinct, explicitly represented shapes.
        let valid = false;
        for (const example of examples) {
          try {
            visit(item, example, [...path, i]);
            valid = true;
            break;
          } catch (error) {
            if (!(error instanceof PanelError)) throw error;
          }
        }
        if (!valid)
          invalid([...path, i], "Estructura, tipos o valores no válidos.");
      });
      return;
    }
    if (previous && typeof previous === "object") {
      if (!next || typeof next !== "object" || Array.isArray(next))
        invalid(path, "Debe ser un objeto.");
      const object = next as Record<string, Json>;
      const keys = Object.keys(previous);
      if (
        Object.keys(object).length !== keys.length ||
        keys.some((k) => !Object.hasOwn(object, k))
      )
        invalid(path, "Faltan campos o hay campos adicionales.");
      for (const key of keys)
        visit(object[key]!, previous[key]!, [...path, key]);
      return;
    }
    if (
      typeof next !== typeof previous ||
      next === null ||
      typeof next === "object"
    )
      invalid(path, "Tipo de dato no válido.");
    if (typeof next === "string") {
      if (next.length > 10000) invalid(path, "Máximo 10 000 caracteres.");
      if (
        (typeof previous === "string" && previous.startsWith("/images/")) ||
        path.at(-1) === "image"
      ) {
        if (!safeImage(next))
          invalid(
            path,
            "La imagen debe usar una ruta válida dentro de /images/.",
          );
      } else if (next.startsWith("/images") && !safeImage(next))
        invalid(path, "Ruta de imagen no válida.");
      if (path.at(-1) === "id" && !/^[a-zA-Z0-9_-]{1,100}$/.test(next))
        invalid(path, "Identificador no válido.");
    }
    if (typeof next === "number") {
      if (!Number.isFinite(next) || next < 0 || next > 1_000_000_000)
        invalid(path, "Número fuera de rango.");
      if (path.at(-1) === "depositPercent" && next > 100)
        invalid(path, "Usa un porcentaje de 0 a 100.");
    }
  }
  visit(value, current, []);
  if (name === "quote-catalog") {
    const services = (value as typeof catalog).services;
    for (const service of services) {
      if (
        /software|licenc|antivirus|epson|dr.?click/i.test(
          `${service.id} ${service.name}`,
        )
      )
        invalid(["services"], "Software y licencias son venta directa.");
      if (!["PEN", "USD"].includes(service.currency))
        invalid(["services"], "Moneda no válida: usa PEN o USD.");
      for (const item of service.items)
        if (
          item.price !== "" &&
          (!/^\d+(?:\.\d{1,2})?$/.test(item.price) ||
            Number(item.price) > 1_000_000_000)
        )
          invalid(
            ["services"],
            "El precio debe estar vacío o ser un importe positivo con hasta dos decimales.",
          );
    }
  }
}
export function attachImages(
  value: Json,
  uploads: unknown,
  files: Map<string, Buffer | null>,
) {
  if (!Array.isArray(uploads) || uploads.length > 20)
    throw new PanelError(400, "Lista de imágenes no válida.");
  const seen = new Set<string>();
  for (const upload of uploads) {
    if (
      !upload ||
      typeof upload !== "object" ||
      Object.keys(upload).some(
        (k) => !["field", "dataUrl", "folder"].includes(k),
      )
    )
      throw new PanelError(400, "Imagen no válida.");
    const { field, dataUrl, folder } = upload;
    if (
      !Array.isArray(field) ||
      !field.length ||
      field.length > 20 ||
      !field.every(
        (p) => typeof p === "string" || (Number.isInteger(p) && p >= 0),
      ) ||
      !imageFolders.includes(folder)
    )
      throw new PanelError(400, "Destino de imagen no permitido.");
    if (
      field.some((p) =>
        ["__proto__", "constructor", "prototype"].includes(String(p)),
      ) ||
      seen.has(JSON.stringify(field))
    )
      throw new PanelError(400, "Destino de imagen no permitido.");
    seen.add(JSON.stringify(field));
    let parent: any = value;
    for (const key of field.slice(0, -1)) {
      if (!parent || typeof parent !== "object" || !Object.hasOwn(parent, key))
        throw new PanelError(400, "Campo de imagen no válido.");
      parent = parent[key];
    }
    const key = field.at(-1);
    if (
      !parent ||
      !Object.hasOwn(parent, key) ||
      typeof parent[key] !== "string" ||
      !safeImage(parent[key])
    )
      throw new PanelError(400, "El destino debe ser un campo de imagen.");
    const match =
      /^data:image\/(jpeg|png|webp);base64,([a-zA-Z0-9+/]+={0,2})$/.exec(
        String(dataUrl),
      );
    if (!match)
      throw new PanelError(400, "Selecciona una imagen JPG, PNG o WebP.");
    const bytes = Buffer.from(match[2]!, "base64");
    if (bytes.length > 8_000_000)
      throw new PanelError(413, "La imagen supera el límite de 8 MB.");
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP";
    if (!(match[1] === "png" ? png : match[1] === "jpeg" ? jpeg : webp))
      throw new PanelError(
        400,
        "El contenido no coincide con el tipo de imagen.",
      );
    const imagePath = `/images/${folder}/${randomUUID()}.${match[1] === "jpeg" ? "jpg" : match[1]}`;
    parent[key] = imagePath;
    files.set(`public${imagePath}`, bytes);
  }
}
