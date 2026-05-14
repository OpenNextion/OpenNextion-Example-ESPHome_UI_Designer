import {
  DEFAULT_BUTTON_BG_COLOR,
  getHmiScreenBrightnessLayout,
  getMultiSwitchChannelTitle,
  getMultiSwitchLayout,
  getEnabledSwitchIndices,
  getLightTileLayout,
  isMultiSwitchChannelEnabled,
  LIGHT_ICON_PATHS,
  LIGHT_STYLE_TILE,
  LIGHT_STYLE_SLIDER,
  LIGHT_TILE_ICON_BUBBLE_OPACITY,
  MULTI_SWITCH_STYLE_TILE,
  MULTI_SWITCH_STYLE_LIST,
  SWITCH_HEIGHT,
  SWITCH_WIDTH,
  THERMO_ICON_PATHS,
} from "./constants.js";
import {
  getEffectiveFriendlyName,
  normalizeEntities,
  normalizeScreens,
  normalizeOptionalColor,
  normalizeYamlColor,
  normalizeSwipeDirection,
  quoteYaml,
} from "./spec.js";
import { renderEsphomeWidgetByComponent } from "./components/esphome/registry.js";

const UI_FONT_BODY = "montserrat_14";
const UI_FONT_VALUE = "montserrat_16";

export function renderCombinedYaml(state) {
  const screens = normalizeScreens(state.screens, state.canvasWidth, state.canvasHeight);
  const scopedScreens = screens.map((screen) => ({
    ...screen,
    entities: normalizeEntities(screen.entities, state.canvasWidth, state.canvasHeight).map((entity) => ({
      ...entity,
      __screenKey: screen.id,
    })),
  }));
  const entities = scopedScreens.flatMap((screen) => screen.entities);
  const header = [
    "# This file is auto-generated.",
    `# Base config: ${state.board}.yaml`,
    "# UI config: browser editor",
    "# This is a full ESPHome config assembled locally in the browser.",
  ];

  const body = [
    renderBaseConfigYaml(state, entities).trimEnd(),
    `  bg_color: ${state.screenBgColor}`,
    "  widgets:",
    indentLines(renderScreenWidgetBlock(scopedScreens, normalizeSwipeDirection(state.swipeDirection)) || "[]", 4),
    "",
    "switch:",
    indentLines(renderSwitchBlock(entities) || "[]", 2),
    "",
    "sensor:",
    indentLines(renderSensorBlock(entities) || "[]", 2),
    "",
    "text_sensor:",
    indentLines(renderTextSensorBlock(entities) || "[]", 2),
    "",
    "image:",
    indentLines(renderImageBlock(entities) || "[]", 2),
    "",
  ];
  return `${header.join("\n")}\n${body.join("\n")}`;
}

function indentLines(text, spaces) {
  const prefix = " ".repeat(spaces);
  return String(text)
      .split("\n")
      .map((line) => (line ? `${prefix}${line}` : line))
      .join("\n");
}

function sanitizeId(value) {
  let slug = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  if (!slug) {
    throw new Error("Entity ID produced an empty sanitized ID");
  }
  if (/^\d/.test(slug)) {
    slug = `entity_${slug}`;
  }
  return slug;
}

function getEntitySlug(entity) {
  const parts = [entity.__screenKey || "", entity.type, entity.id || "", ...(entity.entityids || [])];
  if (!(entity.entityids || []).length && entity.props?.title) {
    parts.push(entity.props.title);
  }
  return sanitizeId(parts.join("_"));
}

function getContainerId(entity) {
  return `card_${getEntitySlug(entity)}`;
}

function getHaSwitchId(entity, index) {
  return `ha_${getEntitySlug(entity)}_${index + 1}`;
}

function getHaTextSensorId(entity, index) {
  return `ha_text_${getEntitySlug(entity)}_${index + 1}`;
}

function getWidgetId(entity, index) {
  return `widget_${getEntitySlug(entity)}_${index + 1}`;
}

function getValueLabelId(entity, index) {
  return `label_${getEntitySlug(entity)}_${index + 1}`;
}

function getBacklightValueLabelId(entity) {
  return `label_backlight_${getEntitySlug(entity)}`;
}


function getThermoImageId(entity, kind) {
  return `${kind}_${getEntitySlug(entity)}_icon`;
}

function getLightImageId(entity) {
  return `light_${getEntitySlug(entity)}_icon`;
}

function getCoverActionImageId(entity, action) {
  return `cover_${action}_${getEntitySlug(entity)}_icon`;
}

function getLightStateLabelId(entity) {
  return `light_state_${getEntitySlug(entity)}`;
}

function getCoverPositionSensorId(entity) {
  return `cover_position_${getEntitySlug(entity)}`;
}

function getCoverStateTextSensorId(entity) {
  return `cover_state_${getEntitySlug(entity)}`;
}

