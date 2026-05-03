import React from "react";
import { Key, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TokenStatusProps {
  tokenData?: {
    status: string;
    user: string;
    audience: string;
    scope: string;
    expires_in?: number;
    provider?: {
      active_provider: string;
      failover_count: number;
      last_switch_time?: string;
      status?: string;
      endpoints?: Array<{provider: string; endpoint: string; cluster?: string}>;
    };
  };
}

const TokenStatus: React.FC<TokenStatusProps> = ({ tokenData }) => {
  const mockData = {
    status: "VALID",
    user: "alice@meechain.io",
    audience: "MeeChain API",
    scope: "read:rpc write:badges admin:logs",
    expires_in: 3600, // 1 hour in seconds
  };

  const data = tokenData || mockData;
  const isExpired = data.status === "EXPIRED";
  const isInvalid = data.status === "INVALID";
  const isValid = data.status === "VALID";

  const getStatusIcon = () => {
    if (isValid) return <CheckCircle className="text-green-500" size={20} />;
    if (isExpired) return <Clock className="text-yellow-500" size={20} />;
    return <XCircle className="text-red-500" size={20} />;
  };

  const getStatusColor = () => {
    if (isValid) return "bg-green-100 text-green-800";
    if (isExpired) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hours`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Key className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Token Status</h3>
            <p className="text-sm text-gray-600">JWT Authentication Status</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>{data.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">User</p>
            <p className="font-medium text-gray-800">{data.user}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Audience</p>
            <p className="font-medium text-gray-800">{data.audience}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Scope</p>
          <div className="flex flex-wrap gap-2">
            {data.scope.split(" ").map((scopeItem, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
              >
                {scopeItem}
              </span>
            ))}
          </div>
        </div>

        {data.expires_in && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Expires In</p>
                <p className="font-medium text-gray-800">{formatTime(data.expires_in)}</p>
              </div>
              <div className="w-32">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      data.expires_in > 1800 ? "bg-green-500" : 
                      data.expires_in > 600 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, (data.expires_in / 3600) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.provider && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-2">Active Provider</p>
            <p className="font-medium text-gray-800">{data.provider.active_provider}</p>
            <p className="text-sm text-gray-600 mt-1">Failovers: {data.provider.failover_count} · Last Switch: {data.provider.last_switch_time ? new Date(data.provider.last_switch_time).toLocaleString() : "-"}</p>
            {data.provider.active_provider === "dshackle" && data.provider.endpoints?.length ? (
              <div className="mt-2 text-xs text-gray-600">
                {data.provider.endpoints.map((ep, i) => <div key={i}>{ep.provider}: {ep.endpoint} {ep.cluster ? `(${ep.cluster})` : ""}</div>)}
              </div>
            ) : null}
          </div>
        )}

        {isExpired && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-yellow-800">Token Expired</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your authentication token has expired. Please refresh your token to continue using the API.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenStatus;