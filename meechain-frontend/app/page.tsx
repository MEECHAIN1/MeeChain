"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TokenStatus from "@/components/TokenStatus";
import RpcGraph from "@/components/RpcGraph";
import { Activity, Users, Shield, BarChart3, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { 
  Activity, 
  Users, 
  Shield, 
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle
} from "lucide-react";
import { getRpcUsage, getTokenStatus, getContributors } from "@/utils/api";
import { RpcUsageResponse, TokenStatusResponse } from "@/utils/api";
import { ActiveAlert, ackAlert, getActiveAlerts, snoozeAlert } from "@/utils/api";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");
xxx  const [rpcData, setRpcData] = useState<RpcUsageResponse | null>(null);
  const [tokenData, setTokenData] = useState<TokenStatusResponse | null>(null);
  const [mobileTab, setMobileTab] = useState<"overview" | "rpc" | "activity">("overview");
  const [rpcData, setRpcData] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);

  const compactNumber = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setRpcData({ calls_today: 42, errors: 2, latency_avg_ms: 120, quota: "100/day" });
        setTokenData({ status: "VALID", user: "admin@meechain.io", audience: "MeeChain API", scope: "read:rpc write:badges admin:logs", expires_in: 3600 });
        setContributors([
          { name: "Alice Chen", role: "Developer", rpcCalls: 42, errorRate: 2.4 },
          { name: "Bob Smith", role: "Contributor", rpcCalls: 58, errorRate: 1.7 },
          { name: "Carol Johnson", role: "Admin", rpcCalls: 120, errorRate: 0.8 },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        const alertData = await getActiveAlerts().catch(() => []);
        setAlerts(alertData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Active Contributors", value: 24, change: "+3 this week", icon: <Users className="text-blue-600" size={20} />, color: "bg-blue-50" },
    { label: "Total RPC Calls", value: 1248, change: "+42 today", icon: <Activity className="text-green-600" size={20} />, color: "bg-green-50" },
    { label: "Badges Awarded", value: 156, change: "+12 this month", icon: <Shield className="text-purple-600" size={20} />, color: "bg-purple-50" },
    { label: "Avg Latency", value: 120, change: "-15ms from last week", icon: <Clock className="text-yellow-600" size={20} />, color: "bg-yellow-50", isLatency: true },
  ];


  const severityStyles: Record<string, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warn: "bg-yellow-50 border-yellow-200 text-yellow-800",
    critical: "bg-red-50 border-red-200 text-red-800",
  };

  const handleAck = async (alertId: string) => {
    await ackAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleSnooze = async (alertId: string) => {
    await snoozeAlert(alertId, 30);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto w-full max-w-5xl animate-pulse space-y-4">
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="h-24 rounded-xl bg-gray-200" /><div className="h-24 rounded-xl bg-gray-200" /></div>
          <div className="h-64 sm:h-72 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} activePage={activePage} setActivePage={setActivePage} />
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm sm:text-base text-gray-600">Welcome to MeeChain Backend Dashboard</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          
          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-xl p-4 ${severityStyles[alert.severity] || severityStyles.info}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold uppercase text-xs">{alert.severity}</p>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs mt-1">Metric: {alert.metric} • Created: {new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAck(alert.id)} className="px-3 py-1 text-xs rounded-md bg-white/80 border border-current">Ack</button>
                      <button onClick={() => handleSnooze(alert.id)} className="px-3 py-1 text-xs rounded-md bg-white/80 border border-current">Snooze 30m</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className={`${stat.color} p-3 sm:p-5 rounded-xl border border-gray-100`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stat.isLatency ? <><span className="sm:hidden">{compactNumber(stat.value)}ms</span><span className="hidden sm:inline">{stat.value}ms</span></> : <><span className="sm:hidden">{compactNumber(stat.value)}</span><span className="hidden sm:inline">{stat.value.toLocaleString()}</span></>}</p>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{stat.change}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-white rounded-lg shadow-sm">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:hidden mb-4">
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-white p-1 border border-gray-200">
              {["overview", "rpc", "activity"].map((tab) => (
                <button key={tab} onClick={() => setMobileTab(tab as any)} className={`py-2 text-xs font-medium rounded-md ${mobileTab === tab ? "bg-blue-600 text-white" : "text-gray-600"}`}>{tab.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div className={`${mobileTab === "overview" ? "block" : "hidden"} lg:block`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 sm:mb-6">
              <TokenStatus tokenData={tokenData} />
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="text-green-600" size={20} /></div>
                    <div><h3 className="text-base sm:text-lg font-semibold text-gray-800">Top Contributors</h3><p className="text-xs sm:text-sm text-gray-600">Most active this week</p></div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {contributors.slice(0, 3).map((contributor, index) => (
                    <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-gray-50 rounded-lg">
                      <div><p className="text-sm sm:text-base font-medium text-gray-900">{contributor.name}</p><p className="text-xs sm:text-sm text-gray-600">{contributor.role}</p></div>
                      <div className="text-right"><p className="text-sm sm:text-base font-medium text-gray-900"><span className="sm:hidden">{compactNumber(contributor.rpcCalls)}</span><span className="hidden sm:inline">{contributor.rpcCalls}</span> calls</p><p className="text-xs sm:text-sm text-gray-600">{contributor.errorRate.toFixed(1)}% error</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`${mobileTab === "rpc" ? "block" : "hidden"} lg:block mb-4 sm:mb-6`}><RpcGraph rpcData={rpcData} /></div>

          <div className={`${mobileTab === "activity" ? "block" : "hidden"} lg:block bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6"><div className="flex items-center space-x-3"><div className="p-2 bg-blue-100 rounded-lg"><BarChart3 className="text-blue-600" size={20} /></div><div><h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Activity</h3><p className="text-xs sm:text-sm text-gray-600">Latest system events</p></div></div></div>
            <div className="space-y-3 sm:space-y-4">{[{ time: "10:30 AM", user: "Alice Chen", action: "Called eth_blockNumber", status: "success" },{ time: "10:25 AM", user: "Bob Smith", action: "Earned RPC Ranger badge", status: "badge" }].map((activity, index) => <div key={index} className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-gray-50 rounded-lg"><div className="flex items-center space-x-2 sm:space-x-3"><div className={`p-2 rounded-lg ${activity.status === "success" ? "bg-green-100" : "bg-yellow-100"}`}>{activity.status === "success" ? <CheckCircle className="text-green-600" size={14} /> : <Shield className="text-yellow-600" size={14} />}</div><div><p className="text-sm sm:text-base font-medium text-gray-900">{activity.action}</p><p className="text-xs sm:text-sm text-gray-600">by {activity.user} at {activity.time}</p></div></div><span className="text-xs sm:text-sm text-gray-500">{activity.time}</span></div>)}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
