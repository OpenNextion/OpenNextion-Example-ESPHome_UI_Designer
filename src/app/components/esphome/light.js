export function renderLightEsphomeWidget(entity, renderers) {
  if (entity.props.style === renderers.LIGHT_STYLE_TILE) {
    return renderLightTileWidget(entity, renderers);
  }
  if (entity.props.style === renderers.LIGHT_STYLE_SLIDER) {
    return renderLightSliderWidget(entity, renderers);
  }
  return renderLightIconWidget(entity, renderers);
}

function renderLightIconWidget(entity, ctx) {
  const { getHaTextSensorId, getLightImageId, getWidgetId, quoteYaml, UI_FONT_BODY } = ctx;
  return `- button:
    id: ${getWidgetId(entity, 0)}
    x: ${entity.props.x}
    y: ${entity.props.y}
    width: ${entity.props.width}
    height: ${entity.props.height}
    radius: 14
    checkable: true
    layout:
      type: FLEX
      flex_flow: COLUMN
      flex_align_main: CENTER
      flex_align_cross: CENTER
      flex_align_track: CENTER
      pad_row: 2
    pad_all: 5
    border_width: 0
    bg_opa: COVER
    bg_color: 0xF8FBF9
    transform_pivot_x: ${Math.floor(entity.props.width / 2)}
    transform_pivot_y: ${Math.floor(entity.props.height / 2)}
    checked:
      bg_color: 0xEF920C
    pressed:
      transform_zoom: 1.1
    shadow_width: 0
    scrollable: false
    scrollbar_mode: "OFF"
    state:
      checked: !lambda return id(${getHaTextSensorId(entity, 0)}).state == "on";
    on_change:
      then:
        - if:
            condition:
              lambda: return x;
            then:
              - homeassistant.service:
                  service: light.turn_on
                  data:
                    entity_id: ${quoteYaml(entity.entityids[0])}
            else:
              - homeassistant.service:
                  service: light.turn_off
                  data:
                    entity_id: ${quoteYaml(entity.entityids[0])}
    widgets:
      - image:
          src: ${getLightImageId(entity)}
          bg_opa: TRANSP`;
}

function renderLightTileWidget(entity, ctx) {
  const { getHaTextSensorId, getLightImageId, getLightStateLabelId, getLightTileLayout, getWidgetId, quoteYaml, LIGHT_TILE_ICON_BUBBLE_OPACITY, UI_FONT_BODY } = ctx;
  const iconId = getLightImageId(entity);
  const stateId = getLightStateLabelId(entity);
  const haId = getHaTextSensorId(entity, 0);
  const layout = getLightTileLayout(entity.props.tile_icon_position);
  return `- button:
    id: ${getWidgetId(entity, 0)}
    x: ${entity.props.x}
    y: ${entity.props.y}
    width: ${entity.props.width}
    height: ${entity.props.height}
    radius: 12
    border_width: 0
    checkable: true
    pad_all: 0
    bg_opa: COVER
    bg_color: 0xEEF3F0
    checked:
      bg_color: 0xEF920C
    shadow_width: 0
    scrollable: false
    scrollbar_mode: "OFF"
    state:
      checked: !lambda return id(${haId}).state == "on";
    on_change:
      then:
        - lvgl.label.update:
            id: ${stateId}
            text: !lambda |-
              static std::string value;
              value = x ? "ON" : "OFF";
              return value.c_str();
        - if:
            condition:
              lambda: return x;
            then:
              - homeassistant.service:
                  service: light.turn_on
                  data:
                    entity_id: ${quoteYaml(entity.entityids[0])}
            else:
              - homeassistant.service:
                  service: light.turn_off
                  data:
                    entity_id: ${quoteYaml(entity.entityids[0])}
    widgets:
      - obj:
          align: ${layout.icon.align}
          x: ${layout.icon.x}
          y: ${layout.icon.y}
          width: SIZE_CONTENT
          height: SIZE_CONTENT
          radius: 999
          pad_all: 8
          border_width: 0
          bg_color: 0xFFFFFF
          bg_opa: ${LIGHT_TILE_ICON_BUBBLE_OPACITY}%
          shadow_width: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - image:
                align: CENTER
                src: ${iconId}
      - label:
          align: ${layout.title.align}
          x: ${layout.title.x}
          y: ${layout.title.y}
          text_font: ${UI_FONT_BODY}
          text: ${quoteYaml(entity.props.title)}
          text_color: 0x24323A
      - label:
          id: ${stateId}
          align: ${layout.state.align}
          x: ${layout.state.x}
          y: ${layout.state.y}
          text_font: ${UI_FONT_BODY}
          text: !lambda |-
            static std::string value;
            value = id(${haId}).state == "on" ? "ON" : "OFF";
            return value.c_str();
          text_color: 0x596775`;
}

