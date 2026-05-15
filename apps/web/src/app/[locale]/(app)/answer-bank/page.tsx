import { redirect } from "next/navigation";

/**
 * `/answer-bank` is folded into the Knowledge Bank umbrella at `/bank`.
 * The Q&A library renders inside the "Answers" tab. This route is now a
 * 308 redirect so deep links and external traffic land in the right
 * place. Same pattern as `/builder` → `/studio`.
 */
export default function AnswerBankRedirectPage({
  params,
}: {
  params: { locale: string };
}) {
  redirect(`/${params.locale}/bank?tab=answers`);
}
