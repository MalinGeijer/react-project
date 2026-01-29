// src/utils/logger.ts
export let VERBOSE = false; // default off

export function setVerbose(value: boolean) {
  VERBOSE = value;
  console.log(`[LOGGER] Debug logs are ${VERBOSE ? "ON" : "OFF"}`);
}

export function log(...args: any[]) {
  if (!VERBOSE) return;
  console.log("[LOG]", ...args);
}
