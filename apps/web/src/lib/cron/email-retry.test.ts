import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFailedEmailSends: vi.fn(),
  markEmailSendStatus: vi.fn(),
}));

vi.mock("@/lib/db/email-sends", () => ({
  getFailedEmailSends: mocks.getFailedEmailSends,
  markEmailSendStatus: mocks.markEmailSendStatus,
}));

import { runEmailRetryCron } from "./email-retry";
import type { EmailSend } from "@/lib/db/email-sends";

const failedSend: EmailSend = {
  id: "send-1",
  userId: "user-1",
  type: "daily_digest",
  recipient: "ada@example.com",
  subject: "Digest",
  body: "Hello <Ada>",
  status: "failed",
  errorMessage: "rate limited",
  sentAt: "2026-05-18T00:00:00.000Z",
};

describe("runEmailRetryCron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFailedEmailSends.mockReturnValue([failedSend]);
    mocks.markEmailSendStatus.mockReturnValue(true);
  });

  it("resends failed emails and marks them sent", async () => {
    const sender = vi.fn().mockResolvedValue({ ok: true, status: 202 });

    const result = await runEmailRetryCron({ sender });

    expect(result).toMatchObject({
      ok: true,
      scanned: 1,
      retried: 1,
      sent: 1,
      failed: 0,
    });
    expect(sender).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "ada@example.com",
        subject: "Digest",
        html: "<pre>Hello &lt;Ada&gt;</pre>",
        text: "Hello <Ada>",
      }),
    );
    expect(mocks.markEmailSendStatus).toHaveBeenCalledWith(
      "send-1",
      "user-1",
      "sent",
    );
  });

  it("keeps the email failed when the retry sender fails", async () => {
    const sender = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, error: "down" });

    const result = await runEmailRetryCron({ sender });

    expect(result).toMatchObject({
      ok: false,
      sent: 0,
      failed: 1,
    });
    expect(mocks.markEmailSendStatus).toHaveBeenCalledWith(
      "send-1",
      "user-1",
      "failed",
      "down",
    );
  });
});
