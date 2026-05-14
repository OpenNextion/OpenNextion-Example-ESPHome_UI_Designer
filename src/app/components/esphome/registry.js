import { normalizeType } from "../registry.js";
import { renderSwitchEsphomeWidget } from "./switch.js";
import { renderMultiSwitchEsphomeWidget } from "./multi-switch.js";
import { renderThermoHygrometerEsphomeWidget } from "./thermo-hygrometer.js";
import { renderCoverEsphomeWidget } from "./cover.js";
import { renderHmiScreenBrightnessEsphomeWidget } from "./hmi-screen-brightness.js";
import { renderLightEsphomeWidget } from "./light.js";

const ESPHOME_COMPONENT_RENDERERS = {
  switch: renderSwitchEsphomeWidget,
  multi_switch: renderMultiSwitchEsphomeWidget,
  thermo_hygrometer: renderThermoHygrometerEsphomeWidget,
  cover: renderCoverEsphomeWidget,
  hmi_screen_brightness: renderHmiScreenBrightnessEsphomeWidget,
  light: renderLightEsphomeWidget,
};

export function renderEsphomeWidgetByComponent(entity, renderers) {
  const type = normalizeType(entity.type);
  const renderer = ESPHOME_COMPONENT_RENDERERS[type] || ESPHOME_COMPONENT_RENDERERS.switch;
  return renderer(entity, renderers);
}
