"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ContributorCard from "@/components/ContributorCard";
import BadgeGallery from "@/components/BadgeGallery";
import { Search, Filter, Users, Award, TrendingUp } from "lucide-react";
import { getContributors, getBadges } from "@/utils/api";

export default function ContributorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("contributors");
  const [contributors, setContributors] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In production, use real API
        // const contributorsResponse = await getContributors();
        // const badgesResponse = await getBadges();
        
        // For demo, use mock data
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
          { 
            name: "David Lee", 
            role: "Contributor", 
            badges: ["NodeReal Explorer"], 
            activity: "25 RPC calls today",
            rpcCalls: 25,
            errorRate: 3.2,
            joinedDate: "2026-03-07"
          },
          { 
            name: "Eva Martinez", 
            role: "Developer", 
            badges: ["JWT Guardian", "Latency Slayer"], 
            activity: "68 RPC calls today",
            rpcCalls: 68,
            errorRate: 1.2,
            joinedDate: "2026-03-03"
          },
          { 
            name: "Frank Wilson", 
            role: "Admin", 
            badges: ["Auth0 Master", "Config Keeper", "Community Builder"], 
            activity: "95 RPC calls today",
            rpcCalls: 95,
            errorRate: 0.5,
            joinedDate: "2026-02-25"
          },
        ]);
        
        setBadges([
          { name: "Auth0 Master", description: "Login success via Auth0", earned: true, icon: "shield" },
          { name: "JWT Guardian", description: "JWT verified via JWKS", earned: true, icon: "shield" },
          { name: "NodeReal Explorer", description: "First RPC call success", earned: true, icon: "explore" },
          { name: "RPC Ranger", description: "50 RPC calls completed", earned: true, icon: "ranger" },
          { name: "Latency Slayer", description: "RPC latency < 100ms", earned: false, icon: "zap" },
          { name: "Onboarding Hero", description: "Completed onboarding", earned: true, icon: "trophy" },
          { name: "Bug Hunter", description: "Reported useful bug", earned: false, icon: "bug" },
          { name: "Community Builder", description: "Helped new member", earned: true, icon: "users" },
          { name: "Config Keeper", description: "Correct .env setup", earned: true, icon: "settings" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredContributors = contributors.filter(contributor => {
    const matchesSearch = 
      contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contributor.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || contributor.role.toLowerCase() === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: contributors.length,
    developers: contributors.filter(c => c.role === "Developer").length,
    contributors: contributors.filter(c => c.role === "Contributor").length,
    admins: contributors.filter(c => c.role === "Admin").length,
    totalBadges: contributors.reduce((acc, c) => acc + c.badges.length, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Contributors...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Contributors</h1>
                <p className="text-gray-600">Manage and view all MeeChain contributors</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Users size={16} />
                  <span>Invite Contributor</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Contributors</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Badges</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBadges}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="text-green-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{contributors.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg RPC Calls</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(contributors.reduce((acc, c) => acc + c.rpcCalls, 0) / contributors.length)}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search contributors by name or role..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-gray-500" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="developer">Developer</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Role Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setFilterRole("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterRole === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilterRole("admin")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterRole === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Admins ({stats.admins})
              </button>
              <button
                onClick={() => setFilterRole("developer")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterRole === "developer"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Developers ({stats.developers})
              </button>
              <button
                onClick={() => setFilterRole("contributor")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterRole === "contributor"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Contributors ({stats.contributors})
              </button>
            </div>
          </div>
          
          {/* Contributors Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Contributors ({filteredContributors.length})
              </h2>
              <p className="text-sm text-gray-600">
                Showing {filteredContributors.length} of {contributors.length} contributors
              </p>
            </div>
            
            {filteredContributors.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No contributors found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContributors.map((contributor, index) => (
                  <ContributorCard key={index} {...contributor} />
                ))}
              </div>
            )}
          </div>
          
          {/* Badge Gallery */}
          <div className="mb-6">
            <BadgeGallery badges={badges} />
          </div>
          
          {/* Role Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium">Admins</span>
                  </div>
                  <span className="text-sm text-gray-600">{stats.admins} contributors</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500"
                    style={{ width: `${(stats.admins / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">Developers</span>
                  </div>
                  <span className="text-sm text-gray-600">{stats.developers} contributors</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${(stats.developers / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Contributors</span>
                  </div>
                  <span className="text-sm text-gray-600">{stats.contributors} contributors</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${(stats.contributors / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}