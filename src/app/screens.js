export function getCurrentScreen(state) {
  return state.screens.find((screen) => screen.id === state.currentScreenId) || state.screens[0];
}

export function syncCurrentScreenEntities(state) {
  const currentScreen = getCurrentScreen(state);
  state.currentScreenId = currentScreen?.id ?? null;
  state.entities = currentScreen?.entities ?? [];
  if (!state.entities.some((entity) => entity.id === state.selectedId)) {
    state.selectedId = state.entities[0]?.id ?? null;
  }
}

export function setCurrentScreen(state, screenId, { syncScreenControls } = {}) {
  if (!state.screens.some((screen) => screen.id === screenId)) {
    return false;
  }
  state.currentScreenId = screenId;
  syncCurrentScreenEntities(state);
  syncScreenControls?.();
  return true;
}

export function syncScreenControls(state, elements, { normalizeSwipeDirection } = {}) {
  if (elements.swipeDirectionSelect) {
    elements.swipeDirectionSelect.value = normalizeSwipeDirection
      ? normalizeSwipeDirection(state.swipeDirection)
      : state.swipeDirection;
  }
  if (elements.screenSelect) {
    elements.screenSelect.replaceChildren();
    state.screens.forEach((screen, index) => {
      const option = document.createElement("option");
      option.value = screen.id;
      option.textContent = screen.name || `Screen ${index + 1}`;
      elements.screenSelect.append(option);
    });
    elements.screenSelect.value = state.currentScreenId;
  }
  if (elements.screenNameInput) {
    elements.screenNameInput.value = getCurrentScreen(state)?.name || "";
  }
  if (elements.deleteScreenBtn) {
    elements.deleteScreenBtn.disabled = state.screens.length <= 1;
  }
}
