import {
  BOARD_CONFIGS,
  COVER_STYLE_COMPACT,
  DEFAULT_COVER_HEIGHT,
  DEFAULT_COVER_WIDTH,
  DEFAULT_HEIGHT,
  DEFAULT_HMI_SCREEN_BRIGHTNESS_HEIGHT,
  DEFAULT_HMI_SCREEN_BRIGHTNESS_SLIDER_COLOR,
  DEFAULT_HMI_SCREEN_BRIGHTNESS_WIDTH,
  DEFAULT_MULTI_SWITCH_HEIGHT,
  DEFAULT_MULTI_SWITCH_WIDTH,
  LIGHT_DEFAULT_ICON_SIZE,
  DEFAULT_LIGHT_HEIGHT,
  DEFAULT_LIGHT_WIDTH,
  LIGHT_LABEL_HEIGHT,
  LIGHT_LABEL_MIN_WIDTH,
  LIGHT_PAD_ALL,
  LIGHT_PAD_ROW,
  DEFAULT_THERMO_HEIGHT,
  DEFAULT_THERMO_WIDTH,
  DEFAULT_WIDTH,
  getHmiScreenBrightnessMinHeight,
  HMI_SCREEN_BRIGHTNESS_STYLE_TILE,
  LIGHT_ICON_PATHS,
  LIGHT_TILE_ICON_POSITION_DEFAULT,
  LIGHT_STYLE_ICON,
  LIGHT_STYLE_TILE,
  LIGHT_STYLE_SLIDER,
  LIGHT_DEFAULT_PREVIEW_HUE,
  MULTI_SWITCH_STYLE_TILE,
  MULTI_SWITCH_STYLE_LIST,
  getMultiSwitchChannelTitle,
  getEnabledSwitchIndices,
  normalizeLightTileIconPosition,
  isMultiSwitchChannelEnabled,
  THERMO_HYGROMETER_STYLE_COMPACT,
  THERMO_ICON_PATHS,
} from "./constants.js";
import {
  applyComponentInspectorChanges,
  applyComponentInspectorCommit,
  createEntityDraft,
  defaultHeightForType,
  defaultTitleForType,
  defaultWidthForType,
  getComponentDefinition,
  getEntityCapability,
  getInspectorState,
  minHeightForType,
  minWidthForType,
  normalizeStyle,
  normalizeType,
  populateComponentInspector,
  shouldRenderWidgetTitle,
  usesTopAlignedTitle,
} from "./components/registry.js";

export {
  applyComponentInspectorChanges,
  applyComponentInspectorCommit,
  createEntityDraft,
  defaultHeightForType,
  defaultTitleForType,
  defaultWidthForType,
  getEntityCapability,
  getInspectorState,
  minHeightForType,
  minWidthForType,
  normalizeStyle,
  normalizeType,
  populateComponentInspector,
  shouldRenderWidgetTitle,
  usesTopAlignedTitle,
} from "./components/registry.js";

export const initialSpec = {
  screens: [],
};

const DEFAULT_SWIPE_DIRECTION = "horizontal";

function createScreenId() {
  return `screen-${Math.random().toString(36).slice(2, 11)}`;
}

function defaultScreenName(index) {
  return `Screen ${index}`;
}

export function normalizeSwipeDirection(value) {
  return String(value || "").trim().toLowerCase() === "vertical" ? "vertical" : DEFAULT_SWIPE_DIRECTION;
}

export function createInitialState() {
  const screens = normalizeScreens(initialSpec.screens);
  const state = {
    screens,
    currentScreenId: screens[0]?.id ?? null,
    entities: screens[0]?.entities ?? [],
    selectedId: null,
    drag: null,
    board: "nextion_35",
    rotation: 0,
    screenBgColor: "0xF3EFE7",
    swipeDirection: DEFAULT_SWIPE_DIRECTION,
    deviceName: "onx3248g035",
    friendlyName: "",
    wifiSsid: "",
    wifiPassword: "",
    canvasWidth: BOARD_CONFIGS.nextion_35.width,
    canvasHeight: BOARD_CONFIGS.nextion_35.height,
  };
  updateCanvasDimensions(state);
  state.selectedId = state.entities[0]?.id ?? null;
  return state;
}

