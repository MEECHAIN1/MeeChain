"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { 
  Settings, 
  Key, 
  Shield, 
  Eye, 
  EyeOff,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Server,
  Database,
  Lock
} from "lucide-react";
import { getConfig } from "@/utils/api";

export default function ConfigPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("config");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In production, use real API
        // const response = await getConfig();
        
        // For demo, use mock data
        setConfig({
          environment: "production",
          version: "1.0.0",
          last_updated: "2026-03-08T10:30:00Z",
          settings: {
            auth0: {
              domain: "meechain.us.auth0.com",
              audience: "https://api.meechain.io",
              client_id: "AUTH0_CLIENT_ID",
              client_secret: "AUTH0_CLIENT_SECRET",
            },
            nodereal: {
              api_key: "NODEREAL_API_KEY",
              endpoint: "https://bsc-mainnet.nodereal.io",
            },
            database: {
              url: "postgresql://user:password@localhost:5432/meechain",
              pool_size: 10,
            },
            redis: {
              url: "redis://localhost:6379",
              password: "REDIS_PASSWORD",
            },
            quotas: {
              daily_limit: 1000,
              rate_limit: 60,
            },
            security: {
              jwt_expiry: 3600,
              cors_origins: ["http://localhost:3000", "https://meechain.io"],
            },
          },
        });
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const maskSecret = (secret: string) => {
    if (!secret) return "••••••••";
    return "•".repeat(Math.min(secret.length, 12));
  };

  const configSections = [
    {
      title: "Authentication",
      icon: <Shield className="text-blue-600" size={20} />,
      color: "bg-blue-50",
      items: [
        { key: "auth0_domain", label: "Auth0 Domain", value: config?.settings?.auth0?.domain, type: "text" },
        { key: "auth0_audience", label: "Auth0 Audience", value: config?.settings?.auth0?.audience, type: "text" },
        { key: "auth0_client_id", label: "Auth0 Client ID", value: config?.settings?.auth0?.client_id, type: "secret" },
        { key: "auth0_client_secret", label: "Auth0 Client Secret", value: config?.settings?.auth0?.client_secret, type: "secret" },
      ],
    },
    {
      title: "RPC Provider",
      icon: <Server className="text-green-600" size={20} />,
      color: "bg-green-50",
      items: [
        { key: "nodereal_endpoint", label: "NodeReal Endpoint", value: config?.settings?.nodereal?.endpoint, type: "text" },
        { key: "nodereal_api_key", label: "NodeReal API Key", value: config?.settings?.nodereal?.api_key, type: "secret" },
      ],
    },
    {
      title: "Database",
      icon: <Database className="text-purple-600" size={20} />,
      color: "bg-purple-50",
      items: [
        { key: "database_url", label: "Database URL", value: config?.settings?.database?.url, type: "secret" },
        { key: "database_pool_size", label: "Connection Pool Size", value: config?.settings?.database?.pool_size, type: "text" },
      ],
    },
    {
      title: "Cache",
      icon: <RefreshCw className="text-yellow-600" size={20} />,
      color: "bg-yellow-50",
      items: [
        { key: "redis_url", label: "Redis URL", value: config?.settings?.redis?.url, type: "text" },
        { key: "redis_password", label: "Redis Password", value: config?.settings?.redis?.password, type: "secret" },
      ],
    },
    {
      title: "Quotas & Limits",
      icon: <Lock className="text-red-600" size={20} />,
      color: "bg-red-50",
      items: [
        { key: "daily_limit", label: "Daily RPC Limit", value: config?.settings?.quotas?.daily_limit, type: "text" },
        { key: "rate_limit", label: "Rate Limit (per minute)", value: config?.settings?.quotas?.rate_limit, type: "text" },
        { key: "jwt_expiry", label: "JWT Expiry (seconds)", value: config?.settings?.security?.jwt_expiry, type: "text" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          activePage={activePage}
          setActivePage={setActivePage}
        />
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <main className="flex-1 p-4 lg:p-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
                <p className="text-gray-600">Manage backend settings and secrets</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-medium text-gray-900 capitalize">{config?.environment}</span>
                  </div>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">Version: {config?.version}</span>
                </div>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <RefreshCw size={16} />
                  <span>Rotate Keys</span>
                </button>
              </div>
            </div>
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