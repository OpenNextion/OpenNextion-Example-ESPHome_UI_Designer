export function renderThermoHygrometerEsphomeWidget(entity, renderers) {
  const {
    getContainerId,
    getMetricCaption,
    getMetricSuffix,
    getThermoImageId,
    getValueLabelId,
    UI_FONT_VALUE,
  } = renderers;
  const valueBoxWidth = Math.max(Math.floor((entity.props.width - 44) / 2), 84);
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
      - obj:
          align: LEFT_MID
          x: 16
          width: ${valueBoxWidth}
          height: 80
          radius: 12
          border_width: 1
          border_color: 0xD7DDD9
          pad_top: 10
          pad_bottom: 10
          pad_left: 8
          pad_right: 8
          bg_opa: COVER
          bg_color: 0xEEF3F0
          shadow_width: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - image:
                align: TOP_MID
                src: ${getThermoImageId(entity, "temp")}
            - label:
                id: ${getValueLabelId(entity, 0)}
                align: BOTTOM_MID
                text_font: ${UI_FONT_VALUE}
                text: "${getMetricCaption(0)}: --${getMetricSuffix(0)}"
                text_color: 0x24323A
      - obj:
          align: RIGHT_MID
          x: -16
          width: ${valueBoxWidth}
          height: 80
          radius: 12
          border_width: 1
          border_color: 0xD7DDD9
          pad_top: 10
          pad_bottom: 10
          pad_left: 8
          pad_right: 8
          bg_opa: COVER
          bg_color: 0xEEF3F0
          shadow_width: 0
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - image:
                align: TOP_MID
                src: ${getThermoImageId(entity, "hum")}
            - label:
                id: ${getValueLabelId(entity, 1)}
                align: BOTTOM_MID
                text_font: ${UI_FONT_VALUE}
                text: "${getMetricCaption(1)}: --${getMetricSuffix(1)}"
                text_color: 0x24323A`;
}
