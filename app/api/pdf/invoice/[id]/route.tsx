import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDocument } from "@/services/pdf/invoice-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, clients(company_name, contact_name, address, email), invoice_items(*)")
    .eq("id", id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });
  }

  const items = (invoice.invoice_items ?? []).sort((a, b) => a.position - b.position);

  const buffer = await renderToBuffer(
    <InvoiceDocument
      number={invoice.number}
      status={invoice.status}
      issuedAt={invoice.issued_at}
      dueAt={invoice.due_at}
      vatRate={invoice.vat_rate}
      client={invoice.clients!}
      items={items}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
