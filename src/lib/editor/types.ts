export interface TipTapJSONContent {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapJSONContent[];
  marks?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
  }>;
  text?: string;
}
