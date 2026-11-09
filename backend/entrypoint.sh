#!/bin/sh
set -e

python manage.py wait_for_db --timeout "${DB_WAIT_TIMEOUT:-60}"
python manage.py migrate --noinput
python manage.py createcachetable

if [ "${SEED_DEMO_DATA:-1}" = "1" ]; then
    python manage.py seed_demo --if-empty
fi

python manage.py ensure_superuser

exec "$@"
