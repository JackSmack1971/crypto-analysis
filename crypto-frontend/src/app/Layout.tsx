import React from "react";
import { Outlet } from "react-router-dom";
import { useAppStore } from "@/store/app.store";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";
import { MenuIcon, XIcon, SunIcon, MoonIcon } from "lucide-react";
import { Toaster } from "@/components/ui/Toast";
import { GlobalLoadingIndicator } from "@/components/ui/GlobalLoadingIndicator";
import { WatchlistManager } from "@/components/sidebar/WatchlistManager";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { Glossary } from "@/components/glossary/Glossary";
import { BookIcon } from "lucide-react";

export const Layout: React.FC = () => {
    const { sidebarOpen, toggleSidebar, chartPreferences, updateChartPreferences } =
        useAppStore();
    const [glossaryOpen, setGlossaryOpen] = React.useState(false);

    useKeyboardShortcut("b", toggleSidebar, { ctrlKey: true, preventDefault: true });

    const toggleTheme = () => {
        updateChartPreferences({
            theme: chartPreferences.theme === "dark" ? "light" : "dark",
        });
        // Toggle class on document element for Tailwind dark mode
        if (chartPreferences.theme === "dark") {
            document.documentElement.classList.remove("dark");
        } else {
            document.documentElement.classList.add("dark");
        }
    };

    // Initialize theme on mount
    React.useEffect(() => {
        if (chartPreferences.theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, []);

    return (
        <div
            className={cn(
                "min-h-screen transition-colors duration-200",
                "bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text"
            )}
        >
            <Toaster />
            <GlobalLoadingIndicator />
            <OnboardingTour />
            {/* Navigation Bar */}
            <nav
                className={cn(
                    "sticky top-0 z-50 border-b transition-colors",
                    "bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
                )}
            >
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Left: Brand + Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Toggle sidebar"
                            title="Toggle Sidebar (Ctrl+B)"
                        >
                            {sidebarOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
                        </button>
                        <h1 className="text-xl font-bold">Crypto Analysis</h1>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setGlossaryOpen(true)}
                            aria-label="Open Glossary"
                            title="Crypto Glossary"
                        >
                            <BookIcon size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {chartPreferences.theme === "dark" ? (
                                <SunIcon size={18} />
                            ) : (
                                <MoonIcon size={18} />
                            )}
                        </Button>
                    </div>
                </div>
            </nav>

            <Glossary isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
            <OnboardingWizard />

            {/* Main Content Area */}
            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed top-16 left-0 h-[calc(100vh-4rem)] transition-transform duration-300 z-40",
                        "bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border",
                        sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
                    )}
                >
                    <div className="p-4 overflow-y-auto h-full">
                        <h2 className="text-sm font-semibold mb-4 text-light-muted dark:text-dark-muted">Watchlists</h2>
                        <WatchlistManager />
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 transition-all duration-300",
                        sidebarOpen ? "ml-64" : "ml-0"
                    )}
                >
                    <div className="container mx-auto p-4">
                        <ErrorBoundary>
                            <Outlet />
                        </ErrorBoundary>
                    </div>
                </main>
            </div>
        </div>
    );
};