function getCoverSyncingFlagId(entity) {
  return `cover_syncing_${getEntitySlug(entity)}`;
}

function getScreenTileId(screen, index) {
  return `screen_tile_${sanitizeId(screen.name || `screen_${index + 1}`)}`;
}

function renderScreenWidgetBlock(screens, swipeDirection) {
  const direction = swipeDirection === "vertical" ? "VER" : "HOR";
  const tiles = screens.map((screen, index) => {
    const row = direction === "VER" ? index : 0;
    const column = direction === "HOR" ? index : 0;
    const widgets = screen.entities.map((entity) => renderWidget(entity)).join("\n");
    return `        - id: ${getScreenTileId(screen, index)}
          row: ${row}
          column: ${column}
          dir: ${direction}
          bg_opa: TRANSP
          border_width: 0
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
${widgets ? indentLines(widgets, 12) : "            []"}`;
  }).join("\n");

  return `- tileview:
    id: main_tileview
    width: 100%
    height: 100%
    pad_all: 0
    border_width: 0
    bg_opa: TRANSP
    scrollbar_mode: "OFF"
    tiles:
${tiles}`;
}

function getLightColorTempSensorId(entity) {
  return `ha_color_temp_${getEntitySlug(entity)}`;
}

function getLightMinColorTempSensorId(entity) {
  return `ha_min_color_temp_${getEntitySlug(entity)}`;
}

function getLightMaxColorTempSensorId(entity) {
  return `ha_max_color_temp_${getEntitySlug(entity)}`;
}

function getLightRgbSensorId(entity) {
  return `ha_rgb_${getEntitySlug(entity)}`;
}

function getLightHueWrapperId(entity) {
  return `${getWidgetId(entity, 0)}_hue_wrapper`;
}

function getLightHuePillId(entity) {
  return `${getWidgetId(entity, 0)}_hue_pill`;
}

function getLightHueSliderId(entity) {
  return `${getWidgetId(entity, 0)}_hue`;
}

function renderHueRgbStatements(pctExpr) {
  return `float pct = ${pctExpr};
if (pct < 0.0f) pct = 0.0f;
if (pct > 1.0f) pct = 1.0f;
struct RGB { float r; float g; float b; };
static const RGB stops[] = {
  {255.0f,   0.0f,   0.0f},
  {255.0f, 255.0f,   0.0f},
  {  0.0f, 255.0f,   0.0f},
  {  0.0f, 255.0f, 255.0f},
  {  0.0f,   0.0f, 255.0f},
  {255.0f,   0.0f, 255.0f}
};
float pos = pct * 5.0f;
if (pos >= 5.0f) pos = 4.9999f;
int index = (int) pos;
float fract = pos - index;
float r = stops[index].r + (stops[index + 1].r - stops[index].r) * fract;
float g = stops[index].g + (stops[index + 1].g - stops[index].g) * fract;
float b = stops[index].b + (stops[index + 1].b - stops[index].b) * fract;`;
}

function indentCodeBlock(text, spaces) {
  const prefix = " ".repeat(spaces);
  return String(text).split("\n").map((line) => `${prefix}${line}`).join("\n");
}

function renderLightAccentColorLambda(entity) {
  if (entity.props.hue_360) {
    return `${renderHueRgbStatements(`(float) lv_slider_get_value(id(${getLightHueSliderId(entity)})) / 100.0f`)}
return lv_color_make((uint8_t) r, (uint8_t) g, (uint8_t) b);`;
  }

  return `float val = ${entity.props.color_temp ? `(float)lv_slider_get_value(id(${getWidgetId(entity, 0)}_ct)) / 100.0f` : `0.5f`};
int r = (int)(213 + (255 - 213) * val);
int g = (int)(213 + (137 - 213) * val);
int b = (int)(225 + (14 - 225) * val);
return lv_color_make(r, g, b);`;
}

function getMetricCaption(index) {
  return index === 0 ? "Temp" : "Humi";
}

function getMetricSuffix(index) {
  return index === 0 ? "°C" : "%";
}

function buttonInactiveBgColor(entity) {
  return normalizeOptionalColor(entity.props.inactive_bg_color) || DEFAULT_BUTTON_BG_COLOR;
}

function buttonActiveBgColor(entity) {
  return normalizeYamlColor(entity.props.active_bg_color) || "0xeaaa78";
}

