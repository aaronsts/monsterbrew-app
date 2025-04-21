import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMarkdownPage } from "@/services/converters/markdown";
import {
  createCreatureSchema,
  defaultCreature,
} from "@/schema/createCreatureSchema";
import { z } from "zod";

// Mock window.open
const mockOpen = vi.fn();
const mockWrite = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", {
    open: mockOpen.mockReturnValue({
      document: {
        write: mockWrite,
      },
    }),
  });
});

describe("markdown converter", () => {
  it("should create a markdown page", () => {
    // Create a minimal valid creature
    const creature = {
      ...defaultCreature,
      name: "Test Creature",
    };

    createMarkdownPage(creature);

    expect(mockOpen).toHaveBeenCalled();
    expect(mockWrite).toHaveBeenCalled();
    expect(mockWrite.mock.calls[0][0]).toContain("Test Creature");
  });
});
