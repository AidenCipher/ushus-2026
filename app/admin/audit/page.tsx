"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Terminal, ShieldAlert, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import * as React from "react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  metadata: any;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [pagination, setPagination] = React.useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loading, setLoading] = React.useState(true);

  const fetchLogs = React.useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/audit?page=${page}&limit=20`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data || []);
        setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function getActionBadgeColor(action: string): string {
    if (action.includes("CREATE")) return "border-success/50 text-success bg-success/10";
    if (action.includes("UPDATE")) return "border-amber-500/50 text-amber-500 bg-amber-500/10";
    if (action.includes("DELETE")) return "border-danger/50 text-danger bg-danger/10";
    return "border-white/20 text-muted-foreground";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-rose-50">Security & Audit</h1>
          <p className="text-muted-foreground mt-1">Real-time system transaction logs and user actions.</p>
        </div>
        <Button variant="outline" className="border-white/10" onClick={() => fetchLogs(pagination.page)}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Logs
        </Button>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-rose-400" />
            <CardTitle>System Transactions</CardTitle>
          </div>
          <CardDescription>Immutable record of all modifications made on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingAnimation message="Syncing immutable audit trails..." />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50 text-rose-500" />
              <p className="font-semibold">No transactions recorded</p>
            </div>
          ) : (
            <div className="rounded-md border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 text-sm font-medium text-muted-foreground border-b border-white/10">
                <div className="col-span-3">Timestamp</div>
                <div className="col-span-3">User</div>
                <div className="col-span-3">Action</div>
                <div className="col-span-3 text-right">IP Address</div>
              </div>
              {/* Rows */}
              <div className="divide-y divide-white/5">
                {logs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-4 p-4 items-center text-xs sm:text-sm hover:bg-white/5 transition-colors">
                    <div className="col-span-3 text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </div>
                    <div className="col-span-3 truncate">
                      <p className="font-medium text-foreground">{log.user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{log.user.email}</p>
                    </div>
                    <div className="col-span-3">
                      <Badge variant="outline" className={getActionBadgeColor(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                      {log.entityType && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {log.entityType} ID: <span className="font-mono text-foreground">{log.entityId?.slice(0, 8)}</span>
                        </p>
                      )}
                    </div>
                    <div className="col-span-3 text-right font-mono text-xs text-muted-foreground">
                      {log.ipAddress || "system"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
              <p className="text-xs text-muted-foreground">
                Showing {logs.length} transactions of {pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchLogs(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
