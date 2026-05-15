import { redirect } from "next/navigation";

/**
 * Legacy `/bank` redirect — the route renamed to `/components` when
 * the bank/answer-bank split was reaffirmed (see
 * `docs/editorial-rebuild-todo.md`). The 308 preserves any bookmark
 * or extension link still pointing here.
 */
export default function BankRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/components`);
}
