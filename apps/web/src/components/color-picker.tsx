"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";

import { Button } from "@tk2-pkpl/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tk2-pkpl/ui/components/popover";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
          />
        }
      >
        <div
          className="mr-2 h-5 w-5 rounded-md border"
          style={{ backgroundColor: value }}
        />
        {value}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <HexColorPicker color={value} onChange={onChange} />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
