import React from 'react';
import {
  CalendarDays,
  Sparkles,
  ShieldAlert,
  Gauge,
  Users,
  ArrowLeftRight,
  Terminal,
  FileCheck2,
  BookOpen,
} from 'lucide-react';

export type NavTabId =
  | 'roster'
  | 'generator'
  | 'emergency'
  | 'fatigue'
  | 'staff'
  | 'swaps'
  | 'dispatcher'
  | 'audit'
  | 'about';

interface NavigationTabsProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  emergencyCount: number;
  fatigueCount: number;
  pendingSwapsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  emergencyCount,
  fatigueCount,
  pendingSwapsCount,
}) => {
  const tabs = [
    {
      id: 'roster' as NavTabId,
      label: 'Roster Matrix',
      icon: CalendarDays,
      badge: null,
    },
    {
      id: 'generator' as NavTabId,
      label: 'AI Roster Studio',
      icon: Sparkles,
      badge: 'Gemini',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'emergency' as NavTabId,
      label: 'Code Red & Rebalance',
      icon: ShieldAlert,
      badge: emergencyCount > 0 ? `${emergencyCount}` : null,
      badgeClass: 'bg-rose-500 text-white font-bold animate-pulse',
    },
    {
      id: 'fatigue' as NavTabId,
      label: 'Fatigue Radar',
      icon: Gauge,
      badge: fatigueCount > 0 ? `${fatigueCount}` : null,
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'staff' as NavTabId,
      label: 'Staff Registry',
      icon: Users,
      badge: null,
    },
    {
      id: 'swaps' as NavTabId,
      label: 'Shift Swap Desk',
      icon: ArrowLeftRight,
      badge: pendingSwapsCount > 0 ? `${pendingSwapsCount}` : null,
      badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'dispatcher' as NavTabId,
      label: 'AI CMD Dispatcher',
      icon: Terminal,
      badge: 'Prompt',
      badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'audit' as NavTabId,
      label: 'MDCAN Audit & Print',
      icon: FileCheck2,
      badge: null,
    },
    {
      id: 'about' as NavTabId,
      label: 'About & SOP Procedures',
      icon: BookOpen,
      badge: 'Step-by-Step',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-none py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      tab.badgeClass || 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
