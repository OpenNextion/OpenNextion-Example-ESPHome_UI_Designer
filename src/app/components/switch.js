import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  DEFAULT_SWITCH_PAD_RIGHT,
  DEFAULT_BUTTON_BG_COLOR,
  SWITCH_STYLE_TOGGLE,
  SWITCH_STYLE_SWITCH,
  SWITCH_BUTTON_STYLE_HEIGHT,
  SWITCH_WIDTH,
  SWITCH_HEIGHT,
} from "../constants.js";
import { deriveTitle } from "./common.js";

function renderTogglePreview() {
  const switchShell = document.createElement("div");
  switchShell.className = "widget-switch";
  switchShell.style.right = `${DEFAULT_SWITCH_PAD_RIGHT}px`;
  switchShell.style.width = `${SWITCH_WIDTH}px`;
  switchShell.style.height = `${SWITCH_HEIGHT}px`;

  const knob = document.createElement("span");
  knob.className = "widget-switch-knob";
  switchShell.append(knob);
  return switchShell;
}

function renderButtonPreview(entity) {
  const button = document.createElement("div");
  button.className = "single-switch-button";
  button.style.inset = "0";
  button.style.background = DEFAULT_BUTTON_BG_COLOR;

  const label = document.createElement("span");
  label.className = "single-switch-button-label";
  label.textContent = entity.props.title;
  button.append(label);
  return button;
}

export const switchComponent = {
  type: "switch",
  label: "switch",
  entityFields: [{ label: "Entity ID", defaultValue: (index) => `switch.new_switch_${index}` }],
  styleOptions: [
    { value: SWITCH_STYLE_SWITCH, label: "switch" },
    { value: SWITCH_STYLE_TOGGLE, label: "toggle" },
  ],
  createEntity(index) {
    return {
      entityid: `switch.new_switch_${index}`,
      type: "switch",
      props: {
        x: 24,
        y: 24,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        title: `New Switch ${index}`,
      },
    };
  },
  normalizeStyle(value) {
    return value === SWITCH_STYLE_SWITCH ? SWITCH_STYLE_SWITCH : SWITCH_STYLE_TOGGLE;
  },
  defaultTitle(entityids) {
    return deriveTitle(entityids[0]);
  },
  defaultWidth() {
    return DEFAULT_WIDTH;
  },
  defaultHeight(style) {
    return style === SWITCH_STYLE_TOGGLE ? SWITCH_BUTTON_STYLE_HEIGHT : DEFAULT_HEIGHT;
  },
  minWidth() {
    return 20;
  },
  minHeight(style) {
    return style === SWITCH_STYLE_TOGGLE ? SWITCH_BUTTON_STYLE_HEIGHT : 56;
  },
  usesTopAlignedTitle(entity) {
    return false;
  },
  shouldRenderWidgetTitle(entity) {
    return entity.props.style !== SWITCH_STYLE_TOGGLE;
  },
  getInspectorState(entity) {
    return {
      showEntityId: true,
      showEntityId2: false,
      showStyle: true,
      showMultiSwitch: false,
      showThermoIcons: false,
      showHmiBrightness: false,
      showLightIcon: false,
      showLightTilePosition: false,
      showLightSliders: false,
      showActiveColor: entity.props.style === SWITCH_STYLE_TOGGLE,
    };
  },
  populateInspector() {},
  applyInspectorChanges() {},
  applyInspectorCommit() {},
  appendSpecProps() {},
  renderPreview(entity) {
    return entity.props.style === SWITCH_STYLE_TOGGLE ? renderButtonPreview(entity) : renderTogglePreview();
  },
};
