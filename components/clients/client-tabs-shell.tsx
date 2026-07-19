"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TAB_ITEMS = [
  { value: "infos", label: "Infos générales" },
  { value: "avatar", label: "Avatar client" },
  { value: "offre", label: "Offre" },
  { value: "positionnement", label: "Positionnement" },
  { value: "branding", label: "Direction artistique" },
  { value: "documents", label: "Documents" },
  { value: "projets", label: "Projets" },
];

/** 7 onglets serrés dans une seule rangée defilante etaient impraticables au
 * doigt : sur mobile la navigation devient un Select pleine largeur, le
 * contenu (TabsContent) reste unique et partage le meme etat controle. */
export function ClientTabsShell({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState("infos");

  return (
    <Tabs value={value} onValueChange={(v) => v && setValue(v)}>
      <TabsList className="hidden sm:inline-flex">
        {TAB_ITEMS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <Select value={value} onValueChange={(v) => v && setValue(v)}>
        <SelectTrigger className="w-full sm:hidden">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TAB_ITEMS.map((tab) => (
            <SelectItem key={tab.value} value={tab.value}>
              {tab.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {children}
    </Tabs>
  );
}
