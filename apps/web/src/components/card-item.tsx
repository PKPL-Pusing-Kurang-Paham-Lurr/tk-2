"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@tk2-pkpl/ui/components/button";

import { getFontById } from "@/lib/font-registry";

interface CardItemProps {
  card: {
    id: number;
    title: string;
    description: string;
    customFont: string;
    customColor: string;
    fontColor: string;
    creatorId: string;
    creator?: { name: string | null; email: string };
  };
  isOwner: boolean;
  onEdit?: (card: CardItemProps["card"]) => void;
  onDelete?: (id: number) => void;
}

export function CardItem({ card, isOwner, onEdit, onDelete }: CardItemProps) {
  const font = getFontById(card.customFont);

  const rotation = ((card.id * 7) % 5) - 2;

  return (
    <div
      className="group relative flex flex-col p-4 transition-shadow hover:shadow-lg"
      style={{
        backgroundColor: card.customColor,
        transform: `rotate(${rotation}deg)`,
        boxShadow: "2px 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2"
        style={{
          width: "40px",
          height: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          borderRadius: "2px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      />
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3
          className="text-lg font-semibold"
          style={{ fontFamily: font.cssVariable, color: card.fontColor }}
        >
          {card.title}
        </h3>
        {isOwner && (
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit?.(card)}
              className="h-7 w-7"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete?.(card.id)}
              className="h-7 w-7 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <p
        className="flex-1 text-sm"
        style={{ fontFamily: font.cssVariable, color: card.fontColor }}
      >
        {card.description}
      </p>
      <div className="mt-4 border-t pt-2">
        <p
          className="text-xs"
          style={{ fontFamily: font.cssVariable, color: card.fontColor }}
        >
          by {card.creator?.name ?? card.creator?.email ?? "Unknown"}
        </p>
      </div>
    </div>
  );
}
