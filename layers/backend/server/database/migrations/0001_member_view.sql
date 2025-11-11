-- Custom SQL migration file, put your code below! --

DROP VIEW IF EXISTS members_view;

CREATE VIEW members_view AS
SELECT
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS name,
    u.first_name || ' ' || u.last_name || ' ' || u.email || ' ' || COALESCE(g.name, '') || ' ' || COALESCE(r.name, '') AS search_term,
    u.email AS email,
    u.avatar AS avatar,
    u.nationality AS nationality,
    u.status AS status,
    r.id AS role_id,
    r.name AS role_name,
    g.id AS group_id,
    g.name AS group_name
FROM
    users u
    LEFT JOIN members_to_groups mtg ON u.id = mtg.user_id
    LEFT JOIN groups g ON mtg.group_id = g.id
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY
    u.id;