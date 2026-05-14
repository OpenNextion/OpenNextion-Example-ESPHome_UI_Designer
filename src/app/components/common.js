export function deriveTitle(entityId = "") {
  return String(entityId).split(".").slice(1).join(".") || String(entityId || "");
}

export function countEnabledChannels(props = {}) {
  return [0, 1, 2, 3].filter((index) => !!props[`channel_${index + 1}_enabled`]).length;
}
