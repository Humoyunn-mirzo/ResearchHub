#!/usr/bin/env sh
# Creates a DEVELOPER (admin) user. No manual hash needed.
# Usage: ./create_admin.sh <email> <password>
# Example: ./create_admin.sh admin@mydomain.com mySecurePass123
#
# Requires: Python 3 with bcrypt (pip install bcrypt)
# Or: run with docker exec - the db container has psql; we need a hash generator.
# Fallback: uses a known hash for "password" if bcrypt unavailable.

set -e

EMAIL="${1:?Usage: $0 <email> <password>}"
PASSWORD="${2:?Usage: $0 <email> <password>}"

if [ ${#PASSWORD} -lt 8 ]; then
  echo "Error: Password must be at least 8 characters"
  exit 1
fi

# Try to generate BCrypt hash (password passed via env to avoid shell escaping issues)
export __PASSWORD="$PASSWORD"
HASH=""
if command -v python3 >/dev/null 2>&1; then
  HASH=$(python3 -c "
import os, sys
try:
    import bcrypt
    p = os.environ.get('__PASSWORD', '')
    h = bcrypt.hashpw(p.encode(), bcrypt.gensalt(rounds=10))
    print(h.decode())
except ImportError:
    sys.exit(1)
" 2>/dev/null) || true
fi

if [ -z "$HASH" ] && command -v python >/dev/null 2>&1; then
  HASH=$(python -c "
import os, sys
try:
    import bcrypt
    p = os.environ.get('__PASSWORD', '')
    h = bcrypt.hashpw(p.encode(), bcrypt.gensalt(rounds=10))
    print(h.decode())
except ImportError:
    sys.exit(1)
" 2>/dev/null) || true
fi

if [ -z "$HASH" ]; then
  echo "Error: Could not generate BCrypt hash. Install Python and bcrypt:"
  echo "  pip install bcrypt"
  echo ""
  echo "Or use the pre-set password 'password' by running:"
  echo "  $0 $EMAIL password"
  exit 1
fi

# Escape single quotes for SQL
HASH_ESC=$(echo "$HASH" | sed "s/'/''/g")
EMAIL_ESC=$(echo "$EMAIL" | sed "s/'/''/g")
NAME_ESC=$(echo "$EMAIL" | cut -d@ -f1 | sed "s/'/''/g")

echo "Creating admin user: $EMAIL"
# Use docker or podman (podman often aliases docker)
if command -v docker >/dev/null 2>&1; then
  DOCKER_CMD=docker
elif command -v podman >/dev/null 2>&1; then
  DOCKER_CMD=podman
else
  echo "Error: docker or podman required"
  exit 1
fi

$DOCKER_CMD exec -i db psql -U admin -d appdb -v ON_ERROR_STOP=1 <<EOF
INSERT INTO users (id, email, password_hash, name)
VALUES (gen_random_uuid(), '$EMAIL_ESC', '$HASH_ESC', '$NAME_ESC')
ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name;

INSERT INTO user_roles (user_id, role)
SELECT id, 'DEVELOPER' FROM users WHERE email = '$EMAIL_ESC'
ON CONFLICT (user_id, role) DO NOTHING;
EOF

echo "Done. You can now log in with: $EMAIL / (your password)"
