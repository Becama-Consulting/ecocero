SELECT u.email, ur.role, ur.created_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'dennis@becamaconsulting.com';
