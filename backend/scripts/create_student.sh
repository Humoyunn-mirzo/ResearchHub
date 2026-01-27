#!/bin/env sh
# creates a STUDENT user with the following credentials:
# email: student@example.com
# password: 123
docker exec -it db psql -U admin -d appdb -v ON_ERROR_STOP=1 -c "
    INSERT INTO users (id, email, password_hash) VALUES ('d52e5ee5-538b-41b4-a63d-af8821251766', 'student@example.com', '\$2a\$12\$mn3C1uW7HMD7KAk3mQ.Ic.uu4sopNA.jMg2EPbFv6.Sa1RkP1RlKG');
    INSERT INTO user_roles (user_id, role) VALUES ('d52e5ee5-538b-41b4-a63d-af8821251766', 'STUDENT');
    "
