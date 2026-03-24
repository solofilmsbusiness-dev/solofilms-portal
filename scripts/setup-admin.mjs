import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setup() {
  console.log("Setting up database tables...\n");

  // Create tables
  const sql = `
    -- Create profiles table
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      company_name TEXT,
      phone TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create project_status enum type
    DO $$ BEGIN
      CREATE TYPE project_status AS ENUM (
        'booked', 'pre_production', 'filming', 'editing', 'review', 'delivered'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Create projects table
    CREATE TABLE IF NOT EXISTS public.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status project_status DEFAULT 'booked',
      genre TEXT,
      shoot_date DATE,
      estimated_delivery DATE,
      thumbnail_url TEXT,
      location TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create project_status_history table
    CREATE TABLE IF NOT EXISTS public.project_status_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      status project_status NOT NULL,
      reached_at TIMESTAMPTZ DEFAULT now(),
      note TEXT
    );

    -- Create booking_status enum type
    DO $$ BEGIN
      CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Create deliverables table
    CREATE TABLE IF NOT EXISTS public.deliverables (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size_bytes BIGINT,
      file_type TEXT,
      version INT DEFAULT 1,
      is_final BOOLEAN DEFAULT false,
      uploaded_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create bookings table
    CREATE TABLE IF NOT EXISTS public.bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      project_id UUID REFERENCES public.projects(id),
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      shoot_type TEXT,
      location TEXT,
      notes TEXT,
      status booking_status DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create blocked_dates table
    CREATE TABLE IF NOT EXISTS public.blocked_dates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL UNIQUE,
      reason TEXT
    );

    -- Create social_tips table
    CREATE TABLE IF NOT EXISTS public.social_tips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      genre TEXT NOT NULL,
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_trending BOOLEAN DEFAULT false,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Create notifications table
    CREATE TABLE IF NOT EXISTS public.notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      link TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Enable RLS on all tables
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.project_status_history ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.social_tips ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for profiles
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Allow insert for authenticated" ON public.profiles;
    CREATE POLICY "Allow insert for authenticated" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);

    -- RLS Policies for projects
    DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
    CREATE POLICY "Users can view own projects" ON public.projects
      FOR SELECT USING (auth.uid() = client_id);

    -- RLS Policies for project_status_history
    DROP POLICY IF EXISTS "Users can view own project history" ON public.project_status_history;
    CREATE POLICY "Users can view own project history" ON public.project_status_history
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
      );

    -- RLS Policies for deliverables
    DROP POLICY IF EXISTS "Users can view own deliverables" ON public.deliverables;
    CREATE POLICY "Users can view own deliverables" ON public.deliverables
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
      );

    -- RLS Policies for bookings
    DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
    CREATE POLICY "Users can view own bookings" ON public.bookings
      FOR SELECT USING (auth.uid() = client_id);

    DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
    CREATE POLICY "Users can create bookings" ON public.bookings
      FOR INSERT WITH CHECK (auth.uid() = client_id);

    -- RLS Policies for blocked_dates (public read)
    DROP POLICY IF EXISTS "Anyone can view blocked dates" ON public.blocked_dates;
    CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates
      FOR SELECT USING (true);

    -- RLS Policies for social_tips (public read)
    DROP POLICY IF EXISTS "Anyone can view social tips" ON public.social_tips;
    CREATE POLICY "Anyone can view social tips" ON public.social_tips
      FOR SELECT USING (true);

    -- RLS Policies for notifications
    DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
    CREATE POLICY "Users can view own notifications" ON public.notifications
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    CREATE POLICY "Users can update own notifications" ON public.notifications
      FOR UPDATE USING (auth.uid() = user_id);

    -- Auto-create profile trigger
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name, avatar_url)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `;

  const { error: sqlError } = await supabase.rpc("exec_sql", { sql });

  if (sqlError) {
    // Try running SQL directly if RPC doesn't exist - use REST API
    console.log("RPC not available, running SQL via REST...");
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!res.ok) {
      console.log("SQL via REST also unavailable. You may need to run the SQL manually in the Supabase dashboard.");
      console.log("Continuing with admin user creation...\n");
    }
  } else {
    console.log("Tables created successfully!\n");
  }

  // Create admin user
  console.log("Creating admin user...");

  const { data: user, error: userError } =
    await supabase.auth.admin.createUser({
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: process.env.ADMIN_PASSWORD || "changeme123",
      email_confirm: true,
      user_metadata: {
        full_name: "Solo Films Admin",
      },
    });

  if (userError) {
    if (userError.message.includes("already been registered")) {
      console.log("User already exists. Updating password...");
      // Get user by email
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(
        (u) => u.email === (process.env.ADMIN_EMAIL || "admin@example.com")
      );
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, {
          password: "Solo4Eva1010",
        });
        // Update profile role to admin
        await supabase
          .from("profiles")
          .upsert({
            id: existing.id,
            full_name: "Solo Films Admin",
            role: "admin",
          });
        console.log("Password updated and role set to admin!");
      }
    } else {
      console.error("Error creating user:", userError.message);
    }
  } else {
    console.log("Admin user created:", user.user.email);
    // Set role to admin in profiles
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.user.id,
      full_name: "Solo Films Admin",
      role: "admin",
    });
    if (profileError) {
      console.log("Note: Profile table may not exist yet. Role will be set after tables are created.");
    } else {
      console.log("Profile role set to admin!");
    }
  }

  console.log("\nDone! Admin can now sign in at the portal.");
}

setup().catch(console.error);
