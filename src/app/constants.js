export const BOARD_CONFIGS = {
  nextion_35: { width: 320, height: 480, name: "ONX3248G035" },
  nextion_28: { width: 240, height: 320, name: "ONX2432G028" },
};

export const DEFAULT_WIDTH = 220;
export const DEFAULT_HEIGHT = 72;
export const DEFAULT_LABEL_PAD_LEFT = 16;
export const DEFAULT_SWITCH_PAD_RIGHT = 16;
export const SWITCH_STYLE_TOGGLE = "toggle";
export const SWITCH_STYLE_SWITCH = "switch";
export const SWITCH_STYLE_BUTTON = SWITCH_STYLE_SWITCH;
export const SWITCH_BUTTON_HEIGHT = 40;
export const SWITCH_BUTTON_STYLE_HEIGHT = 20;
export const MULTI_SWITCH_STYLE_TILE = "tile";
export const MULTI_SWITCH_STYLE_LIST = "list";
export const DEFAULT_MULTI_SWITCH_WIDTH = 220;
export const DEFAULT_MULTI_SWITCH_HEIGHT = 124;
export const THERMO_HYGROMETER_STYLE_COMPACT = "compact";
export const DEFAULT_THERMO_WIDTH = 220;
export const DEFAULT_THERMO_HEIGHT = 112;
export const THERMO_VALUE_BOX_HEIGHT = 80;
export const COVER_STYLE_COMPACT = "compact";
export const DEFAULT_COVER_WIDTH = 195;
export const DEFAULT_COVER_HEIGHT = 132;
export const HMI_SCREEN_BRIGHTNESS_STYLE_TILE = "tile";
export const DEFAULT_HMI_SCREEN_BRIGHTNESS_WIDTH = 220;
export const DEFAULT_HMI_SCREEN_BRIGHTNESS_HEIGHT = 60;
export const DEFAULT_HMI_SCREEN_BRIGHTNESS_SLIDER_COLOR = "0xFDBB13";
export const HMI_SCREEN_BRIGHTNESS_PADDING = 10;
export const HMI_SCREEN_BRIGHTNESS_HEADER_HEIGHT = 14;
export const HMI_SCREEN_BRIGHTNESS_HEADER_GAP = 6;
export const HMI_SCREEN_BRIGHTNESS_MIN_SLIDER_HEIGHT = 25;
export const LIGHT_STYLE_ICON = "icon";
export const LIGHT_STYLE_TILE = "tile";
export const LIGHT_STYLE_SLIDER = "slider";
export const LIGHT_DEFAULT_PREVIEW_HUE = 180;
export const LIGHT_TILE_ICON_BUBBLE_OPACITY = 40;
export const LIGHT_TILE_ICON_POSITION_TOP_LEFT = "top-left";
export const LIGHT_TILE_ICON_POSITION_TOP_RIGHT = "top-right";
export const LIGHT_TILE_ICON_POSITION_BOTTOM_LEFT = "bottom-left";
export const LIGHT_TILE_ICON_POSITION_BOTTOM_RIGHT = "bottom-right";
export const LIGHT_TILE_ICON_POSITION_DEFAULT = LIGHT_TILE_ICON_POSITION_TOP_LEFT;
export const LIGHT_TILE_ICON_POSITION_OPTIONS = [
  { value: LIGHT_TILE_ICON_POSITION_TOP_LEFT, label: "top-left" },
  { value: LIGHT_TILE_ICON_POSITION_TOP_RIGHT, label: "top-right" },
  { value: LIGHT_TILE_ICON_POSITION_BOTTOM_LEFT, label: "bottom-left" },
  { value: LIGHT_TILE_ICON_POSITION_BOTTOM_RIGHT, label: "bottom-right" },
];
export const LIGHT_PAD_ALL = 5;
export const LIGHT_PAD_ROW = 2;
export const LIGHT_DEFAULT_ICON_SIZE = 36;
export const LIGHT_LABEL_HEIGHT = 14;
export const LIGHT_LABEL_MIN_WIDTH = 24;
export const DEFAULT_LIGHT_WIDTH = Math.max(LIGHT_DEFAULT_ICON_SIZE, LIGHT_LABEL_MIN_WIDTH) + LIGHT_PAD_ALL * 2;
export const DEFAULT_LIGHT_HEIGHT = LIGHT_DEFAULT_ICON_SIZE + LIGHT_LABEL_HEIGHT + LIGHT_PAD_ALL * 2 + LIGHT_PAD_ROW;
export const THERMO_ICON_PATHS = {
  temp: "mdi:thermometer",
  hum: "https://OpenNextion.github.io/OpenNextion-Example-ESPHome_UI_Designer/assets/images/hum.png",
};
export const LIGHT_ICON_PATHS = {
  on: "https://OpenNextion.github.io/OpenNextion-Example-ESPHome_UI_Designer/assets/images/light.png",
};
export const DEFAULT_BUTTON_BG_COLOR = "0xEEF3F0";
export const SWITCH_WIDTH = 54;
export const SWITCH_HEIGHT = 28;

export function isMultiSwitchChannelEnabled(props, index) {
  return !!props?.[`channel_${index + 1}_enabled`];
}

export function getMultiSwitchChannelTitle(props, index) {
  const raw = String(props?.[`channel_${index + 1}_title`] || "").trim();
  return raw || `Switch ${index + 1}`;
}

