import {
  DEFAULT_THERMO_WIDTH,
  DEFAULT_THERMO_HEIGHT,
  THERMO_HYGROMETER_STYLE_COMPACT,
  THERMO_ICON_PATHS,
  THERMO_VALUE_BOX_HEIGHT,
} from "../constants.js";
import { appendIconWithFallback } from "./preview-helpers.js";

export const thermoHygrometerComponent = {
  type: "thermo_hygrometer",
  label: "thermo-hygrometer",
  entityFields: [
    { label: "Entity ID (Temperature)", defaultValue: (index) => `sensor.temperature_${index}` },
    { label: "Entity ID (Humidity)", defaultValue: (index) => `sensor.humidity_${index}` },
  ],
  styleOptions: [{ value: THERMO_HYGROMETER_STYLE_COMPACT, label: "compact" }],
  createEntity(index) {
    return {
      entityids: [`sensor.temperature_${index}`, `sensor.humidity_${index}`],
      type: "thermo_hygrometer",
      props: {
        x: 24,
        y: 24,
        width: DEFAULT_THERMO_WIDTH,
        height: DEFAULT_THERMO_HEIGHT,
        title: `Climate ${index}`,
        style: THERMO_HYGROMETER_STYLE_COMPACT,
        temp_icon: THERMO_ICON_PATHS.temp,
        hum_icon: THERMO_ICON_PATHS.hum,
      },
    };
  },
  normalizeStyle() {
    return THERMO_HYGROMETER_STYLE_COMPACT;
  },
  defaultTitle() {
    return "Temperature & Humidity";
  },
  defaultWidth() {
    return DEFAULT_THERMO_WIDTH;
  },
  defaultHeight() {
    return DEFAULT_THERMO_HEIGHT;
  },
  minWidth() {
    return 180;
  },
  minHeight() {
    return DEFAULT_THERMO_HEIGHT;
  },
  usesTopAlignedTitle() {
    return false;
  },
  shouldRenderWidgetTitle() {
    return false;
  },
  getInspectorState() {
    return {
      showEntityId: true,
      showEntityId2: true,
      showStyle: true,
      showMultiSwitch: false,
      showThermoIcons: true,
      showHmiBrightness: false,
      showLightIcon: false,
      showLightTilePosition: false,
      showLightSliders: false,
      showActiveColor: false,
    };
  },
  populateInspector(entity, elements) {
    elements.fieldTempIcon.value = entity.props.temp_icon ?? "";
    elements.fieldHumIcon.value = entity.props.hum_icon ?? "";
  },
  applyInspectorChanges(entity, elements, utils) {
    const trimmedEntityId2 = elements.fieldEntityId2.value.trim();
    if (trimmedEntityId2) {
      entity.entityids[1] = trimmedEntityId2;
    }
    entity.props.temp_icon = utils.normalizeIconSource(elements.fieldTempIcon.value);
    entity.props.hum_icon = utils.normalizeIconSource(elements.fieldHumIcon.value);
  },
  applyInspectorCommit(entity, elements, utils) {
    entity.props.temp_icon = utils.normalizeIconSource(elements.fieldTempIcon.value);
    entity.props.hum_icon = utils.normalizeIconSource(elements.fieldHumIcon.value);
  },
  appendSpecProps(lines, entity, propIndent, { normalizeIconSource, quoteYaml }) {
    if (normalizeIconSource(entity.props.temp_icon)) {
      lines.push(`${propIndent}  temp_icon: ${quoteYaml(entity.props.temp_icon)}`);
    }
    if (normalizeIconSource(entity.props.hum_icon)) {
      lines.push(`${propIndent}  hum_icon: ${quoteYaml(entity.props.hum_icon)}`);
    }
  },
  renderPreview(entity) {
    const group = document.createElement("div");
    group.className = "thermo-group";
    [
      { caption: "Temp", suffix: "°C", icon: entity.props.temp_icon, fallback: THERMO_ICON_PATHS.temp },
      { caption: "Humi", suffix: "%", icon: entity.props.hum_icon, fallback: THERMO_ICON_PATHS.hum },
    ].forEach((item) => {
      const valueBox = document.createElement("div");
      valueBox.className = "thermo-value-box";
      valueBox.style.height = `${THERMO_VALUE_BOX_HEIGHT}px`;
      const icon = document.createElement("img");
      icon.className = "thermo-icon";
      appendIconWithFallback(icon, item.icon, item.fallback, item.caption);
      const value = document.createElement("span");
      value.className = "thermo-value";
      value.textContent = `${item.caption}: --${item.suffix}`;
      valueBox.append(icon, value);
      group.append(valueBox);
    });
    return group;
  },
};
