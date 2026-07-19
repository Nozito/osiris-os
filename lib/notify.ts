import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Inserts a notification for every staff member who opted in. Uses the
 * service-role client because notification rows must land regardless of who
 * triggered the event (e.g. a client signing a quote — RLS only lets staff
 * insert into `notifications`, and the signer is a client-role session).
 */
async function notifyStaff(options: {
  type: string;
  title: string;
  body?: string;
  link?: string;
  prefColumn: "notify_on_quote_signed";
}) {
  const admin = createAdminClient();

  const { data: recipients } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["admin", "employee"])
    .eq(options.prefColumn, true);

  if (!recipients || recipients.length === 0) return;

  await admin.from("notifications").insert(
    recipients.map((r) => ({
      profile_id: r.id,
      type: options.type,
      title: options.title,
      body: options.body ?? null,
      link: options.link ?? null,
    }))
  );
}

export async function notifyStaffQuoteSigned(quote: {
  id: string;
  number: string;
  signedByName: string;
}) {
  await notifyStaff({
    type: "quote_signed",
    title: `Devis ${quote.number} signé`,
    body: `Signé par ${quote.signedByName}.`,
    link: `/quotes/${quote.id}`,
    prefColumn: "notify_on_quote_signed",
  });
}
