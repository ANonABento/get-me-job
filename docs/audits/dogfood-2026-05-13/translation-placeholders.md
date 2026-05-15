# Translation Placeholder Audit

Generated from `apps/web/src/messages/*.json` by `pnpm --filter @slothing/web check:translations --markdown-report=<path>`.

| Locale | Placeholder strings | Largest namespaces |
| --- | ---: | --- |
| `es` | 0 |  |
| `zh-CN` | 0 |  |
| `pt-BR` | 0 |  |
| `hi` | 0 |  |
| `fr` | 0 |  |
| `ja` | 0 |  |
| `ko` | 0 |  |
| **Total** | **0** | |

## Identical-to-English Review

These strings are not allowlisted brand terms or passthrough keys. They should be reviewed after provider refresh and must be cleared before `check:translations:release` passes.

| Locale | Identical strings | Keys |
| --- | ---: | --- |
| `es` | 0 | none |
| `zh-CN` | 3 | `dialogs.builder.sectionList.pickerEmptyCta`, `dialogs.builder.sectionList.pickerEmptyDescription`, `dialogs.builder.sectionList.pickerEmptyTitle` |
| `pt-BR` | 0 | none |
| `hi` | 3 | `dialogs.builder.sectionList.pickerEmptyCta`, `dialogs.builder.sectionList.pickerEmptyDescription`, `dialogs.builder.sectionList.pickerEmptyTitle` |
| `fr` | 0 | none |
| `ja` | 3 | `dialogs.builder.sectionList.pickerEmptyCta`, `dialogs.builder.sectionList.pickerEmptyDescription`, `dialogs.builder.sectionList.pickerEmptyTitle` |
| `ko` | 3 | `dialogs.builder.sectionList.pickerEmptyCta`, `dialogs.builder.sectionList.pickerEmptyDescription`, `dialogs.builder.sectionList.pickerEmptyTitle` |
| **Total** | **12** | |

## Locale Quality Review

These checks catch known wrong-language fragments that exact-English drift cannot detect.

| Locale | Quality issues | Keys |
| --- | ---: | --- |
| `es` | 0 | none |
| `zh-CN` | 0 | none |
| `pt-BR` | 0 | none |
| `hi` | 0 | none |
| `fr` | 0 | none |
| `ja` | 0 | none |
| `ko` | 0 | none |
| **Total** | **0** | |

## Next Action

Run `pnpm --filter @slothing/web translate:messages` with `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`, review the locale JSON diffs, then run `pnpm --filter @slothing/web check:translations:release`.
