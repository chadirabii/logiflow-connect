import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

const port = Number(process.env.MAIL_SERVER_PORT || 4000);
const allowedOrigin = process.env.MAIL_CORS_ORIGIN || "*";
const mailApiKey = process.env.MAIL_API_KEY || "";
const appName = process.env.MAIL_APP_NAME || "24/7 Logistics";

const smtpHost =
  process.env.SMTP_HOST || process.env["spring.mail.host"] || "smtp.gmail.com";
const smtpPort = Number(
  process.env.SMTP_PORT || process.env["spring.mail.port"] || 587,
);
const smtpUser = process.env.SMTP_USER || process.env["spring.mail.username"];
const smtpPass = process.env.SMTP_PASS || process.env["spring.mail.password"];
const fromAddress = process.env.SMTP_FROM || smtpUser;
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!smtpUser || !smtpPass || !fromAddress) {
  console.error(
    "Missing SMTP env vars. Required: SMTP_USER, SMTP_PASS, SMTP_FROM (or SMTP_USER as fallback).",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: false,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Api-Key"],
  }),
);
app.use(express.json({ limit: "1mb" }));

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const withLineBreaks = (value = "") =>
  escapeHtml(value).replaceAll("\n", "<br/>");

const ensureAuthorized = (req, res, next) => {
  if (!mailApiKey) {
    next();
    return;
  }

  const token = req.get("X-Api-Key");
  if (token !== mailApiKey) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};

const normalizeEmails = (emails = []) =>
  Array.from(
    new Set(
      emails
        .filter((email) => typeof email === "string")
        .map((email) => email.trim())
        .filter((email) => email.length > 0),
    ),
  );

const getAdminUserIds = async () => {
  if (!supabaseAdmin) {
    throw new Error(
      "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin recipient lookup.",
    );
  }

  const adminRolesResult = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");

  if (adminRolesResult.error) {
    throw new Error(adminRolesResult.error.message);
  }

  return (adminRolesResult.data ?? []).map((entry) => entry.user_id);
};

const getRoleUserIds = async (roles = []) => {
  if (!supabaseAdmin) {
    throw new Error(
      "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for role recipient lookup.",
    );
  }

  const uniqueRoles = Array.from(
    new Set(
      roles
        .filter((role) => typeof role === "string")
        .map((role) => role.trim())
        .filter((role) => role.length > 0),
    ),
  );

  if (uniqueRoles.length === 0) {
    return [];
  }

  const rolesResult = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .in("role", uniqueRoles);

  if (rolesResult.error) {
    throw new Error(rolesResult.error.message);
  }

  return Array.from(new Set((rolesResult.data ?? []).map((entry) => entry.user_id)));
};

const resolveEmailsFromRecipientIds = async (recipientIds = []) => {
  if (!supabaseAdmin) {
    throw new Error(
      "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for recipientId email resolution.",
    );
  }

  const uniqueRecipientIds = Array.from(
    new Set(
      recipientIds
        .filter((recipientId) => typeof recipientId === "string")
        .map((recipientId) => recipientId.trim())
        .filter((recipientId) => recipientId.length > 0),
    ),
  );

  const resolvedEmails = [];

  for (const recipientId of uniqueRecipientIds) {
    const userResult = await supabaseAdmin.auth.admin.getUserById(recipientId);
    const recipientEmail = userResult.data.user?.email;

    if (recipientEmail) {
      resolvedEmails.push(recipientEmail);
    }
  }

  return normalizeEmails(resolvedEmails);
};

const buildNotificationHtml = ({ title, description, actionUrl, type }) => {
  const safeTitle = escapeHtml(title || "Nouvelle notification");
  const safeDescription = withLineBreaks(
    description || "Vous avez une nouvelle activité.",
  );
  const safeType = escapeHtml(type || "info");
  const safeActionUrl = actionUrl ? escapeHtml(actionUrl) : "";

  return `
    <div style="margin: 0; padding: 24px 12px; background-color: #f3f6fb; font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;">
        <tr>
          <td style="padding: 24px 28px 16px; background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); color: #ffffff;">
            <p style="margin: 0 0 8px; font-size: 12px; opacity: 0.95; letter-spacing: 0.4px; text-transform: uppercase;">Notification</p>
            <h1 style="margin: 0; font-size: 24px; line-height: 1.3; font-weight: 700;">${escapeHtml(appName)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px 28px 28px;">
            <h2 style="margin: 0 0 12px; font-size: 22px; line-height: 1.35; color: #0f172a;">${safeTitle}</h2>
            <p style="margin: 0 0 22px; font-size: 15px; line-height: 1.7; color: #334155;">${safeDescription}</p>
            ${safeActionUrl ? `<p style="margin: 0 0 20px;"><a href="${safeActionUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 18px; border-radius: 8px;">Ouvrir ${escapeHtml(appName)}</a></p>` : ""}
            <p style="margin: 0; font-size: 12px; color: #64748b;">Type: <strong style="color: #334155; text-transform: capitalize;">${safeType}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 28px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Cet email a été envoyé automatiquement par ${escapeHtml(appName)}.
          </td>
        </tr>
      </table>
    </div>
  `;
};

