import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAppStore } from "@/store/app.store";

export const OnboardingTour: React.FC = () => {
    const { hasSeenOnboarding, completeOnboarding } = useAppStore();

    useEffect(() => {
        if (hasSeenOnboarding) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: "Done",
            // closeBtnText is not a valid option in v1.x, removing it
            nextBtnText: "Next",
            prevBtnText: "Previous",
            onDestroyed: () => {
                completeOnboarding();
            },
            steps: [
                {
                    element: "body",
                    popover: {
                        title: "Welcome to Crypto Analysis",
                        description: "Let's take a quick tour of the key features to get you started.",
                        side: "left",
                        align: "start",
                    },
                },
                {
                    element: "#tour-watchlist",
                    popover: {
                        title: "Watchlists",
                        description: "Manage your favorite assets here. Create new watchlists, rename them, and switch between them easily.",
                        side: "right",
                        align: "start",
                    },
                },
                {
                    element: "#tour-view-toggle",
                    popover: {
                        title: "Chart & Table Views",
                        description: "Switch between the interactive trading chart and the raw data table view.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#tour-backtest",
                    popover: {
                        title: "Backtesting Engine",
                        description: "Test your strategies against historical data. Configure parameters and run simulations directly from here.",
                        side: "left",
                        align: "start",
                    },
                },
            ],
        });

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            driverObj.drive();
        }, 1000);

        return () => {
            clearTimeout(timer);
            driverObj.destroy();
        };
    }, [hasSeenOnboarding, completeOnboarding]);

    return null;
};
