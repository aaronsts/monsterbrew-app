import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithForm } from "./test-utils";
import { DerivedValues } from "./derived-values";
import { defaultMonster } from "@/schema/monster-schema";

const withWis = (wis: number) => ({
  ability_scores: { ...defaultMonster.ability_scores, wis },
});

describe("DerivedValues", () => {
  it("derives passive perception from the shared form's WIS", async () => {
    const { getForm } = renderWithForm(<DerivedValues />, withWis(14));

    await waitFor(() =>
      expect(getForm().getValues("passive_perception")).toBe(12),
    );
  });

  it("leaves passive perception alone once it is set manually", async () => {
    const { getForm } = renderWithForm(<DerivedValues />, {
      ...withWis(14),
      custom_passive_perception: true,
      passive_perception: 20,
    });

    await waitFor(() =>
      expect(getForm().getValues("passive_perception")).toBe(20),
    );
  });
});