function getBoardTransform(model, rotation) {
  const mappings = {
    st7796: {
      0: { width: 320, height: 480, dSwap: false, dMirX: true, dMirY: false, tSwap: false, tMirX: false, tMirY: false },
      90: { width: 480, height: 320, dSwap: true, dMirX: false, dMirY: false, tSwap: true, tMirX: false, tMirY: true },
      180: { width: 320, height: 480, dSwap: false, dMirX: false, dMirY: true, tSwap: false, tMirX: true, tMirY: true },
      270: { width: 480, height: 320, dSwap: true, dMirX: true, dMirY: true, tSwap: true, tMirX: true, tMirY: false },
    },
    st7789v: {
      0: { width: 240, height: 320, dSwap: false, dMirX: false, dMirY: false, tSwap: false, tMirX: false, tMirY: false },
      90: { width: 320, height: 240, dSwap: true, dMirX: true, dMirY: false, tSwap: true, tMirX: false, tMirY: true },
      180: { width: 240, height: 320, dSwap: false, dMirX: true, dMirY: true, tSwap: false, tMirX: true, tMirY: true },
      270: { width: 320, height: 240, dSwap: true, dMirX: false, dMirY: true, tSwap: true, tMirX: true, tMirY: false },
    },
  };
  return mappings[model]?.[rotation] || mappings[model]?.[0];
}

function renderBaseConfigYaml(state, entities = []) {
  const templates = {
    nextion_35: renderNextion35Base,
    nextion_28: renderNextion28Base,
  };
  const renderer = templates[state.board];
  if (!renderer) {
    throw new Error(`Unsupported board: ${state.board}`);
  }
  return renderer(state.rotation, {
    deviceName: state.deviceName,
    friendlyName: getEffectiveFriendlyName(state.deviceName, state.friendlyName),
    ssid: state.wifiSsid,
    password: state.wifiPassword,
  }, entities);
}

function renderAdditionalGlobalsBlock(entities) {
  const coverGlobals = entities
      .filter((entity) => entity.type === "cover")
      .map((entity) => `  - id: ${getCoverSyncingFlagId(entity)}
    type: bool
    restore_value: no
    initial_value: "false"`)
      .join("\n");

  return coverGlobals ? `\n${coverGlobals}` : "";
}

function renderBacklightSyncLambda(entities) {
  const widgets = entities.filter((entity) => entity.type === "hmi_screen_brightness");
  if (!widgets.length) {
    return "";
  }

  const statements = [
    "float state = id(backlight).remote_values.get_state();",
    "float brightness = id(backlight).remote_values.get_brightness();",
    "int pct = (int) roundf(state * brightness * 100.0f);",
    "if (pct < 10) pct = 10;",
    "if (pct > 100) pct = 100;",
    "id(backlight_percent) = pct;",
  ];

  widgets.forEach((entity) => {
    const wrapperId = `${getWidgetId(entity, 0)}_wrapper`;
    const fillId = `${getWidgetId(entity, 0)}_fill`;
    const pillId = `${getWidgetId(entity, 0)}_pill`;
    statements.push(`{
  auto wrapper = id(${wrapperId});
  int width = lv_obj_get_width(wrapper);
  int fill_w = (int)((width * pct) / 100.0f);
  if (fill_w < 0) fill_w = 0;
  if (fill_w > width) fill_w = width;
  lv_slider_set_value(id(${getWidgetId(entity, 0)}), pct, LV_ANIM_OFF);
  lv_obj_set_width(id(${fillId}), fill_w);
  lv_obj_set_x(id(${pillId}), fill_w - 10 < 0 ? 0 : fill_w - 10);
}`);
    if (entity.props.show_header !== false) {
      statements.push(`lv_label_set_text_fmt(id(${getBacklightValueLabelId(entity)}), "%d%%", pct);`);
    }
  });

  return statements.join("\n");
}

