import { switchComponent } from "./switch.js";
import { multiSwitchComponent } from "./multi-switch.js";
import { thermoHygrometerComponent } from "./thermo-hygrometer.js";
import { coverComponent } from "./cover.js";
import { hmiScreenBrightnessComponent } from "./hmi-screen-brightness.js";
import { lightComponent } from "./light.js";

export const COMPONENT_DEFINITIONS = {
  switch: switchComponent,
  multi_switch: multiSwitchComponent,
  thermo_hygrometer: thermoHygrometerComponent,
  cover: coverComponent,
  hmi_screen_brightness: hmiScreenBrightnessComponent,
  light: lightComponent,
};

const DEFAULT_COMPONENT_TYPE = "switch";

export function normalizeType(value) {
  return COMPONENT_DEFINITIONS[value] ? value : DEFAULT_COMPONENT_TYPE;
}

export function getComponentDefinition(type) {
  return COMPONENT_DEFINITIONS[normalizeType(type)];
}

export function getEntityCapability(type) {
  return getComponentDefinition(type);
}

export function getComponentTypes() {
  return Object.keys(COMPONENT_DEFINITIONS);
}

export function normalizeStyle(type, value) {
  return getComponentDefinition(type).normalizeStyle(value);
}

export function defaultTitleForType(type, entityids = []) {
  return getComponentDefinition(type).defaultTitle(entityids);
}

export function defaultWidthForType(type, style) {
  return getComponentDefinition(type).defaultWidth(style);
}

export function defaultHeightForType(type, style, props = {}) {
  return getComponentDefinition(type).defaultHeight(style, props);
}

export function minWidthForType(type, style) {
  return getComponentDefinition(type).minWidth(style);
}

export function minHeightForType(type, style, props = {}) {
  return getComponentDefinition(type).minHeight(style, props);
}

export function createEntityDraft(type, index) {
  return getComponentDefinition(type).createEntity(index);
}

export function usesTopAlignedTitle(entity) {
  return getComponentDefinition(entity.type).usesTopAlignedTitle(entity);
}

export function shouldRenderWidgetTitle(entity) {
  return getComponentDefinition(entity.type).shouldRenderWidgetTitle(entity);
}

export function renderComponentPreview(entity) {
  return getComponentDefinition(entity.type).renderPreview(entity);
}

export function getInspectorState(entity) {
  return getComponentDefinition(entity.type).getInspectorState?.(entity) || {
    showEntityId: true,
    showEntityId2: false,
    showStyle: true,
    showMultiSwitch: false,
    showThermoIcons: false,
    showHmiBrightness: false,
    showLightIcon: false,
    showLightTilePosition: false,
    showLightSliders: false,
    showActiveColor: false,
  };
}

export function populateComponentInspector(entity, elements, utils = {}) {
  getComponentDefinition(entity.type).populateInspector?.(entity, elements, utils);
}

export function applyComponentInspectorChanges(entity, elements, utils = {}) {
  getComponentDefinition(entity.type).applyInspectorChanges?.(entity, elements, utils);
}

export function applyComponentInspectorCommit(entity, elements, utils = {}) {
  getComponentDefinition(entity.type).applyInspectorCommit?.(entity, elements, utils);
}
