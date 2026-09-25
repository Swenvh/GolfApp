#!/usr/bin/env bash
# Test migraties + seed + RLS op een lokale PostgreSQL (zonder Supabase CLI).
# Gebruikt de standaard libpq-variabelen, bv.: PGHOST=localhost PGUSER=postgres ./supabase/tests/run-local.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="golfapp_test_$$"
psql -d postgres -qc "create database $DB" >/dev/null
trap 'psql -d postgres -qc "drop database $DB" >/dev/null' EXIT
run() { psql -d "$DB" -v ON_ERROR_STOP=1 -q -f "$1" >/dev/null; }
run tests/_supabase_stub.sql
for f in migrations/*.sql; do run "$f"; done
run seed.sql
psql -d "$DB" -v ON_ERROR_STOP=1 -q -f tests/database.test.sql >/dev/null
echo "✔ database tests geslaagd"
