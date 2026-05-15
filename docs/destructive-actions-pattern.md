# Destructive Actions Pattern

> Future-Claude note: If you're adding any user-facing destructive action, READ THIS FILE FIRST.

Every destructive action needs either explicit confirmation or a short undo window. Bare one-click destruction is not acceptable.

## Pattern A: Confirm Dialog

Use for hard deletes, bulk deletes, settings resets, account-level changes, and any action whose reversibility is unclear.

```tsx
const { confirm, dialog } = useConfirmDialog();

async function deleteRecord() {
  const confirmed = await confirm({
    title: "Delete this record?",
    description: "This permanently removes the record. This cannot be undone.",
    confirmLabel: "Delete",
  });
  if (!confirmed) return;

  await fetch("/api/records/123", { method: "DELETE" });
}

return (
  <>
    <Button variant="ghost" onClick={() => void deleteRecord()}>
      Delete
    </Button>
    {dialog}
  </>
);
```

## Pattern B: Optimistic Undo Snackbar

Use when the action is reversible at the data layer, common, and productivity matters. The item should update immediately, then show a toast with `Undo`.

```tsx
const archiveRecord = useUndoableAction({
  action: async ({ id }) => {
    await updateRecord(id, { archivedAt: new Date().toISOString() });
  },
  undoAction: async ({ id }) => {
    await updateRecord(id, { archivedAt: null });
  },
  message: "Record archived.",
});

<Button onClick={() => void archiveRecord({ id })}>Archive</Button>;
```

Default undo window: 5 seconds. Increase it when the action is easy to mis-click or harder to notice.

## Routing Rules

| Situation                                         | Pattern   |
| ------------------------------------------------- | --------- |
| Permanent DB delete or file delete                | Pattern A |
| Bulk delete or bulk destructive mutation          | Pattern A |
| Settings reset, theme reset, account-level change | Pattern A |
| Reversible status change or soft delete           | Pattern B |
| Reversibility cannot be verified quickly          | Pattern A |

## Current Actions

| Area                          | Action                    | Endpoint/data effect                                                | Pattern   |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------- | --------- |
| Opportunity detail            | Dismiss                   | `PATCH /api/opportunities/[id]`, status to `withdrawn`; row remains | Pattern B |
| Opportunity detail            | Remove opportunity contact | `DELETE /api/opportunities/[id]/contacts/[contactId]`; hard delete  | Pattern A |
| Opportunities                 | Delete opportunity        | `DELETE /api/opportunities/[id]`; hard delete                       | Pattern A |
| Email templates               | Delete draft              | `DELETE /api/email/drafts/[id]`; hard delete                        | Pattern A |
| Interview                     | Delete session            | `DELETE /api/interview/sessions/[id]`; hard delete                  | Pattern A |
| Interview                     | Skip question             | Stores `answer="[skipped]"` and advances the session                 | Pattern A |
| Notifications                 | Delete notification       | `DELETE /api/notifications/[id]`; hard delete                       | Pattern A |
| Notifications                 | Delete read notifications | `POST /api/notifications` with `deleteRead`; bulk hard delete       | Pattern A |
| Profile bank                  | Delete selected entries   | `DELETE /api/bank/[id]`; hard delete                                | Pattern A |
| Profile bank                  | Delete individual entry   | `DELETE /api/bank/[id]`; hard delete                                | Pattern A |
| Profile bank source documents | Delete source document(s) | `DELETE /api/bank/documents`; hard delete with cascaded chunks      | Pattern A |
| Studio                        | Delete local studio file  | Local state removal                                                 | Pattern A |
| Settings                      | Delete prompt variant     | `DELETE /api/prompts/[id]`; hard delete                             | Pattern A |
| Settings — Danger zone        | Reset local preferences   | Clears every `taida:*` localStorage key in this browser              | Pattern A |

## Adding A New Destructive Action

1. Decide whether the backend action is hard delete, soft delete, or status change.
2. Use Pattern B only when the reverse mutation is known and tested.
3. Use Pattern A for hard deletes, bulk actions, resets, and uncertain cases.
4. Write tests for the confirm or undo flow.
5. Add the action to the table above.
