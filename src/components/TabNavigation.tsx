interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-[#E2E8F0]">
      <nav className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-150
              ${
                activeTab === tab.id
                  ? 'border-[#0066CC] text-[#0066CC]'
                  : 'border-transparent text-[#64748B] hover:text-[#334155]'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`
                  ml-2 px-2 py-0.5 rounded text-xs font-medium
                  ${
                    activeTab === tab.id
                      ? 'bg-[#E6F2FF] text-[#0066CC]'
                      : 'bg-[#F1F5F9] text-[#475569]'
                  }
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
