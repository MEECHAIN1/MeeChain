import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { calcPercent, safeNumber } from "@/utils/number";
import { RpcUsageResponse } from "@/utils/api";

interface RpcGraphProps {
  rpcData?: RpcUsageResponse;
}

const RpcGraph: React.FC<RpcGraphProps> = ({ rpcData }) => {
  const compactNumber = (value: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  const mockData = {
    calls_today: 42,
    errors: 2,
    latency_avg_ms: 120,
    quota: "100/day",
    daily_calls: [
      { hour: "00:00", calls: 2 },
      { hour: "04:00", calls: 1 },
      { hour: "08:00", calls: 8 },
      { hour: "12:00", calls: 15 },
      { hour: "16:00", calls: 10 },
      { hour: "20:00", calls: 6 },
    ],
    methods: [
      { method: "eth_blockNumber", count: 15 },
      { method: "eth_getBalance", count: 10 },
      { method: "eth_call", count: 8 },
      { method: "eth_getTransactionReceipt", count: 5 },
      { method: "eth_sendRawTransaction", count: 4 },
    ],
    latency_distribution: [
      { range: "<100ms", count: 25, color: "#10B981" },
      { range: "100-500ms", count: 12, color: "#3B82F6" },
      { range: "500-1000ms", count: 3, color: "#F59E0B" },
      { range: ">1000ms", count: 2, color: "#EF4444" },
    ],
  };

  const data = rpcData || mockData;
  const callsToday = safeNumber(data.calls_today);
  const errors = safeNumber(data.errors);
  const latencyAvgMs = safeNumber(data.latency_avg_ms);

  const parsedQuotaParts = typeof data.quota === "string" ? data.quota.split("/") : [];
  const quotaUsed = safeNumber(data.quota_used ?? parsedQuotaParts[0]);
  const quotaLimit = safeNumber(data.quota_limit ?? parsedQuotaParts[1]);
  const errorRate = calcPercent(errors, callsToday);
  const quotaPercentage = Math.min(100, calcPercent(quotaUsed || callsToday, quotaLimit));
  const isQuotaPending = quotaLimit <= 0;
  const quotaUsedText = isQuotaPending ? "--" : `${Math.round(quotaUsed || callsToday)}/${Math.round(quotaLimit)}`;

  const stats = [
    {
      label: "Total Calls",
      value: callsToday.toString(),
      icon: <Activity className="text-blue-600" size={20} />,
      color: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Error Rate",
      value: `${errorRate.toFixed(1)}%`,
      icon: <AlertTriangle className="text-red-600" size={20} />,
      color: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      label: "Avg Latency",
      value: `${latencyAvgMs}ms`,
      icon: <Clock className="text-green-600" size={20} />,
      color: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      label: "Quota Used",
      value: quotaUsedText,
      icon: <TrendingUp className="text-purple-600" size={20} />,
      color: "bg-purple-50",
      textColor: "text-purple-700",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">RPC Usage Analytics</h3>
            <p className="text-xs sm:text-xs sm:text-sm text-gray-600">Real-time RPC call statistics</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} p-3 sm:p-4 rounded-lg border border-gray-100`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                <p className={`text-lg sm:text-2xl font-bold ${stat.textColor} mt-1`}>
                  <span className="sm:hidden">{stat.label === "Avg Latency" ? `${compactNumber(data.latency_avg_ms)}ms` : stat.label === "Total Calls" ? compactNumber(data.calls_today) : stat.label === "Quota Used" ? `${compactNumber(data.calls_today)}/${quotaTotal}` : stat.value}</span><span className="hidden sm:inline">{stat.value}</span>
                </p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quota Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Daily Quota Usage</p>
          <p className="text-sm text-gray-600" title={isQuotaPending ? "waiting for data" : undefined}>
            {isQuotaPending ? "0% used" : `${quotaPercentage.toFixed(1)}% used`}
          <p className="text-xs sm:text-sm text-gray-600">
            {quotaPercentage.toFixed(1)}% used
          </p>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              quotaPercentage < 70
                ? "bg-green-500"
                : quotaPercentage < 90
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${quotaPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Calls Line Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Calls by Hour (Today)
          </h4>
          <div className="min-h-[220px] h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily_calls || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Method Distribution Bar Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Method Distribution
          </h4>
          <div className="min-h-[220px] h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.methods || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="method" stroke="#6B7280" fontSize={10} angle={-45} textAnchor="end" />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Distribution Pie Chart */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Latency Distribution
          </h4>
          <div className="min-h-[220px] h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.latency_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }: any) => 
                    `${payload.range}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data?.latency_distribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )) || []}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RpcGraph;
