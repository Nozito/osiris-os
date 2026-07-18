import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
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
  TableRowLink,
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
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead className="text-right">Ajouté le</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="group">
                    <TableRowLink href={`/clients/${client.id}`} />
                    <TableCell>
                      <span className="flex items-center gap-2 font-medium group-hover:text-primary">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-secondary text-xs">
                            {client.company_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {client.company_name}
                      </span>
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
                    <TableCell>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-(--duration-fast) group-hover:opacity-100" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2 sm:hidden">
            {clients.map((client, i) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="animate-fade-in-up flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-xs)] transition-colors duration-(--duration-fast) active:bg-white/[0.03]"
                style={{ animationDelay: `${Math.min(i * 25, 300)}ms` }}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-secondary text-xs">
                    {client.company_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{client.company_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {client.contact_name || client.email || client.sector || "—"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
