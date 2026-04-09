-- 1. Ensure extensions for pg_cron and pg_net are enabled
create extension if not exists "pg_cron";
create extension if not exists "pg_net";

-- 2. Create the cron job
-- This cron schedule '0 0,5,10 * * *' executes at 00:00, 05:00, and 10:00 UTC.
-- In PHT (UTC+8), this corresponds to 8:00 AM, 1:00 PM, and 6:00 PM (3x a day)
--
-- Make sure to replace YOUR_PROJECT_REF with your actual project ref in the URL if running remotely.
-- e.g., 'https://yosbftuwvsrwnxyemequ.supabase.co/functions/v1/send-batch-notification'
select
  cron.schedule(
    'send-batch-admin-notification',
    '0 0,5,10 * * *', 
    $$
      select
        net.http_post(
          url:='https://yosbftuwvsrwnxyemequ.supabase.co/functions/v1/send-batch-notification',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvc2JmdHV3dnNyd254eWVtZXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzUyNzgsImV4cCI6MjA4ODI1MTI3OH0.uv6IMkr4GYi6Hsh1xAWy9W9YoJtvhuMR2mc5vqOefq4"}'::jsonb,
          body:='{}'::jsonb
        ) as request_id;
    $$
  );
