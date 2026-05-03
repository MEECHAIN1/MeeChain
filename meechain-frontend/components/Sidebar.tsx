import React from "react";
import { 
  Home, 
  Users, 
  Activity, 
  Settings, 
  FileText, 
  Shield,
  BarChart3,
  Key
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  activePage: string;
  setActivePage: (page: string) => void;
  systemStatus?: "healthy" | "degraded" | "down";
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activePage, setActivePage, systemStatus = "healthy" }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: <Home size={20} /> },
    { id: "contributors", label: "Contributors", icon: <Users size={20} /> },
    { id: "rpc", label: "RPC Usage", icon: <Activity size={20} /> },
    { id: "badges", label: "Badges", icon: <Shield size={20} /> },
    { id: "config", label: "Config", icon: <Settings size={20} /> },
    { id: "logs", label: "Logs", icon: <FileText size={20} /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    { id: "tokens", label: "Token Status", icon: <Key size={20} /> },
  ];

  return (
    <aside className={`
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
      fixed lg:static
      top-0 left-0
      w-64 h-full
      bg-gray-900 text-white
      transition-transform duration-300
      z-40
    `}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold">MeeChain</h2>
            <p className="text-sm text-gray-400">Backend Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${activePage === item.id 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="px-4">
            <p className="text-sm text-gray-400 mb-2">System Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus === "healthy" ? "bg-green-500" : systemStatus === "degraded" ? "bg-yellow-500" : "bg-red-500"}`}></div>
              <span className="text-sm capitalize">{systemStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;