function renderNextion35Base(rotation, wifi, entities = []) {
  const t = getBoardTransform("st7796", rotation);
  const backlightSyncLambda = renderBacklightSyncLambda(entities);
  return `substitutions:
  device_name: ${quoteYaml(wifi.deviceName)}
  friendly_name: ${quoteYaml(wifi.friendlyName)}
  wifi_ssid: ${quoteYaml(wifi.ssid)}
  wifi_password: ${quoteYaml(wifi.password)}

esphome:
  name: \${device_name}
  friendly_name: \${friendly_name}
  comment: "ESPHome config for ONX3248G035 / ESP32-S3 + ST7796U + CST816"
  on_boot:
    priority: 800
    then:
      - light.turn_on:
          id: backlight
          brightness: !lambda "return id(backlight_percent) / 100.0f;"

esp32:
  board: esp32-s3-devkitc-1
  variant: esp32s3
  framework:
    type: esp-idf

psram:
  mode: octal
  speed: 40MHz

logger:
  baud_rate: 0
  level: WARN

api:

ota:
  - platform: esphome

wifi:
  ssid: \${wifi_ssid}
  password: \${wifi_password}
  ap:
    ssid: "\${friendly_name} Fallback"

web_server:
  port: 80

i2c:
  sda: GPIO8
  scl: GPIO7
  scan: true
  frequency: 400kHz

spi:
  clk_pin: GPIO5
  mosi_pin: GPIO1

output:
  - platform: ledc
    id: backlight_pwm
    pin: GPIO6
    frequency: 10000Hz

light:
  - platform: monochromatic
    id: backlight
    name: "\${friendly_name} Backlight"
    output: backlight_pwm
    restore_mode: ALWAYS_ON${backlightSyncLambda ? `
    on_state:
      then:
        - lambda: |-
${indentCodeBlock(backlightSyncLambda, 12)}` : ""}

globals:
  - id: backlight_percent
    type: int
    restore_value: no
    initial_value: "50"${renderAdditionalGlobalsBlock(entities)}

display:
  - platform: mipi_spi
    id: main_display
    model: ST7796
    dc_pin: GPIO3
    cs_pin: GPIO2
    dimensions:
      width: ${t.width}
      height: ${t.height}
    data_rate: 80MHz
    color_order: bgr
    invert_colors: false
    auto_clear_enabled: false
    update_interval: never
    transform:
      swap_xy: ${String(t.dSwap)}
      mirror_x: ${String(t.dMirX)}
      mirror_y: ${String(t.dMirY)}
    init_sequence:
      - [0x11]
      - delay 120ms
      - [0xF0, 0xC3]
      - [0xF0, 0x96]
      - [0xB4, 0x01]
      - [0xB7, 0xC6]
      - [0xC0, 0x80, 0x45]
      - [0xC1, 0x13]
      - [0xC2, 0xA7]
      - [0xC5, 0x0A]
      - [0xE8, 0x40, 0x8A, 0x00, 0x00, 0x29, 0x19, 0xA5, 0x33]
      - [0xE0, 0xD0, 0x08, 0x0F, 0x06, 0x06, 0x33, 0x30, 0x33, 0x47, 0x17, 0x13, 0x13, 0x2B, 0x31]
      - [0xE1, 0xD0, 0x0A, 0x11, 0x0B, 0x09, 0x07, 0x2F, 0x33, 0x47, 0x38, 0x15, 0x16, 0x2C, 0x32]
      - [0xF0, 0x3C]
      - [0xF0, 0x69]
      - delay 120ms
      - [0x21]
      - [0x29]

touchscreen:
  - platform: cst816
    id: main_touch
    display: main_display
    transform:
      swap_xy: ${String(t.tSwap)}
      mirror_x: ${String(t.tMirX)}
      mirror_y: ${String(t.tMirY)}
    update_interval: 16ms

lvgl:
  buffer_size: 25%
  default_font: ${UI_FONT_BODY}
  displays:
    - main_display
  touchscreens:
    - touchscreen_id: main_touch
      long_press_time: 300ms
      long_press_repeat_time: 60ms`;
}

function renderNextion28Base(rotation, wifi, entities = []) {
  const t = getBoardTransform("st7789v", rotation);
  const backlightSyncLambda = renderBacklightSyncLambda(entities);
  return `substitutions:
  device_name: ${quoteYaml(wifi.deviceName)}
  friendly_name: ${quoteYaml(wifi.friendlyName)}
  wifi_ssid: ${quoteYaml(wifi.ssid)}
  wifi_password: ${quoteYaml(wifi.password)}

esphome:
  name: \${device_name}
  friendly_name: \${friendly_name}
  comment: "ESPHome config for ONX2432G028 / ESP32-S3 + ST7789 + CST816"
  on_boot:
    priority: 800
    then:
      - light.turn_on:
          id: backlight
          brightness: !lambda "return id(backlight_percent) / 100.0f;"

esp32:
  board: esp32-s3-devkitc-1
  variant: esp32s3
  framework:
    type: esp-idf

psram:
  mode: octal
  speed: 40MHz

logger:
  baud_rate: 0
  level: WARN
api:
ota:
  - platform: esphome

wifi:
  ssid: \${wifi_ssid}
  password: \${wifi_password}
  ap:
    ssid: "\${friendly_name} Fallback"

web_server:
  port: 80

i2c:
  sda: GPIO8
  scl: GPIO7
  scan: true
  frequency: 400kHz

spi:
  clk_pin: GPIO5
  mosi_pin: GPIO1

pcf8574:
  - id: lcd_exio
    address: 0x38
    pcf8575: false

output:
  - platform: ledc
    id: backlight_pwm
    pin: GPIO6
    frequency: 5000Hz

light:
  - platform: monochromatic
    id: backlight
    name: "\${friendly_name} Backlight"
    output: backlight_pwm
    restore_mode: ALWAYS_ON${backlightSyncLambda ? `
    on_state:
      then:
        - lambda: |-
${indentCodeBlock(backlightSyncLambda, 12)}` : ""}

globals:
  - id: backlight_percent
    type: int
    restore_value: no
    initial_value: "50"${renderAdditionalGlobalsBlock(entities)}

display:
  - platform: mipi_spi
    id: main_display
    model: ST7789V
    dc_pin: GPIO3
    cs_pin: GPIO2
    reset_pin:
      pcf8574: lcd_exio
      number: 5
      mode:
        output: true
      inverted: false
    dimensions:
      width: ${t.width}
      height: ${t.height}
    data_rate: 80MHz
    invert_colors: false
    auto_clear_enabled: false
    update_interval: never
    transform:
      swap_xy: ${String(t.dSwap)}
      mirror_x: ${String(t.dMirX)}
      mirror_y: ${String(t.dMirY)}

touchscreen:
  - platform: cst816
    id: main_touch
    display: main_display
    transform:
      swap_xy: ${String(t.tSwap)}
      mirror_x: ${String(t.tMirX)}
      mirror_y: ${String(t.tMirY)}
    update_interval: 16ms

lvgl:
  buffer_size: 25%
  default_font: ${UI_FONT_BODY}
  displays:
    - main_display
  touchscreens:
    - touchscreen_id: main_touch
      long_press_time: 300ms
      long_press_repeat_time: 60ms`;
}

