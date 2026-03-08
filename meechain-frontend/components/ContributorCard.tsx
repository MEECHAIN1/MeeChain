import React from "react";
import { User, Award, Activity, Star, Shield } from "lucide-react";

interface ContributorCardProps {
  name: string;
  role: string;
  badges: string[];
  activity: string;
  rpcCalls?: number;
  errorRate?: number;
  joinedDate?: string;
}

const ContributorCard: React.FC<ContributorCardProps> = ({ 
  name, 
  role, 
  badges, 
  activity,
  rpcCalls = 0,
  errorRate = 0,
  joinedDate = "2026-03-01"
}) => {
  const getRoleColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'developer': return 'bg-blue-100 text-blue-800';
      case 'contributor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role.toLowerCase()) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'developer': return <Activity className="w-4 h-4" />;
      case 'contributor': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${getRoleColor(role)}`}>
                {getRoleIcon(role)}
                <span>{role}</span>
              </span>
              <span className="text-xs text-gray-500">Joined {joinedDate}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <Star className="text-yellow-500" size={16} />
          <span className="text-sm font-medium text-gray-700">
            {badges.length} badges
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Activity: {activity}</p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Activity className="text-blue-500" size={14} />
            <span className="text-gray-700">{rpcCalls} RPC calls</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${errorRate < 5 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-700">{errorRate.toFixed(1)}% error rate</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="text-gray-400" size={16} />
          <span className="text-sm font-medium text-gray-700">Badges</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center space-x-1"
            >
              <Award size={12} />
              <span>{badge}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{rpcCalls}</p>
            <p className="text-xs text-gray-500">Total Calls</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{errorRate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500">Error Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorCard;