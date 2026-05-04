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
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Provider Health</h3>
            <p className="text-sm text-gray-600">Active provider: <span className="font-medium">dshackle</span> · Failover count: <span className="font-medium">2</span> · Last switch: <span className="font-medium">2026-05-03 10:30 UTC</span></p>
            <p className="text-xs text-gray-500 mt-2">Dshackle endpoint/cluster shown in redacted mode.</p>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Environment</p>
                  <p className="text-xl font-bold text-gray-900 mt-1 capitalize">{config?.environment}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Server className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {new Date(config?.last_updated).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <RefreshCw className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Secrets</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">6</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Key className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-xl font-bold text-green-600 mt-1">Active</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Configuration Sections */}
          <div className="space-y-6">
            {configSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className={`${section.color} px-6 py-4 rounded-t-xl border-b border-gray-200`}>
                  <div className="flex items-center space-x-3">
                    {section.icon}
                    <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            {item.type === "secret" && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                                Secret
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm text-gray-800 font-mono bg-white px-3 py-1.5 rounded border border-gray-200 flex-1">
                              {item.type === "secret" && !showSecrets[item.key] 
                                ? maskSecret(item.value)
                                : item.value
                              }
                            </code>
                            
                            <div className="flex items-center space-x-1">
                              {item.type === "secret" && (
                                <button
                                  onClick={() => toggleSecret(item.key)}
                                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                  title={showSecrets[item.key] ? "Hide secret" : "Show secret"}
                                >
                                  {showSecrets[item.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              )}
                              
                              <button
                                onClick={() => copyToClipboard(item.value, item.key)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                title="Copy to clipboard"
                              >
                                {copiedKey === item.key ? (
                                  <CheckCircle className="text-green-500" size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Security Notes */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Security Notes</h3>
                <ul className="space-y-2 text-sm text-yellow-700">
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>Never commit secrets to version control. Use environment variables or secret management services.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>Rotate API keys and secrets regularly, especially after team member changes.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>Use different credentials for development, staging, and production environments.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>Audit secret access logs regularly to detect unauthorized access.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Environment Variables Example */}
          <div className="mt-6 bg-gray-900 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-100">.env.example</h3>
              <button
                onClick={() => copyToClipboard(`AUTH0_DOMAIN=${config?.settings?.auth0?.domain}
AUTH0_AUDIENCE=${config?.settings?.auth0?.audience}
AUTH0_CLIENT_ID=${config?.settings?.auth0?.client_id}
AUTH0_CLIENT_SECRET=${config?.settings?.auth0?.client_secret}
NODEREAL_API_KEY=${config?.settings?.nodereal?.api_key}
DATABASE_URL=${config?.settings?.database?.url}
REDIS_URL=${config?.settings?.redis?.url}`, "env")}
                className="px-3 py-1.5 bg-gray-800 text-gray-100 text-sm rounded-lg hover:bg-gray-700 flex items-center space-x-2"
              >
                {copiedKey === "env" ? (
                  <>
                    <CheckCircle size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy .env example</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="text-gray-300 text-sm overflow-x-auto">
{`AUTH0_DOMAIN=${config?.settings?.auth0?.domain}
AUTH0_AUDIENCE=${config?.settings?.auth0?.audience}
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
NODEREAL_API_KEY=your_nodereal_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/meechain
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password
DAILY_RPC_LIMIT=${config?.settings?.quotas?.daily_limit}
RATE_LIMIT_PER_MINUTE=${config?.settings?.quotas?.rate_limit}
JWT_EXPIRY_SECONDS=${config?.settings?.security?.jwt_expiry}`}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}
