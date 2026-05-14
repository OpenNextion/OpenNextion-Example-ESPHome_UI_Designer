import {
  DEFAULT_MULTI_SWITCH_WIDTH,
  DEFAULT_MULTI_SWITCH_HEIGHT,
  MULTI_SWITCH_STYLE_TILE,
  MULTI_SWITCH_STYLE_LIST,
  SWITCH_WIDTH,
  SWITCH_HEIGHT,
  getMultiSwitchLayout,
  getMultiSwitchChannelTitle,
  isMultiSwitchChannelEnabled,
} from "../constants.js";
import { countEnabledChannels } from "./common.js";

function renderTilePreview(entity) {
  const group = document.createElement("div");
  group.className = "multi-switch-group";
  const channels = entity.entityids
    .map((entityId, index) => ({ entityId, index }))
    .filter(({ index }) => isMultiSwitchChannelEnabled(entity.props, index));
  const layout = getMultiSwitchLayout(entity.props.width, entity.props.height, channels.length, true);

  if (!channels.length) {
    const empty = document.createElement("div");
    empty.className = "multi-switch-empty";
    empty.textContent = "Enable channels";
    group.append(empty);
    return group;
  }

  channels.forEach((channel, index) => {
    const placement = layout.items[index];
    const button = document.createElement("div");
    button.className = "multi-switch-channel";
    button.style.left = `${placement.x}px`;
    button.style.top = `${placement.y}px`;
    button.style.width = `${placement.width}px`;
    button.style.height = `${placement.height}px`;

    const label = document.createElement("span");
    label.className = "multi-switch-channel-label";
    label.textContent = getMultiSwitchChannelTitle(entity.props, channel.index);
    button.append(label);
    group.append(button);
  });

  return group;
}

function renderListPreview(entity) {
  const group = document.createElement("div");
  group.className = "multi-switch-list-group";
  const channels = entity.entityids
    .map((entityId, index) => ({ entityId, index }))
    .filter(({ index }) => isMultiSwitchChannelEnabled(entity.props, index));

  if (!channels.length) {
    const empty = document.createElement("div");
    empty.className = "multi-switch-empty";
    empty.textContent = "Enable channels";
    group.append(empty);
    return group;
  }

  channels.forEach((channel, index) => {
    const item = document.createElement("div");
    item.className = "multi-switch-list-item";
    item.style.top = `${index * 44 + 44}px`;
    item.style.left = "16px";
    item.style.width = `${entity.props.width - 32}px`;
    item.style.height = "40px";

    const label = document.createElement("span");
    label.className = "multi-switch-list-label";
    label.textContent = getMultiSwitchChannelTitle(entity.props, channel.index);

    const switchShell = document.createElement("div");
    switchShell.className = "widget-switch";
    switchShell.style.right = "0px";
    switchShell.style.width = `${SWITCH_WIDTH}px`;
    switchShell.style.height = `${SWITCH_HEIGHT}px`;

    const knob = document.createElement("span");
    knob.className = "widget-switch-knob";
    switchShell.append(knob);
    item.append(label, switchShell);
    group.append(item);
  });

  return group;
}

