import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { QuoteDocument } from "@/services/pdf/quote-document";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(company_name, contact_name, address, email), quote_items(*)")
    .eq("id", id)
    .single();

  if (!quote) {
    return NextResponse.json({ error: "Devis introuvable." }, { status: 404 });
  }

  const items = (quote.quote_items ?? []).sort((a, b) => a.position - b.position);

  const buffer = await renderToBuffer(
    <QuoteDocument
      number={quote.number}
      status={quote.status}
      issuedAt={quote.issued_at}
      validUntil={quote.valid_until}
      terms={quote.terms}
      vatRate={quote.vat_rate}
      signedByName={quote.signed_by_name}
      signedAt={quote.signed_at}
      client={quote.clients!}
      items={items}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quote.number}.pdf"`,
    },
  });
}
