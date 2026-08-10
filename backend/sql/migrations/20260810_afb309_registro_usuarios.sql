SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'alfi'
  AND table_name = 'usuarios'
ORDER BY ordinal_position;