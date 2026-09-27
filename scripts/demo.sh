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
mkdir -p "$RUN_DIR"

say() { printf '\n\033[1;32m▸ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1" >&2; exit 1; }

# Stopt een proces met alles wat het gestart heeft (npx → next-server)
kill_tree() {
  local child
  for child in $(pgrep -P "$1" 2>/dev/null); do kill_tree "$child"; done
  kill "$1" 2>/dev/null || true
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
    npx supabase stop
    echo "Demo gestopt."
    exit 0
    ;;
  reset)
    say "Demodata terugzetten"
    npx supabase db reset
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
  npx supabase start -x studio,imgproxy,realtime,storage-api,edge-runtime,logflare,vector,supavisor,postgres-meta && break
  [ "$poging" = 5 ] && fail "De database start niet. Kijk in Docker Desktop of er genoeg geheugen is (minimaal 4 GB)."
  echo "Database is nog aan het opstarten, opnieuw over 10 seconden…"
  sleep 10
done

say "Demodata laden (Golfclub De Duinen, zes weken gebruik)"
npx supabase db reset

API_URL="$(npx supabase status -o env | sed -n 's/^API_URL="\(.*\)"$/\1/p')"
ANON_KEY="$(npx supabase status -o env | sed -n 's/^ANON_KEY="\(.*\)"$/\1/p')"
[ -n "$ANON_KEY" ] || fail "Kon de sleutel van de lokale database niet lezen (npx supabase status)."

printf 'NEXT_PUBLIC_SUPABASE_URL=%s\nNEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$API_URL" "$ANON_KEY" > apps/admin/.env.local
printf 'EXPO_PUBLIC_SUPABASE_URL=%s\nEXPO_PUBLIC_SUPABASE_ANON_KEY=%s\n' "$API_URL" "$ANON_KEY" > apps/mobile/.env.local

stop_servers

say "Clubbeheer bouwen"
(cd apps/admin && npx next build >/dev/null)
nohup bash -c "cd apps/admin && exec npx next start -p $ADMIN_PORT" > "$RUN_DIR/admin.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/admin.pid"

say "Ledenapp bouwen (webversie)"
(cd apps/mobile && EXPO_PUBLIC_SUPABASE_URL="$API_URL" EXPO_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY" \
  npx expo export --platform web --output-dir "../../$RUN_DIR/app" >/dev/null)
nohup bash -c "cd $RUN_DIR/app && exec npx --yes serve -s -l $APP_PORT" > "$RUN_DIR/app.log" 2>&1 < /dev/null &
echo $! > "$RUN_DIR/app.pid"

# Wachten tot clubbeheer en ledenapp antwoorden
for url in "http://localhost:$ADMIN_PORT/login" "http://localhost:$APP_PORT/"; do
  for _ in $(seq 1 60); do
    curl -fs --noproxy '*' "$url" >/dev/null 2>&1 && break
    sleep 1
  done
done

cat <<EOF

────────────────────────────────────────────────────────────
  Greenside-demo draait

  Clubbeheer   http://localhost:$ADMIN_PORT
               beheer@deduinen.test / golfapp123

  Ledenapp     http://localhost:$APP_PORT   (tip: telefoonweergave in de browser)
               jan@example.test     A-lid
               pieter@example.test  weekdaglid met Handicart-pas
               inlogcode: zie de testmailbox hieronder

  Testmail     http://localhost:54324

  Demo terugzetten:  pnpm demo:reset
  Stoppen:           pnpm demo:stop
────────────────────────────────────────────────────────────
EOF