function renderSwitchBlock(entities) {
  return entities
      .filter((entity) => entity.type === "switch" || entity.type === "multi_switch")
      .flatMap((entity) => getEnabledSwitchIndices(entity).map((index) => renderSwitchComponent(entity, index)))
      .join("\n");
}

function renderSensorBlock(entities) {
  return entities
      .filter((entity) => (entity.type === "light" && entity.props.style === LIGHT_STYLE_SLIDER) || entity.type === "cover")
      .flatMap((entity) => {
        if (entity.type === "cover") {
          return [`- platform: homeassistant
  id: ${getCoverPositionSensorId(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  attribute: current_position
  on_value:
    - if:
        condition:
          lambda: |-
            auto state = id(${getCoverStateTextSensorId(entity)}).state;
            return state != "opening" && state != "closing";
        then:
          - globals.set:
              id: ${getCoverSyncingFlagId(entity)}
              value: "true"
          - lvgl.slider.update:
              id: ${getWidgetId(entity, 0)}
              value: !lambda |-
                return std::isnan(x) ? 0 : (int) x;
          - globals.set:
              id: ${getCoverSyncingFlagId(entity)}
              value: "false"
    - lvgl.label.update:
        id: ${getValueLabelId(entity, 0)}
        text: !lambda |-
          static char buf[20];
          int value = std::isnan(x) ? 0 : (int) x;
          if (value < 0) value = 0;
          if (value > 100) value = 100;
          sprintf(buf, "current: %d%%", value);
          return buf;`];
        }
        const blocks = [
        `- platform: homeassistant
  id: ha_brightness_${getEntitySlug(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  attribute: brightness
  on_value:
    - lvgl.slider.update:
        id: ${getWidgetId(entity, 0)}
        value: !lambda |-
          return std::isnan(x) ? 0 : (x / 255.0) * 100.0;
    - lvgl.obj.update:
        id: ${getWidgetId(entity, 0)}_orange_fill
        width: !lambda |-
          float val = std::isnan(x) ? 0 : (x / 255.0) * 100.0;
          auto wrapper = id(${getWidgetId(entity, 0)}_wrapper);
          int w = lv_obj_get_width(wrapper);
          int fill_w = (int)((w * val) / 100.0f);
          if(fill_w < 0) fill_w = 0;
          if(fill_w > w) fill_w = w;
          return fill_w;
    - lvgl.obj.update:
        id: ${getWidgetId(entity, 0)}_pill
        x: !lambda |-
          float val = std::isnan(x) ? 0 : (x / 255.0) * 100.0;
          auto wrapper = id(${getWidgetId(entity, 0)}_wrapper);
          int w = lv_obj_get_width(wrapper);
          int fill_w = (int)((w * val) / 100.0f);
          if(fill_w < 0) fill_w = 0;
          if(fill_w > w) fill_w = w;
          int pill_x = fill_w - 10;
          return pill_x < 0 ? 0 : pill_x;
    - lvgl.label.update:
        id: ${getLightStateLabelId(entity)}
        text: !lambda |-
          static char buf[10];
          if (id(${getHaTextSensorId(entity, 0)}).state != "on" || std::isnan(x) || x == 0) {
            return "OFF";
          }
          sprintf(buf, "%.0f%%", (x / 255.0) * 100.0);
          return buf;`
        ];

        if (entity.props.color_temp) {
          blocks.push(`- platform: homeassistant
  id: ${getLightMinColorTempSensorId(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  attribute: min_color_temp_kelvin

- platform: homeassistant
  id: ${getLightMaxColorTempSensorId(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  attribute: max_color_temp_kelvin

- platform: homeassistant
  id: ${getLightColorTempSensorId(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  attribute: color_temp_kelvin
  on_value:
    - lvgl.slider.update:
        id: ${getWidgetId(entity, 0)}_ct
        value: !lambda |-
          float min_kelvin = id(${getLightMinColorTempSensorId(entity)}).state;
          if (std::isnan(min_kelvin) || min_kelvin < 1000.0f) {
            min_kelvin = 2000.0f;
          }
          float max_kelvin = id(${getLightMaxColorTempSensorId(entity)}).state;
          if (std::isnan(max_kelvin) || max_kelvin < 1000.0f) {
            max_kelvin = 6500.0f;
          }
          if (max_kelvin <= min_kelvin) {
            max_kelvin = min_kelvin + 1.0f;
          }
          float kelvin = std::isnan(x) || x <= 0 ? min_kelvin : x;
          if (kelvin < min_kelvin) kelvin = min_kelvin;
          if (kelvin > max_kelvin) kelvin = max_kelvin;
          return (int) (((max_kelvin - kelvin) / (max_kelvin - min_kelvin)) * 100.0f);
    - lvgl.obj.update:
        id: ${getWidgetId(entity, 0)}_ct_pill
        x: !lambda |-
          float min_kelvin = id(${getLightMinColorTempSensorId(entity)}).state;
          if (std::isnan(min_kelvin) || min_kelvin < 1000.0f) {
            min_kelvin = 2000.0f;
          }
          float max_kelvin = id(${getLightMaxColorTempSensorId(entity)}).state;
          if (std::isnan(max_kelvin) || max_kelvin < 1000.0f) {
            max_kelvin = 6500.0f;
          }
          if (max_kelvin <= min_kelvin) {
            max_kelvin = min_kelvin + 1.0f;
          }
          float kelvin = std::isnan(x) || x <= 0 ? min_kelvin : x;
          if (kelvin < min_kelvin) kelvin = min_kelvin;
          if (kelvin > max_kelvin) kelvin = max_kelvin;
          float slider_val = ((max_kelvin - kelvin) / (max_kelvin - min_kelvin)) * 100.0f;
          auto wrapper = id(${getWidgetId(entity, 0)}_ct_wrapper);
          int w = lv_obj_get_width(wrapper);
          int fill_w = (int)((w * slider_val) / 100.0f);
          if(fill_w < 0) fill_w = 0;
          if(fill_w > w) fill_w = w;
          int pill_x = fill_w - 10;
          return pill_x < 0 ? 0 : pill_x;
    - lvgl.obj.update:
        id: ${getWidgetId(entity, 0)}_wrapper
        bg_color: !lambda |-
          float val = lv_slider_get_value(id(${getWidgetId(entity, 0)}_ct)) / 100.0f;
          int r = (int)(213 + (255 - 213) * val);
          int g = (int)(213 + (137 - 213) * val);
          int b = (int)(225 + (14 - 225) * val);
          return lv_color_make(r, g, b);
    - lvgl.obj.update:
        id: ${getWidgetId(entity, 0)}_orange_fill
        bg_color: !lambda |-
          float val = lv_slider_get_value(id(${getWidgetId(entity, 0)}_ct)) / 100.0f;
          int r = (int)(213 + (255 - 213) * val);
          int g = (int)(213 + (137 - 213) * val);
          int b = (int)(225 + (14 - 225) * val);
          return lv_color_make(r, g, b);`);
        }
        return blocks;
      })
      .join("\n");
}

