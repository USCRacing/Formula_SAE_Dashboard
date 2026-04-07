"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLdxFiles } from "@/hooks/use-ldx-files";
import { usePendingInjection } from "@/hooks/use-pending-injection";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import { LdxFileTable } from "@/components/admin/ldx-file-table";
import { LdxInjectionDialog } from "@/components/admin/ldx-injection-dialog";
import { WatchDirectoryForm } from "@/components/admin/watch-directory-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, ArrowDownToLine, ClipboardList } from "lucide-react";
import { PendingInjectionEntry } from "@/types";

function toFormLabel(formName: string): string {
  return formName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function PendingQueueCard({
  entries,
  isLoading,
}: {
  entries: PendingInjectionEntry[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
        Checking queue…
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-8 w-8" />}
        title="No values queued"
        description="Fill out forms to queue values for the next LDX file."
      />
    );
  }

  const byForm = entries.reduce<Record<string, PendingInjectionEntry[]>>((acc, e) => {
    (acc[e.form_name] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(byForm).map(([formName, items]) => (
        <div key={formName}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {toFormLabel(formName)}
          </p>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.field_id}
                className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-foreground truncate">{item.field_id}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-medium tabular-nums">
                    {item.value}
                    {item.unit && (
                      <span className="ml-1 text-xs text-muted-foreground">{item.unit}</span>
                    )}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {item.entry_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LdxPage() {
  const { token } = useAuth();
  const { data: files, isLoading, mutate: mutateFiles } = useLdxFiles();
  const { data: pending, isLoading: isPendingLoading, mutate: mutatePending } = usePendingInjection();
  const [watchDir, setWatchDir] = useState("");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportClearConfirm, setShowExportClearConfirm] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ path: string | null }>("/admin/watch-directory", {}, token)
      .then((data) => setWatchDir(data.path || ""))
      .catch(() => setWatchDir(""));
  }, [token]);

  const handleExport = async () => {
    if (!token) return;
    try {
      const result = await apiFetch<{ status: string; filename: string }>(
        "/admin/export-db",
        { method: "POST" },
        token
      );
      toast.success(`Exported: ${result.filename}`);
    } catch {
      toast.error("Export failed");
    }
  };

  const handleClear = async () => {
    if (!token) return;
    try {
      await apiFetch("/admin/clear-data", { method: "POST" }, token);
      toast.success("All data cleared");
      await refreshLdxViews();
    } catch {
      toast.error("Clear failed");
    }
  };

  const handleExportAndClear = async () => {
    if (!token) return;
    try {
      const result = await apiFetch<{ status: string; filename: string }>(
        "/admin/export-db",
        { method: "POST" },
        token
      );
      await apiFetch("/admin/clear-data", { method: "POST" }, token);
      toast.success(`Exported ${result.filename} and cleared all data`);
      await refreshLdxViews();
    } catch {
      toast.error("Export & Clear failed");
    }
  };

  const refreshLdxViews = async () => {
    await mutateFiles();
    await mutatePending();
  };

  if (isLoading) return <LoadingSpinner label="Loading LDX files..." />;

  const pendingCount = pending?.length ?? 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Watch Directory</CardTitle>
          <CardDescription>
            New .ldx files dropped here are automatically detected and injected with current form values.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WatchDirectoryForm
            initialPath={watchDir}
            onSaved={() => {
              void refreshLdxViews();
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>LDX Files</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export DB
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportClearConfirm(true)}
              >
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Export &amp; Clear
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LdxFileTable
              files={files || []}
              onFileClick={(name) => setSelectedFile(name)}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Next Injection</CardTitle>
              {pendingCount > 0 && (
                <Badge className="bg-racing text-white text-[10px] px-1.5 py-0">
                  {pendingCount}
                </Badge>
              )}
            </div>
            <CardDescription>
              Values that will be written into the next file dropped into the watch directory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PendingQueueCard entries={pending ?? []} isLoading={isPendingLoading} />
          </CardContent>
        </Card>
      </div>

      <LdxInjectionDialog
        fileName={selectedFile}
        onClose={() => setSelectedFile(null)}
        onReinjected={() => {
          void refreshLdxViews();
        }}
      />

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Clear All Data"
        description="This will permanently delete all form values, audit logs, LDX file records, and injection logs. User accounts and settings will be preserved. This cannot be undone."
        confirmLabel="Clear All Data"
        destructive
        onConfirm={handleClear}
      />

      <ConfirmDialog
        open={showExportClearConfirm}
        onOpenChange={setShowExportClearConfirm}
        title="Export & Clear All Data"
        description="This will export the database to the watch directory and then clear all form values, audit logs, LDX file records, and injection logs. User accounts and settings will be preserved."
        confirmLabel="Export & Clear"
        destructive
        onConfirm={handleExportAndClear}
      />
    </div>
  );
}
