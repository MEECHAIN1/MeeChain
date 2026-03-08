import React from "react";
import { Shield, Award, Trophy, Star, Target, Zap, Award as AwardIcon, Target as TargetIcon, Zap as ZapIcon } from "lucide-react";

interface BadgeGalleryProps {
  badges?: Array<{
    name: string;
    description: string;
    earned: boolean;
    icon?: string;
  }>;
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ 
  badges = [
    { name: "Auth0 Master", description: "Login success via Auth0", earned: true, icon: "shield" },
    { name: "JWT Guardian", description: "JWT verified via JWKS", earned: true, icon: "shield" },
    { name: "NodeReal Explorer", description: "First RPC call success", earned: true, icon: "explore" },
    { name: "RPC Ranger", description: "50 RPC calls completed", earned: true, icon: "ranger" },
    { name: "Latency Slayer", description: "RPC latency < 100ms", earned: false, icon: "zap" },
    { name: "Onboarding Hero", description: "Completed onboarding", earned: true, icon: "trophy" },
    { name: "Bug Hunter", description: "Reported useful bug", earned: false, icon: "bug" },
    { name: "Community Builder", description: "Helped new member", earned: true, icon: "users" },
    { name: "Config Keeper", description: "Correct .env setup", earned: true, icon: "settings" },
  ]
}) => {
  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'shield': return <Shield className="w-5 h-5" />;
      case 'trophy': return <Trophy className="w-5 h-5" />;
      case 'star': return <Star className="w-5 h-5" />;
      case 'target': return <TargetIcon className="w-5 h-5" />;
      case 'zap': return <ZapIcon className="w-5 h-5" />;
      case 'award': return <AwardIcon className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Badge Gallery</h3>
          <p className="text-sm text-gray-600">Earn badges by contributing to the MeeChain ecosystem</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {badges.filter(b => b.earned).length} of {badges.length} badges earned
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`
              border rounded-lg p-4 transition-all duration-200
              ${badge.earned 
                ? 'border-green-100 bg-green-50 hover:bg-green-50' 
                : 'border-gray-100 bg-gray-50 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-start space-x-4">
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                ${badge.earned 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
                }
              `}>
                {getIcon(badge.icon || 'award')}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${badge.earned ? 'text-gray-900' : 'text-gray-400'}`}>
                    {badge.name}
                  </h4>
                  {badge.earned ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Earned
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Progress</h4>
            <p className="text-sm text-gray-600">
              {badges.filter(b => b.earned).length} of {badges.length} badges earned
            </p>
          </div>
          <div className="w-48">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ 
                  width: `${(badges.filter(b => b.earned).length / badges.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeGallery;