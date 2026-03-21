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
    <div className="border-b border-border-default">
      <nav className="flex gap-1 md:gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-base font-medium transition-colors duration-150 active:scale-95 min-w-0
              before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:bg-primary before:transition-transform before:duration-300 before:ease-out
              ${
                activeTab === tab.id
                  ? 'text-primary before:scale-x-100'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/50 before:scale-x-0'
              }
            `}
          >
            <span className="whitespace-nowrap relative z-10">{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`
                  ml-1.5 md:ml-2 px-1.5 md:px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'bg-primary-light text-primary'
                      : 'bg-bg-hover text-text-secondary'
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
