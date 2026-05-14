import {
  LIGHT_ICON_PATHS,
  LIGHT_TILE_ICON_BUBBLE_OPACITY,
  LIGHT_DEFAULT_PREVIEW_HUE,
  THERMO_ICON_PATHS,
} from "../constants.js";
import { normalizeIconSource, yamlColorToCss } from "../spec.js";

export function resolvePreviewImageSource(source) {
  const value = normalizeIconSource(source);
  if (!value) {
    return "";
  }
  if (/^mdi:[a-z0-9-]+$/i.test(value)) {
    return `https://api.iconify.design/${encodeURIComponent(value)}.svg`;
  }
  if (/^https?:\/\//i.test(value) || /^file:\/\//i.test(value)) {
    return value;
  }
  if (value.startsWith("/")) {
    return `file://${value}`;
  }
  return value;
}

export function updateSingleIconPreview(imgNode, fallbackNode, value, fallback) {
  const resolved = resolvePreviewImageSource(value);
  if (!resolved) {
    imgNode.removeAttribute("src");
    imgNode.classList.add("hidden");
    fallbackNode.classList.remove("hidden");
    return;
  }

  imgNode.dataset.fallbackApplied = "false";
  imgNode.classList.remove("hidden");
  fallbackNode.classList.add("hidden");
  imgNode.onerror = () => {
    if (imgNode.dataset.fallbackApplied === "true") {
      imgNode.classList.add("hidden");
      fallbackNode.classList.remove("hidden");
      return;
    }
    imgNode.dataset.fallbackApplied = "true";
    const fallbackSrc = resolvePreviewImageSource(fallback);
    if (fallbackSrc === resolved) {
      imgNode.classList.add("hidden");
      fallbackNode.classList.remove("hidden");
      return;
    }
    imgNode.src = fallbackSrc;
  };
  imgNode.onload = () => {
    fallbackNode.classList.add("hidden");
    imgNode.classList.remove("hidden");
  };
  imgNode.src = resolved;
}

export function calculateLightSliderColor(factor) {
  const cool = { r: 213, g: 213, b: 225 };
  const warm = { r: 255, g: 137, b: 14 };
  const r = Math.round(cool.r + (warm.r - cool.r) * factor);
  const g = Math.round(cool.g + (warm.g - cool.g) * factor);
  const b = Math.round(cool.b + (warm.b - cool.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

export function calculateHueSliderColor(hue) {
  const normalizedHue = ((Number(hue) || 0) % 360 + 360) % 360;
  return `hsl(${normalizedHue}deg 100% 50%)`;
}

export function applyTilePlacement(node, placement) {
  node.style.top = placement.top === null ? "" : `${placement.top}px`;
  node.style.right = placement.right === null || placement.right === undefined ? "" : `${placement.right}px`;
  node.style.bottom = placement.bottom === null || placement.bottom === undefined ? "" : `${placement.bottom}px`;
  node.style.left = placement.left === null || placement.left === undefined ? "" : `${placement.left}px`;
}

export function appendIconWithFallback(icon, primary, fallback, alt) {
  icon.className = icon.className || "";
  icon.src = resolvePreviewImageSource(primary);
  icon.alt = alt;
  icon.addEventListener("error", () => {
    if (icon.dataset.fallbackApplied === "true") {
      return;
    }
    icon.dataset.fallbackApplied = "true";
    icon.src = resolvePreviewImageSource(fallback);
  });
}

export {
  LIGHT_DEFAULT_PREVIEW_HUE,
  LIGHT_ICON_PATHS,
  LIGHT_TILE_ICON_BUBBLE_OPACITY,
  THERMO_ICON_PATHS,
  yamlColorToCss,
};
