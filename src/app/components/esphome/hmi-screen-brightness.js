export function renderHmiScreenBrightnessEsphomeWidget(entity, renderers) {
  const {
    getBacklightValueLabelId,
    getContainerId,
    getHmiScreenBrightnessLayout,
    getWidgetId,
    normalizeYamlColor,
    quoteYaml,
    UI_FONT_BODY,
  } = renderers;
  const layout = getHmiScreenBrightnessLayout(entity.props.width, entity.props.height, entity.props.show_header !== false);
  const sliderColor = normalizeYamlColor(entity.props.slider_color || "0xFDBB13");
  const headerUpdateYaml = entity.props.show_header === false ? "" : `                    - lvgl.label.update:
                        id: ${getBacklightValueLabelId(entity)}
                        text: !lambda |-
                          static char buf[10];
                          sprintf(buf, "%d%%", (int) x);
                          return buf;
`;
  const headerYaml = entity.props.show_header === false ? "" : `      - obj:
          x: ${layout.header.x}
          y: ${layout.header.y}
          width: ${layout.header.width}
          height: ${layout.header.height}
          border_width: 0
          bg_opa: TRANSP
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          layout:
            type: FLEX
            flex_flow: ROW
            flex_align_main: SPACE_BETWEEN
            flex_align_cross: CENTER
          widgets:
            - label:
                width: ${Math.max(layout.header.width - 60, 20)}
                text_align: LEFT
                long_mode: DOT
                text_font: ${UI_FONT_BODY}
                text: ${quoteYaml(entity.props.title)}
                text_color: 0x24323A
            - label:
                id: ${getBacklightValueLabelId(entity)}
                text_font: ${UI_FONT_BODY}
                text: !lambda |-
                  static char buf[10];
                  sprintf(buf, "%d%%", id(backlight_percent));
                  return buf;
                text_color: 0x596775
`;
  return `- obj:
    id: ${getContainerId(entity)}
    x: ${entity.props.x}
    y: ${entity.props.y}
    width: ${entity.props.width}
    height: ${entity.props.height}
    radius: 14
    border_width: 1
    border_color: 0xD7DDD9
    pad_all: 0
    bg_opa: COVER
    bg_color: 0xF8FBF9
    shadow_width: 4
    shadow_color: 0x1F2933
    shadow_opa: 6%
    scrollable: false
    scrollbar_mode: "OFF"
    widgets:
${headerYaml ? headerYaml : ""}      - obj:
          id: ${getWidgetId(entity, 0)}_wrapper
          x: ${layout.slider.x}
          y: ${layout.slider.y}
          width: ${layout.slider.width}
          height: ${layout.slider.height}
          bg_color: 0x24323A
          bg_opa: 30%
          radius: 12
          border_width: 0
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - obj:
                id: ${getWidgetId(entity, 0)}_fill
                width: !lambda |-
                  int width = lv_obj_get_width(id(${getWidgetId(entity, 0)}_wrapper));
                  int value = id(backlight_percent);
                  if (value < 10) value = 10;
                  if (value > 100) value = 100;
                  return (int)((width * value) / 100.0f);
                height: 100%
                bg_color: ${sliderColor}
                radius: 12
                border_width: 0
                scrollable: false
                scrollbar_mode: "OFF"
            - obj:
                id: ${getWidgetId(entity, 0)}_pill
                width: 4
                height: 16
                radius: 2
                bg_color: 0xFFFFFF
                align: LEFT_MID
                x: !lambda |-
                  int width = lv_obj_get_width(id(${getWidgetId(entity, 0)}_wrapper));
                  int value = id(backlight_percent);
                  if (value < 10) value = 10;
                  if (value > 100) value = 100;
                  int fill_w = (int)((width * value) / 100.0f);
                  int pill_x = fill_w - 10;
                  return pill_x < 0 ? 0 : pill_x;
                border_width: 0
                scrollable: false
                scrollbar_mode: "OFF"
            - slider:
                id: ${getWidgetId(entity, 0)}
                width: 100%
                height: 100%
                min_value: 10
                max_value: 100
                value: 50
                radius: 12
                bg_opa: TRANSP
                scrollable: false
                scrollbar_mode: "OFF"
                indicator:
                  bg_opa: TRANSP
                knob:
                  bg_opa: TRANSP
                  border_width: 0
                  shadow_width: 0
                on_change:
                  then:
                    - globals.set:
                        id: backlight_percent
                        value: !lambda "return (int)x;"
${headerUpdateYaml}                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_fill
                        width: !lambda |-
                          int width = lv_obj_get_width(id(${getWidgetId(entity, 0)}_wrapper));
                          int value = (int) x;
                          if (value < 10) value = 10;
                          if (value > 100) value = 100;
                          return (int)((width * value) / 100.0f);
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_pill
                        x: !lambda |-
                          int width = lv_obj_get_width(id(${getWidgetId(entity, 0)}_wrapper));
                          int value = (int) x;
                          if (value < 10) value = 10;
                          if (value > 100) value = 100;
                          int fill_w = (int)((width * value) / 100.0f);
                          int pill_x = fill_w - 10;
                          return pill_x < 0 ? 0 : pill_x;
                on_release:
                  then:
                    - light.turn_on:
                        id: backlight
                        brightness: !lambda "return x / 100.0f;"`;
}
