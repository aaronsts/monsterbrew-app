import { render } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

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