function renderTextSensorBlock(entities) {
  return entities
      .filter((entity) => entity.type === "thermo_hygrometer" || entity.type === "light" || entity.type === "cover")
      .flatMap((entity) => {
        if (entity.type === "thermo_hygrometer") {
          return entity.entityids.map((_, index) => renderTextSensorComponent(entity, index));
        }
        if (entity.type === "cover") {
          return [renderCoverStateTextSensorComponent(entity)];
        }
        return entity.props.hue_360
          ? [renderLightStateTextSensorComponent(entity), renderLightRgbTextSensorComponent(entity)]
          : [renderLightStateTextSensorComponent(entity)];
      })
      .join("\n");
}

function renderImageBlock(entities) {
  return entities
      .filter((entity) => entity.type === "thermo_hygrometer" || entity.type === "light" || entity.type === "cover")
      .flatMap((entity) => {
        if (entity.type === "thermo_hygrometer") {
          return [
            `- file: ${quoteYaml(entity.props.temp_icon || THERMO_ICON_PATHS.temp)}
  id: ${getThermoImageId(entity, "temp")}
  type: rgb565
  transparency: alpha_channel
  resize: 32x32`,
            `- file: ${quoteYaml(entity.props.hum_icon || THERMO_ICON_PATHS.hum)}
  id: ${getThermoImageId(entity, "hum")}
  type: rgb565
  transparency: alpha_channel
  resize: 32x32`,
          ];
        }

        if (entity.type === "cover") {
          return [
            `- file: "mdi:arrow-down-circle"
  id: ${getCoverActionImageId(entity, "close")}
  type: BINARY
  transparency: chroma_key`,
            `- file: "mdi:pause"
  id: ${getCoverActionImageId(entity, "stop")}
  type: BINARY
  transparency: chroma_key`,
            `- file: "mdi:arrow-up-circle"
  id: ${getCoverActionImageId(entity, "open")}
  type: BINARY
  transparency: chroma_key`,
          ];
        }

        if (entity.type === "light" && entity.props.style === LIGHT_STYLE_SLIDER) {
          return [
            `- file: "mdi:lightbulb"
  id: ${getLightImageId(entity)}
  type: BINARY
  transparency: chroma_key
  resize: 32x32`,
          ];
        }

        if (entity.type === "light" && entity.props.style === LIGHT_STYLE_TILE) {
          return [
            `- file: ${quoteYaml(entity.props.icon || LIGHT_ICON_PATHS.on)}
  id: ${getLightImageId(entity)}
  type: rgb565
  transparency: alpha_channel`
          ];
        }

        return [
          `- file: ${quoteYaml(entity.props.icon || LIGHT_ICON_PATHS.on)}
  id: ${getLightImageId(entity)}
  type: rgb565
  transparency: alpha_channel`,
        ];
      })
      .join("\n");
}

