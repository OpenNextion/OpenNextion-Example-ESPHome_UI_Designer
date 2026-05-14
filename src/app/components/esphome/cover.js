export function renderCoverEsphomeWidget(entity, renderers) {
  const {
    getContainerId,
    getCoverActionImageId,
    getCoverSyncingFlagId,
    getValueLabelId,
    getWidgetId,
    quoteYaml,
    UI_FONT_BODY,
  } = renderers;
  const sliderWidth = Math.max(entity.props.width - 94, 80);
  const controlWidth = Math.max(Math.floor((entity.props.width - 32) / 3), 48);
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
      - label:
          align: TOP_MID
          x: 0
          y: 4
          text_font: ${UI_FONT_BODY}
          text: ${quoteYaml(entity.props.title)}
          text_color: 0x24323A
      - label:
          id: ${getValueLabelId(entity, 0)}
          align: TOP_MID
          x: 0
          y: 23
          text_font: ${UI_FONT_BODY}
          text: "current: --%"
          text_color: 0xD64343
      - button:
          x: 8
          y: 45
          width: ${controlWidth}
          height: 28
          radius: 10
          border_width: 1
          border_color: 0xD7DDD9
          bg_opa: COVER
          bg_color: 0xEEF3F0
          shadow_width: 0
          scrollable: false
          widgets:
            - image:
                align: CENTER
                src: ${getCoverActionImageId(entity, "close")}
          on_click:
            - homeassistant.action:
                action: cover.close_cover
                data:
                  entity_id: ${quoteYaml(entity.entityids[0])}
      - button:
          x: ${Math.max(Math.floor((entity.props.width - controlWidth) / 2), 8)}
          y: 45
          width: ${controlWidth}
          height: 28
          radius: 10
          border_width: 1
          border_color: 0xD7DDD9
          bg_opa: COVER
          bg_color: 0xF5F0E8
          shadow_width: 0
          scrollable: false
          widgets:
            - image:
                align: CENTER
                src: ${getCoverActionImageId(entity, "stop")}
          on_click:
            - homeassistant.action:
                action: cover.stop_cover
                data:
                  entity_id: ${quoteYaml(entity.entityids[0])}
      - button:
          x: ${Math.max(entity.props.width - controlWidth - 8, 8)}
          y: 45
          width: ${controlWidth}
          height: 28
          radius: 10
          border_width: 1
          border_color: 0xD7DDD9
          bg_opa: COVER
          bg_color: 0xEEF3F0
          shadow_width: 0
          scrollable: false
          widgets:
            - image:
                align: CENTER
                src: ${getCoverActionImageId(entity, "open")}
          on_click:
            - homeassistant.action:
                action: cover.open_cover
                data:
                  entity_id: ${quoteYaml(entity.entityids[0])}
      - label:
          align: BOTTOM_LEFT
          x: 6
          y: -14
          text_font: ${UI_FONT_BODY}
          text: "0%"
          text_color: 0x24323A
      - label:
          align: BOTTOM_RIGHT
          x: -8
          y: -14
          text_font: ${UI_FONT_BODY}
          text: "100%"
          text_color: 0x24323A
      - slider:
          id: ${getWidgetId(entity, 0)}
          x: 44
          y: ${entity.props.height - 27}
          width: ${sliderWidth}
          height: 10
          min_value: 0
          max_value: 100
          radius: 10
          bg_color: 0xD8DBE2
          border_width: 0
          knob:
            bg_color: 0xFFFFFF
            border_color: 0x6688EE
            border_width: 1
            width: 10
            height: 10
            pad_all: 0
            shadow_width: 0
          indicator:
            bg_color: 0x6688EE
          on_change:
            then:
              - if:
                  condition:
                    lambda: |-
                      return !id(${getCoverSyncingFlagId(entity)}) && lv_indev_get_act() != nullptr;
                  then:
                    - lvgl.label.update:
                        id: ${getValueLabelId(entity, 0)}
                        text: !lambda |-
                          static char buf[20];
                          int value = (int) x;
                          if (value < 0) value = 0;
                          if (value > 100) value = 100;
                          sprintf(buf, "current: %d%%", value);
                          return buf;
          on_release:
            then:
              - if:
                  condition:
                    lambda: |-
                      return !id(${getCoverSyncingFlagId(entity)}) && lv_indev_get_act() != nullptr;
                  then:
                    - homeassistant.action:
                        action: cover.set_cover_position
                        data:
                          entity_id: ${quoteYaml(entity.entityids[0])}
                        data_template:
                          position: "{{ position }}"
                        variables:
                          position: !lambda "return (int)x;"`;
}
