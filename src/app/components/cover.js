import {
  COVER_STYLE_COMPACT,
  DEFAULT_COVER_WIDTH,
  DEFAULT_COVER_HEIGHT,
} from "../constants.js";
import { appendIconWithFallback } from "./preview-helpers.js";
import { deriveTitle } from "./common.js";

export const coverComponent = {
  type: "cover",
  label: "curtain",
  entityFields: [{ label: "Entity ID", defaultValue: (index) => `cover.new_curtain_${index}` }],
  styleOptions: [{ value: COVER_STYLE_COMPACT, label: "compact" }],
  createEntity(index) {
    return {
      entityid: `cover.new_curtain_${index}`,
      type: "cover",
      props: {
        x: 24,
        y: 24,
        width: DEFAULT_COVER_WIDTH,
        height: DEFAULT_COVER_HEIGHT,
        title: `Curtain ${index}`,
        style: COVER_STYLE_COMPACT,
      },
    };
  },
  normalizeStyle() {
    return COVER_STYLE_COMPACT;
  },
  defaultTitle(entityids) {
    return deriveTitle(entityids[0]);
  },
  defaultWidth() {
    return DEFAULT_COVER_WIDTH;
  },
  defaultHeight() {
    return DEFAULT_COVER_HEIGHT;
  },
  minWidth() {
    return 180;
  },
  minHeight() {
    return 120;
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
  },
  populateInspector() {},
  applyInspectorChanges() {},
  applyInspectorCommit() {},
  appendSpecProps() {},
  renderPreview(entity) {
    const group = document.createElement("div");
    group.className = "cover-widget-group";
    const title = document.createElement("span");
    title.className = "cover-title";
    title.textContent = entity.props.title;
    const current = document.createElement("span");
    current.className = "cover-current";
    current.textContent = "current: 30%";
    const minLabel = document.createElement("span");
    minLabel.className = "cover-range-label cover-range-min";
    minLabel.textContent = "0%";
    const maxLabel = document.createElement("span");
    maxLabel.className = "cover-range-label cover-range-max";
    maxLabel.textContent = "100%";
    const controls = document.createElement("div");
    controls.className = "cover-controls";
    [
      { src: "mdi:arrow-down-circle", alt: "Close", className: "cover-control close" },
      { src: "mdi:pause", alt: "Stop", className: "cover-control stop" },
      { src: "mdi:arrow-up-circle", alt: "Open", className: "cover-control open" },
    ].forEach((item) => {
      const button = document.createElement("span");
      button.className = item.className;
      const icon = document.createElement("img");
      icon.className = "cover-control-icon";
      appendIconWithFallback(icon, item.src, item.src, item.alt);
      button.append(icon);
      controls.append(button);
    });
    const slider = document.createElement("div");
    slider.className = "cover-slider";
    const fill = document.createElement("div");
    fill.className = "cover-slider-fill";
    fill.style.width = "30%";
    const thumb = document.createElement("div");
    thumb.className = "cover-slider-thumb";
    fill.append(thumb);
    slider.append(fill);
    title.style.width = `${Math.max(entity.props.width - 24, 60)}px`;
    current.style.width = `${Math.max(entity.props.width - 24, 60)}px`;
    group.append(title, current, minLabel, maxLabel, controls, slider);
    return group;
  },
};
