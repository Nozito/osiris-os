"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export function DatePicker({
  name,
  defaultValue,
  placeholder = "Sélectionner une date",
  id,
}: {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  id?: string;
}) {
  const [value, setValue] = useState<Date | null>(
    defaultValue ? parseISO(defaultValue) : null
  );
  const [viewMonth, setViewMonth] = useState<Date>(value ?? new Date());
  const [open, setOpen] = useState(false);

  const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <>
      <input type="hidden" name={name} value={value ? format(value, "yyyy-MM-dd") : ""} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className="w-full justify-start font-normal"
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              {value ? (
                <span>{format(value, "d MMMM yyyy", { locale: fr })}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              {value && (
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setValue(null);
                  }}
                  className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-white/[0.08] hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-64 p-3">
          <div className="mb-2 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <p className="text-xs font-medium capitalize">
              {format(viewMonth, "MMMM yyyy", { locale: fr })}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d, i) => (
              <div
                key={i}
                className="flex h-6 items-center justify-center text-[10px] text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {days.map((day) => {
              const selected = value && isSameDay(day, value);
              const outside = !isSameMonth(day, viewMonth);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setValue(day);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors duration-(--duration-fast)",
                    outside && "text-muted-foreground/30",
                    !outside && !selected && "text-foreground/85 hover:bg-white/[0.06]",
                    selected && "bg-primary text-primary-foreground",
                    isToday(day) && !selected && "text-primary"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
