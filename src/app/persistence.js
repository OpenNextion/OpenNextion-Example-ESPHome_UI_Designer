import { BOARD_CONFIGS } from "./constants.js";
import {
  createInitialState,
  normalizeScreens,
  normalizeSwipeDirection,
  normalizeYamlColor,
  updateCanvasDimensions,
} from "./spec.js";

const STORAGE_KEY_PREFIX = "esphome-ui-builder-state-v2";

function getStorage() {
  if (typeof localStorage === "undefined") {
    return null;
  }
  return localStorage;
}

export function formatTimestampForFilename() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "_",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

export function createStateSnapshot(state) {
  return {
    board: state.board,
    rotation: state.rotation,
    screenBgColor: state.screenBgColor,
    swipeDirection: state.swipeDirection,
    currentScreenId: state.currentScreenId,
    deviceName: state.deviceName,
    friendlyName: state.friendlyName,
    wifiSsid: state.wifiSsid,
    wifiPassword: state.wifiPassword,
    screens: state.screens.map((screen) => ({
      id: screen.id,
      name: screen.name,
      entities: screen.entities.map((entity) => ({
        type: entity.type,
        entityids: [...entity.entityids],
        props: { ...entity.props },
      })),
    })),
  };
}

export function applyStateSnapshot(state, snapshot, { syncCurrentScreenEntities } = {}) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Invalid saved state");
  }

  state.board = BOARD_CONFIGS[snapshot.board] ? snapshot.board : "nextion_35";
  state.rotation = Number(snapshot.rotation) || 0;
  state.screenBgColor = normalizeYamlColor(snapshot.screenBgColor || "0xF3EFE7");
  state.swipeDirection = normalizeSwipeDirection(snapshot.swipeDirection);
  state.deviceName = String(snapshot.deviceName ?? "");
  state.friendlyName = String(snapshot.friendlyName ?? "").trim();
  state.wifiSsid = String(snapshot.wifiSsid ?? "").trim();
  state.wifiPassword = String(snapshot.wifiPassword ?? "").trim();
  updateCanvasDimensions(state);
  state.screens = normalizeScreens(
    snapshot.screens?.length ? snapshot.screens : [{ name: "Screen 1", entities: snapshot.entities || [] }],
    state.canvasWidth,
    state.canvasHeight
  );
  state.currentScreenId = state.screens.some((screen) => screen.id === snapshot.currentScreenId)
    ? snapshot.currentScreenId
    : state.screens[0]?.id ?? null;
  syncCurrentScreenEntities?.();
}

export function resetStateToEmptyDefaults(state, boardKey = "nextion_35", { syncCurrentScreenEntities } = {}) {
  const fresh = createInitialState();
  state.board = BOARD_CONFIGS[boardKey] ? boardKey : fresh.board;
  state.rotation = fresh.rotation;
  state.screenBgColor = fresh.screenBgColor;
  state.swipeDirection = fresh.swipeDirection;
  state.deviceName = "";
  state.friendlyName = "";
  state.wifiSsid = "";
  state.wifiPassword = "";
  state.screens = normalizeScreens(fresh.screens, fresh.canvasWidth, fresh.canvasHeight);
  state.currentScreenId = state.screens[0]?.id ?? null;
  state.selectedId = null;
  updateCanvasDimensions(state);
  syncCurrentScreenEntities?.();
}

export function getStorageKey(boardKey) {
  return `${STORAGE_KEY_PREFIX}:${boardKey}`;
}

export function saveStateToCache(state, { storage = getStorage() } = {}) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(getStorageKey(state.board), JSON.stringify(createStateSnapshot(state)));
  } catch (_error) {
  }
}

export function restoreStateFromCache(
  state,
  boardKey = state.board,
  { storage = getStorage(), syncCurrentScreenEntities } = {}
) {
  if (!storage) {
    return { restored: false, recovered: false };
  }

  const raw = storage.getItem(getStorageKey(boardKey));
  if (!raw) {
    return { restored: false, recovered: false };
  }

  try {
    applyStateSnapshot(state, JSON.parse(raw), { syncCurrentScreenEntities });
    state.board = boardKey;
    updateCanvasDimensions(state);
    syncCurrentScreenEntities?.();
    saveStateToCache(state, { storage });
    return { restored: true, recovered: false };
  } catch (_error) {
    storage.removeItem(getStorageKey(boardKey));
    resetStateToEmptyDefaults(state, boardKey, { syncCurrentScreenEntities });
    return { restored: false, recovered: true };
  }
}
