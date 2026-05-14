import { BOARD_CONFIGS } from "./constants.js";
import { renderCombinedYaml } from "./esphome.js";
import {
  formatTimestampForFilename,
  restoreStateFromCache,
  resetStateToEmptyDefaults,
  saveStateToCache,
} from "./persistence.js";
import {
  getCurrentScreen,
  setCurrentScreen,
  syncCurrentScreenEntities,
  syncScreenControls,
} from "./screens.js";
import {
  pointerToCanvas,
  renderCanvas,
  renderEntityList,
  renderInspector,
  renderScreenTabs,
  setActivePaletteSwatch,
  syncCanvasUi,
  updateCanvasAppearance,
  updateLightIconInspectorPreview,
  updateThermoIconInspectorPreview,
} from "./preview.js";
import {
  applyComponentInspectorChanges,
  applyComponentInspectorCommit,
  clamp,
  clampNumber,
  createEntityDraft,
  createInitialState,
  createScreenDraft,
  defaultTitleForEntity,
  generateSpecYaml,
  minHeightForType,
  minWidthForType,
  normalizeEntities,
  normalizeEntity,
  normalizeIconSource,
  normalizeStyle,
  normalizeSwipeDirection,
  normalizeType,
  normalizeYamlColor,
  parseSpecYaml,
  readPendingNumber,
  supportsHeightResize,
  updateCanvasDimensions,
  yamlColorToHtml,
  htmlColorToYaml,
  getEntityCapability,
  getDeviceNameValidation,
} from "./spec.js";

const state = createInitialState();

