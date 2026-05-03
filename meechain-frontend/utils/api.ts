import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

export interface RpcUsageResponse {
  calls_today: number | string | null;
  errors: number | string | null;
  latency_avg_ms: number | string | null;
  quota?: string | null;
  quota_used?: number | string | null;
  quota_limit?: number | string | null;
  daily_calls?: Array<{ hour: string; calls: number | string | null }>;
  methods?: Array<{ method: string; count: number | string | null }>;
  latency_distribution?: Array<{ range: string; count: number | string | null; color: string }>;
}

export interface TokenStatusResponse {
  status: "VALID" | "EXPIRED" | "INVALID" | string;
  user: string;
  audience: string;
  scope: string;
  expires_in?: number | string | null;
}

// ดึงข้อมูล contributors
export const getContributors = async () => {
  const res = await api.get("/dashboard/contributors");
  return res.data;
};
export type AlertSeverity = "info" | "warn" | "critical";

export interface ActiveAlert {
  id: string;
  metric: string;
  message: string;
  severity: AlertSeverity;
  status: string;
  created_at: string;
  snoozed_until?: string;
}

export const getActiveAlerts = async () => {
  const res = await api.get("/dashboard/active-alerts");
  return res.data.alerts as ActiveAlert[];
};

export const ackAlert = async (alertId: string) => {
  const res = await api.post(`/dashboard/admin/alerts/${alertId}/ack`);
  return res.data;
};

export const snoozeAlert = async (alertId: string, minutes = 30) => {
  const res = await api.post(`/dashboard/admin/alerts/${alertId}/snooze?minutes=${minutes}`);
  return res.data;
};

export default api;
