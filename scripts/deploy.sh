#!/usr/bin/env bash
# Builds the site and uploads _site/ to a Cloudflare R2 bucket. Used by the GitHub
# Action and by `npm run deploy` / `npm run deploy:staging` (manual).
#
# Usage: deploy.sh [prod|staging] [--dry-run]   (default: prod; DEPLOY_ENV also works)
#
# Needs R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY, plus R2_BUCKET for
# prod or R2_STAGING_BUCKET for staging. Optional: SITE_URL (prod, defaults to
# https://icpc.cl), STAGING_SITE_URL (staging) and EASTER_EGG_KEYS (see lib/bonus.js).
# Read from the environment or from .env in the repo root; for staging, .env.staging
# is also read if it exists and overrides .env. See .env.example.
# DRY_RUN=1 (or --dry-run) only prints what would change.

set -euo pipefail
cd "$(dirname "$0")/.."

# Reads KEY=value lines (not executed as shell, so values may contain spaces);
# surrounding quotes are optional and removed.
load_env() {
  local line key value
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*(#|$) ]] && continue
    [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]] || continue
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    if [[ "$value" =~ ^\"(.*)\"$ || "$value" =~ ^\'(.*)\'$ ]]; then
      value="${BASH_REMATCH[1]}"
    fi
    export "$key=$value"
  done < "$1"
}

target="${DEPLOY_ENV:-prod}"
for arg in "$@"; do
  case "$arg" in
    prod|production) target=prod ;;
    staging) target=staging ;;
    --dry-run) DRY_RUN=1 ;;
    *) echo "Uso: $0 [prod|staging] [--dry-run]" >&2; exit 1 ;;
  esac
done
[[ "$target" == "production" ]] && target=prod
if [[ "$target" != "prod" && "$target" != "staging" ]]; then
  echo "Ambiente desconocido: $target (usa prod o staging)." >&2
  exit 1
fi

[[ -f .env ]] && load_env .env
[[ "$target" == "staging" && -f .env.staging ]] && load_env .env.staging

: "${R2_ACCOUNT_ID:?falta R2_ACCOUNT_ID}"
: "${R2_ACCESS_KEY_ID:?falta R2_ACCESS_KEY_ID}"
: "${R2_SECRET_ACCESS_KEY:?falta R2_SECRET_ACCESS_KEY}"

if [[ "$target" == "staging" ]]; then
  : "${R2_STAGING_BUCKET:?falta R2_STAGING_BUCKET}"
  R2_BUCKET="$R2_STAGING_BUCKET"
  SITE_URL="${STAGING_SITE_URL:-https://icpc-cl-staging.idlechara.net}"
else
  : "${R2_BUCKET:?falta R2_BUCKET}"
fi

echo "[$target] Construyendo para ${SITE_URL:-https://icpc.cl} → bucket ${R2_BUCKET}"
SITE_URL="${SITE_URL:-}" npm run build

export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION=auto
# R2 rejects some of the checksum headers newer AWS CLI versions send by default
export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required

endpoint="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
bucket="s3://${R2_BUCKET}"
sync=(aws s3 sync _site "$bucket" --endpoint-url "$endpoint" --no-progress)
[[ "${DRY_RUN:-}" == "1" ]] && sync+=(--dryrun)

# Pagefind files whose names don't change between builds; they point at the hashed index
# chunks, so they get the short HTML cache and are uploaded with the HTML
short_cache=(--include "*.html" --include "pagefind/*.js" --include "pagefind/*.css" --include "pagefind/pagefind-entry.json")
long_cache=(--exclude "*.html" --exclude "pagefind/*.js" --exclude "pagefind/*.css" --exclude "pagefind/pagefind-entry.json")

# 1. New and changed assets first (long cache), so new HTML never points at missing files
"${sync[@]}" "${long_cache[@]}" --cache-control "public, max-age=604800"

# 2. HTML (short cache); also removes pages that no longer exist
"${sync[@]}" --exclude "*" "${short_cache[@]}" --cache-control "public, max-age=300" --delete

# 3. Remove assets that are no longer used, once no page references them.
#    The hidden page's photo and text are not in git (they're uploaded to the bucket by
#    hand), so CI builds don't have them: never delete them.
"${sync[@]}" "${long_cache[@]}" --exclude "*/photo.jpg" --exclude "*/content.json" --cache-control "public, max-age=604800" --delete