const elements = {
  canvas: document.getElementById("canvas"),
  entityList: document.getElementById("entity-list"),
  yamlIo: document.getElementById("yaml-io"),
  statusNode: document.getElementById("status"),
  emptyState: document.getElementById("empty-state"),
  inspectorForm: document.getElementById("inspector-form"),
  addEntityBtn: document.getElementById("add-entity-btn"),
  loadYamlBtn: document.getElementById("load-yaml-btn"),
  copyYamlBtn: document.getElementById("copy-yaml-btn"),
  downloadYamlBtn: document.getElementById("download-yaml-btn"),
  buildFinalBtn: document.getElementById("build-final-btn"),
  downloadFinalBtn: document.getElementById("download-final-btn"),
  copyFinalBtn: document.getElementById("copy-final-btn"),
  finalYamlIo: document.getElementById("final-yaml-io"),
  buildStatusNode: document.getElementById("build-status"),
  template: document.getElementById("entity-item-template"),
  boardSelect: document.getElementById("board-select"),
  rotationSelect: document.getElementById("rotation-select"),
  swipeDirectionSelect: document.getElementById("swipe-direction"),
  screenSelect: document.getElementById("screen-select"),
  screenNameInput: document.getElementById("screen-name"),
  addScreenBtn: document.getElementById("add-screen-btn"),
  deleteScreenBtn: document.getElementById("delete-screen-btn"),
  previewScreens: document.getElementById("preview-screens"),
  previewDirection: document.getElementById("preview-direction"),
  screenBgColorInput: document.getElementById("screen-bg-color"),
  screenPalette: document.getElementById("screen-palette"),
  configTabBoard: document.getElementById("config-tab-board"),
  configTabWifi: document.getElementById("config-tab-wifi"),
  configPanelBoard: document.getElementById("config-panel-board"),
  configPanelWifi: document.getElementById("config-panel-wifi"),
  deviceNameInput: document.getElementById("device-name"),
  deviceNameHelp: document.getElementById("device-name-help"),
  friendlyNameInput: document.getElementById("friendly-name"),
  wifiSsidInput: document.getElementById("wifi-ssid"),
  wifiPasswordInput: document.getElementById("wifi-password"),
  canvasResTitle: document.getElementById("canvas-res-title"),
  fieldType: document.getElementById("field-type"),
  fieldEntityIdRow: document.getElementById("field-entityid").closest("label"),
  fieldEntityIdLabel: document.getElementById("field-entityid-label"),
  fieldEntityId: document.getElementById("field-entityid"),
  fieldEntityId2Label: document.getElementById("field-entityid-2-label"),
  fieldEntityId2: document.getElementById("field-entityid-2"),
  fieldTitle: document.getElementById("field-title"),
  fieldStyle: document.getElementById("field-style"),
  fieldX: document.getElementById("field-x"),
  fieldY: document.getElementById("field-y"),
  fieldWidth: document.getElementById("field-width"),
  fieldHeight: document.getElementById("field-height"),
  dualFields: document.getElementById("dual-fields"),
  switchStyleFields: document.getElementById("switch-style-fields"),
  multiSwitchFields: document.getElementById("multi-switch-fields"),
  thermoIconFields: document.getElementById("thermo-icon-fields"),
  lightIconFields: document.getElementById("light-icon-fields"),
  hmiBrightnessFields: document.getElementById("hmi-brightness-fields"),
  lightTilePositionFields: document.getElementById("light-tile-position-fields"),
  lightSliderFields: document.getElementById("light-slider-fields"),
  fieldTempIcon: document.getElementById("field-temp-icon"),
  fieldHumIcon: document.getElementById("field-hum-icon"),
  fieldLightIcon: document.getElementById("field-light-icon"),
  fieldLightTileIconPosition: document.getElementById("field-light-tile-icon-position"),
  fieldHmiShowHeader: document.getElementById("field-hmi-show-header"),
  fieldHmiSliderColor: document.getElementById("field-hmi-slider-color"),
  fieldHmiSliderColorHex: document.getElementById("field-hmi-slider-color-hex"),
  fieldHmiSliderColorCopy: document.getElementById("field-hmi-slider-color-copy"),
  fieldColorTemp: document.getElementById("field-color-temp"),
  fieldHue360: document.getElementById("field-hue-360"),
  tempIconPreviewImg: document.getElementById("temp-icon-preview-img"),
  humIconPreviewImg: document.getElementById("hum-icon-preview-img"),
  tempIconPreviewFallback: document.getElementById("temp-icon-preview-fallback"),
  humIconPreviewFallback: document.getElementById("hum-icon-preview-fallback"),
  lightIconPreviewImg: document.getElementById("light-icon-preview-img"),
  lightIconPreviewFallback: document.getElementById("light-icon-preview-fallback"),
  multiSwitchEnabledInputs: [1, 2, 3, 4].map((index) => document.getElementById(`field-multi-enabled-${index}`)),
  multiSwitchEntityInputs: [1, 2, 3, 4].map((index) => document.getElementById(`field-multi-entityid-${index}`)),
  multiSwitchTitleInputs: [1, 2, 3, 4].map((index) => document.getElementById(`field-multi-title-${index}`)),
  activeBgColorFields: document.getElementById("active-bg-color-fields"),
  fieldActiveBgColor: document.getElementById("field-active-bg-color"),
  fieldActiveBgColorHex: document.getElementById("field-active-bg-color-hex"),
  fieldActiveBgColorCopy: document.getElementById("field-active-bg-color-copy"),
  fieldLightPreviewCt: document.getElementById("field-light-preview-ct"),
  fieldLightPreviewCtRow: document.getElementById("field-light-preview-ct-row"),
  fieldLightPreviewHue: document.getElementById("field-light-preview-hue"),
  fieldLightPreviewHueRow: document.getElementById("field-light-preview-hue-row"),
  screenBgColorHex: document.getElementById("screen-bg-color-hex"),
  screenBgColorCopy: document.getElementById("screen-bg-color-copy"),
};

const configTabs = [
  { key: "board", button: elements.configTabBoard, panel: elements.configPanelBoard },
  { key: "wifi", button: elements.configTabWifi, panel: elements.configPanelWifi },
];

function setActiveConfigTab(targetKey) {
  configTabs.forEach(({ key, button, panel }) => {
    const isActive = key === targetKey;
    if (!button || !panel) {
      return;
    }
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    panel.classList.toggle("hidden", !isActive);
    panel.hidden = !isActive;
  });
}

configTabs.forEach(({ key, button }) => {
  button?.addEventListener("click", () => {
    setActiveConfigTab(key);
  });
});

