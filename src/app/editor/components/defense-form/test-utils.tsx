import { defaultMonster, Monster } from "@/schema/monster-schema";
import { cleanup, render } from "@testing-library/react";
import { ReactNode } from "react";
import { FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { afterEach } from "vitest";

// Vitest isn't configured with `globals: true`, so testing-library's automatic
// afterEach cleanup never registers. Register it here since every field test
// renders through this helper.
afterEach(cleanup);

// jsdom doesn't implement PointerEvent / pointer capture, which Base UI's
// Checkbox relies on when handling clicks. Provide minimal shims so the
// checkbox fields can be exercised with user-event.
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

/**
 * Renders a defense-form field inside a react-hook-form provider, mirroring how
 * the fields consume the shared form via `useFormContext`. The live `form`
 * instance is captured so tests can read/assert the resulting form values.
 */
export function renderWithForm(
  ui: ReactNode,
  defaults: Partial<Monster> = {},
) {
  const captured: { form?: UseFormReturn<Monster> } = {};

  function Wrapper() {
    const form = useForm<Monster>({
      defaultValues: { ...defaultMonster, ...defaults },
    });
    captured.form = form;
    return <FormProvider {...form}>{ui}</FormProvider>;
  }

  const result = render(<Wrapper />);
  return {
    ...result,
    getForm: () => captured.form as UseFormReturn<Monster>,
  };
}
