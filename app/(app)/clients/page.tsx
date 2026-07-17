import Link from "next/link";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewClientDialog } from "@/components/clients/new-client-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, company_name, contact_name, email, sector, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="page-title">Clients</h2>
          <p className="text-sm text-muted-foreground">
            {clients?.length ?? 0} client{(clients?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>
        <NewClientDialog />
      </div>

      {!clients || clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client pour l'instant"
          description="Créez votre première fiche client pour démarrer un projet."
          action={<NewClientDialog />}
        />
      ) : (
        <div className="rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entreprise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead className="text-right">Ajouté le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="group">
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-2 font-medium group-hover:text-primary"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-secondary text-xs">
                          {client.company_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {client.company_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.contact_name || client.email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.sector || "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(client.created_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