export function sanitizeDeviceName(value) {
  let normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalized) {
    normalized = "esphome-device";
  }

  return normalized;
}

export function getDeviceNameValidation(value) {
  const raw = String(value ?? "");
  const trimmed = raw.trim();
  const sanitized = sanitizeDeviceName(raw);
  const isValid = trimmed.length > 0 && /^[a-z0-9_-]+$/.test(trimmed);

  if (!trimmed) {
    return {
      isValid: false,
      sanitized,
      message: "Device name is required. Supported characters: lowercase a-z, 0-9, '-' and '_'.",
    };
  }

  if (!isValid) {
    return {
      isValid: false,
      sanitized,
      message: `Supported characters: lowercase a-z, 0-9, '-' and '_'. Generated YAML will use \"${sanitized}\".`,
    };
  }

  return {
    isValid: true,
    sanitized,
    message: "",
  };
}

export function generateSpecYaml(state) {
  const lines = [];
  const deviceName = sanitizeDeviceName(state.deviceName);
  const screens = normalizeScreens(state.screens, state.canvasWidth, state.canvasHeight);
  lines.push(`base_config: ${state.board}`);
  if (state.rotation !== 0) {
    lines.push(`rotation: ${state.rotation}`);
  }
  lines.push("device:");
  lines.push(`  name: ${quoteYaml(deviceName)}`);
  if (state.friendlyName) {
    lines.push(`  friendly_name: ${quoteYaml(state.friendlyName)}`);
  }
  lines.push("wifi:");
  lines.push(`  ssid: ${quoteYaml(state.wifiSsid)}`);
  lines.push(`  password: ${quoteYaml(state.wifiPassword)}`);
  lines.push("screen:");
  lines.push(`  bg_color: ${quoteYaml(state.screenBgColor)}`);
  lines.push(`  swipe_direction: ${quoteYaml(normalizeSwipeDirection(state.swipeDirection))}`);
  lines.push("screens:");
  screens.forEach((screen, index) => {
    lines.push(`  - name: ${quoteYaml(screen.name || defaultScreenName(index + 1))}`);
    lines.push("    entities:");
    if (!screen.entities.length) {
      lines.push("      []");
      return;
    }
    screen.entities.forEach((entity) => appendEntityYaml(lines, entity, "      "));
  });
  return `${lines.join("\n")}\n`;
}

function appendEntityYaml(lines, entity, indent = "  ") {
  const propIndent = `${indent}  `;
  const definition = getComponentDefinition(entity.type);
  if (entity.type === "hmi_screen_brightness") {
    lines.push(`${indent}- type: ${entity.type}`);
  } else if (entity.type === "switch" || entity.type === "light" || entity.type === "cover") {
    lines.push(`${indent}- entityid: ${quoteYaml(entity.entityids[0])}`);
  } else {
    lines.push(`${indent}- entityids:`);
    entity.entityids.forEach((entityId) => {
      lines.push(`${propIndent}    - ${quoteYaml(entityId)}`);
    });
    lines.push(`${propIndent}type: ${entity.type}`);
  }
  if (entity.type !== "hmi_screen_brightness" && entity.type !== "switch" && entity.type !== "light" && entity.type !== "cover") {
    // already emitted above for multi-value widgets
  } else if (entity.type !== "hmi_screen_brightness") {
    lines.push(`${propIndent}type: ${entity.type}`);
  }
  lines.push(`${propIndent}props:`);
  lines.push(`${propIndent}  style: ${quoteYaml(normalizeStyle(entity.type, entity.props.style))}`);
  lines.push(`${propIndent}  x: ${entity.props.x}`);
  lines.push(`${propIndent}  y: ${entity.props.y}`);
  lines.push(`${propIndent}  width: ${entity.props.width}`);
  if (!hasFixedHeight(entity.type, entity.props.style)) {
    lines.push(`${propIndent}  height: ${entity.props.height}`);
  }
  lines.push(`${propIndent}  title: ${quoteYaml(entity.props.title)}`);
  definition.appendSpecProps?.(lines, entity, propIndent, {
    normalizeIconSource,
    normalizeStyle,
    quoteYaml,
  });
  if (entity.props.active_bg_color) {
    lines.push(`${propIndent}  active_bg_color: ${quoteYaml(entity.props.active_bg_color)}`);
  }
}

