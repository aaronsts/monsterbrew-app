import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest isn't configured with `globals: true`, so testing-library's automatic
// afterEach cleanup never registers itself. Do it here, once, for every test.
afterEach(cleanup);

// jsdom doesn't implement PointerEvent / pointer capture, which Base UI's
// Checkbox, Switch and Select rely on when handling clicks. Provide minimal
// shims so those controls can be exercised with user-event.
if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEventShim extends MouseEvent {
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
    }
  }
  window.PointerEvent = PointerEventShim as typeof PointerEvent;
}
if (typeof Element !== "undefined") {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
}

// jsdom has no matchMedia; `useIsMobile` calls it on mount.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