function renderLightSliderWidget(entity, ctx) {
  const { getContainerId, getHaTextSensorId, getLightHuePillId, getLightHueSliderId, getLightHueWrapperId, getLightImageId, getLightMaxColorTempSensorId, getLightMinColorTempSensorId, getLightStateLabelId, getWidgetId, indentCodeBlock, quoteYaml, renderHueRgbStatements, UI_FONT_BODY } = ctx;
  const iconId = getLightImageId(entity);
  const stateId = getLightStateLabelId(entity);
  let yaml = `- obj:
    id: ${getContainerId(entity)}
    x: ${entity.props.x}
    y: ${entity.props.y}
    width: ${entity.props.width}
    height: ${entity.props.height}
    radius: 14
    border_width: 1
    border_color: 0xD7DDD9
    pad_all: 12
    bg_opa: COVER
    bg_color: 0xFDFAF3
    shadow_width: 4
    shadow_color: 0x1F2933
    shadow_opa: 6%
    scrollable: false
    scrollbar_mode: "OFF"
    layout:
      type: FLEX
      flex_flow: COLUMN
      flex_align_main: SPACE_BETWEEN
      flex_align_cross: STRETCH
    widgets:
      - obj:
          width: 100%
          height: SIZE_CONTENT
          border_width: 0
          bg_opa: TRANSP
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          layout:
            type: FLEX
            flex_flow: ROW
            flex_align_cross: CENTER
          widgets:
            - obj:
                id: ${getWidgetId(entity, 0)}_bubble
                width: 44
                height: 44
                radius: 22
                bg_color: 0xFEEDBD
                border_width: 0
                scrollable: false
                scrollbar_mode: "OFF"
                layout:
                  type: FLEX
                  flex_align_main: CENTER
                  flex_align_cross: CENTER
                on_click:
                  - homeassistant.service:
                      service: light.toggle
                      data:
                        entity_id: ${quoteYaml(entity.entityids[0])}
                widgets:
                  - image:
                      id: ${getWidgetId(entity, 0)}_icon
                      src: ${iconId}
                      image_recolor: 0xFDBB13
                      image_recolor_opa: COVER
            - obj:
                width: SIZE_CONTENT
                height: SIZE_CONTENT
                border_width: 0
                bg_opa: TRANSP
                pad_all: 0
                pad_left: 12
                scrollable: false
                scrollbar_mode: "OFF"
                layout:
                  type: FLEX
                  flex_flow: COLUMN
                widgets:
                  - label:
                      text_font: ${UI_FONT_BODY}
                      text: ${quoteYaml(entity.props.title)}
                      text_color: 0x24323A
                  - label:
                      id: ${stateId}
                      text_font: ${UI_FONT_BODY}
                      text: "OFF"
                      text_color: 0x596775
      - obj:
          id: ${getWidgetId(entity, 0)}_wrapper
          width: 100%
          height: 38
          flex_grow: 1
          bg_color: 0x24323A
          bg_opa: 30%
          radius: 12
          border_width: 0
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - obj:
                id: ${getWidgetId(entity, 0)}_orange_fill
                width: 0
                height: 100%
                bg_color: 0xFDBB13
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
                x: 0
                border_width: 0
                scrollable: false
                scrollbar_mode: "OFF"
            - slider:
                id: ${getWidgetId(entity, 0)}
                width: 100%
                height: 100%
                min_value: 1
                max_value: 100
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
                    - lvgl.label.update:
                        id: ${stateId}
                        text: !lambda |-
                          static char buf[10];
                          if (id(${getHaTextSensorId(entity, 0)}).state != "on" || x == 0) return "OFF";
                          sprintf(buf, "%.0f%%", (float)x);
                          return buf;
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_orange_fill
                        width: !lambda |-
                          auto wrapper = id(${getWidgetId(entity, 0)}_wrapper);
                          int w = lv_obj_get_width(wrapper);
                          float val = x;
                          int fill_w = (int)((w * val) / 100.0f);
                          if(fill_w < 0) fill_w = 0;
                          if(fill_w > w) fill_w = w;
                          return fill_w;
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_pill
                        x: !lambda |-
                          auto wrapper = id(${getWidgetId(entity, 0)}_wrapper);
                          int w = lv_obj_get_width(wrapper);
                          float val = x;
                          int fill_w = (int)((w * val) / 100.0f);
                          if(fill_w < 0) fill_w = 0;
                          if(fill_w > w) fill_w = w;
                          int pill_x = fill_w - 10;
                          return pill_x < 0 ? 0 : pill_x;
                on_release:
                  then:
                    - homeassistant.service:
                        service: light.turn_on
                        data:
                          entity_id: ${quoteYaml(entity.entityids[0])}
                          brightness_pct: !lambda "return (int)x;"`;
  if (entity.props.color_temp) {
    yaml += `
      - obj:
          id: ${getWidgetId(entity, 0)}_ct_wrapper
          width: 100%
          height: 38
          flex_grow: 1
          bg_color: 0x91C1FF
          bg_grad_color: 0xFFD699
          bg_grad_dir: HOR
          radius: 12
          border_width: 0
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - obj:
                id: ${getWidgetId(entity, 0)}_ct_pill
                width: 4
                height: 16
                radius: 2
                bg_color: 0xFFFFFF
                align: LEFT_MID
                x: 0
                border_width: 0
                scrollable: false
                scrollbar_mode: "OFF"
            - slider:
                id: ${getWidgetId(entity, 0)}_ct
                width: 100%
                height: 100%
                min_value: 0
                max_value: 100
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
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_ct_pill
                        x: !lambda |-
                          auto wrapper = id(${getWidgetId(entity, 0)}_ct_wrapper);
                          int w = lv_obj_get_width(wrapper);
                          float pct = x / 100.0f;
                          int pill_x = (int)(w * pct) - 10;
                          return (pill_x < 0) ? 0 : pill_x;
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_wrapper
                        bg_color: !lambda |-
                          float pct = x / 100.0f;
                          int r = (int)(213 + (255 - 213) * pct);
                          int g = (int)(213 + (137 - 213) * pct);
                          int b = (int)(225 + (14 - 225) * pct);
                          return lv_color_make(r, g, b);
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_orange_fill
                        bg_color: !lambda |-
                          float pct = x / 100.0f;
                          int r = (int)(213 + (255 - 213) * pct);
                          int g = (int)(213 + (137 - 213) * pct);
                          int b = (int)(225 + (14 - 225) * pct);
                          return lv_color_make(r, g, b);
                on_release:
                  then:
                    - homeassistant.action:
                        action: light.turn_on
                        data:
                          entity_id: ${quoteYaml(entity.entityids[0])}
                        data_template:
                          color_temp_kelvin: "{{ color_temp_kelvin }}"
                        variables:
                          color_temp_kelvin: !lambda |-
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
                            float pct = x / 100.0f;
                            if (pct < 0.0f) pct = 0.0f;
                            if (pct > 1.0f) pct = 1.0f;
                            return (int) (max_kelvin - ((max_kelvin - min_kelvin) * pct) + 0.5f);`;
  }
  if (entity.props.hue_360) {
    yaml += `
      - obj:
          id: ${getLightHueWrapperId(entity)}
          width: 100%
          height: 38
          flex_grow: 1
          clip_corner: true
          bg_color: 0x000000
          radius: 12
          border_width: 0
          pad_all: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - obj:
                width: 100%
                height: 100%
                border_width: 0
                bg_opa: TRANSP
                pad_all: 0
                scrollable: false
                scrollbar_mode: "OFF"
                layout:
                  type: FLEX
                  flex_flow: ROW
                  pad_column: 0
                widgets:
                  - obj:
                      width: 20%
                      height: 100%
                      radius: 0
                      border_width: 0
                      bg_color: 0xFF0000
                      bg_grad_color: 0xFFFF00
                      bg_grad_dir: HOR
                  - obj:
                      width: 20%
                      height: 100%
                      radius: 0
                      border_width: 0
                      bg_color: 0xFFFF00
                      bg_grad_color: 0x00FF00
                      bg_grad_dir: HOR
                  - obj:
                      width: 20%
                      height: 100%
                      radius: 0
                      border_width: 0
                      bg_color: 0x00FF00
                      bg_grad_color: 0x00FFFF
                      bg_grad_dir: HOR
                  - obj:
                      width: 20%
                      height: 100%
                      radius: 0
                      border_width: 0
                      bg_color: 0x00FFFF
                      bg_grad_color: 0x0000FF
                      bg_grad_dir: HOR
                  - obj:
                      width: 20%
                      height: 100%
                      radius: 0
                      border_width: 0
                      bg_color: 0x0000FF
                      bg_grad_color: 0xFF00FF
                      bg_grad_dir: HOR
            - obj:
                id: ${getLightHuePillId(entity)}
                width: 4
                height: 16
                radius: 2
                bg_color: 0xFFFFFF
                align: LEFT_MID
                x: 0
                border_width: 0
                scrollable: false
                scrollbar_mode: "OFF"
            - slider:
                id: ${getLightHueSliderId(entity)}
                width: 100%
                height: 100%
                min_value: 0
                max_value: 100
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
                    - lvgl.obj.update:
                        id: ${getLightHuePillId(entity)}
                        x: !lambda |-
                          auto wrapper = id(${getLightHueWrapperId(entity)});
                          int w = lv_obj_get_width(wrapper);
                          int fill_w = (int)((w * x) / 100.0f);
                          if(fill_w < 0) fill_w = 0;
                          if(fill_w > w) fill_w = w;
                          int pill_x = fill_w - 10;
                          return pill_x < 0 ? 0 : pill_x;
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_bubble
                        bg_color: !lambda |-
${indentCodeBlock(`${renderHueRgbStatements("x / 100.0f")}
return lv_color_make((uint8_t) r, (uint8_t) g, (uint8_t) b);`, 26)}
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_icon
                        image_recolor: !lambda |-
${indentCodeBlock(`${renderHueRgbStatements("x / 100.0f")}
return lv_color_make((uint8_t) r, (uint8_t) g, (uint8_t) b);`, 26)}
                        image_recolor_opa: COVER
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_wrapper
                        bg_color: !lambda |-
${indentCodeBlock(`${renderHueRgbStatements("x / 100.0f")}
return lv_color_make((uint8_t) r, (uint8_t) g, (uint8_t) b);`, 26)}
                    - lvgl.obj.update:
                        id: ${getWidgetId(entity, 0)}_orange_fill
                        bg_color: !lambda |-
${indentCodeBlock(`${renderHueRgbStatements("x / 100.0f")}
return lv_color_make((uint8_t) r, (uint8_t) g, (uint8_t) b);`, 26)}
                on_release:
                  then:
                    - homeassistant.action:
                        action: light.turn_on
                        data:
                          entity_id: ${quoteYaml(entity.entityids[0])}
                        data_template:
                          rgb_color: !lambda |-
                            static char rgb_buf[32];
${indentCodeBlock(renderHueRgbStatements("x / 100.0f"), 28)}
                            sprintf(rgb_buf, "[%d,%d,%d]", (int) (r + 0.5f), (int) (g + 0.5f), (int) (b + 0.5f));
                            return rgb_buf;`;
  }
  return yaml;
}
