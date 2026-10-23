CREATE TABLE public.system_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  kind text NOT NULL DEFAULT 'info',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  dismissible boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.system_announcements TO authenticated;
GRANT ALL ON public.system_announcements TO service_role;
ALTER TABLE public.system_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read announcements" ON public.system_announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "support publishes announcements" ON public.system_announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'support'::app_role));
CREATE POLICY "support edits announcements" ON public.system_announcements FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'support'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'support'::app_role));