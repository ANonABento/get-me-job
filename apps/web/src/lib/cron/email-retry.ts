import {
  getFailedEmailSends,
  markEmailSendStatus,
  type EmailSend,
} from "@/lib/db/email-sends";
import {
  sendTransactionalEmail,
  type TransactionalEmailInput,
  type TransactionalEmailResult,
} from "@/lib/email/transactional";
import { nowEpoch } from "@/lib/format/time";

export interface EmailRetryOutcome {
  id: string;
  userId: string;
  recipient: string;
  retried: boolean;
  sent: boolean;
  error?: string;
}

export interface EmailRetryResult {
  ok: boolean;
  scanned: number;
  retried: number;
  sent: number;
  failed: number;
  durationMs: number;
  outcomes: EmailRetryOutcome[];
}

export interface RunEmailRetryOptions {
  limit?: number;
  failedSends?: EmailSend[];
  sender?: (
    input: TransactionalEmailInput,
  ) => Promise<TransactionalEmailResult>;
}

export async function runEmailRetryCron(
  options: RunEmailRetryOptions = {},
): Promise<EmailRetryResult> {
  const startedAt = nowEpoch();
  const failedSends =
    options.failedSends ?? getFailedEmailSends({ limit: options.limit ?? 25 });
  const sender = options.sender ?? sendTransactionalEmail;
  const outcomes: EmailRetryOutcome[] = [];
  let sent = 0;
  let failed = 0;

  for (const send of failedSends) {
    try {
      const result = await sender({
        to: send.recipient,
        subject: send.subject,
        html: `<pre>${escapeHtml(send.body)}</pre>`,
        text: send.body,
        tags: [
          { name: "type", value: send.type },
          { name: "retry", value: "true" },
        ],
      });

      if (result.ok) {
        markEmailSendStatus(send.id, send.userId, "sent");
        sent += 1;
        outcomes.push({
          id: send.id,
          userId: send.userId,
          recipient: send.recipient,
          retried: true,
          sent: true,
        });
      } else {
        markEmailSendStatus(send.id, send.userId, "failed", result.error);
        failed += 1;
        outcomes.push({
          id: send.id,
          userId: send.userId,
          recipient: send.recipient,
          retried: true,
          sent: false,
          error: result.error,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      markEmailSendStatus(send.id, send.userId, "failed", message);
      failed += 1;
      outcomes.push({
        id: send.id,
        userId: send.userId,
        recipient: send.recipient,
        retried: true,
        sent: false,
        error: message,
      });
    }
  }

  return {
    ok: failed === 0,
    scanned: failedSends.length,
    retried: outcomes.length,
    sent,
    failed,
    durationMs: nowEpoch() - startedAt,
    outcomes,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