function renderSwitchComponent(entity, index) {
  return `- platform: homeassistant
  id: ${getHaSwitchId(entity, index)}
  entity_id: ${quoteYaml(entity.entityids[index])}
  on_turn_on:
    - lvgl.widget.update:
        id: ${getWidgetId(entity, index)}
        state:
          checked: true
  on_turn_off:
    - lvgl.widget.update:
        id: ${getWidgetId(entity, index)}
        state:
          checked: false`;
}

function renderTextSensorComponent(entity, index) {
  return `- platform: homeassistant
  id: ${getHaTextSensorId(entity, index)}
  entity_id: ${quoteYaml(entity.entityids[index])}
  on_value:
    - lvgl.label.update:
        id: ${getValueLabelId(entity, index)}
        text: !lambda |-
          static std::string value;
          value = "${getMetricCaption(index)}: " + x + "${getMetricSuffix(index)}";
          return value.c_str();`;
}

function renderCoverStateTextSensorComponent(entity) {
  return `- platform: homeassistant
  id: ${getCoverStateTextSensorId(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}`;
}

function renderLightRgbTextSensorComponent(entity) {
  return `- platform: homeassistant
  id: ${getLightRgbSensorId(entity)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  attribute: rgb_color
  on_value:
    - lambda: |-
        float values[3] = {255.0f, 0.0f, 0.0f};
        int found = 0;
        std::string token;
        auto flush_token = [&](void) {
          if (found >= 3 || token.empty()) return;
          values[found++] = atof(token.c_str());
          token.clear();
        };

        for (char c : x) {
          if ((c >= '0' && c <= '9') || c == '.' || c == '-') {
            token.push_back(c);
          } else {
            flush_token();
          }
        }
        flush_token();

        if (found < 3) {
          return;
        }

        int r = (int) values[0];
        int g = (int) values[1];
        int b = (int) values[2];

        if (r < 0) r = 0;
        if (r > 255) r = 255;
        if (g < 0) g = 0;
        if (g > 255) g = 255;
        if (b < 0) b = 0;
        if (b > 255) b = 255;

        float rf = r / 255.0f;
        float gf = g / 255.0f;
        float bf = b / 255.0f;
        float max_v = rf;
        if (gf > max_v) max_v = gf;
        if (bf > max_v) max_v = bf;
        float min_v = rf;
        if (gf < min_v) min_v = gf;
        if (bf < min_v) min_v = bf;
        float delta = max_v - min_v;
        float hue = 0.0f;

        if (delta > 0.0001f) {
          if (max_v == rf) {
            hue = 60.0f * fmodf(((gf - bf) / delta), 6.0f);
          } else if (max_v == gf) {
            hue = 60.0f * (((bf - rf) / delta) + 2.0f);
          } else {
            hue = 60.0f * (((rf - gf) / delta) + 4.0f);
          }
        }
        if (hue < 0.0f) hue += 360.0f;

        int slider_value = (int)((hue / 360.0f) * 100.0f + 0.5f);
        if (slider_value < 0) slider_value = 0;
        if (slider_value > 100) slider_value = 100;
        lv_slider_set_value(id(${getLightHueSliderId(entity)}), slider_value, LV_ANIM_OFF);

        auto wrapper = id(${getLightHueWrapperId(entity)});
        int w = lv_obj_get_width(wrapper);
        int fill_w = (int)((w * slider_value) / 100.0f);
        if (fill_w < 0) fill_w = 0;
        if (fill_w > w) fill_w = w;
        int pill_x = fill_w - 10;
        if (pill_x < 0) pill_x = 0;
        lv_obj_set_x(id(${getLightHuePillId(entity)}), pill_x);

        auto color = lv_color_make(r, g, b);
        lv_obj_set_style_bg_color(id(${getWidgetId(entity, 0)}_bubble), color, 0);
        lv_obj_set_style_bg_color(id(${getWidgetId(entity, 0)}_orange_fill), color, 0);
        // lv_obj_set_style_image_recolor(id(${getWidgetId(entity, 0)}_icon), color, 0);
        lv_obj_set_style_bg_color(id(${getWidgetId(entity, 0)}_wrapper), color, 0);`;
}

