export function simulateBfcacheRestore() {
  window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
}
