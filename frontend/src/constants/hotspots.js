import doggoPadrao from "../img/doggo.png";

const API_URL = process.env.REACT_APP_API_URL || "";

export const DEFAULT_HOTSPOTS = [
  { janela: 0, title: "HD", nome: "Hepato-Diafragmática", className: "hd", color: "#0d6efd", left: 52, top: 12, size: 22 },
  { janela: 1, title: "HR", nome: "Hepato-Renal", className: "hr", color: "#dc3545", left: 67, top: 43, size: 22 },
  { janela: 2, title: "ER", nome: "Espleno-Renal", className: "er", color: "#212529", left: 39, top: 36, size: 22 },
  { janela: 3, title: "CC", nome: "Cisto-Cólica", className: "cc", color: "#198754", left: 50, top: 70, size: 22 },
];

function clamp(num, min, max, fallback) {
  const n = Number(num);
  if (!Number.isFinite(n)) return fallback;
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10;
}

export function clonarHotspotsPadrao() {
  return DEFAULT_HOTSPOTS.map((item) => ({ ...item }));
}

export function parseHotspotsConfig(raw) {
  if (!raw) {
    return clonarHotspotsPadrao();
  }
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return clonarHotspotsPadrao();
    }
  }
  if (!Array.isArray(parsed)) {
    return clonarHotspotsPadrao();
  }

  return DEFAULT_HOTSPOTS.map((def) => {
    const match = parsed.find((p) => Number(p?.janela) === def.janela || String(p?.title || "").toUpperCase() === def.title);
    if (!match) {
      return { ...def };
    }
    return {
      ...def,
      left: clamp(match.left, 5, 95, def.left),
      top: clamp(match.top, 5, 95, def.top),
      size: clamp(match.size, 8, 45, def.size),
    };
  });
}

export function serializeHotspotsConfig(list) {
  const normalized = parseHotspotsConfig(list).map(({ janela, title, left, top, size }) => ({
    janela,
    title,
    left,
    top,
    size,
  }));
  return JSON.stringify(normalized);
}

export function resolverImagemBaseUrl(imagemBase, cacheBust) {
  if (!imagemBase) {
    return doggoPadrao;
  }
  if (String(imagemBase).startsWith("http")) {
    return cacheBust ? `${imagemBase}?t=${cacheBust}` : imagemBase;
  }
  const base = `${API_URL}/ws/images/${imagemBase}`;
  return cacheBust ? `${base}?t=${cacheBust}` : base;
}
