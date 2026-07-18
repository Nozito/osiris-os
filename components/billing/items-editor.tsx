"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeTotals } from "@/lib/validations/quote";

export type EditableItem = {
  label: string;
  description: string;
  quantity: number;
  unit_price: number;
};

const EMPTY_ITEM: EditableItem = { label: "", description: "", quantity: 1, unit_price: 0 };

function formatEUR(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

export function ItemsEditor({
  defaultItems,
  defaultVatRate = 20,
}: {
  defaultItems?: EditableItem[];
  defaultVatRate?: number;
}) {
  const [items, setItems] = useState<EditableItem[]>(
    defaultItems && defaultItems.length > 0 ? defaultItems : [{ ...EMPTY_ITEM }]
  );
  const [vatRate, setVatRate] = useState(defaultVatRate);

  function updateItem(index: number, patch: Partial<EditableItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  const totals = computeTotals(items, vatRate);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-white/[0.015] p-3">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Lignes de prestation
      </p>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 items-start gap-2">
            <div className="col-span-5 space-y-1">
              {index === 0 && <Label className="text-xs">Libellé</Label>}
              <Input
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="Ex : Création site vitrine"
              />
            </div>
            <div className="col-span-2 space-y-1">
              {index === 0 && <Label className="text-xs">Qté</Label>}
              <Input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2 space-y-1">
              {index === 0 && <Label className="text-xs">Prix unitaire (€)</Label>}
              <Input
                type="number"
                min={0}
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(index, { unit_price: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-2 space-y-1">
              {index === 0 && <Label className="text-xs">Total HT</Label>}
              <p className="flex h-8 items-center text-sm tabular-nums text-muted-foreground">
                {formatEUR(item.quantity * item.unit_price)}
              </p>
            </div>
            <div className="col-span-1 flex items-end justify-end pb-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={addItem}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        Ajouter une ligne
      </Button>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="vat_rate" className="text-xs">
            TVA (%)
          </Label>
          <Input
            id="vat_rate"
            name="vat_rate"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={vatRate}
            onChange={(e) => setVatRate(Number(e.target.value))}
            className="w-20"
          />
        </div>
        <div className="text-right text-sm">
          <p className="text-muted-foreground">
            HT : <span className="text-foreground">{formatEUR(totals.ht)}</span>
          </p>
          <p className="text-muted-foreground">
            TVA : <span className="text-foreground">{formatEUR(totals.vat)}</span>
          </p>
          <p className="font-semibold">TTC : {formatEUR(totals.ttc)}</p>
        </div>
      </div>
    </div>
  );
}