setActiveConfigTab("board");

elements.addEntityBtn.addEventListener("click", () => {
  const nextIndex = state.entities.length + 1;
  const nextType = getSelectedEntity()?.type || "switch";
  const entity = normalizeEntity(createEntityDraft(nextType, nextIndex), state.canvasWidth, state.canvasHeight);
  state.entities.push(entity);
  state.selectedId = entity.id;
  syncAll(`Added ${getEntityCapability(nextType).label} widget to ${getCurrentScreen(state).name}`);
});

elements.addScreenBtn?.addEventListener("click", () => {
  const nextScreen = createScreenDraft(state.screens.length + 1, state.canvasWidth, state.canvasHeight);
  state.screens.push(nextScreen);
  setCurrentScreen(state, nextScreen.id, { syncScreenControls: refreshScreenControls });
  syncAll(`Added ${nextScreen.name}`);
});

elements.deleteScreenBtn?.addEventListener("click", () => {
  if (state.screens.length <= 1) {
    return;
  }
  const currentScreen = getCurrentScreen(state);
  const index = state.screens.findIndex((screen) => screen.id === currentScreen.id);
  state.screens.splice(index, 1);
  const fallback = state.screens[Math.max(0, index - 1)] || state.screens[0];
  setCurrentScreen(state, fallback.id, { syncScreenControls: refreshScreenControls });
  syncAll(`Deleted ${currentScreen.name}`);
});

elements.screenSelect?.addEventListener("change", () => {
  setCurrentScreen(state, elements.screenSelect.value, { syncScreenControls: refreshScreenControls });
  syncAll(`Switched to ${getCurrentScreen(state).name}`);
});

elements.screenNameInput?.addEventListener("input", () => {
  const currentScreen = getCurrentScreen(state);
  currentScreen.name = elements.screenNameInput.value.trim() || currentScreen.name;
  syncAll("Screen name updated");
});

elements.swipeDirectionSelect?.addEventListener("change", () => {
  state.swipeDirection = normalizeSwipeDirection(elements.swipeDirectionSelect.value);
  syncAll(`Swipe direction set to ${state.swipeDirection}`);
});

elements.loadYamlBtn.addEventListener("click", () => {
  try {
    const data = parseSpecYaml(elements.yamlIo.value);
    if (data.board && BOARD_CONFIGS[data.board]) {
      state.board = data.board;
      elements.boardSelect.value = data.board;
    }
    state.rotation = data.rotation || 0;
    state.screenBgColor = normalizeYamlColor(data.screen?.bg_color || data.screen_bg_color || state.screenBgColor);
    state.swipeDirection = normalizeSwipeDirection(data.screen?.swipe_direction || data.screen?.swipe_dir || state.swipeDirection);
    state.deviceName = String(data.device?.name || data.device_name || state.deviceName);
    state.friendlyName = String(data.device?.friendly_name || data.friendly_name || state.friendlyName).trim();
    state.wifiSsid = String(data.wifi?.ssid || data.wifi_ssid || state.wifiSsid).trim();
    state.wifiPassword = String(data.wifi?.password || data.wifi_password || state.wifiPassword).trim();
    updateCanvasDimensions(state);
    state.screens = normalizeScreens(
      data.screens?.length ? data.screens : [{ name: "Screen 1", entities: data.entities || [] }],
      state.canvasWidth,
      state.canvasHeight
    );
    state.currentScreenId = state.screens[0]?.id ?? null;
    syncCurrentScreenEntities(state);
    syncFormControls();
    syncAll("Loaded YAML");
  } catch (error) {
    setStatus(error.message, true);
  }
});

elements.copyYamlBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(generateSpecYaml(state));
    setStatus("YAML copied to clipboard");
  } catch (_error) {
    setStatus("Clipboard unavailable. Copy from the text area.", true);
  }
});

