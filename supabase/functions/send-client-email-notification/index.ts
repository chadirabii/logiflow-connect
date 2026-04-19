import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

type NotificationType =
  | "message"
  | "status_update"
  | "alert"
  | "success"
  | "info";

type RequestPayload = {
  recipientIds?: string[];
  title?: string;
  description?: string;
  actionUrl?: string;
  type?: NotificationType;
  offlineThresholdMinutes?: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("NOTIFY_FROM_EMAIL");
  const appBaseUrl = Deno.env.get("APP_BASE_URL") || "";

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    !supabaseServiceRoleKey ||
    !resendApiKey ||
    !fromEmail
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NOTIFY_FROM_EMAIL",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const token = authHeader.replace("Bearer ", "");

  const authClient = createClient(supabaseUrl, supabaseAnonKey);
  const authResult = await authClient.auth.getUser(token);
  if (authResult.error || !authResult.data.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const payload = (await req.json()) as RequestPayload;
  const rawRecipientIds = Array.isArray(payload.recipientIds)
    ? payload.recipientIds
    : [];

  const recipientIds = Array.from(
    new Set(
      rawRecipientIds.filter(
        (recipientId) =>
          typeof recipientId === "string" && recipientId.length > 0,
      ),
    ),
  );

  if (recipientIds.length === 0) {
    return new Response(JSON.stringify({ sent: 0, skipped: 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const title = payload.title?.trim() || "Nouvelle notification";
  const description =
    payload.description?.trim() || "Vous avez une nouvelle activité.";
  const type = payload.type || "info";
  const offlineThresholdMinutes =
    typeof payload.offlineThresholdMinutes === "number" &&
    Number.isFinite(payload.offlineThresholdMinutes)
      ? Math.max(1, Math.min(120, Math.floor(payload.offlineThresholdMinutes)))
      : 5;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  const [rolesResult, profilesResult] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", recipientIds),
    supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, last_seen_at")
      .in("user_id", recipientIds),
  ]);

  if (rolesResult.error || profilesResult.error) {
    return new Response(
      JSON.stringify({
        error:
          rolesResult.error?.message ||
          profilesResult.error?.message ||
          "Failed to load recipients",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const clientUserIds = new Set(
    (rolesResult.data || [])
      .filter((entry) => entry.role === "client")
      .map((entry) => entry.user_id),
  );

  const thresholdDate = new Date(Date.now() - offlineThresholdMinutes * 60_000);

  const offlineClients = (profilesResult.data || []).filter((profile) => {
    if (!clientUserIds.has(profile.user_id)) {
      return false;
    }

    if (!profile.last_seen_at) {
      return true;
    }

    return new Date(profile.last_seen_at).getTime() < thresholdDate.getTime();
  });

  if (offlineClients.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0, skipped: recipientIds.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const fullActionUrl = payload.actionUrl
    ? payload.actionUrl.startsWith("http")
      ? payload.actionUrl
      : `${appBaseUrl}${payload.actionUrl}`
    : "";

  let sent = 0;
  let skipped = recipientIds.length - offlineClients.length;

  for (const clientProfile of offlineClients) {
    const userResult = await supabaseAdmin.auth.admin.getUserById(
      clientProfile.user_id,
    );
    const recipientEmail = userResult.data.user?.email;

    if (!recipientEmail) {
      skipped += 1;
      continue;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
        <h2 style="margin: 0 0 12px;">${title}</h2>
        <p style="margin: 0 0 12px;">Bonjour ${clientProfile.full_name || "Client"},</p>
        <p style="margin: 0 0 16px;">${description}</p>
        ${fullActionUrl ? `<p style="margin: 0 0 16px;"><a href="${fullActionUrl}" style="color: #2563eb; text-decoration: none;">Ouvrir LogiFlow Connect</a></p>` : ""}
        <p style="margin: 0; font-size: 12px; color: #6b7280;">Type: ${type}</p>
      </div>
    `;

    const resendResult = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: `[LogiFlow] ${title}`,
        html,
      }),
    });

    if (resendResult.ok) {
      sent += 1;
    } else {
      skipped += 1;
    }
  }

  return new Response(JSON.stringify({ sent, skipped }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
