import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithRetry = async <T>(
  request: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 500
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        break;
      }
      const delay = baseDelayMs * 2 ** attempt;
      await sleep(delay);
    }
  }

  throw lastError;
};

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

// ดึงข้อมูล badges
export const getBadges = async () => {
  const res = await api.get("/dashboard/badges");
  return res.data;
};

// ดึง RPC usage
export const getRpcUsage = async () => {
  const res = await api.get("/dashboard/rpc-usage");
  return res.data;
};

// ดึง token status
export const getTokenStatus = async () => {
  const res = await api.get("/dashboard/token-status");
  return res.data;
};

// ดึง logs
export const getLogs = async () => {
  const res = await api.get("/dashboard/logs");
  return res.data;
};

export const getMetricsAndLogs = async () => {
  const [rpcUsage, logs] = await Promise.all([
    fetchWithRetry(() => getRpcUsage()),
    fetchWithRetry(() => getLogs()),
  ]);

  return { rpcUsage, logs };
};

export const getConfig = async () => {
  const res = await api.get("/dashboard/config");
  return res.data;
};

export const getHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};

export const getIdentity = async (token: string) => {
  const res = await api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const postRpcCall = async (method: string, params: any[], token: string) => {
  const res = await api.post(
    "/rpc",
    {
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
// ดึง config (admin only)
export const getConfig = async (token: string) => {
  const res = await api.get("/dashboard/config", { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const updateConfig = async (updates: Record<string, any>, token: string) => {
  const res = await api.put("/dashboard/config", { updates }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};

export const testConfigConnection = async (token: string) => {
  const res = await api.post("/dashboard/config/test-connection", {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
};
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