export function parseSpecYaml(source) {
  const rows = source
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, "  "))
    .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
    .map((line) => ({
      raw: line,
      trimmed: line.trim(),
      indent: line.match(/^ */)?.[0].length ?? 0,
    }));

  const screens = [];
  const topLevelEntities = [];
  let currentScreen = null;
  let currentEntity = null;
  let currentEntityTarget = topLevelEntities;
  let inProps = false;
  let inEntityIds = false;
  let inScreen = false;
  let inWifi = false;
  let inDevice = false;

  let rotation = 0;
  let board = null;
  const screen = {};
  const wifi = {};
  const device = {};

  const pushCurrentEntity = () => {
    if (!currentEntity) {
      return;
    }
    currentEntityTarget.push(currentEntity);
    currentEntity = null;
    inProps = false;
    inEntityIds = false;
  };

  const pushCurrentScreen = () => {
    if (!currentScreen) {
      return;
    }
    pushCurrentEntity();
    currentScreen.entities = Array.isArray(currentScreen.entities) ? currentScreen.entities : [];
    screens.push(currentScreen);
    currentScreen = null;
  };

  rows.forEach(({ trimmed, indent }) => {
    if (indent === 0 && trimmed.startsWith("base_config:")) {
      pushCurrentScreen();
      const nextBoard = readYamlValue(trimmed.slice("base_config:".length).trim());
      board = BOARD_CONFIGS[nextBoard] ? nextBoard : null;
      return;
    }
    if (indent === 0 && trimmed.startsWith("rotation:")) {
      pushCurrentScreen();
      rotation = parseInt(trimmed.slice("rotation:".length).trim(), 10) || 0;
      return;
    }
    if (indent === 0 && trimmed === "device:") {
      pushCurrentScreen();
      inDevice = true;
      inWifi = false;
      inScreen = false;
      return;
    }
    if (inDevice && indent === 2 && trimmed.includes(":")) {
      const separatorIndex = trimmed.indexOf(":");
      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      device[key] = readYamlValue(rawValue);
      return;
    }
    if (indent === 0 && trimmed === "wifi:") {
      pushCurrentScreen();
      inDevice = false;
      inWifi = true;
      inScreen = false;
      return;
    }
    if (inWifi && indent === 2 && trimmed.includes(":")) {
      const separatorIndex = trimmed.indexOf(":");
      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      wifi[key] = readYamlValue(rawValue);
      return;
    }
    if (indent === 0 && trimmed === "screen:") {
      pushCurrentScreen();
      inDevice = false;
      inWifi = false;
      inScreen = true;
      return;
    }
    if (inScreen && indent === 2 && trimmed.includes(":")) {
      const separatorIndex = trimmed.indexOf(":");
      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      screen[key] = readYamlValue(rawValue);
      return;
    }
    if (indent === 0 && trimmed === "entities:") {
      pushCurrentScreen();
      inDevice = false;
      inWifi = false;
      inScreen = false;
      currentEntityTarget = topLevelEntities;
      return;
    }
    if (indent === 0 && trimmed === "screens:") {
      pushCurrentScreen();
      inDevice = false;
      inWifi = false;
      inScreen = false;
      return;
    }
    if (indent === 2 && trimmed.startsWith("- ")) {
      pushCurrentScreen();
      currentScreen = {
        id: createScreenId(),
        name: defaultScreenName(screens.length + 1),
        entities: [],
      };
      currentEntityTarget = currentScreen.entities;
      const rest = trimmed.slice(2).trim();
      if (rest && rest.includes(":")) {
        const separatorIndex = rest.indexOf(":");
        const key = rest.slice(0, separatorIndex).trim();
        const rawValue = rest.slice(separatorIndex + 1).trim();
        if (key === "name") {
          currentScreen.name = String(readYamlValue(rawValue) || currentScreen.name);
        }
      }
      return;
    }
    if (currentScreen && indent === 4 && trimmed.startsWith("name:")) {
      currentScreen.name = String(readYamlValue(trimmed.slice("name:".length).trim()) || currentScreen.name);
      return;
    }
    if (currentScreen && indent === 4 && trimmed === "entities:") {
      pushCurrentEntity();
      currentEntityTarget = currentScreen.entities;
      return;
    }
    if (trimmed === "[]") {
      return;
    }
    if (trimmed.startsWith("- entityid:")) {
      pushCurrentEntity();
      currentEntity = {
        entityid: readYamlValue(trimmed.slice("- entityid:".length).trim()),
        type: "switch",
        props: {},
      };
      inProps = false;
      inEntityIds = false;
      return;
    }
    if (trimmed.startsWith("- type:")) {
      pushCurrentEntity();
      currentEntity = {
        entityids: [],
        type: readYamlValue(trimmed.slice("- type:".length).trim()),
        props: {},
      };
      inProps = false;
      inEntityIds = false;
      return;
    }
    if (trimmed === "- entityids:") {
      pushCurrentEntity();
      currentEntity = {
        entityids: [],
        type: "switch",
        props: {},
      };
      inProps = false;
      inEntityIds = true;
      return;
    }
    if (!currentEntity) {
      throw new Error(`Unsupported line: ${trimmed}`);
    }
    if (inEntityIds && trimmed.startsWith("- ")) {
      currentEntity.entityids.push(readYamlValue(trimmed.slice(2).trim()));
      return;
    }
    if (trimmed.startsWith("type:")) {
      currentEntity.type = readYamlValue(trimmed.slice("type:".length).trim());
      inEntityIds = false;
      return;
    }
    if (trimmed === "props:") {
      inProps = true;
      inEntityIds = false;
      return;
    }
    if (inProps && trimmed.includes(":")) {
      const separatorIndex = trimmed.indexOf(":");
      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      currentEntity.props[key] = readYamlValue(rawValue);
      return;
    }
    throw new Error(`Unsupported line: ${trimmed}`);
  });

  pushCurrentScreen();

  const normalizedScreens = screens.length
    ? screens
    : [{ name: defaultScreenName(1), entities: topLevelEntities }];

  return { board, screens: normalizedScreens, entities: topLevelEntities, rotation, screen, wifi, device };
}

