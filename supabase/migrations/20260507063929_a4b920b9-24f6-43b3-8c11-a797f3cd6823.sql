create or replace function public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = user_uuid
    and environment = check_env
    and (
      -- Active / trialing within period (or no period = lifetime)
      (status in ('active', 'trialing') and (current_period_end is null or current_period_end > now()))
      -- Canceled but still in paid period
      or (status = 'canceled' and current_period_end > now())
      -- Past due / unpaid: 7-day grace period from period end
      or (status in ('past_due', 'unpaid') and current_period_end > (now() - interval '7 days'))
    )
  );
$$;