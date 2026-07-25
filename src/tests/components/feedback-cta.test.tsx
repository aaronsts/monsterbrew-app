import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FeedbackCta } from "@/components/feedback-cta";

const STORAGE_KEY = "monsterbrew:feedback-cta-shown";
const SHOW_DELAY_MS = 5_000;
const TOAST_DURATION_MS = 10_000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1_000;
const DAY_MS = 24 * 60 * 60 * 1_000;

const { toastCustom, toastDismiss, feedbackState } = vi.hoisted(() => ({
  toastCustom: vi.fn(),
  toastDismiss: vi.fn(),
  feedbackState: { configured: true },
}));

vi.mock("sonner", () => ({
  toast: { custom: toastCustom, dismiss: toastDismiss },
}));

vi.mock("@/hooks/use-feedback", () => ({
  get isFeedbackConfigured() {
    return feedbackState.configured;
  },
}));

// The dialog drags in the full form + react-query; the CTA only needs to
// hand it an open state, so stub it down to that contract.
vi.mock("@/components/feedback-dialog", () => ({
  FeedbackDialog: ({ open }: { open?: boolean }) => (
    <div data-testid="feedback-dialog" data-open={open ? "true" : "false"} />
  ),
}));

/** Render the card JSX the component handed to `toast.custom`. */
function renderCtaCard(toastId = "toast-1") {
  const renderCard = toastCustom.mock.calls[0][0] as (
    id: string,
  ) => React.ReactElement;
  render(renderCard(toastId));
}

describe("FeedbackCta", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.clearAllMocks();
    feedbackState.configured = true;
  });

  afterEach(() => {
    // No `globals: true` in the Vitest config, so testing-library's
    // auto-cleanup never registers; clean the DOM up ourselves.
    cleanup();
    vi.useRealTimers();
  });

  it("shows the prompt 5 seconds after mount, not before", () => {
    render(<FeedbackCta />);

    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS - 1));
    expect(toastCustom).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(toastCustom).toHaveBeenCalledOnce();
  });

  it("keeps the prompt on screen for 10 seconds", () => {
    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));

    expect(toastCustom).toHaveBeenCalledWith(expect.any(Function), {
      duration: TOAST_DURATION_MS,
    });
  });

  it("records when the prompt was shown", () => {
    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));

    expect(Number(localStorage.getItem(STORAGE_KEY))).toBe(Date.now());
  });

  it("stays quiet while the 7-day snooze is active", () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() - DAY_MS));

    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS * 2));

    expect(toastCustom).not.toHaveBeenCalled();
  });

  it("shows again once the 7-day snooze has passed", () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() - SNOOZE_MS - 1));

    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));

    expect(toastCustom).toHaveBeenCalledOnce();
  });

  it("does nothing when no feedback access key is configured", () => {
    feedbackState.configured = false;

    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS * 2));

    expect(toastCustom).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("cancels the pending prompt when unmounted before the delay", () => {
    const { unmount } = render(<FeedbackCta />);

    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS - 1));
    unmount();
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));

    expect(toastCustom).not.toHaveBeenCalled();
  });

  it("opens the feedback dialog and dismisses the toast when clicked", () => {
    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));
    renderCtaCard("toast-1");

    fireEvent.click(
      screen.getByRole("button", { name: /Enjoying Monsterbrew/ }),
    );

    expect(toastDismiss).toHaveBeenCalledWith("toast-1");
    expect(
      screen.getByTestId("feedback-dialog").getAttribute("data-open"),
    ).toBe("true");
  });

  it("dismisses without opening the dialog via the close button", () => {
    render(<FeedbackCta />);
    act(() => vi.advanceTimersByTime(SHOW_DELAY_MS));
    renderCtaCard("toast-1");

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(toastDismiss).toHaveBeenCalledWith("toast-1");
    expect(
      screen.getByTestId("feedback-dialog").getAttribute("data-open"),
    ).toBe("false");
  });
});
