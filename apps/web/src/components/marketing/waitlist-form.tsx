"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmitState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; email: string }
  | { kind: "error"; message: string };

interface WaitlistFormProps {
  source: string;
  className?: string;
}

export function WaitlistForm({ source, className }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "loading" });

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          interest: interest.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Could not join the waitlist.");
      }

      setState({ kind: "success", email });
      setEmail("");
      setInterest("");
    } catch (error) {
      setState({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not join the waitlist.",
      });
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="grid gap-2 text-left text-sm font-medium">
          Email
          <Input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            disabled={state.kind === "loading"}
          />
        </label>
        <Button
          type="submit"
          className="self-end"
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : state.kind === "success" ? (
            <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />
          ) : (
            <MailPlus className="mr-2 h-4 w-4" aria-hidden />
          )}
          Join waitlist
        </Button>
      </div>
      <label className="mt-3 grid gap-2 text-left text-sm font-medium">
        What should we prioritize?
        <Input
          name="interest"
          value={interest}
          onChange={(event) => setInterest(event.target.value)}
          placeholder="Hosted access, extension stores, Google setup..."
          disabled={state.kind === "loading"}
        />
      </label>
      {state.kind === "success" ? (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {state.email} is on the list.
        </p>
      ) : null}
      {state.kind === "error" ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
