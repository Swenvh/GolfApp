#!/usr/bin/env bash
# Greenside-demo met één commando: database met demodata, clubbeheer en de ledenapp (web).
#
#   pnpm demo            start alles
#   pnpm demo:reset      demodata terugzetten naar de beginstand
#   pnpm demo:stop       alles stoppen
#
# Vereist: Node 22, pnpm 10 en Docker Desktop (draaiend).
set -euo pipefail
cd "$(dirname "$0")/.."

ADMIN_PORT="${ADMIN_PORT:-3000}"
APP_PORT="${APP_PORT:-8081}"
RUN_DIR=".demo"
# Vaste versie van de Supabase-CLI, zodat de demo niet breekt als er een nieuwe uitkomt
SUPABASE="npx --yes supabase@2.118.0"
mkdir -p "$RUN_DIR"

say() { printf '\n\033[1;32m▸ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1" >&2; exit 1; }

# Stopt een proces met alles wat het gestart heeft (npx → next-server)
kill_tree() {
  local child
  for child in $(pgrep -P "$1" 2>/dev/null); do kill_tree "$child"; done
  kill "$1" 2>/dev/null || true
}

# Reviewaccount van Apple/Google met de democlub "Golfclub De Proefbaan" (vast demowachtwoord)
REVIEW_PASSWORD_DEMO="Proefbaan2026"
review_account() {
  local url key
  url="$($SUPABASE status -o env | sed -n 's/^API_URL="\(.*\)"$/\1/p')"
  key="$($SUPABASE status -o env | sed -n 's/^SERVICE_ROLE_KEY="\(.*\)"$/\1/p')"
  NO_PROXY="127.0.0.1,localhost${NO_PROXY:+,$NO_PROXY}" SUPABASE_URL="$url" SUPABASE_SERVICE_ROLE_KEY="$key" \
    REVIEW_PASSWORD="$REVIEW_PASSWORD_DEMO" node scripts/app-review.mjs >/dev/null
}

stop_servers() {
  for f in "$RUN_DIR"/*.pid; do
    [ -f "$f" ] || continue
    kill_tree "$(cat "$f")"
    rm -f "$f"
  done
}

case "${1:-start}" in
  stop)
    stop_servers
    $SUPABASE stop
    echo "Demo gestopt."
    exit 0
    ;;
  reset)
    say "Demodata terugzetten"
    $SUPABASE db reset
    review_account
    echo "Klaar: zes weken gebruik bij Golfclub De Duinen staat weer klaar."
    exit 0
    ;;
  start) ;;
  *) fail "Onbekend commando: $1 (gebruik start, reset of stop)" ;;
esac

command -v docker >/dev/null || fail "Docker ontbreekt. Installeer Docker Desktop en start het."
docker info >/dev/null 2>&1 || fail "Docker draait niet. Start Docker Desktop en probeer opnieuw."

say "Pakketten installeren"
pnpm install --frozen-lockfile

say "Database, inloggen en testmail starten (eerste keer duurt een paar minuten)"
# De database-container heeft soms even nodig om op te starten: dan nog een paar keer proberen
for poging in 1 2 3 4 5; do
  $SUPABASE start -x studio,imgproxy,realtime,storage-api,logflare,vector,supavisor,postgres-meta && break
  [ "$poging" = 5 ] && fail "De database start niet. Kijk in Docker Desktop of er genoeg geheugen is (minimaal 4 GB)."
  echo "Database is nog aan het opstarten, opnieuw over 10 seconden…"
  sleep 10
done

say "Demodata laden (Golfclub De Duinen, zes weken gebruik)"
$SUPABASE db reset

API_URL="$($SUPABASE status -o env | sed -n 's/^API_URL="\(.*\)"$/\1/p')"
ANON_KEY="$($SUPABASE status -o env | sed -n 's/^ANON_KEY="\(.*\)"$/\1/p')"
[ -n "$ANON_KEY" ] || fail "Kon de sleutel van de lokale database niet lezen ($SUPABASE status)."

printf 'NEXT_PUBLIC_SUPABASE_URL=%s\nNEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$API_URL" "$ANON_KEY" > apps/admin/.env.local
printf 'EXPO_PUBLIC_SUPABASE_URL=%s\nEXPO_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$API_URL" "$ANON_KEY" > apps/mobile/.env.local

say "Reviewaccount voor Apple en Google klaarzetten"
review_account

stop_servers

say "Clubbeheer bouwen"
(cd apps/admin && npx next build >/dev/null)
nohup bash -c "cd apps/admin && exec npx next start -p $ADMIN_PORT" > "$RUN_DIR/admin.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/admin.pid"

say "Ledenapp bouwen (webversie)"
(cd apps/mobile && EXPO_PUBLIC_SUPABASE_URL="$API_URL" EXPO_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
  npx expo export --platform web --clear --output-dir "../../$RUN_DIR/app" >/dev/null)
nohup bash -c "cd $RUN_DIR/app && exec npx --yes serve -s -l $APP_PORT" > "$RUN_DIR/app.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/app.pid"

# Wachten tot clubbeheer en ledenapp antwoorden
wait_for() {
  for _ in $(seq 1 60); do
    curl -fs --noproxy '*' "$1" >/dev/null 2>&1 && return 0
    sleep 1
  done
  fail "$2 start niet op $1. Staat de poort al in gebruik? Kijk in $3 (of kies een andere poort, bv. ADMIN_PORT=3001 pnpm demo)."
}
wait_for "http://localhost:$ADMIN_PORT/login" "Clubbeheer" "$RUN_DIR/admin.log"
wait_for "http://localhost:$APP_PORT/" "De ledenapp" "$RUN_DIR/app.log"

cat <<EOF

────────────────────────────────────────────────────────────
  Greenside-demo draait

  Clubbeheer   http://localhost:$ADMIN_PORT
               beheer@deduinen.test / golfapp123

  Ledenapp     http://localhost:$APP_PORT   (tip: telefoonweergave in de browser)
               jan@example.test     A-lid
               pieter@example.test  weekdaglid met Handicart-pas
               inlogcode: zie de testmailbox hieronder
               appreview@greenside.test / $REVIEW_PASSWORD_DEMO  (keuring, democlub)

  Testmail     http://localhost:54324

  Demo terugzetten:  pnpm demo:reset
  Stoppen:           pnpm demo:stop
────────────────────────────────────────────────────────────
EOF
