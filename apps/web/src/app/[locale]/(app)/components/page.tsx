"use client";

/**
 * Components — atomic resume material (bullets, stories, projects,
 * extracted experience entries). The body lives in `components-tab.tsx`,
 * extracted as a shared component during the Phase 3 audit so the
 * Answers and Components surfaces can ship in parallel.
 *
 * Sibling: `/answers` (Q&A library). Both were briefly merged into a
 * "Knowledge Bank" umbrella; merge was reverted because the two
 * underlying data models (atomic chunks vs. saved Q&A) and the user
 * intents differ enough that one filter step on every visit was the
 * wrong default.
 */

import { BankComponentsTab } from "./components-tab";

export default function ComponentsPage() {
  return <BankComponentsTab />;
}