export const multiSwitchComponent = {
  type: "multi_switch",
  label: "multi-switch",
  entityFields: [
    { label: "Channel 1 Entity ID", defaultValue: (index) => `switch.multi_${index}_1` },
    { label: "Channel 2 Entity ID", defaultValue: (index) => `switch.multi_${index}_2` },
    { label: "Channel 3 Entity ID", defaultValue: (index) => `switch.multi_${index}_3` },
    { label: "Channel 4 Entity ID", defaultValue: (index) => `switch.multi_${index}_4` },
  ],
  styleOptions: [
    { value: MULTI_SWITCH_STYLE_TILE, label: "tile" },
    { value: MULTI_SWITCH_STYLE_LIST, label: "list" },
  ],
  createEntity(index) {
    return {
      entityids: [
        `switch.multi_${index}_1`,
        `switch.multi_${index}_2`,
        `switch.multi_${index}_3`,
        `switch.multi_${index}_4`,
      ],
      type: "multi_switch",
      props: {
        x: 24,
        y: 24,
        width: DEFAULT_MULTI_SWITCH_WIDTH,
        height: DEFAULT_MULTI_SWITCH_HEIGHT,
        title: `Switch Group ${index}`,
        style: MULTI_SWITCH_STYLE_TILE,
        channel_1_title: "Switch 1",
        channel_2_title: "Switch 2",
        channel_3_title: "Switch 3",
        channel_4_title: "Switch 4",
        channel_1_enabled: true,
        channel_2_enabled: true,
        channel_3_enabled: false,
        channel_4_enabled: false,
      },
    };
  },
  normalizeStyle(value) {
    return value === MULTI_SWITCH_STYLE_LIST ? MULTI_SWITCH_STYLE_LIST : MULTI_SWITCH_STYLE_TILE;
  },
  defaultTitle() {
    return "Switch Group";
  },
  defaultWidth() {
    return DEFAULT_MULTI_SWITCH_WIDTH;
  },
  defaultHeight(style, props = {}) {
    if (style === MULTI_SWITCH_STYLE_LIST) {
      return Math.max(countEnabledChannels(props) * 44 + 48, DEFAULT_MULTI_SWITCH_HEIGHT);
    }
    return DEFAULT_MULTI_SWITCH_HEIGHT;
  },
  minWidth() {
    return 180;
  },
  minHeight() {
    return 104;
  },
  usesTopAlignedTitle() {
    return true;
  },
  shouldRenderWidgetTitle() {
    return true;
  },
  getInspectorState() {
    return {
      showEntityId: false,
      showEntityId2: false,
      showStyle: true,
      showMultiSwitch: true,
      showThermoIcons: false,
      showHmiBrightness: false,
      showLightIcon: false,
      showLightTilePosition: false,
      showLightSliders: false,
      showActiveColor: true,
    };
  },
  populateInspector(entity, elements) {
    elements.multiSwitchEnabledInputs?.forEach((input, index) => {
      input.checked = isMultiSwitchChannelEnabled(entity.props, index);
    });
    elements.multiSwitchEntityInputs?.forEach((input, index) => {
      input.value = entity.entityids[index] || "";
    });
    elements.multiSwitchTitleInputs?.forEach((input, index) => {
      input.value = getMultiSwitchChannelTitle(entity.props, index);
    });
  },
  applyInspectorChanges(entity, elements) {
    elements.multiSwitchEntityInputs.forEach((input, index) => {
      const trimmedEntityId = input.value.trim();
      if (trimmedEntityId) {
        entity.entityids[index] = trimmedEntityId;
      }
      entity.props[`channel_${index + 1}_title`] = elements.multiSwitchTitleInputs[index].value;
      entity.props[`channel_${index + 1}_enabled`] = elements.multiSwitchEnabledInputs[index].checked;
    });
  },
  applyInspectorCommit(entity, elements) {
    elements.multiSwitchEnabledInputs.forEach((input, index) => {
      entity.props[`channel_${index + 1}_title`] = elements.multiSwitchTitleInputs[index].value.trim() || `Switch ${index + 1}`;
      entity.props[`channel_${index + 1}_enabled`] = input.checked;
    });
  },
  appendSpecProps(lines, entity, propIndent, { quoteYaml }) {
    for (let index = 0; index < 4; index += 1) {
      lines.push(`${propIndent}  channel_${index + 1}_title: ${quoteYaml(getMultiSwitchChannelTitle(entity.props, index))}`);
      lines.push(`${propIndent}  channel_${index + 1}_enabled: ${isMultiSwitchChannelEnabled(entity.props, index) ? "true" : "false"}`);
    }
  },
  renderPreview(entity) {
    return entity.props.style === MULTI_SWITCH_STYLE_LIST ? renderListPreview(entity) : renderTilePreview(entity);
  },
};
