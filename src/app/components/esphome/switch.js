import { SWITCH_STYLE_SWITCH } from "../../constants.js";

export function renderSwitchEsphomeWidget(entity, renderers) {
  return entity.props.style === SWITCH_STYLE_SWITCH
    ? renderSingleSwitchToggleWidget(entity, renderers)
    : renderSingleSwitchButtonWidget(entity, renderers);
}

function renderSingleSwitchToggleWidget(entity, ctx) {
  const { getContainerId, getWidgetId, getHaSwitchId, quoteYaml, UI_FONT_BODY, SWITCH_WIDTH, SWITCH_HEIGHT } = ctx;
  return `- obj:
    id: ${getContainerId(entity)}
    x: ${entity.props.x}
    y: ${entity.props.y}
    width: ${entity.props.width}
    height: ${entity.props.height}
    radius: 14
    border_width: 0
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
          align: LEFT_MID
          x: 16
          text_font: ${UI_FONT_BODY}
          text: ${quoteYaml(entity.props.title)}
      - switch:
          id: ${getWidgetId(entity, 0)}
          align: RIGHT_MID
          x: -16
          width: ${SWITCH_WIDTH}
          height: ${SWITCH_HEIGHT}
          state:
            checked: !lambda return id(${getHaSwitchId(entity, 0)}).state;
          on_change:
            then:
              - if:
                  condition:
                    lambda: return x;
                  then:
                    - switch.turn_on: ${getHaSwitchId(entity, 0)}
                  else:
                    - switch.turn_off: ${getHaSwitchId(entity, 0)}`;
}

function renderSingleSwitchButtonWidget(entity, ctx) {
  const {
    buttonActiveBgColor,
    buttonInactiveBgColor,
    getContainerId,
    getWidgetId,
    getHaSwitchId,
    quoteYaml,
    UI_FONT_BODY,
  } = ctx;
  return `- obj:
    id: ${getContainerId(entity)}
    x: ${entity.props.x}
    y: ${entity.props.y}
    width: ${entity.props.width}
    height: ${entity.props.height}
    radius: 14
    border_width: 0
    pad_all: 0
    bg_opa: COVER
    bg_color: 0xF8FBF9
    shadow_width: 4
    shadow_color: 0x1F2933
    shadow_opa: 6%
    scrollable: false
    scrollbar_mode: "OFF"
    widgets:
      - button:
          id: ${getWidgetId(entity, 0)}
          x: 0
          y: 0
          width: ${entity.props.width}
          height: ${entity.props.height}
          checkable: true
          radius: 12
          pad_all: 0
          border_width: 0
          bg_opa: COVER
          bg_color: ${buttonInactiveBgColor(entity)}
          checked:
            bg_color: ${buttonActiveBgColor(entity)}
          shadow_width: 0
          scrollable: false
          state:
            checked: !lambda return id(${getHaSwitchId(entity, 0)}).state;
          widgets:
            - label:
                align: CENTER
                text_font: ${UI_FONT_BODY}
                text: ${quoteYaml(entity.props.title)}
                text_color: 0x24323A
          on_change:
                then:
                  - if:
                      condition:
                        lambda: return x;
                      then:
                        - switch.turn_on: ${getHaSwitchId(entity, 0)}
                      else:
                        - switch.turn_off: ${getHaSwitchId(entity, 0)}`;
}
