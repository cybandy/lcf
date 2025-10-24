-- DROP VIEW IF EXISTS members_view;
-- CREATE VIEW members_view AS
-- SELECT
--     u.id AS user_id,
--     u.first_name || ' ' || u.last_name AS name,
--     u.email AS email,
--     json_object(
--         'id',
--         u.id,
--         'first_name',
--         u.first_name,
--         'last_name',
--         u.last_name,
--         'email',
--         u.email,
--         'phone_number',
--         u.phone_number,
--         'status',
--         u.status,
--         'avatar',
--         u.avatar
--     ) AS member,
--     (
--         SELECT
--             json_group_array(
--                 json_object(
--                     'role_id',
--                     r.id,
--                     'role_name',
--                     r.name
--                 )
--             )
--         FROM
--             roles r
--             LEFT JOIN user_roles ur ON r.id = ur.role_id
--         WHERE
--             ur.user_id = u.id
--     ) AS roles,
--     (
--         SELECT
--             json_group_array(
--                 json_object(
--                     'group_id',
--                     g.id,
--                     'group_name',
--                     g.name
--                 )
--             )
--         FROM
--             groups g
--             LEFT JOIN members_to_groups mtg ON g.id = mtg.group_id
--         WHERE
--             mtg.user_id = u.id
--     ) AS groups
-- FROM
--     users u;
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