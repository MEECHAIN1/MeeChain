"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getConfig, testConfigConnection, updateConfig } from "@/utils/api";

export default function ConfigPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("config");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [form, setForm] = useState<Record<string, any>>({});

  const loadConfig = async () => {
    try {
      const data = await getConfig(token);
      setForm(data.settings || {});
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || "โหลด config ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    void loadConfig();
  }, [token]);

  const onSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateConfig(form, token);
      setMessage("บันทึกค่าเรียบร้อย");
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const onTestConnection = async () => {
    setMessage("");
    try {
      const result = await testConfigConnection(token);
      setMessage(result.ok ? "RPC health check ผ่าน" : "RPC health check ไม่ผ่าน");
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || "ทดสอบการเชื่อมต่อไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Config Management</h1>
          <input className="border p-2 rounded w-full mb-4" placeholder="Admin Bearer Token" value={token} onChange={(e) => setToken(e.target.value)} />

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded border p-4 space-y-3">
              {Object.keys(form).map((key) => (
                <div key={key}>
                  <label className="block text-sm text-gray-600 mb-1">{key}</label>
                  <input
                    className="w-full border rounded p-2"
                    value={Array.isArray(form[key]) ? form[key].join(",") : String(form[key] ?? "")}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        [key]: typeof prev[key] === "number" ? Number(e.target.value) : Array.isArray(prev[key]) ? e.target.value.split(",").map((v) => v.trim()) : e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {saving ? "Saving..." : "Save Config"}
                </button>
                <button onClick={onTestConnection} className="px-4 py-2 bg-green-600 text-white rounded">Test Connection</button>
              </div>
              {message && <p className="text-sm text-gray-700">{message}</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
