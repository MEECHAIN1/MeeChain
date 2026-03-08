import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // หรือ URL ของ FastAPI backend ที่ deploy แล้ว
  headers: {
    "Content-Type": "application/json",
  },
});

// ดึงข้อมูล contributors
export const getContributors = async () => {
  const res = await api.get("/dashboard/contributors");
  return res.data;
};

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

// ดึง config (admin only)
export const getConfig = async () => {
  const res = await api.get("/dashboard/config");
  return res.data;
};

// ดึง health status
export const getHealth = async () => {
  const res = await api.get("/health");
  return res.data;
};

// ดึง identity (JWT)
export const getIdentity = async (token: string) => {
  const res = await api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// ส่ง RPC call
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