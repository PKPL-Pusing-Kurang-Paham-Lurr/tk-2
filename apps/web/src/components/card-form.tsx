"use client";

import { useState } from "react";

import { Button } from "@tk2-pkpl/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@tk2-pkpl/ui/components/dialog";
import { Input } from "@tk2-pkpl/ui/components/input";
import { Textarea } from "@tk2-pkpl/ui/components/textarea";

import { ColorPicker } from "./color-picker";
import { FontPicker } from "./font-picker";

interface CardFormData {
  title: string;
  description: string;
  customFont: string;
  customColor: string;
  fontColor: string;
}

interface CardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CardFormData) => void;
  initialData?: CardFormData;
  mode: "create" | "edit";
}

export function CardForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: CardFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [customFont, setCustomFont] = useState(initialData?.customFont ?? "roboto");
  const [customColor, setCustomColor] = useState(initialData?.customColor ?? "#ffffff");
  const [fontColor, setFontColor] = useState(initialData?.fontColor ?? "#000000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, customFont, customColor, fontColor });
    if (mode === "create") {
      setTitle("");
      setDescription("");
      setCustomFont("roboto");
      setCustomColor("#ffffff");
      setFontColor("#000000");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Card" : "Edit Card"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new card to share with others."
              : "Make changes to your card here."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
                maxLength={100}
                required
              />
              <p className="text-xs text-muted-foreground">{title.length}/100</p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Card description"
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">{description.length}/500</p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="font" className="text-sm font-medium">
                Font
              </label>
              <FontPicker value={customFont} onChange={setCustomFont} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="color" className="text-sm font-medium">
                Background Color
              </label>
              <ColorPicker value={customColor} onChange={setCustomColor} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="fontcolor" className="text-sm font-medium">
                Font Color
              </label>
              <ColorPicker value={fontColor} onChange={setFontColor} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === "create" ? "Create" : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
