import { MULTI_SWITCH_STYLE_LIST } from "../../constants.js";

export function renderMultiSwitchEsphomeWidget(entity, renderers) {
  return entity.props.style === MULTI_SWITCH_STYLE_LIST
    ? renderMultiSwitchListWidget(entity, renderers)
    : renderMultiSwitchWidget(entity, renderers);
}

function renderMultiSwitchWidget(entity, ctx) {
  const {
    buttonActiveBgColor,
    getContainerId,
    getWidgetId,
    getHaSwitchId,
    getEnabledSwitchIndices,
    getMultiSwitchChannelTitle,
    getMultiSwitchLayout,
    quoteYaml,
    UI_FONT_BODY,
  } = ctx;
  const enabledIndices = getEnabledSwitchIndices(entity);
  const layout = getMultiSwitchLayout(entity.props.width, entity.props.height, enabledIndices.length, true);
  const widgets = enabledIndices.length
    ? enabledIndices.map((entityIndex, visualIndex) => {
      const item = layout.items[visualIndex];
      return `      - button:
          id: ${getWidgetId(entity, entityIndex)}
          x: ${item.x}
          y: ${item.y}
          width: ${item.width}
          height: ${item.height}
          checkable: true
          radius: 12
          pad_all: 0
          border_width: 1
          border_color: 0xD7DDD9
          bg_opa: COVER
          bg_color: 0xEEF3F0
          checked:
            bg_color: ${buttonActiveBgColor(entity)}
          shadow_width: 0
          scrollable: false
          scrollbar_mode: "OFF"
          state:
            checked: !lambda return id(${getHaSwitchId(entity, entityIndex)}).state;
          widgets:
            - label:
                align: CENTER
                text_font: ${UI_FONT_BODY}
                text: ${quoteYaml(getMultiSwitchChannelTitle(entity.props, entityIndex))}
                text_color: 0x24323A
          on_change:
            then:
              - if:
                  condition:
                    lambda: return x;
                  then:
                    - switch.turn_on: ${getHaSwitchId(entity, entityIndex)}
                  else:
                    - switch.turn_off: ${getHaSwitchId(entity, entityIndex)}`;
    }).join("\n")
    : `      - obj:
          x: 16
          y: ${layout.top}
          width: ${Math.max(entity.props.width - 32, 72)}
          height: ${Math.max(entity.props.height - layout.top - 16, 40)}
          radius: 12
          border_width: 1
          border_color: 0xC4D0CB
          bg_opa: TRANSP
          scrollable: false
          scrollbar_mode: "OFF"
          widgets:
            - label:
                align: CENTER
                text_font: ${UI_FONT_BODY}
                text: "Enable channels"
                text_color: 0x7B8A92`;

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
          align: TOP_LEFT
          x: 16
          y: 16
          text_font: ${UI_FONT_BODY}
          text: ${quoteYaml(entity.props.title)}
${widgets}`;
}

function renderMultiSwitchListWidget(entity, ctx) {
  const {
    getContainerId,
    getWidgetId,
    getHaSwitchId,
    getEnabledSwitchIndices,
    getMultiSwitchChannelTitle,
    quoteYaml,
    SWITCH_HEIGHT,
    SWITCH_WIDTH,
    UI_FONT_BODY,
  } = ctx;
  const enabledIndices = getEnabledSwitchIndices(entity);
  const widgets = enabledIndices.map((entityIndex, visualIndex) => {
    return `      - obj:
          x: 16
          y: ${visualIndex * 44 + 44}
          width: ${entity.props.width - 32}
          height: 40
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
                text_font: ${UI_FONT_BODY}
                text: ${quoteYaml(getMultiSwitchChannelTitle(entity.props, entityIndex))}
                text_color: 0x24323A
            - switch:
                id: ${getWidgetId(entity, entityIndex)}
                width: ${SWITCH_WIDTH}
                height: ${SWITCH_HEIGHT}
                state:
                  checked: !lambda return id(${getHaSwitchId(entity, entityIndex)}).state;
                on_change:
                  then:
                    - if:
                        condition:
                          lambda: return x;
                        then:
                          - switch.turn_on: ${getHaSwitchId(entity, entityIndex)}
                        else:
                          - switch.turn_off: ${getHaSwitchId(entity, entityIndex)}`;
  }).join("\n");

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
          align: TOP_LEFT
          x: 16
          y: 16
          text_font: ${UI_FONT_BODY}
          text: ${quoteYaml(entity.props.title)}
${widgets}`;
}
