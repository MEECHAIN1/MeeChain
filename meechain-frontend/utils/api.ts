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

export const getContributors = async () => {
  const res = await api.get("/dashboard/contributors");
  return res.data;
};

export const getBadges = async () => {
  const res = await api.get("/dashboard/badges");
  return res.data;
};

export const getRpcUsage = async () => {
  const res = await api.get("/dashboard/rpc-usage");
  return res.data;
};

export const getTokenStatus = async () => {
  const res = await api.get("/dashboard/token-status");
  return res.data;
};

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
  return res.data;
};

export default api;