export function normalizeEntities(entities, canvasWidth = BOARD_CONFIGS.nextion_35.width, canvasHeight = BOARD_CONFIGS.nextion_35.height) {
  return entities.map((entity) => normalizeEntity(entity, canvasWidth, canvasHeight));
}

export function createScreenDraft(index, canvasWidth = BOARD_CONFIGS.nextion_35.width, canvasHeight = BOARD_CONFIGS.nextion_35.height) {
  return normalizeScreen(
    {
      name: defaultScreenName(index),
      entities: [],
    },
    index,
    canvasWidth,
    canvasHeight
  );
}

export function normalizeScreen(screen, index = 1, canvasWidth = BOARD_CONFIGS.nextion_35.width, canvasHeight = BOARD_CONFIGS.nextion_35.height) {
  return {
    id: String(screen?.id || createScreenId()),
    name: String(screen?.name || defaultScreenName(index)).trim() || defaultScreenName(index),
    entities: normalizeEntities(screen?.entities || [], canvasWidth, canvasHeight),
  };
}

export function normalizeScreens(screens, canvasWidth = BOARD_CONFIGS.nextion_35.width, canvasHeight = BOARD_CONFIGS.nextion_35.height) {
  if (Array.isArray(screens) && screens.length) {
    return screens.map((screen, index) => normalizeScreen(screen, index + 1, canvasWidth, canvasHeight));
  }
  return [createScreenDraft(1, canvasWidth, canvasHeight)];
}

