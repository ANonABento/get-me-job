"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ContactPicker,
  type GooglePickerContact,
} from "@/components/google/ContactPicker";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { useErrorToast } from "@/hooks/use-error-toast";
import { readJsonResponse } from "@/lib/http";

interface OpportunityContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  source: "google" | "manual";
  googleResourceName?: string;
  createdAt: string;
}

interface ContactsResponse {
  contacts: OpportunityContact[];
}

interface AddContactResponse {
  contact: OpportunityContact;
}

interface OpportunityContactsProps {
  opportunityId: string;
}

export function OpportunityContacts({
  opportunityId,
}: OpportunityContactsProps) {
  const [contacts, setContacts] = useState<OpportunityContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showErrorToast = useErrorToast();
  const { confirm, dialog } = useConfirmDialog();

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/opportunities/${opportunityId}/contacts`,
      );
      const data = await readJsonResponse<ContactsResponse>(
        response,
        "Failed to load contacts",
      );
      setContacts(data.contacts);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not load contacts",
        fallbackDescription: "Please refresh and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [opportunityId, showErrorToast]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  async function addContact(contact: GooglePickerContact) {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/opportunities/${opportunityId}/contacts`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            source: "google",
            googleResourceName: contact.resourceName,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            title: contact.title,
          }),
        },
      );
      const data = await readJsonResponse<AddContactResponse>(
        response,
        "Failed to add contact",
      );
      setContacts((current) => [
        data.contact,
        ...current.filter((item) => item.id !== data.contact.id),
      ]);
    } catch (error) {
      showErrorToast(error, {
        title: "Could not add contact",
        fallbackDescription: "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeContact(contact: OpportunityContact) {
    const confirmed = await confirm({
      title: "Remove this contact?",
      description:
        "This removes the contact from the opportunity. It will not delete the contact from Google.",
      confirmLabel: "Remove",
    });
    if (!confirmed) return;

    const previous = contacts;
    setContacts((current) => current.filter((item) => item.id !== contact.id));

    try {
      const response = await fetch(
        `/api/opportunities/${opportunityId}/contacts/${contact.id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        await readJsonResponse(response, "Failed to remove contact");
      }
    } catch (error) {
      setContacts(previous);
      showErrorToast(error, {
        title: "Could not remove contact",
        fallbackDescription: "Please try again.",
      });
    }
  }

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        {/* audit/17: editorial mono-eyebrow heading + hide the 0-count
            badge when no contacts attached (was always rendering "0"). */}
        <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Contacts
        </h2>
        {contacts.length > 0 && (
          <Badge variant="outline">{contacts.length}</Badge>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading contacts...
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">None attached</p>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className="rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{contact.name}</div>
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="truncate text-muted-foreground hover:text-primary"
                    >
                      {contact.email}
                    </a>
                  ) : null}
                  {[contact.company, contact.title].filter(Boolean).length >
                  0 ? (
                    <div className="truncate text-xs text-muted-foreground">
                      {[contact.company, contact.title]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${contact.name}`}
                  onClick={() => void removeContact(contact)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Badge variant="secondary" className="mt-2">
                {contact.source === "google" ? "Google" : "Manual"}
              </Badge>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <ContactPicker
          onSelect={(contact) => void addContact(contact)}
          trigger={
            <Button variant="outline" className="w-full" disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Users className="mr-2 h-4 w-4" />
              )}
              Add from Google
            </Button>
          }
        />
      </div>
      {dialog}
    </section>
  );
}
