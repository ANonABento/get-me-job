/**
 * Editorial primitive barrel.
 *
 * These are the cross-cutting components reused across the Phase 3
 * page rebuilds. Build once here, import everywhere.
 */

export { MonoCap } from "./mono-cap";
export type { MonoCapSize, MonoCapTone } from "./mono-cap";

export { KbdChip } from "./kbd-chip";
export type { KbdChipSize } from "./kbd-chip";

export { EditorialEyebrow } from "./editorial-eyebrow";

export { StatusPill, STAGE_PRESENTATION } from "./status-pill";
export type { StageId } from "./status-pill";

export { CompanyGlyph, getGlyphClass, getGlyphInitial } from "./company-glyph";
export type { CompanyGlyphSize } from "./company-glyph";

export {
  MatchScoreBar,
  MATCH_THRESHOLDS,
  getMatchTier,
} from "./match-score-bar";
export type { MatchTier } from "./match-score-bar";

export {
  EditorialPanel,
  EditorialPanelHeader,
  EditorialPanelBody,
  EditorialPanelFooter,
} from "./editorial-panel";

export {
  EditorialTable,
  EditorialTableBody,
  EditorialTableCell,
  EditorialTableHead,
  EditorialTableHeaderCell,
  EditorialTableRow,
} from "./editorial-table";

export { TaskRow } from "./task-row";

export { QuickActionCard, QuickActionStrip } from "./quick-action-strip";

export { PasteBox } from "./paste-box";
export type { PasteBoxHandle } from "./paste-box";

export { EditorialDetailDrawer } from "./editorial-detail-drawer";