export function getEnabledSwitchIndices(entity) {
  if (entity.type === "multi_switch") {
    return [0, 1, 2, 3].filter((index) => isMultiSwitchChannelEnabled(entity.props, index));
  }
  return (entity.entityids || []).map((_, index) => index);
}

export function getHmiScreenBrightnessLayout(width, height, showHeader = true) {
  const padding = HMI_SCREEN_BRIGHTNESS_PADDING;
  const headerHeight = showHeader ? HMI_SCREEN_BRIGHTNESS_HEADER_HEIGHT : 0;
  const headerGap = showHeader ? HMI_SCREEN_BRIGHTNESS_HEADER_GAP : 0;
  const sliderX = padding;
  const sliderY = padding + headerHeight + headerGap;
  const sliderWidth = Math.max(width - padding * 2, 80);
  const sliderHeight = Math.max(height - sliderY - padding, HMI_SCREEN_BRIGHTNESS_MIN_SLIDER_HEIGHT);

  return {
    padding,
    header: {
      x: padding,
      y: padding,
      width: sliderWidth,
      height: headerHeight,
    },
    slider: {
      x: sliderX,
      y: sliderY,
      width: sliderWidth,
      height: sliderHeight,
    },
  };
}

export function getHmiScreenBrightnessMinHeight(showHeader = true) {
  return HMI_SCREEN_BRIGHTNESS_PADDING
    + (showHeader ? HMI_SCREEN_BRIGHTNESS_HEADER_HEIGHT + HMI_SCREEN_BRIGHTNESS_HEADER_GAP : 0)
    + HMI_SCREEN_BRIGHTNESS_MIN_SLIDER_HEIGHT
    + HMI_SCREEN_BRIGHTNESS_PADDING;
}

export function getMultiSwitchLayout(width, height, count, hasTitle = true) {
  const titleHeight = hasTitle ? 14 : 0;
  const titleGap = hasTitle ? 14 : 0;
  const paddingX = 16;
  const paddingTop = 16;
  const paddingBottom = 16;
  const contentTop = paddingTop + titleHeight + titleGap;
  const contentWidth = Math.max(width - paddingX * 2, 72);
  const contentHeight = Math.max(height - contentTop - paddingBottom, 40);
  const gap = 10;

  if (count <= 0) {
    return { items: [], top: contentTop, gap };
  }

  if (count === 1) {
    return {
      top: contentTop,
      gap,
      items: [{ x: paddingX, y: contentTop, width: contentWidth, height: contentHeight }],
    };
  }

  if (count === 2) {
    const itemWidth = Math.max(Math.floor((contentWidth - gap) / 2), 48);
    return {
      top: contentTop,
      gap,
      items: [
        { x: paddingX, y: contentTop, width: itemWidth, height: contentHeight },
        { x: paddingX + itemWidth + gap, y: contentTop, width: itemWidth, height: contentHeight },
      ],
    };
  }

  const rowHeight = Math.max(Math.floor((contentHeight - gap) / 2), 32);
  const halfWidth = Math.max(Math.floor((contentWidth - gap) / 2), 48);
  const items = [
    { x: paddingX, y: contentTop, width: halfWidth, height: rowHeight },
    { x: paddingX + halfWidth + gap, y: contentTop, width: halfWidth, height: rowHeight },
  ];

  if (count === 3) {
    items.push({
      x: paddingX,
      y: contentTop + rowHeight + gap,
      width: contentWidth,
      height: rowHeight,
    });
  } else {
    items.push(
      { x: paddingX, y: contentTop + rowHeight + gap, width: halfWidth, height: rowHeight },
      { x: paddingX + halfWidth + gap, y: contentTop + rowHeight + gap, width: halfWidth, height: rowHeight }
    );
  }

  return { top: contentTop, gap, items };
}

export function normalizeLightTileIconPosition(value) {
  return LIGHT_TILE_ICON_POSITION_OPTIONS.some((option) => option.value === value)
    ? value
    : LIGHT_TILE_ICON_POSITION_DEFAULT;
}

export function getLightTileLayout(position) {
  const normalized = normalizeLightTileIconPosition(position);
  const icon = {
    top: normalized.startsWith("top") ? 12 : null,
    right: normalized.endsWith("right") ? 12 : null,
    bottom: normalized.startsWith("bottom") ? 12 : null,
    left: normalized.endsWith("left") ? 12 : null,
    align: normalized === LIGHT_TILE_ICON_POSITION_TOP_RIGHT
      ? "TOP_RIGHT"
      : normalized === LIGHT_TILE_ICON_POSITION_BOTTOM_LEFT
        ? "BOTTOM_LEFT"
        : normalized === LIGHT_TILE_ICON_POSITION_BOTTOM_RIGHT
          ? "BOTTOM_RIGHT"
          : "TOP_LEFT",
    x: normalized.endsWith("right") ? -12 : 12,
    y: normalized.startsWith("bottom") ? -12 : 12,
  };

  const labelsOnTop = normalized.startsWith("bottom");
  return {
    icon,
    title: {
      align: labelsOnTop ? "TOP_LEFT" : "BOTTOM_LEFT",
      x: 12,
      y: labelsOnTop ? 12 : -28,
      top: labelsOnTop ? 12 : null,
      bottom: labelsOnTop ? null : 28,
      left: 12,
    },
    state: {
      align: labelsOnTop ? "TOP_LEFT" : "BOTTOM_LEFT",
      x: 12,
      y: labelsOnTop ? 28 : -12,
      top: labelsOnTop ? 28 : null,
      bottom: labelsOnTop ? null : 12,
      left: 12,
    },
  };
}
