import { redirect } from "next/navigation";

/**
 * Legacy `/answer-bank` redirect — the route renamed to `/answers`
 * when the bank/answer-bank split was reaffirmed (see
 * `docs/editorial-rebuild-todo.md`). The 308 preserves any bookmark
 * or extension link still pointing here.
 */
export default function AnswerBankRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/answers`);
}
