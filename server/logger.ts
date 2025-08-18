export function log(...a: unknown[]) {
  if (process.env.NODE_ENV !== "test") console.log("[app]", ...a);
}


