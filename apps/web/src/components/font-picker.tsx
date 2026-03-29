"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@tk2-pkpl/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@tk2-pkpl/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@tk2-pkpl/ui/components/popover";

import { FONT_REGISTRY, getFontById } from "@/lib/font-registry";

interface FontPickerProps {
  value: string;
  onChange: (fontId: string) => void;
}

export function FontPicker({ value, onChange }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedFont = getFontById(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start font-normal"
          />
        }
      >
        <span style={{ fontFamily: selectedFont.cssVariable }}>
          {selectedFont.name}
        </span>
        <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search font..." />
          <CommandEmpty>No font found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {FONT_REGISTRY.map((font) => (
                <CommandItem
                  key={font.id}
                  value={font.id}
                  onSelect={(currentValue: string) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === font.id ? "opacity-100" : "opacity-0"}`}
                  />
                  <span style={{ fontFamily: font.cssVariable }} className="mr-2">
                    {font.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {font.category}
                  </span>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
