"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TokenStatus from "@/components/TokenStatus";
import RpcGraph from "@/components/RpcGraph";
import { 
  Activity, 
  Users, 
  Shield, 
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle
} from "lucide-react";
import { ActiveAlert, ackAlert, getActiveAlerts, snoozeAlert } from "@/utils/api";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("overview");
  const [rpcData, setRpcData] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In production, use real API
        // const rpcResponse = await getRpcUsage();
        // const tokenResponse = await getTokenStatus();
        // const contributorsResponse = await getContributors();
        
        // For demo, use mock data
        setRpcData({
          calls_today: 42,
          errors: 2,
          latency_avg_ms: 120,
          quota: "100/day",
        });
        
        setTokenData({
          status: "VALID",
          user: "admin@meechain.io",
          audience: "MeeChain API",
          scope: "read:rpc write:badges admin:logs",
          expires_in: 3600,
        });
        
        setContributors([
          { 
            name: "Alice Chen", 
            role: "Developer", 
            badges: ["JWT Guardian", "Onboarding Hero"], 
            activity: "42 RPC calls today",
            rpcCalls: 42,
            errorRate: 2.4,
            joinedDate: "2026-03-01"
          },
          { 
            name: "Bob Smith", 
            role: "Contributor", 
            badges: ["NodeReal Explorer", "RPC Ranger", "Community Builder"], 
            activity: "58 RPC calls today",
            rpcCalls: 58,
            errorRate: 1.7,
            joinedDate: "2026-03-05"
          },
          { 
            name: "Carol Johnson", 
            role: "Admin", 
            badges: ["Auth0 Master", "Config Keeper", "Bug Hunter"], 
            activity: "120 RPC calls today",
            rpcCalls: 120,
            errorRate: 0.8,
            joinedDate: "2026-02-28"
          },
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
    {
      label: "Active Contributors",
      value: "24",
      change: "+3 this week",
      icon: <Users className="text-blue-600" size={24} />,
      color: "bg-blue-50",
    },
    {
      label: "Total RPC Calls",
      value: "1,248",
      change: "+42 today",
      icon: <Activity className="text-green-600" size={24} />,
      color: "bg-green-50",
    },
    {
      label: "Badges Awarded",
      value: "156",
      change: "+12 this month",
      icon: <Shield className="text-purple-600" size={24} />,
      color: "bg-purple-50",
    },
    {
      label: "Avg Latency",
      value: "120ms",
      change: "-15ms from last week",
      icon: <Clock className="text-yellow-600" size={24} />,
      color: "bg-yellow-50",
    },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MeeChain Dashboard...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome to MeeChain Backend Dashboard</p>
          </div>
          
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
              <div
                key={index}
                className={`${stat.color} p-5 rounded-xl border border-gray-100`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Token Status */}
            <div>
              <TokenStatus tokenData={tokenData} />
            </div>
            
            {/* Top Contributors */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Top Contributors</h3>
                    <p className="text-sm text-gray-600">Most active this week</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {contributors.slice(0, 3).map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Users className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{contributor.name}</p>
                        <p className="text-sm text-gray-600">{contributor.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{contributor.rpcCalls} calls</p>
                      <p className="text-sm text-gray-600">{contributor.errorRate.toFixed(1)}% error</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* RPC Graph */}
          <div className="mb-6">
            <RpcGraph rpcData={rpcData} />
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Latest system events</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { time: "10:30 AM", user: "Alice Chen", action: "Called eth_blockNumber", status: "success" },
                { time: "10:25 AM", user: "Bob Smith", action: "Earned RPC Ranger badge", status: "badge" },
                { time: "10:15 AM", user: "Carol Johnson", action: "Updated config settings", status: "config" },
                { time: "10:00 AM", user: "David Lee", action: "Reported bug #123", status: "bug" },
                { time: "9:45 AM", user: "System", action: "Daily quota reset", status: "system" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-100' :
                      activity.status === 'badge' ? 'bg-yellow-100' :
                      activity.status === 'config' ? 'bg-blue-100' :
                      activity.status === 'bug' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {activity.status === 'success' && <CheckCircle className="text-green-600" size={16} />}
                      {activity.status === 'badge' && <Shield className="text-yellow-600" size={16} />}
                      {activity.status === 'config' && <BarChart3 className="text-blue-600" size={16} />}
                      {activity.status === 'bug' && <Activity className="text-red-600" size={16} />}
                      {activity.status === 'system' && <Clock className="text-gray-600" size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">by {activity.user} at {activity.time}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}