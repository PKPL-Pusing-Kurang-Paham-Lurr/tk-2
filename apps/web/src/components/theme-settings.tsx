"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sun, Moon } from "lucide-react";
import { Button } from "@tk2-pkpl/ui/components/button";
import { trpc } from "@/utils/trpc";
import { formatRelativeTime } from "@tk2-pkpl/ui/lib/time-utils";

const THEMES = [
  { id: "bold-tech", name: "Bold Tech", description: "Neon green on dark" },
  { id: "amber-minimal", name: "Amber Minimal", description: "Warm minimal light" },
  { id: "bubblegum", name: "Bubblegum", description: "Pink playful" },
  { id: "darkmatter", name: "Darkmatter", description: "Deep purple dark" },
  { id: "notebook", name: "Notebook", description: "Classic notebook style" },
] as const;

export function ThemeSettings() {
  const queryClient = useQueryClient();

  const { data: themeData, isLoading } = useQuery(
    trpc.admin.getTheme.queryOptions()
  );

  const setThemeMutation = useMutation(
    trpc.admin.setTheme.mutationOptions({
      onSuccess: (result, variables) => {
        document.documentElement.setAttribute("data-theme", variables.theme);
        document.documentElement.setAttribute("data-mode", variables.mode);
        queryClient.setQueryData(
          trpc.admin.getTheme.queryOptions().queryKey,
          {
            theme: variables.theme,
            mode: variables.mode,
            themeUpdatedAt: new Date().toISOString(),
            themeChangedBy: result.themeChangedBy ?? "Admin",
          }
        );
      },
    })
  );

  if (isLoading) {
    return <div className="animate-pulse h-32 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Theme</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a theme for your site. This affects all users.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() =>
                setThemeMutation.mutate({
                  theme: theme.id,
                  mode: (themeData?.mode ?? "light") as "light" | "dark",
                })
              }
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                themeData?.theme === theme.id
                  ? "border-primary"
                  : "border-border hover:border-muted-foreground"
              }`}
              type="button"
            >
              <div className="font-medium">{theme.name}</div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Mode</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Switch between light and dark mode.
        </p>
        <div className="flex gap-2">
          <Button
            variant={themeData?.mode === "light" ? "default" : "outline"}
            onClick={() =>
              setThemeMutation.mutate({
                theme: (themeData?.theme ?? "bold-tech") as typeof THEMES[number]["id"],
                mode: "light",
              })
            }
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
          </Button>
          <Button
            variant={themeData?.mode === "dark" ? "default" : "outline"}
            onClick={() =>
              setThemeMutation.mutate({
                theme: (themeData?.theme ?? "bold-tech") as typeof THEMES[number]["id"],
                mode: "dark",
              })
            }
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </Button>
        </div>
      </div>

      {themeData?.themeUpdatedAt && (
        <p className="text-xs text-muted-foreground">
          Theme changed by {themeData.themeChangedBy} {formatRelativeTime(new Date(themeData.themeUpdatedAt))}
        </p>
      )}
    </div>
  );
}
