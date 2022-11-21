export function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
