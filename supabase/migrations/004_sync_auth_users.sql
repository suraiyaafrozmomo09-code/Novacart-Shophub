-- Keep public.users in sync with auth.users so the frontend can always
-- resolve profile and role information after login.

CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_role TEXT;
BEGIN
  resolved_role := CASE
    WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer') = 'admin' THEN 'admin'
    ELSE 'customer'
  END;

  INSERT INTO public.users (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    resolved_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.users.phone),
    role = CASE
      WHEN public.users.role = 'admin' OR EXCLUDED.role = 'admin' THEN 'admin'
      ELSE 'customer'
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;
CREATE TRIGGER on_auth_user_sync
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_sync();

INSERT INTO public.users (id, email, full_name, phone, role)
SELECT
  au.id,
  au.email,
  NULLIF(au.raw_user_meta_data ->> 'full_name', ''),
  NULLIF(au.raw_user_meta_data ->> 'phone', ''),
  CASE
    WHEN COALESCE(au.raw_user_meta_data ->> 'role', 'customer') = 'admin' THEN 'admin'
    ELSE 'customer'
  END
FROM auth.users AS au
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
  phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.users.phone),
  role = CASE
    WHEN public.users.role = 'admin' OR EXCLUDED.role = 'admin' THEN 'admin'
    ELSE 'customer'
  END,
  updated_at = NOW();
