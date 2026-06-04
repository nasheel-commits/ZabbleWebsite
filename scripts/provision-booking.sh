#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Provision the Google Cloud side of the /diagnose call-booking feature.
#
# Prerequisite (interactive, run it yourself first):
#     gcloud auth login        # sign in as a Workspace admin for zabble.org
#
# Then run:
#     bash scripts/provision-booking.sh
#
# This script:
#   1. Creates (or reuses) the GCP project
#   2. Enables the Calendar + Gmail APIs
#   3. Creates the service account + a JSON key
#   4. Writes NUXT_GOOGLE_* credentials into .env (git-ignored)
#   5. Prints the Client ID + scopes you paste into the Admin console for
#      domain-wide delegation (the one manual step that has no CLI)
#
# Safe to re-run: it skips resources that already exist and refreshes .env.
# ---------------------------------------------------------------------------
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-zabble-booking}"
SA_NAME="${SA_NAME:-zabble-booking-bot}"
IMPERSONATE="${IMPERSONATE:-sales@zabble.org}"
TIMEZONE="${TIMEZONE:-Africa/Johannesburg}"
KEY_PATH="${KEY_PATH:-.secrets/zabble-booking-key.json}"
ENV_FILE="${ENV_FILE:-.env}"

note() { printf '\n\033[36m▸ %s\033[0m\n' "$1"; }

# --- 1. Project ------------------------------------------------------------
note "Ensuring project '$PROJECT_ID' exists"
if gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
  echo "  already exists — reusing."
else
  if ! gcloud projects create "$PROJECT_ID" --name="Zabble Booking" 2>/dev/null; then
    echo "  ⚠ couldn't create '$PROJECT_ID' (no org-create permission or name taken)."
    PROJECT_ID="$(gcloud config get-value project 2>/dev/null)"
    echo "  falling back to current project: $PROJECT_ID"
  fi
fi
gcloud config set project "$PROJECT_ID" >/dev/null

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# --- 2. APIs ---------------------------------------------------------------
note "Enabling Calendar + Gmail APIs (no-op if already on)"
gcloud services enable calendar-json.googleapis.com gmail.googleapis.com

# --- 3. Service account + key ----------------------------------------------
note "Ensuring service account '$SA_EMAIL'"
if ! gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="Zabble booking bot"
else
  echo "  already exists — reusing."
fi

note "Creating a fresh JSON key → $KEY_PATH"
mkdir -p "$(dirname "$KEY_PATH")"
gcloud iam service-accounts keys create "$KEY_PATH" --iam-account="$SA_EMAIL"

# --- 4. Write .env ---------------------------------------------------------
note "Writing NUXT_GOOGLE_* into $ENV_FILE"
CLIENT_EMAIL="$(node -e "console.log(require('./$KEY_PATH').client_email)")"
PRIVATE_KEY="$(node -e "console.log(JSON.stringify(require('./$KEY_PATH').private_key))")"

# Drop any previous booking block, then append a fresh one.
MARKER="# >>> zabble booking (managed by provision-booking.sh) >>>"
END_MARKER="# <<< zabble booking <<<"
if [ -f "$ENV_FILE" ] && grep -qF "$MARKER" "$ENV_FILE"; then
  node -e "const fs=require('fs');const f='$ENV_FILE';let s=fs.readFileSync(f,'utf8');s=s.replace(/# >>> zabble booking[\s\S]*?# <<< zabble booking <<<\n?/,'');fs.writeFileSync(f,s)"
fi
{
  echo "$MARKER"
  echo "NUXT_GOOGLE_CLIENT_EMAIL=${CLIENT_EMAIL}"
  echo "NUXT_GOOGLE_PRIVATE_KEY=${PRIVATE_KEY}"
  echo "NUXT_GOOGLE_IMPERSONATED_USER=${IMPERSONATE}"
  echo "NUXT_SALES_NOTIFY_EMAIL=${IMPERSONATE}"
  echo "NUXT_BOOKING_TIMEZONE=${TIMEZONE}"
  echo "NUXT_BOOKING_DURATION_MINUTES=30"
  echo "$END_MARKER"
} >> "$ENV_FILE"

# --- 5. Domain-wide delegation instructions --------------------------------
CLIENT_ID="$(gcloud iam service-accounts describe "$SA_EMAIL" --format='value(oauth2ClientId)')"
cat <<EOF

\033[32m✔ Google Cloud side done.\033[0m  Project: $PROJECT_ID

ONE manual step left — domain-wide delegation (≈2 min, Workspace super-admin):

  1. Open: https://admin.google.com  →  Security  →  Access and data control
           →  API controls  →  Domain-wide delegation  →  Add new
  2. Client ID:  $CLIENT_ID
  3. OAuth scopes (paste exactly):
       https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/gmail.send
  4. Authorise.

Then add the same NUXT_GOOGLE_* vars (now in $ENV_FILE) to Vercel:
  Project → Settings → Environment Variables.

The key file lives at: $KEY_PATH  (keep it secret — it's git-ignored under .secrets/)
EOF