export function normalizeEntity(entity, canvasWidth = BOARD_CONFIGS.nextion_35.width, canvasHeight = BOARD_CONFIGS.nextion_35.height) {
  const type = normalizeType(entity.type || "switch");
  const props = entity.props || {};
  const style = normalizeStyle(type, props.style);
  const width = clampNumber(props.width ?? defaultWidthForType(type, style), minWidthForType(type, style), canvasWidth);
  const fixedHeight = hasFixedHeight(type, style);
  const height = fixedHeight
    ? defaultHeightForType(type, style, props)
    : clampNumber(props.height ?? defaultHeightForType(type, style, props), minHeightForType(type, style, props), canvasHeight);
  const entityids = normalizeEntityIds(entity, type);
  return {
    id: `id-${Math.random().toString(36).slice(2, 11)}`,
    type,
    entityids,
    props: {
      x: clamp(clampNumber(props.x ?? 0, 0, canvasWidth), 0, canvasWidth - width),
      y: clamp(clampNumber(props.y ?? 0, 0, canvasHeight), 0, canvasHeight - height),
      width,
      height,
      title: String(props.title || defaultTitleForType(type, entityids)),
      style,
      channel_1_title: type === "multi_switch" ? String(props.channel_1_title ?? props.channel1_title ?? "Switch 1") : "",
      channel_2_title: type === "multi_switch" ? String(props.channel_2_title ?? props.channel2_title ?? "Switch 2") : "",
      channel_3_title: type === "multi_switch" ? String(props.channel_3_title ?? props.channel3_title ?? "Switch 3") : "",
      channel_4_title: type === "multi_switch" ? String(props.channel_4_title ?? props.channel4_title ?? "Switch 4") : "",
      channel_1_enabled: type === "multi_switch" ? !!(props.channel_1_enabled ?? props.channel1_enabled ?? true) : false,
      channel_2_enabled: type === "multi_switch" ? !!(props.channel_2_enabled ?? props.channel2_enabled ?? true) : false,
      channel_3_enabled: type === "multi_switch" ? !!(props.channel_3_enabled ?? props.channel3_enabled ?? false) : false,
      channel_4_enabled: type === "multi_switch" ? !!(props.channel_4_enabled ?? props.channel4_enabled ?? false) : false,
      temp_icon: normalizeIconSource(
        props.temp_icon || props.temp_image || props.temperature_icon || THERMO_ICON_PATHS.temp
      ),
      hum_icon: normalizeIconSource(
        props.hum_icon || props.humidity_icon || props.hum_image || THERMO_ICON_PATHS.hum
      ),
      icon: normalizeIconSource(
        props.icon || props.icon_image || props.on_icon || props.on_image || props.off_icon || props.off_image || props.icon_on || props.icon_off || LIGHT_ICON_PATHS.on
      ),
      tile_icon_position: normalizeLightTileIconPosition(
        props.tile_icon_position || props.icon_position || props.icon_align || LIGHT_TILE_ICON_POSITION_DEFAULT
      ),
      color_temp: !!(props.color_temp ?? props.colorTemp ?? false),
      hue_360: !!(props.hue_360 ?? props.hue360 ?? props.hue ?? false),
      preview_color_temp: clampNumber(props.preview_color_temp ?? props.previewColorTemp ?? 50, 0, 100),
      preview_hue: clampNumber(props.preview_hue ?? props.previewHue ?? LIGHT_DEFAULT_PREVIEW_HUE, 0, 360),
      active_bg_color: normalizeOptionalColor(props.active_bg_color || props.active_color || props.on_color),
      show_header: type === "hmi_screen_brightness" ? props.show_header !== false : true,
      slider_color: type === "hmi_screen_brightness"
        ? normalizeYamlColor(props.slider_color || props.sliderColor || DEFAULT_HMI_SCREEN_BRIGHTNESS_SLIDER_COLOR)
        : "",
    },
  };
}

function getLightSliderExtraRowCount(props = {}) {
  return Number(!!props.color_temp) + Number(!!props.hue_360);
}

export function updateCanvasDimensions(state) {
  const config = BOARD_CONFIGS[state.board];
  const isRotated = state.rotation === 90 || state.rotation === 270;
  state.canvasWidth = isRotated ? config.height : config.width;
  state.canvasHeight = isRotated ? config.width : config.height;

  const screens = Array.isArray(state.screens) ? state.screens : [];
  screens.forEach((screen) => {
    screen.entities.forEach((entity) => {
      entity.props.width = clamp(entity.props.width, minWidthForType(entity.type), state.canvasWidth);
      entity.props.height = hasFixedHeight(entity.type, entity.props.style)
        ? defaultHeightForType(entity.type, entity.props.style, entity.props)
        : clamp(
            entity.props.height,
            minHeightForType(entity.type, entity.props.style, entity.props),
            state.canvasHeight
          );
      entity.props.x = clamp(entity.props.x, 0, state.canvasWidth - entity.props.width);
      entity.props.y = clamp(entity.props.y, 0, state.canvasHeight - entity.props.height);
    });
  });

  const currentScreen = screens.find((item) => item.id === state.currentScreenId) || screens[0] || null;
  state.currentScreenId = currentScreen?.id ?? null;
  state.entities = currentScreen?.entities ?? [];
}

