import { act, render, screen } from "@testing-library/react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { renderWithForm } from "./test-utils";
import { StatblockPreview } from "./statblock-preview";
import type { UseFormReturn } from "react-hook-form";
import type { Monster } from "@/schema/monster-schema";
import { defaultMonster } from "@/schema/monster-schema";

/**
 * Stands in for the four section forms. They take no props and reach the shared
 * form through `useFormContext()`, so whatever re-renders them re-renders this.
 */
function SectionProbe({ onRender }: { onRender: () => void }) {
  useFormContext<Monster>();
  onRender();
  return null;
}

/**
 * Mirrors `MonsterForm`'s structure rather than reusing `renderWithForm`: the
 * form is built by a parent that renders the provider *and its children* as
 * inline JSX. That matters. `renderWithForm` takes an already-built element, so
 * its children keep the same reference across parent re-renders and React skips
 * them — which hides the very cascade this test exists to detect. With the
 * children inlined, a parent re-render produces fresh elements and reaches the
 * sections, exactly as the whole-form `useWatch` in #158 did.
 */
function EditorReplica({
  onSectionRender,
  onForm,
}: {
  onSectionRender: () => void;
  onForm: (form: UseFormReturn<Monster>) => void;
}) {
  const form = useForm<Monster>({
    defaultValues: { ...defaultMonster, name: "Kraken" },
  });
  onForm(form);

  return (
    <FormProvider {...form}>
      <SectionProbe onRender={onSectionRender} />
      <StatblockPreview />
    </FormProvider>
  );
}

describe("StatblockPreview", () => {
  it("renders the statblock from the shared form's values", () => {
    renderWithForm(<StatblockPreview />, { name: "Kraken" });

    expect(screen.getByRole("heading", { name: "Kraken" })).toBeTruthy();
  });

  it("renders the creature's description alongside the statblock", () => {
    renderWithForm(<StatblockPreview />, {
      name: "Kraken",
      description: "A titanic cephalopod that wrecks fleets for sport.",
    });

    expect(
      screen.getByText("A titanic cephalopod that wrecks fleets for sport."),
    ).toBeTruthy();
  });

  it("updates the statblock when a form value changes", async () => {
    const { getForm } = renderWithForm(<StatblockPreview />, {
      name: "Kraken",
    });

    act(() => getForm().setValue("name", "Aboleth"));

    // The preview is deferred, so it lands in a later render pass.
    expect(await screen.findByRole("heading", { name: "Aboleth" })).toBeTruthy();
  });

  /**
   * The regression guard for #158: the preview owns its subscription, so a
   * keystroke redraws the statblock and nothing else. Hoisting a whole-form
   * `useWatch` into the parent — the defect the issue was filed for — fails
   * this test, verified by mutation.
   *
   * What it cannot see is `MonsterForm` itself, which needs a router and a
   * query client to render. Keep the subscription out of it.
   */
  it("does not re-render the rest of the form when a value changes", async () => {
    let sectionRenders = 0;
    let form: UseFormReturn<Monster> | undefined;
    render(
      <EditorReplica
        onSectionRender={() => (sectionRenders += 1)}
        onForm={(instance) => (form = instance)}
      />,
    );
    const rendersBeforeEdit = sectionRenders;

    act(() => form!.setValue("name", "Aboleth"));
    await screen.findByRole("heading", { name: "Aboleth" });

    expect(sectionRenders).toBe(rendersBeforeEdit);
  });
});
