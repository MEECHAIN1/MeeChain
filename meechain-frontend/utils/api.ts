import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

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
