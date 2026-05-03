"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RpcGraph from "@/components/RpcGraph";
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Zap,
  BarChart3,
  RefreshCw,
  Play
} from "lucide-react";
import { fetchWithRetry, getMetricsAndLogs, getRpcUsage, postRpcCall } from "@/utils/api";

export default function RpcPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("rpc");
  const [rpcData, setRpcData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rpcMethod, setRpcMethod] = useState("eth_blockNumber");
  const [rpcParams, setRpcParams] = useState("[]");
  const [rpcResult, setRpcResult] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stale, setStale] = useState(false);

  const pollIntervalMs = 20000;

  useEffect(() => {
    let isMounted = true;
    let pollingId: NodeJS.Timeout;
    let staleId: NodeJS.Timeout;
    let debounceId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const [{ rpcUsage }] = await Promise.all([
          fetchWithRetry(() => getMetricsAndLogs()),
          fetchWithRetry(() => getRpcUsage()),
        ]);

        if (!isMounted) return;
        setRpcData(rpcUsage);
        setLastUpdated(new Date());
        setStale(false);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch RPC data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    pollingId = setInterval(() => {
      clearTimeout(debounceId);
      debounceId = setTimeout(fetchData, 350);
    }, pollIntervalMs);

    staleId = setInterval(() => {
      if (!isMounted || !lastUpdated) return;
      setStale(Date.now() - lastUpdated.getTime() > pollIntervalMs * 2);
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(pollingId);
      clearInterval(staleId);
      clearTimeout(debounceId);
    };
  }, [lastUpdated]);

  const statusLabel = useMemo(() => {
    if (loading) return "Loading";
    if (error) return "Error";
    if (stale) return "Stale";
    return "Live";
  }, [loading, error, stale]);

  const handleSendRpc = async () => {
    setIsSending(true);
    try {
      // In production, use real API
      // const token = "your-jwt-token"; // Get from authentication
      // const params = JSON.parse(rpcParams);
      // const result = await postRpcCall(rpcMethod, params, token);
      
      // For demo, use mock response
      setTimeout(() => {
        setRpcResult({
          jsonrpc: "2.0",
          id: 1,
          result: "0x1234567890abcdef",
          latency: "125ms",
          timestamp: new Date().toISOString(),
        });
        setIsSending(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending RPC:", error);
      setRpcResult({
        error: {
          code: -32601,
          message: "Method not found",
        },
      });
      setIsSending(false);
    }
  };

  const commonMethods = [
    "eth_blockNumber",
    "eth_getBalance",
    "eth_call",
    "eth_getTransactionReceipt",
    "eth_sendRawTransaction",
    "eth_getBlockByNumber",
    "eth_getTransactionByHash",
    "eth_estimateGas",
    "eth_gasPrice",
    "eth_getLogs",
  ];

  const recentCalls = [
    { method: "eth_blockNumber", params: "[]", result: "0x123456", time: "10:30 AM", latency: "120ms" },
    { method: "eth_getBalance", params: '["0x123...", "latest"]', result: "0x456789", time: "10:25 AM", latency: "150ms" },
    { method: "eth_call", params: '[{"to": "0x789..."}, "latest"]', result: "0x789abc", time: "10:20 AM", latency: "180ms" },
    { method: "eth_getTransactionReceipt", params: '["0xabc..."]', result: "success", time: "10:15 AM", latency: "95ms" },
    { method: "eth_sendRawTransaction", params: '["0xdef..."]', result: "0xdef123", time: "10:10 AM", latency: "210ms" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RPC Analytics...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">RPC Usage</h1>
                <p className="text-gray-600">Monitor and test RPC calls to NodeReal BSC</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
                  <RefreshCw size={16} />
                  <span>Refresh Data</span>
                {lastUpdated && <span className="text-xs text-gray-500 ml-2">{lastUpdated.toLocaleTimeString()}</span>}
                </button>
              </div>
            </div>
          </div>
          
          {/* RPC Graph */}
          <div className="mb-6">
            <RpcGraph rpcData={rpcData} />
          </div>
          
          {/* RPC Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* RPC Call Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">RPC Call Tester</h3>
                    <p className="text-sm text-gray-600">Test RPC methods directly</p>
                  </div>
                </div>
                <div className="text-sm">
                  Status: <span className={error ? "text-red-600" : stale ? "text-yellow-600" : "text-green-600"}>{statusLabel}</span>
                  {error && <span className="ml-2 text-red-600">{error}</span>}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RPC Method
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={rpcMethod}
                    onChange={(e) => setRpcMethod(e.target.value)}
                  >
                    {commonMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parameters (JSON array)
                  </label>
                  <textarea
                    className="w-full h-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    value={rpcParams}
                    onChange={(e) => setRpcParams(e.target.value)}
                    placeholder='["0x123...", "latest"]'
                  />
                </div>
                
                <button
                  onClick={handleSendRpc}
                  disabled={isSending}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      <span>Send RPC Call</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* RPC Result */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">RPC Response</h3>
                    <p className="text-sm text-gray-600">Latest call result</p>
                  </div>
                </div>
              </div>
              
              {rpcResult ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Method</span>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{rpcMethod}</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Latency</span>
                      <span className="text-sm text-gray-600">{rpcResult.latency || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Timestamp</span>
                      <span className="text-sm text-gray-600">
                        {new Date(rpcResult.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Response
                    </label>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      {JSON.stringify(rpcResult, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No RPC call made yet</h3>
                  <p className="text-gray-600">Use the form to send your first RPC call</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Calls */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Recent RPC Calls</h3>
                  <p className="text-sm text-gray-600">Last 5 calls made today</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Parameters</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Latency</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {call.method}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm text-gray-600">{call.params}</code>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm text-gray-800">{call.result}</code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          parseInt(call.latency) < 100 ? 'bg-green-100 text-green-800' :
                          parseInt(call.latency) < 200 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {call.latency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{call.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Quota Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Daily Quota</h4>
                  <p className="text-xs text-gray-600">Calls per day limit</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{rpcData?.quota}</p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Error Rate</h4>
                  <p className="text-xs text-gray-600">Failed calls percentage</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {((rpcData?.errors / rpcData?.calls_today) * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="text-green-600" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Avg Latency</h4>
                  <p className="text-xs text-gray-600">Response time average</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{rpcData?.latency_avg_ms}ms</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}