const buildNotificationText = ({ title, description, actionUrl, type }) =>
  [
    appName,
    "",
    title || "Nouvelle notification",
    description || "Vous avez une nouvelle activité.",
    actionUrl ? `Ouvrir: ${actionUrl}` : "",
    `Type: ${type || "info"}`,
  ]
    .filter(Boolean)
    .join("\n");

app.get("/health", async (_req, res) => {
  try {
    await transporter.verify();
    res.status(200).json({ ok: true, provider: "smtp" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "SMTP verify failed",
    });
  }
});

app.post("/notifications/email", ensureAuthorized, async (req, res) => {
  const {
    to,
    recipientIds,
    includeAdmins,
    subject,
    title,
    description,
    actionUrl,
    type,
    html,
    text,
  } = req.body || {};

  let recipients = normalizeEmails(Array.isArray(to) ? to : [to]);

  if (!recipients.length && (Array.isArray(recipientIds) || includeAdmins)) {
    try {
      const baseRecipientIds = Array.isArray(recipientIds) ? recipientIds : [];
      const adminRecipientIds = includeAdmins ? await getAdminUserIds() : [];
      const resolvedRecipientIds = Array.from(
        new Set([...baseRecipientIds, ...adminRecipientIds]),
      );
      recipients = await resolveEmailsFromRecipientIds(resolvedRecipientIds);
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to resolve recipient emails",
      });
      return;
    }
  }

  if (!recipients.length) {
    res.status(400).json({ error: "Missing recipient(s) in `to`" });
    return;
  }

  const finalSubject =
    typeof subject === "string" && subject.trim().length > 0
      ? subject.trim()
      : `[${appName}] ${title || "Nouvelle notification"}`;

  try {
    const result = await transporter.sendMail({
      from: fromAddress,
      to: recipients,
      subject: finalSubject,
      html:
        typeof html === "string" && html.trim().length > 0
          ? html
          : buildNotificationHtml({ title, description, actionUrl, type }),
      text:
        typeof text === "string" && text.trim().length > 0
          ? text
          : buildNotificationText({ title, description, actionUrl, type }),
    });

    res.status(200).json({
      sent: recipients.length,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to send email",
    });
  }
});

app.post("/notifications/create", ensureAuthorized, async (req, res) => {
  if (!supabaseAdmin) {
    res.status(500).json({
      error:
        "Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for notification creation.",
    });
    return;
  }

  const {
    recipientIds,
    roles,
    type,
    title,
    description,
    icon,
    actionUrl,
  } = req.body || {};

  if (typeof title !== "string" || title.trim().length === 0) {
    res.status(400).json({ error: "`title` is required" });
    return;
  }

  const directRecipientIds = Array.isArray(recipientIds) ? recipientIds : [];
  const roleRecipientIds = Array.isArray(roles) ? await getRoleUserIds(roles) : [];

  const targetUserIds = Array.from(
    new Set(
      [...directRecipientIds, ...roleRecipientIds]
        .filter((userId) => typeof userId === "string")
        .map((userId) => userId.trim())
        .filter((userId) => userId.length > 0),
    ),
  );

  if (targetUserIds.length === 0) {
    res.status(200).json({ inserted: 0 });
    return;
  }

  const createdAt = new Date().toISOString();
  const insertPayload = targetUserIds.map((userId) => ({
    user_id: userId,
    type: typeof type === "string" && type.length > 0 ? type : "info",
    title: title.trim(),
    description: typeof description === "string" ? description : "",
    read: false,
    icon: typeof icon === "string" ? icon : null,
    action_url: typeof actionUrl === "string" ? actionUrl : null,
    created_at: createdAt,
  }));

  const insertResult = await supabaseAdmin
    .from("notifications")
    .insert(insertPayload)
    .select("id");

  if (insertResult.error) {
    res.status(500).json({ error: insertResult.error.message });
    return;
  }

  res.status(200).json({ inserted: insertResult.data?.length ?? 0 });
});

app.post("/notifications/bulk", ensureAuthorized, async (req, res) => {
  const { notifications } = req.body || {};

  if (!Array.isArray(notifications) || notifications.length === 0) {
    res
      .status(400)
      .json({ error: "`notifications` must be a non-empty array" });
    return;
  }

  let sent = 0;
  let skipped = 0;
  const errors = [];

  for (const [index, notification] of notifications.entries()) {
    const recipients = normalizeEmails(
      Array.isArray(notification?.to) ? notification.to : [notification?.to],
    );

    if (!recipients.length) {
      skipped += 1;
      errors.push({ index, error: "Missing recipient(s)" });
      continue;
    }

    try {
      await transporter.sendMail({
        from: fromAddress,
        to: recipients,
        subject:
          notification.subject ||
          `[${appName}] ${notification.title || "Notification"}`,
        html:
          notification.html ||
          buildNotificationHtml({
            title: notification.title,
            description: notification.description,
            actionUrl: notification.actionUrl,
            type: notification.type,
          }),
        text:
          notification.text ||
          buildNotificationText({
            title: notification.title,
            description: notification.description,
            actionUrl: notification.actionUrl,
            type: notification.type,
          }),
      });
      sent += recipients.length;
    } catch (error) {
      skipped += recipients.length;
      errors.push({
        index,
        error: error instanceof Error ? error.message : "Failed to send",
      });
    }
  }

  res.status(200).json({ sent, skipped, errors });
});

app.listen(port, () => {
  console.log(`Mail server listening on http://localhost:${port}`);
});
