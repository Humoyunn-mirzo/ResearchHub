#!/bin/env sh
# creates a DEVELOPER user with the following credentials:
# email: developer@example.com
# password: 123
docker exec -it db psql -U admin -d appdb -v ON_ERROR_STOP=1 -c "
    INSERT INTO users (id, email, password_hash) VALUES ('63f742f5-bd2b-4df8-8a68-cc16727fd0ca', 'developer@example.com', '\$2a\$12\$YHPHU3RxhcdR4EPM9jnrv.YpxPkriXejg7TTghZTuWMa9vdmvprRu');
    INSERT INTO user_roles (user_id, role) VALUES ('63f742f5-bd2b-4df8-8a68-cc16727fd0ca', 'DEVELOPER');
    "
