import { useMutation } from "@tanstack/react-query";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

/** Whether a Web3Forms access key is configured for this build. */
export const isFeedbackConfigured = Boolean(accessKey);

export interface FeedbackPayload {
  email?: string;
  message: string;
  /** Honeypot field — bots fill it in, humans never see it. */
  botcheck?: string;
}

/** Send feedback to the Web3Forms inbox. Throws on any failure. */
export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const response = await fetch(WEB3FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: accessKey,
      subject: "Monsterbrew feedback",
      from_name: "Monsterbrew",
      email: payload.email || undefined,
      message: payload.message,
      botcheck: payload.botcheck,
    }),
  });
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message ?? "Feedback submission failed");
  }
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: sendFeedback,
  });
}