elements.downloadYamlBtn.addEventListener("click", () => {
  const blob = new Blob([generateSpecYaml(state)], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ui_spec_${formatTimestampForFilename()}.yaml`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded YAML");
});

elements.buildFinalBtn.addEventListener("click", () => {
  buildFinalYaml(true);
});

elements.downloadFinalBtn.addEventListener("click", () => {
  if (!elements.finalYamlIo.value.trim()) {
    const built = buildFinalYaml();
    if (!built) {
      return;
    }
  }
  const blob = new Blob([elements.finalYamlIo.value], { type: "text/yaml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.board}.generated_${formatTimestampForFilename()}.yaml`;
  link.click();
  URL.revokeObjectURL(url);
  setStatus("Downloaded final ESPHome YAML");
});

elements.copyFinalBtn.addEventListener("click", async () => {
  if (!elements.finalYamlIo.value.trim()) {
    const built = buildFinalYaml();
    if (!built) {
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(elements.finalYamlIo.value);
    setStatus("Final ESPHome YAML copied");
  } catch (_error) {
    setStatus("Clipboard unavailable. Copy from the text area.", true);
  }
});

[
  elements.fieldType,
  elements.fieldEntityId,
  elements.fieldEntityId2,
  elements.fieldTitle,
  elements.fieldStyle,
  elements.fieldTempIcon,
  elements.fieldHumIcon,
  elements.fieldLightIcon,
  elements.fieldLightTileIconPosition,
  elements.fieldX,
  elements.fieldY,
  elements.fieldWidth,
  elements.fieldHeight,
  elements.fieldColorTemp,
  elements.fieldHue360,
  elements.fieldActiveBgColor,
  elements.fieldLightPreviewCt,
  elements.fieldLightPreviewHue,
  elements.fieldHmiShowHeader,
  elements.fieldHmiSliderColor,
  ...elements.multiSwitchEnabledInputs,
  ...elements.multiSwitchEntityInputs,
  ...elements.multiSwitchTitleInputs,
].forEach((input) => {
  input.addEventListener("input", handleInspectorChange);
  input.addEventListener("change", handleInspectorCommit);
});

elements.boardSelect.addEventListener("change", () => {
  const result = setBoard(elements.boardSelect.value);
  syncAll(
    result.restored
      ? `Switched to ${BOARD_CONFIGS[state.board].name} and restored saved config`
      : result.recovered
        ? `Switched to ${BOARD_CONFIGS[state.board].name}; invalid saved config was cleared`
        : `Switched to ${BOARD_CONFIGS[state.board].name}`
  );
});

elements.rotationSelect.addEventListener("change", () => {
  setRotation(parseInt(elements.rotationSelect.value, 10));
  syncAll(`Rotated to ${state.rotation}°`);
});

if (elements.screenBgColorInput) {
  elements.screenBgColorInput.addEventListener("input", () => {
    state.screenBgColor = htmlColorToYaml(elements.screenBgColorInput.value);
    updateCanvasAppearance(state.screenBgColor);
    updateColorHexLabel(elements.screenBgColorInput, elements.screenBgColorHex);
    elements.yamlIo.value = generateSpecYaml(state);
    buildFinalYaml();
    saveStateToCache(state);
    setActivePaletteSwatch(elements.screenPalette, elements.screenBgColorInput.value);
    setStatus("Background color updated");
  });
}

elements.screenBgColorCopy?.addEventListener("click", () => {
  handleCopyColor(elements.screenBgColorInput.value, elements.screenBgColorCopy);
});

elements.fieldActiveBgColorCopy?.addEventListener("click", () => {
  handleCopyColor(elements.fieldActiveBgColor.value, elements.fieldActiveBgColorCopy);
});

elements.fieldHmiSliderColorCopy?.addEventListener("click", () => {
  handleCopyColor(elements.fieldHmiSliderColor.value, elements.fieldHmiSliderColorCopy);
});

if (elements.screenPalette) {
  elements.screenPalette.querySelectorAll(".palette-swatch").forEach((button) => {
    button.addEventListener("click", () => {
      const color = button.dataset.color || "#f3efe7";
      if (elements.screenBgColorInput) {
        elements.screenBgColorInput.value = color;
      }
      state.screenBgColor = htmlColorToYaml(color);
      updateCanvasAppearance(state.screenBgColor);
      elements.yamlIo.value = generateSpecYaml(state);
      buildFinalYaml();
      saveStateToCache(state);
      setActivePaletteSwatch(elements.screenPalette, color);
      setStatus("Background color updated");
    });
  });
}

if (elements.wifiSsidInput) {
  elements.wifiSsidInput.addEventListener("input", () => {
    state.wifiSsid = elements.wifiSsidInput.value.trim();
    elements.yamlIo.value = generateSpecYaml(state);
    buildFinalYaml();
    saveStateToCache(state);
    setStatus("Wi-Fi SSID updated");
  });
}

if (elements.wifiPasswordInput) {
  elements.wifiPasswordInput.addEventListener("input", () => {
    state.wifiPassword = elements.wifiPasswordInput.value.trim();
    elements.yamlIo.value = generateSpecYaml(state);
    buildFinalYaml();
    saveStateToCache(state);
    setStatus("Wi-Fi password updated");
  });
}

if (elements.deviceNameInput) {
  elements.deviceNameInput.addEventListener("input", () => {
    state.deviceName = elements.deviceNameInput.value;
    elements.yamlIo.value = generateSpecYaml(state);
    buildFinalYaml();
    saveStateToCache(state);
    renderDeviceNameHelp();
    setStatus("Device name updated");
  });
}

if (elements.friendlyNameInput) {
  elements.friendlyNameInput.addEventListener("input", () => {
    state.friendlyName = elements.friendlyNameInput.value.trim();
    elements.yamlIo.value = generateSpecYaml(state);
    buildFinalYaml();
    saveStateToCache(state);
    setStatus("Friendly name updated");
  });
}

elements.canvas.addEventListener("pointermove", (event) => {
  if (!state.drag) {
    return;
  }
  const entity = state.entities.find((item) => item.id === state.drag.id);
  if (!entity) {
    return;
  }

  const position = pointerToCanvas(event, elements.canvas, state);
  if (state.drag.mode === "move") {
    entity.props.x = clamp(Math.round(position.x - state.drag.offsetX), 0, state.canvasWidth - entity.props.width);
    entity.props.y = clamp(Math.round(position.y - state.drag.offsetY), 0, state.canvasHeight - entity.props.height);
    setStatus(`Dragging ${entity.props.title}`);
  } else if (state.drag.mode === "resize") {
    entity.props.width = clamp(
      Math.round(state.drag.startWidth + (position.x - state.drag.startX)),
      minWidthForType(entity.type),
      state.canvasWidth - entity.props.x
    );
    if (supportsHeightResize(entity.type, entity.props.style)) {
      entity.props.height = clamp(
        Math.round(state.drag.startHeight + (position.y - state.drag.startY)),
        minHeightForType(entity.type, entity.props.style, entity.props),
        state.canvasHeight - entity.props.y
      );
    }
    setStatus(`Resizing ${entity.props.title}`);
  }
  renderApp();
  elements.yamlIo.value = generateSpecYaml(state);
  buildFinalYaml();
});

elements.canvas.addEventListener("pointerup", stopDrag);
elements.canvas.addEventListener("pointerleave", stopDrag);
elements.canvas.addEventListener("pointercancel", stopDrag);

function setBoard(boardKey) {
  if (!BOARD_CONFIGS[boardKey]) {
    return { restored: false, recovered: false };
  }
  if (state.board === boardKey) {
    syncCanvasUi(state, elements.canvasResTitle);
    updateCanvasAppearance(state.screenBgColor);
    return { restored: false, recovered: false };
  }

  saveStateToCache(state);
  const restoreResult = restoreStateFromCache(state, boardKey, {
    syncCurrentScreenEntities: () => syncCurrentScreenEntities(state),
  });
  if (!restoreResult.restored && !restoreResult.recovered) {
    resetStateToEmptyDefaults(state, boardKey, {
      syncCurrentScreenEntities: () => syncCurrentScreenEntities(state),
    });
  }
  syncFormControls();
  return restoreResult;
}

function setRotation(deg) {
  state.rotation = deg;
  updateCanvasDimensions(state);
  syncCurrentScreenEntities(state);
  syncCanvasUi(state, elements.canvasResTitle);
  updateCanvasAppearance(state.screenBgColor);
}

function stopDrag() {
  if (!state.drag) {
    return;
  }
  const wasMode = state.drag.mode;
  state.drag = null;
  saveStateToCache(state);
  setStatus(wasMode === "resize" ? "Size updated" : "Position updated");
}

function handleInspectorChange() {
  const entity = getSelectedEntity();
  if (!entity) {
    return;
  }

  const nextType = normalizeType(elements.fieldType.value);
  if (entity.type !== nextType) {
    const draft = normalizeEntity(createEntityDraft(nextType, state.entities.length + 1), state.canvasWidth, state.canvasHeight);
    entity.type = nextType;
    entity.entityids = draft.entityids.map((fallback, index) => entity.entityids[index] || fallback);
    entity.props.width = Math.max(entity.props.width, draft.props.width);
    entity.props.style = normalizeStyle(nextType, draft.props.style);
    entity.props.height = Math.max(entity.props.height, minHeightForType(nextType, entity.props.style, entity.props));
  }

  entity.props.style = normalizeStyle(entity.type, elements.fieldStyle.value || entity.props.style);
  if (!supportsHeightResize(entity.type, entity.props.style)) {
    entity.props.height = minHeightForType(entity.type, entity.props.style, entity.props);
  }

  const capability = getEntityCapability(entity.type);
  const trimmedEntityId = elements.fieldEntityId.value.trim();
  if (capability.entityFields.length > 0 && trimmedEntityId) {
    entity.entityids[0] = trimmedEntityId;
  }

  entity.props.title = elements.fieldTitle.value;
  applyComponentInspectorChanges(entity, elements, {
    htmlColorToYaml,
    minHeightForType,
    normalizeIconSource,
    updateColorHexLabel,
  });
  if (!supportsHeightResize(entity.type, entity.props.style)) {
    entity.props.height = minHeightForType(entity.type, entity.props.style, entity.props);
  }

  const pendingWidth = readPendingNumber(elements.fieldWidth.value);
  if (pendingWidth !== null) {
    entity.props.width = clamp(pendingWidth, minWidthForType(entity.type), state.canvasWidth);
  }

  const pendingHeight = readPendingNumber(elements.fieldHeight.value);
  if (pendingHeight !== null && supportsHeightResize(entity.type, entity.props.style)) {
    entity.props.height = clamp(
      pendingHeight,
      minHeightForType(entity.type, entity.props.style, entity.props),
      state.canvasHeight
    );
  }

  if (elements.fieldActiveBgColor) {
    entity.props.active_bg_color = htmlColorToYaml(elements.fieldActiveBgColor.value);
  }

  const maxX = Math.max(0, state.canvasWidth - entity.props.width);
  const maxY = Math.max(0, state.canvasHeight - entity.props.height);
  const pendingX = readPendingNumber(elements.fieldX.value);
  const pendingY = readPendingNumber(elements.fieldY.value);

  if (pendingX !== null) {
    entity.props.x = clamp(pendingX, 0, maxX);
  }
  if (pendingY !== null) {
    entity.props.y = clamp(pendingY, 0, maxY);
  }

  syncFromInspector("Inspector updated");
}

function handleInspectorCommit() {
  const entity = getSelectedEntity();
  if (!entity) {
    return;
  }

  entity.type = normalizeType(elements.fieldType.value);
  const draft = normalizeEntity(createEntityDraft(entity.type, state.entities.length + 1), state.canvasWidth, state.canvasHeight);
  entity.entityids = draft.entityids.map((fallback, index) => {
    const inputValue = entity.type === "multi_switch"
      ? elements.multiSwitchEntityInputs[index]?.value.trim()
      : index === 0
        ? elements.fieldEntityId.value.trim()
        : elements.fieldEntityId2.value.trim();
    return inputValue || entity.entityids[index] || fallback;
  });
  entity.props.style = normalizeStyle(entity.type, elements.fieldStyle.value || entity.props.style);
  entity.props.title = elements.fieldTitle.value.trim() || defaultTitleForEntity(entity);
  applyComponentInspectorCommit(entity, elements, {
    htmlColorToYaml,
    normalizeIconSource,
    updateColorHexLabel,
  });
  if (elements.fieldActiveBgColor) {
    entity.props.active_bg_color = htmlColorToYaml(elements.fieldActiveBgColor.value);
    updateColorHexLabel(elements.fieldActiveBgColor, elements.fieldActiveBgColorHex);
  }
  entity.props.width = clampNumber(
    elements.fieldWidth.value,
    minWidthForType(entity.type, entity.props.style),
    state.canvasWidth
  );
  if (supportsHeightResize(entity.type, entity.props.style)) {
    entity.props.height = clampNumber(
      elements.fieldHeight.value,
      minHeightForType(entity.type, entity.props.style, entity.props),
      state.canvasHeight
    );
  } else {
    entity.props.height = minHeightForType(entity.type, entity.props.style, entity.props);
  }
  entity.props.x = clamp(clampNumber(elements.fieldX.value, 0, state.canvasWidth), 0, state.canvasWidth - entity.props.width);
  entity.props.y = clamp(clampNumber(elements.fieldY.value, 0, state.canvasHeight), 0, state.canvasHeight - entity.props.height);

  syncAll("Inspector updated");
}

function syncAll(message = "Ready") {
  renderApp();
  elements.yamlIo.value = generateSpecYaml(state);
  buildFinalYaml();
  saveStateToCache(state);
  setStatus(message);
}

function syncFromInspector(message = "Ready") {
  renderApp();
  elements.yamlIo.value = generateSpecYaml(state);
  buildFinalYaml();
  saveStateToCache(state);
  setStatus(message);
}

function renderApp() {
  refreshScreenControls();
  renderCanvas(state, elements, {
    onSelect(entityId, message) {
      state.selectedId = entityId;
      syncAll(message);
    },
    onResizeStart(event, entity, resizeHandle) {
      event.stopPropagation();
      event.preventDefault();
      state.selectedId = entity.id;
      const position = pointerToCanvas(event, elements.canvas, state);
      state.drag = {
        id: entity.id,
        mode: "resize",
        startX: position.x,
        startY: position.y,
        startWidth: entity.props.width,
        startHeight: entity.props.height,
      };
      resizeHandle.setPointerCapture(event.pointerId);
      renderApp();
      elements.yamlIo.value = generateSpecYaml(state);
      buildFinalYaml();
      setStatus("Resizing widget");
    },
    onMoveStart(event, entity, widget) {
      if (event.target.classList.contains("resize-handle")) {
        return;
      }
      state.selectedId = entity.id;
      const rect = elements.canvas.getBoundingClientRect();
      const scaleX = state.canvasWidth / rect.width;
      const scaleY = state.canvasHeight / rect.height;
      state.drag = {
        id: entity.id,
        mode: "move",
        offsetX: (event.clientX - rect.left) * scaleX - entity.props.x,
        offsetY: (event.clientY - rect.top) * scaleY - entity.props.y,
      };
      widget.setPointerCapture(event.pointerId);
      syncAll("Dragging widget");
    },
  });

  renderEntityList(state, elements.entityList, elements.template, {
    onSelect(entityId, message) {
      state.selectedId = entityId;
      syncAll(message);
    },
    onDuplicate(entityId) {
      duplicateEntityById(entityId);
    },
    onDelete(entityId) {
      deleteEntityById(entityId);
    },
  });

  renderScreenTabs(
    state.screens,
    state.currentScreenId,
    state.swipeDirection,
    elements.previewScreens,
    elements.previewDirection,
    (screenId) => {
      setCurrentScreen(state, screenId, { syncScreenControls: refreshScreenControls });
      syncAll(`Switched to ${getCurrentScreen(state).name}`);
    }
  );

  renderInspector(getSelectedEntity(), elements);
}

function getSelectedEntity() {
  return state.entities.find((entity) => entity.id === state.selectedId) || null;
}

function duplicateEntityById(entityId) {
  const entity = state.entities.find((item) => item.id === entityId);
  if (!entity) {
    return;
  }
  const clone = structuredClone(entity);
  clone.id = `id-${Math.random().toString(36).slice(2, 11)}`;
  clone.entityids = clone.entityids.map((currentEntityId, index) =>
    index === 0 ? `${currentEntityId}_copy` : `${currentEntityId}_copy_${index + 1}`
  );
  clone.props.x = clamp(entity.props.x + 18, 0, state.canvasWidth - clone.props.width);
  clone.props.y = clamp(entity.props.y + 18, 0, state.canvasHeight - clone.props.height);
  clone.props.title = `${entity.props.title} Copy`;
  state.entities.push(clone);
  state.selectedId = clone.id;
  syncAll("Duplicated widget");
}

function deleteEntityById(entityId) {
  if (!state.entities.some((entity) => entity.id === entityId)) {
    return;
  }
  state.entities = state.entities.filter((entity) => entity.id !== entityId);
  getCurrentScreen(state).entities = state.entities;
  state.selectedId = state.entities[0]?.id ?? null;
  syncAll("Deleted widget");
}

function setStatus(message, isError = false) {
  elements.statusNode.textContent = message;
  elements.statusNode.style.color = isError ? "#b9412e" : "";
}

function setBuildStatus(message, isError = false) {
  elements.buildStatusNode.textContent = message;
  elements.buildStatusNode.style.color = isError ? "#b9412e" : "";
}

function buildFinalYaml(showManualStatus = false) {
  try {
    elements.finalYamlIo.value = renderCombinedYaml(state);
    setBuildStatus(showManualStatus ? "Final ESPHome YAML generated." : "Auto-generated from current editor state.");
    if (showManualStatus) {
      setStatus("Final ESPHome YAML generated");
    }
    return true;
  } catch (error) {
    elements.finalYamlIo.value = "";
    setBuildStatus(error.message || "Failed to generate final YAML", true);
    if (showManualStatus) {
      setStatus("Build failed", true);
    }
    return false;
  }
}

function syncFormControls() {
  elements.boardSelect.value = state.board;
  elements.rotationSelect.value = state.rotation.toString();
  elements.screenBgColorInput.value = yamlColorToHtml(state.screenBgColor);
  updateColorHexLabel(elements.screenBgColorInput, elements.screenBgColorHex);
  elements.deviceNameInput.value = state.deviceName;
  elements.friendlyNameInput.value = state.friendlyName;
  elements.wifiSsidInput.value = state.wifiSsid;
  elements.wifiPasswordInput.value = state.wifiPassword;
  syncCanvasUi(state, elements.canvasResTitle);
  updateCanvasAppearance(state.screenBgColor);
  setActivePaletteSwatch(elements.screenPalette, elements.screenBgColorInput.value);
  renderDeviceNameHelp();
  refreshScreenControls();
  updateThermoIconInspectorPreview(elements);
  updateLightIconInspectorPreview(elements);
}

function renderDeviceNameHelp() {
  if (!elements.deviceNameInput || !elements.deviceNameHelp) {
    return;
  }

  const validation = getDeviceNameValidation(elements.deviceNameInput.value);
  elements.deviceNameHelp.textContent = validation.message;
  elements.deviceNameHelp.classList.toggle("error", !validation.isValid);
}

function refreshScreenControls() {
  syncScreenControls(state, elements, { normalizeSwipeDirection });
}

const restoreResult = restoreStateFromCache(state, state.board, {
  syncCurrentScreenEntities: () => syncCurrentScreenEntities(state),
});
syncFormControls();
syncAll(
  restoreResult.restored
    ? "Restored saved config"
    : restoreResult.recovered
      ? "Saved config was invalid and has been cleared"
      : "Ready"
);

function updateColorHexLabel(input, label) {
  if (!input || !label) return;
  label.textContent = input.value.toUpperCase();
}

async function handleCopyColor(color, button) {
  try {
    await navigator.clipboard.writeText(color.toUpperCase());
    button.classList.add("success");
    const originalSvg = button.innerHTML;
    button.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => {
      button.classList.remove("success");
      button.innerHTML = originalSvg;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy color: ", err);
  }
}