export function normalizeEntityIds(entity, type) {
  const capability = getEntityCapability(type);
  const defaults = capability.entityFields.map((field, index) => field.defaultValue(index + 1));
  const ids = Array.isArray(entity.entityids)
    ? entity.entityids
    : Array.isArray(entity.entity_ids)
      ? entity.entity_ids
      : [];

  if (capability.entityFields.length === 1) {
    return [String(ids[0] || entity.entityid || entity.entity_id || defaults[0]).trim()];
  }

  return capability.entityFields.map((field, index) =>
    String(ids[index] || (index === 0 ? entity.entityid : "") || defaults[index]).trim()
  );
}

export function defaultTitleForEntity(entity) {
  return defaultTitleForType(entity.type, entity.entityids);
}

export function normalizeOptionalColor(value) {
  const text = String(value || "").trim();
  return text || "";
}

export function getEffectiveFriendlyName(deviceName, friendlyName) {
  const explicitFriendlyName = String(friendlyName || "").trim();
  if (explicitFriendlyName) {
    return explicitFriendlyName;
  }
  return sanitizeDeviceName(deviceName).toUpperCase();
}

export function normalizeYamlColor(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "0xF3EFE7";
  }
  if (/^0x[0-9a-f]{6}$/i.test(text)) {
    return `0x${text.slice(2).toUpperCase()}`;
  }
  if (/^#[0-9a-f]{6}$/i.test(text)) {
    return `0x${text.slice(1).toUpperCase()}`;
  }
  return text;
}

export function yamlColorToCss(value) {
  const normalized = normalizeYamlColor(value);
  if (/^0x[0-9a-f]{6}$/i.test(normalized)) {
    return `#${normalized.slice(2)}`;
  }
  return normalized;
}

export function yamlColorToHtml(value) {
  const css = yamlColorToCss(value);
  return /^#[0-9a-f]{6}$/i.test(css) ? css : "#f3efe7";
}

export function htmlColorToYaml(value) {
  const text = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(text)) {
    return `0x${text.slice(1).toUpperCase()}`;
  }
  return "0xF3EFE7";
}

export function normalizeIconSource(value) {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }

  const normalized = text.replace(/\\/g, "/");
  if (normalized === "temp.png" || normalized === "./temp.png") {
    return THERMO_ICON_PATHS.temp;
  }
  if (normalized === "hum.png" || normalized === "./hum.png") {
    return THERMO_ICON_PATHS.hum;
  }
  if (normalized === "light.png" || normalized === "./light.png" || normalized === "on.png" || normalized === "./on.png") {
    return LIGHT_ICON_PATHS.on;
  }
  return text;
}

export function hasFixedHeight(type) {
  return false;
}

export function supportsHeightResize(type) {
  return !hasFixedHeight(type);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return min;
  }
  return clamp(Math.round(numeric), min, max);
}

export function readPendingNumber(value) {
  if (value === "") {
    return null;
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return Math.round(numeric);
}

export function readYamlValue(rawValue) {
  if (rawValue.startsWith('"') && rawValue.endsWith('"')) {
    return rawValue.slice(1, -1).replace(/\\"/g, '"');
  }
  if (rawValue.startsWith("'") && rawValue.endsWith("'")) {
    return rawValue.slice(1, -1).replace(/\\'/g, "'");
  }
  if (/^-?\d+$/.test(rawValue)) {
    return Number(rawValue);
  }
  if (rawValue === "true") {
    return true;
  }
  if (rawValue === "false") {
    return false;
  }
  return rawValue;
}

export function quoteYaml(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
