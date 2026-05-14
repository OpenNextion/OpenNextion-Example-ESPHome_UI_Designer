import {
  HMI_SCREEN_BRIGHTNESS_STYLE_TILE,
  DEFAULT_HMI_SCREEN_BRIGHTNESS_WIDTH,
  DEFAULT_HMI_SCREEN_BRIGHTNESS_HEIGHT,
  DEFAULT_HMI_SCREEN_BRIGHTNESS_SLIDER_COLOR,
  getHmiScreenBrightnessLayout,
  getHmiScreenBrightnessMinHeight,
} from "../constants.js";
import { yamlColorToCss } from "./preview-helpers.js";

export const hmiScreenBrightnessComponent = {
  type: "hmi_screen_brightness",
  label: "hmi-screen-brightness",
  entityFields: [],
  styleOptions: [{ value: HMI_SCREEN_BRIGHTNESS_STYLE_TILE, label: "tile" }],
  createEntity(index) {
    return {
      entityids: [],
      type: "hmi_screen_brightness",
      props: {
        x: 24,
        y: 24,
        width: DEFAULT_HMI_SCREEN_BRIGHTNESS_WIDTH,
        height: DEFAULT_HMI_SCREEN_BRIGHTNESS_HEIGHT,
        title: `HMI Screen ${index}`,
        style: HMI_SCREEN_BRIGHTNESS_STYLE_TILE,
        show_header: true,
        slider_color: DEFAULT_HMI_SCREEN_BRIGHTNESS_SLIDER_COLOR,
      },
    };
  },
  normalizeStyle() {
    return HMI_SCREEN_BRIGHTNESS_STYLE_TILE;
  },
  defaultTitle() {
    return "HMI Screen";
  },
  defaultWidth() {
    return DEFAULT_HMI_SCREEN_BRIGHTNESS_WIDTH;
  },
  defaultHeight(_style, props = {}) {
    return Math.max(DEFAULT_HMI_SCREEN_BRIGHTNESS_HEIGHT, getHmiScreenBrightnessMinHeight(props.show_header !== false));
  },
  minWidth() {
    return 180;
  },
  minHeight(_style, props = {}) {
    return getHmiScreenBrightnessMinHeight(props.show_header !== false);
  },
  usesTopAlignedTitle() {
    return false;
  },
  shouldRenderWidgetTitle() {
    return false;
  },
  getInspectorState() {
    return {
      showEntityId: false,
      showEntityId2: false,
      showStyle: true,
      showMultiSwitch: false,
      showThermoIcons: false,
      showHmiBrightness: true,
      showLightIcon: false,
      showLightTilePosition: false,
      showLightSliders: false,
      showActiveColor: false,
    };
  },
  populateInspector(entity, elements, utils) {
    elements.fieldHmiShowHeader.checked = entity.props.show_header !== false;
    elements.fieldHmiSliderColor.value = utils.yamlColorToHtml(entity.props.slider_color || "#FDBB13");
    if (elements.fieldHmiSliderColorHex) {
      elements.fieldHmiSliderColorHex.textContent = elements.fieldHmiSliderColor.value.toUpperCase();
    }
  },
  applyInspectorChanges(entity, elements, utils) {
    entity.props.show_header = elements.fieldHmiShowHeader.checked;
    entity.props.slider_color = utils.htmlColorToYaml(elements.fieldHmiSliderColor.value);
    utils.updateColorHexLabel(elements.fieldHmiSliderColor, elements.fieldHmiSliderColorHex);
  },
  applyInspectorCommit(entity, elements, utils) {
    entity.props.show_header = elements.fieldHmiShowHeader.checked;
    entity.props.slider_color = utils.htmlColorToYaml(elements.fieldHmiSliderColor.value);
    utils.updateColorHexLabel(elements.fieldHmiSliderColor, elements.fieldHmiSliderColorHex);
  },
  appendSpecProps(lines, entity, propIndent, { quoteYaml }) {
    if (entity.props.show_header === false) {
      lines.push(`${propIndent}  show_header: false`);
    }
    if (entity.props.slider_color) {
      lines.push(`${propIndent}  slider_color: ${quoteYaml(entity.props.slider_color)}`);
    }
  },
  renderPreview(entity) {
    const group = document.createElement("div");
    group.className = `hmi-brightness-group${entity.props.show_header === false ? " no-header" : ""}`;
    const layout = getHmiScreenBrightnessLayout(entity.props.width, entity.props.height, entity.props.show_header !== false);
    if (entity.props.show_header !== false) {
      const header = document.createElement("div");
      header.className = "hmi-brightness-header";
      header.style.left = `${layout.header.x}px`;
      header.style.top = `${layout.header.y}px`;
      header.style.width = `${layout.header.width}px`;
      header.style.height = `${layout.header.height}px`;
      const title = document.createElement("span");
      title.className = "hmi-brightness-title";
      title.textContent = entity.props.title;
      const value = document.createElement("span");
      value.className = "hmi-brightness-value";
      value.textContent = "50%";
      header.append(title, value);
      group.append(header);
    }
    const slider = document.createElement("div");
    slider.className = "hmi-brightness-slider";
    slider.style.backgroundColor = "rgba(36, 50, 58, 0.1)";
    slider.style.left = `${layout.slider.x}px`;
    slider.style.top = `${layout.slider.y}px`;
    slider.style.width = `${layout.slider.width}px`;
    slider.style.height = `${layout.slider.height}px`;
    const fill = document.createElement("div");
    fill.className = "hmi-brightness-slider-fill";
    fill.style.width = "50%";
    fill.style.backgroundColor = yamlColorToCss(entity.props.slider_color || "#FDBB13");
    const thumb = document.createElement("div");
    thumb.className = "hmi-brightness-slider-thumb";
    fill.append(thumb);
    slider.append(fill);
    group.append(slider);
    return group;
  },
};
