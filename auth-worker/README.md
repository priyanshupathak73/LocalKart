# LocalKart Auth Worker

Cloudflare Workers auth service for LocalKart using D1, KV, and Resend.

## Endpoints

- `POST /signup`
- `POST /send-otp`
- `POST /verify-otp`
- `POST /login`
- `GET /health`

## Environment

Set these bindings and variables in `wrangler.toml` or your Cloudflare dashboard:

- `DB` - D1 database
- `OTP_KV` - KV namespace for OTP storage
- `SESSION_KV` - KV namespace for sessions
- `RESEND_API_KEY` - Resend API key
- `RESEND_FROM` - verified sender, for example `LocalKart <no-reply@yourdomain.com>`
- `FRONTEND_URL` - frontend URL
- `APP_NAME` - optional app name

## D1 schema

Run the migration in `migrations/0001_create_users.sql`.

## Local development

1. Install Wrangler.
2. Create D1 and KV resources.
3. Set `RESEND_API_KEY`.
4. Run the worker locally with Wrangler.

## Frontend env

Set `NEXT_PUBLIC_AUTH_API_URL` in the frontend to point to the worker URL.
