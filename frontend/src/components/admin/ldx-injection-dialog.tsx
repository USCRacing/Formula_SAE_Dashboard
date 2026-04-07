"use client";

import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { InjectionLogEntry, LdxReinjectResult, LdxDiffResponse } from "@/types";
import { formatLocalTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText, GitCompare, RefreshCw, RotateCcw } from "lucide-react";

type Props = {
  fileName: string | null;
  onClose: () => void;
  onReinjected?: () => void;
};

function toFormLabel(formName: string): string {
  return formName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function LdxInjectionDialog({ fileName, onClose, onReinjected }: Props) {
  const { token } = useAuth();
  const [isReinjecting, setIsReinjecting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const { data: injections, mutate } = useSWR<InjectionLogEntry[]>(
    fileName && token
      ? [`/admin/ldx-files/${encodeURIComponent(fileName)}/injections`, token]
      : null,
    ([path, t]: [string, string]) => apiFetch<InjectionLogEntry[]>(path, {}, t)
  );

  const { data: diff, error: diffError, mutate: mutateDiff } = useSWR<LdxDiffResponse>(
    fileName && token
      ? [`/admin/ldx-files/${encodeURIComponent(fileName)}/diff`, token]
      : null,
    ([path, t]: [string, string]) => apiFetch<LdxDiffResponse>(path, {}, t),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const handleReinject = async () => {
    if (!fileName || !token) return;
    setIsReinjecting(true);
    try {
      const result = await apiFetch<LdxReinjectResult>(
        `/admin/ldx-files/${encodeURIComponent(fileName)}/reinject`,
        { method: "POST" },
        token
      );
      const changed = result.created + result.updated;
      toast.success(
        changed > 0
          ? `Restored ${changed} value${changed === 1 ? "" : "s"} in ${fileName}`
          : `${fileName} is already up to date`
      );
      await mutate();
      await mutateDiff();
      onReinjected?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Restore failed");
    } finally {
      setIsReinjecting(false);
    }
  };

  const handleReprocess = async () => {
    if (!fileName || !token) return;
    setIsReprocessing(true);
    try {
      const result = await apiFetch<LdxReinjectResult>(
        `/admin/ldx-files/${encodeURIComponent(fileName)}/reprocess`,
        { method: "POST" },
        token
      );
      const total = result.created + result.updated + result.unchanged;
      toast.success(
        `Reprocessed ${fileName} — ${total} value${total === 1 ? "" : "s"} from current forms`
      );
      await mutate();
      await mutateDiff();
      onReinjected?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reprocess failed");
    } finally {
      setIsReprocessing(false);
    }
  };

  const changedCount = diff?.entries.filter((e) => e.changed).length ?? 0;
  const busy = isReinjecting || isReprocessing;

  // Group injection history by form_name
  const historyByForm = injections?.reduce<Record<string, InjectionLogEntry[]>>(
    (acc, entry) => {
      const key = entry.form_name || "Unknown";
      (acc[key] ??= []).push(entry);
      return acc;
    },
    {}
  );

  return (
    <Dialog open={!!fileName} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="font-mono text-sm font-semibold truncate">{fileName}</DialogTitle>
              {diff?.short_comment && (
                <p className="text-sm text-muted-foreground mt-0.5">{diff.short_comment}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleReinject}
                disabled={!fileName || busy}
                title="Re-apply the values logged when this file was first processed"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                {isReinjecting ? "Restoring…" : "Restore"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleReprocess}
                disabled={!fileName || busy}
                className="bg-racing hover:bg-racing-hover text-white"
                title="Re-inject using latest form values — clears and replaces previous history"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {isReprocessing ? "Reprocessing…" : "Reprocess"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Restore</strong> replays the logged values from first processing.{" "}
            <strong>Reprocess</strong> re-injects using the latest form values and replaces history.
          </p>
        </DialogHeader>

        <Tabs defaultValue="diff">
          <TabsList>
            <TabsTrigger value="diff">
              <GitCompare className="mr-2 h-4 w-4" />
              Preview
              {changedCount > 0 && (
                <Badge variant="default" className="ml-2 bg-racing text-white text-[10px] px-1.5 py-0">
                  {changedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diff">
            {diff && diff.entries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>In File</TableHead>
                    <TableHead>Stored</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diff.entries.map((entry) => (
                    <TableRow key={entry.field_id} className={entry.changed ? "bg-status-warning-muted/30" : ""}>
                      <TableCell className="font-medium font-mono text-xs">{entry.field_id}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground text-sm">
                        {entry.current_value ?? <span className="italic">new</span>}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate font-medium text-sm">
                        {entry.new_value}
                      </TableCell>
                      <TableCell>
                        {entry.changed ? (
                          <Badge variant="default" className="bg-status-warning text-white">Changed</Badge>
                        ) : (
                          <Badge variant="secondary">Match</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : diffError ? (
              <EmptyState
                icon={<GitCompare className="h-10 w-10" />}
                title="No injection history"
                description="This file hasn't been processed yet. Drop it into the watch directory to inject values."
              />
            ) : diff ? (
              <EmptyState
                icon={<GitCompare className="h-10 w-10" />}
                title="All values match"
                description="Every stored value already matches what's in the file."
              />
            ) : null}
          </TabsContent>

          <TabsContent value="history">
            {historyByForm && Object.keys(historyByForm).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(historyByForm).map(([formName, entries]) => (
                  <div key={formName}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 px-1">
                      {toFormLabel(formName)}
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>When</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entries.map((entry, i) => (
                          <TableRow key={`${entry.field_id}-${entry.injected_at}-${i}`}>
                            <TableCell className="font-mono text-xs font-medium">{entry.field_id}</TableCell>
                            <TableCell className="max-w-[180px] truncate text-sm">{entry.value}</TableCell>
                            <TableCell>
                              <Badge variant={entry.was_update ? "default" : "secondary"}>
                                {entry.was_update ? "Update" : "Static"}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {formatLocalTime(entry.injected_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            ) : injections !== undefined ? (
              <EmptyState
                icon={<FileText className="h-10 w-10" />}
                title="No injection history"
                description="No values were logged when this file was processed."
              />
            ) : null}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
