# Slothing Auth Policy

Slothing does not implement local password authentication. Production sign-in is
delegated to NextAuth/Auth.js providers:

- Google OAuth is the required configured provider for hosted or production
  deployments.
- Resend email magic links are optional and only appear when `RESEND_API_KEY`
  and `EMAIL_FROM` are configured.
- Username/password sign-in, local password storage, and password reset emails
  are intentionally not part of the product.

## Account Recovery

Because Slothing does not store user passwords, password recovery happens through
the identity provider:

- Google sign-in users recover access through Google account recovery.
- Email magic-link users request a fresh sign-in link from the Slothing sign-in
  page.

If a user loses access to the email address associated with their Slothing
account, an operator must verify ownership out of band before changing account
metadata or exporting/deleting the account.

## Required Production Configuration

Configured production auth requires:

```env
NEXTAUTH_URL=https://your-domain.example
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_NEXTAUTH_ENABLED=true
```

Optional magic-link sign-in also requires:

```env
RESEND_API_KEY=...
EMAIL_FROM="Slothing <noreply@your-domain.example>"
```

`SLOTHING_ALLOW_UNAUTHED_DEV=1` is only for local development. Do not enable it
in production.

## Operational Notes

- The sign-in page must not show password fields or password reset links.
- Support copy should say "request a new sign-in link" for magic-link users, not
  "reset your password".
- Security audits should treat OAuth provider configuration, email deliverability,
  session signing secrets, and account deletion/export as the relevant auth
  controls.