function renderLightStateTextSensorComponent(entity) {
  if (entity.props.style === LIGHT_STYLE_SLIDER) {
    let offStateYaml = `          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_wrapper
              bg_color: 0xEBEBEB
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_orange_fill
              bg_color: 0x9E9E9E`;
              
    let onStateYaml = `          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_wrapper
              bg_color: !lambda |-
${indentCodeBlock(renderLightAccentColorLambda(entity), 16)}
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_orange_fill
              bg_color: !lambda |-
${indentCodeBlock(renderLightAccentColorLambda(entity), 16)}`;

    if (entity.props.color_temp) {
      offStateYaml += `
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_ct_wrapper
              bg_color: 0xEBEBEB
              bg_grad_color: 0xEBEBEB
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_ct_pill
              bg_color: 0x9E9E9E`;
              
      onStateYaml += `
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_ct_wrapper
              bg_color: 0x91C1FF
              bg_grad_color: 0xFFD699
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_ct_pill
              bg_color: 0xFFFFFF`;
    }

    return `- platform: homeassistant
  id: ${getHaTextSensorId(entity, 0)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  on_value:
    - if:
        condition:
          lambda: "return x == \\"off\\";"
        then:
          - lvgl.label.update:
              id: ${getLightStateLabelId(entity)}
              text: "OFF"
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_icon
              image_recolor: 0x9E9E9E
              image_recolor_opa: COVER
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_bubble
              bg_color: 0xECECEC
${offStateYaml}
        else:
          - lvgl.label.update:
              id: ${getLightStateLabelId(entity)}
              text: !lambda |-
                auto slider = id(${getWidgetId(entity, 0)});
                int slider_val = lv_slider_get_value(slider);
                static char buf[10];
                if (slider_val == 0) return "OFF";
                sprintf(buf, "%.0f%%", (float)slider_val);
                return buf;
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_icon
              image_recolor: !lambda |-
${indentCodeBlock(renderLightAccentColorLambda(entity), 16)}
              image_recolor_opa: COVER
          - lvgl.obj.update:
              id: ${getWidgetId(entity, 0)}_bubble
              bg_color: !lambda |-
${indentCodeBlock(renderLightAccentColorLambda(entity), 16)}
              bg_opa: 30%
${onStateYaml}`;
  }

  return `- platform: homeassistant
  id: ${getHaTextSensorId(entity, 0)}
  entity_id: ${quoteYaml(entity.entityids[0])}
  on_value:
    - lvgl.widget.update:
        id: ${getWidgetId(entity, 0)}
        state:
          checked: !lambda return x == "on";
`;
}

function renderWidget(entity) {
  return renderEsphomeWidgetByComponent(entity, {
    buttonActiveBgColor,
    buttonInactiveBgColor,
    getBacklightValueLabelId,
    getContainerId,
    getCoverActionImageId,
    getCoverSyncingFlagId,
    getEnabledSwitchIndices,
    getHaSwitchId,
    getHmiScreenBrightnessLayout,
    getHaTextSensorId,
    getLightHuePillId,
    getLightHueSliderId,
    getLightHueWrapperId,
    getLightImageId,
    getLightMaxColorTempSensorId,
    getLightMinColorTempSensorId,
    getLightStateLabelId,
    getLightTileLayout,
    getMetricCaption,
    getMetricSuffix,
    getMultiSwitchChannelTitle,
    getMultiSwitchLayout,
    getThermoImageId,
    getValueLabelId,
    getWidgetId,
    indentCodeBlock,
    LIGHT_STYLE_SLIDER,
    LIGHT_STYLE_TILE,
    LIGHT_TILE_ICON_BUBBLE_OPACITY,
    normalizeYamlColor,
    quoteYaml,
    renderHueRgbStatements,
    SWITCH_HEIGHT,
    SWITCH_WIDTH,
    UI_FONT_BODY,
    UI_FONT_VALUE,
  });
}
