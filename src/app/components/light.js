import {
  DEFAULT_LIGHT_WIDTH,
  DEFAULT_LIGHT_HEIGHT,
  LIGHT_STYLE_ICON,
  LIGHT_STYLE_TILE,
  LIGHT_STYLE_SLIDER,
  LIGHT_TILE_ICON_POSITION_DEFAULT,
  LIGHT_TILE_ICON_POSITION_OPTIONS,
  LIGHT_ICON_PATHS,
  getLightTileLayout,
  normalizeLightTileIconPosition,
} from "../constants.js";
import { deriveTitle } from "./common.js";
import {
  LIGHT_DEFAULT_PREVIEW_HUE,
  LIGHT_TILE_ICON_BUBBLE_OPACITY,
  appendIconWithFallback,
  applyTilePlacement,
  calculateHueSliderColor,
  calculateLightSliderColor,
} from "./preview-helpers.js";

function getLightSliderExtraRowCount(props = {}) {
  return Number(!!props.color_temp) + Number(!!props.hue_360);
}

export const lightComponent = {
  type: "light",
  label: "light",
  entityFields: [{ label: "Entity ID", defaultValue: (index) => `light.new_light_${index}` }],
  styleOptions: [
    { value: LIGHT_STYLE_ICON, label: "icon" },
    { value: LIGHT_STYLE_TILE, label: "tile" },
    { value: LIGHT_STYLE_SLIDER, label: "slider" },
  ],
  createEntity(index) {
    return {
      entityid: `light.new_light_${index}`,
      type: "light",
      props: {
        x: 24,
        y: 24,
        width: DEFAULT_LIGHT_WIDTH,
        height: DEFAULT_LIGHT_HEIGHT,
        title: `Light ${index}`,
        style: LIGHT_STYLE_ICON,
        icon: LIGHT_ICON_PATHS.on,
        tile_icon_position: LIGHT_TILE_ICON_POSITION_DEFAULT,
        color_temp: false,
        hue_360: false,
        preview_hue: LIGHT_DEFAULT_PREVIEW_HUE,
      },
    };
  },
  normalizeStyle(value) {
    if (value === LIGHT_STYLE_TILE) return LIGHT_STYLE_TILE;
    if (value === LIGHT_STYLE_SLIDER) return LIGHT_STYLE_SLIDER;
    return LIGHT_STYLE_ICON;
  },
  defaultTitle(entityids) {
    return deriveTitle(entityids[0]);
  },
  defaultWidth(style) {
    if (style === LIGHT_STYLE_TILE) return 120;
    if (style === LIGHT_STYLE_SLIDER) return 220;
    return DEFAULT_LIGHT_WIDTH;
  },
  defaultHeight(style, props = {}) {
    if (style === LIGHT_STYLE_TILE) return 120;
    if (style === LIGHT_STYLE_SLIDER) return 112 + getLightSliderExtraRowCount(props) * 40;
    return DEFAULT_LIGHT_HEIGHT;
  },
  minWidth(style) {
    if (style === LIGHT_STYLE_TILE) return 80;
    if (style === LIGHT_STYLE_SLIDER) return 180;
    return 48;
  },
  minHeight(style, props = {}) {
    if (style === LIGHT_STYLE_SLIDER) return 80 + getLightSliderExtraRowCount(props) * 30;
    return 48;
  },
  usesTopAlignedTitle() {
    return false;
  },
  shouldRenderWidgetTitle() {
    return false;
  },
  getInspectorState(entity) {
    return {
      showEntityId: true,
      showEntityId2: false,
      showStyle: true,
      showMultiSwitch: false,
      showThermoIcons: false,
      showHmiBrightness: false,
      showLightIcon: true,
      showLightTilePosition: entity.props.style === LIGHT_STYLE_TILE || entity.props.style === LIGHT_STYLE_SLIDER,
      showLightSliders: entity.props.style === LIGHT_STYLE_SLIDER,
      showActiveColor: false,
    };
  },
  populateInspector(entity, elements) {
    elements.fieldLightIcon.value = entity.props.icon ?? "";
    elements.fieldLightTileIconPosition.value = entity.props.tile_icon_position ?? LIGHT_TILE_ICON_POSITION_DEFAULT;
    elements.fieldColorTemp.checked = entity.props.color_temp ?? false;
    elements.fieldHue360.checked = entity.props.hue_360 ?? false;
    elements.fieldLightPreviewCtRow?.classList.toggle("hidden", !entity.props.color_temp);
    elements.fieldLightPreviewHueRow?.classList.toggle("hidden", !entity.props.hue_360);
    if (elements.fieldLightPreviewCt) {
      elements.fieldLightPreviewCt.value = entity.props.preview_color_temp !== undefined ? entity.props.preview_color_temp : 50;
    }
    if (elements.fieldLightPreviewHue) {
      elements.fieldLightPreviewHue.value = entity.props.preview_hue !== undefined ? entity.props.preview_hue : LIGHT_DEFAULT_PREVIEW_HUE;
    }
  },
  applyInspectorChanges(entity, elements, utils) {
    entity.props.icon = utils.normalizeIconSource(elements.fieldLightIcon.value);
    entity.props.tile_icon_position = elements.fieldLightTileIconPosition.value.trim() || entity.props.tile_icon_position;
    entity.props.color_temp = elements.fieldColorTemp.checked;
    entity.props.hue_360 = elements.fieldHue360.checked;
    entity.props.preview_color_temp = parseInt(elements.fieldLightPreviewCt.value, 10);
    entity.props.preview_hue = parseInt(elements.fieldLightPreviewHue.value, 10);
    entity.props.height = Math.max(entity.props.height, utils.minHeightForType(entity.type, entity.props.style, entity.props));
  },
  applyInspectorCommit(entity, elements) {
    entity.props.color_temp = elements.fieldColorTemp.checked;
    entity.props.hue_360 = elements.fieldHue360.checked;
    entity.props.preview_color_temp = parseInt(elements.fieldLightPreviewCt.value, 10);
    entity.props.preview_hue = parseInt(elements.fieldLightPreviewHue.value, 10);
  },
  appendSpecProps(lines, entity, propIndent, { normalizeIconSource, normalizeStyle, quoteYaml }) {
    if (normalizeIconSource(entity.props.icon)) {
      lines.push(`${propIndent}  icon: ${quoteYaml(entity.props.icon)}`);
    }
    if (normalizeStyle(entity.type, entity.props.style) === LIGHT_STYLE_TILE || normalizeStyle(entity.type, entity.props.style) === LIGHT_STYLE_SLIDER) {
      lines.push(`${propIndent}  tile_icon_position: ${quoteYaml(normalizeLightTileIconPosition(entity.props.tile_icon_position))}`);
    }
    if (entity.props.color_temp) {
      lines.push(`${propIndent}  color_temp: true`);
    }
    if (entity.props.hue_360) {
      lines.push(`${propIndent}  hue_360: true`);
    }
  },
  normalizeTileIconPosition(value) {
    return normalizeLightTileIconPosition(value);
  },
  tileIconPositionOptions: LIGHT_TILE_ICON_POSITION_OPTIONS,
  renderPreview(entity) {
    const isTile = entity.props.style === LIGHT_STYLE_TILE;
    const group = document.createElement("div");
    group.className = `light-widget-group ${isTile ? "tile" : "icon"} off`;

    if (isTile) {
      const layout = getLightTileLayout(entity.props.tile_icon_position);
      const iconBubble = document.createElement("div");
      iconBubble.className = "light-tile-icon-bubble";
      iconBubble.style.backgroundColor = `rgba(255, 255, 255, ${LIGHT_TILE_ICON_BUBBLE_OPACITY / 100})`;
      applyTilePlacement(iconBubble, layout.icon);

      const icon = document.createElement("img");
      icon.className = "light-tile-icon";
      appendIconWithFallback(icon, entity.props.icon, LIGHT_ICON_PATHS.on, "Light");
      iconBubble.append(icon);

      const titleLabel = document.createElement("span");
      titleLabel.className = "light-tile-title";
      titleLabel.textContent = entity.props.title;
      applyTilePlacement(titleLabel, layout.title);

      const stateLabel = document.createElement("span");
      stateLabel.className = "light-tile-state";
      stateLabel.textContent = "OFF";
      applyTilePlacement(stateLabel, layout.state);

      group.append(iconBubble, titleLabel, stateLabel);
      return group;
    }

    if (entity.props.style === LIGHT_STYLE_SLIDER) {
      group.className = `light-widget-group slider ${entity.props.color_temp ? "has-ct" : ""} ${entity.props.hue_360 ? "has-hue" : ""} off`;
      const topRow = document.createElement("div");
      topRow.className = "light-slider-top-row";
      const iconBubble = document.createElement("div");
      iconBubble.className = "light-tile-icon-bubble";
      iconBubble.style.backgroundColor = `rgba(255, 255, 255, ${LIGHT_TILE_ICON_BUBBLE_OPACITY / 100})`;
      iconBubble.style.position = "static";
      const icon = document.createElement("img");
      icon.className = "light-tile-icon";
      appendIconWithFallback(icon, "mdi:lightbulb", "mdi:lightbulb", "Light");
      iconBubble.append(icon);
      const infoBlock = document.createElement("div");
      infoBlock.className = "light-slider-info";
      const titleLabel = document.createElement("div");
      titleLabel.className = "light-slider-title";
      titleLabel.textContent = entity.props.title;
      const stateLabel = document.createElement("div");
      stateLabel.className = "light-slider-state";
      stateLabel.textContent = "30%";
      infoBlock.append(titleLabel, stateLabel);
      topRow.append(iconBubble, infoBlock);
      const sliderTrack = document.createElement("div");
      sliderTrack.className = "light-slider-track";
      const sliderFill = document.createElement("div");
      sliderFill.className = "light-slider-fill";
      sliderFill.style.width = "30%";
      const ctFactor = entity.props.preview_color_temp !== undefined ? entity.props.preview_color_temp / 100 : 0.5;
      const previewHue = entity.props.preview_hue !== undefined ? entity.props.preview_hue : LIGHT_DEFAULT_PREVIEW_HUE;
      sliderFill.style.backgroundColor = entity.props.hue_360 ? calculateHueSliderColor(previewHue) : calculateLightSliderColor(ctFactor);
      const sliderKnob = document.createElement("div");
      sliderKnob.className = "light-slider-knob";
      sliderFill.append(sliderKnob);
      sliderTrack.append(sliderFill);
      group.append(topRow, sliderTrack);

      if (entity.props.color_temp) {
        const ctTrack = document.createElement("div");
        ctTrack.className = "light-slider-track ct-track";
        const ctFill = document.createElement("div");
        ctFill.className = "light-slider-fill ct-fill";
        ctFill.style.width = "50%";
        const ctKnob = document.createElement("div");
        ctKnob.className = "light-slider-knob";
        ctFill.append(ctKnob);
        ctTrack.append(ctFill);
        group.append(ctTrack);
      }
      if (entity.props.hue_360) {
        const previewHue = entity.props.preview_hue !== undefined ? entity.props.preview_hue : LIGHT_DEFAULT_PREVIEW_HUE;
        const hueTrack = document.createElement("div");
        hueTrack.className = "light-slider-track hue-track";
        const hueFill = document.createElement("div");
        hueFill.className = "light-slider-fill hue-fill";
        hueFill.style.width = `${(previewHue / 360) * 100}%`;
        hueFill.style.backgroundColor = "transparent";
        const hueKnob = document.createElement("div");
        hueKnob.className = "light-slider-knob";
        hueKnob.style.backgroundColor = calculateHueSliderColor(previewHue);
        hueFill.append(hueKnob);
        hueTrack.append(hueFill);
        group.append(hueTrack);
      }
      return group;
    }

    const icon = document.createElement("img");
    icon.className = "light-widget-icon";
    appendIconWithFallback(icon, entity.props.icon, LIGHT_ICON_PATHS.on, "Light");
    group.append(icon);
    return group;
  },
};
