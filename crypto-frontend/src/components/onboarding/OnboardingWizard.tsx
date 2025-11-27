import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/app.store";
import { CheckIcon, MoonIcon, SunIcon, TrendingUpIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export const OnboardingWizard: React.FC = () => {
    const {
        hasCompletedWizard,
        completeWizard,
        userExperienceLevel,
        setUserExperienceLevel,
        chartPreferences,
        updateChartPreferences,
    } = useAppStore();

    const [step, setStep] = useState(0);

    if (hasCompletedWizard) return null;

    const steps = [
        {
            title: "Welcome to Crypto Analysis",
            description: "Your advanced platform for crypto market analysis and strategy backtesting.",
            content: (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <TrendingUpIcon size={40} />
                    </div>
                    <p className="text-center text-gray-600 dark:text-gray-300 max-w-sm">
                        We'll help you set up your workspace in just a few seconds.
                    </p>
                </div>
            ),
        },
        {
            title: "Experience Level",
            description: "Customize the interface complexity based on your expertise.",
            content: (
                <div className="grid grid-cols-1 gap-3 py-4">
                    {(["beginner", "intermediate", "pro"] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setUserExperienceLevel(level)}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-lg border transition-all",
                                userExperienceLevel === level
                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500"
                                    : "border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800"
                            )}
                        >
                            <div className="text-left">
                                <div className="font-medium capitalize text-gray-900 dark:text-white">
                                    {level}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {level === "beginner" && "Simple charts, essential indicators"}
                                    {level === "intermediate" && "Standard tools, balanced view"}
                                    {level === "pro" && "Advanced technicals, full control"}
                                </div>
                            </div>
                            {userExperienceLevel === level && (
                                <CheckIcon size={20} className="text-primary-500" />
                            )}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: "Choose Theme",
            description: "Select your preferred visual style.",
            content: (
                <div className="grid grid-cols-2 gap-4 py-8">
                    <button
                        onClick={() => updateChartPreferences({ theme: "light" })}
                        className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-lg border transition-all",
                            chartPreferences.theme === "light"
                                ? "border-primary-500 bg-gray-50 ring-1 ring-primary-500"
                                : "border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        <SunIcon size={32} className="text-orange-500" />
                        <span className="font-medium text-gray-900">Light Mode</span>
                    </button>
                    <button
                        onClick={() => updateChartPreferences({ theme: "dark" })}
                        className={cn(
                            "flex flex-col items-center gap-3 p-6 rounded-lg border transition-all",
                            chartPreferences.theme === "dark"
                                ? "border-primary-500 bg-gray-800 ring-1 ring-primary-500"
                                : "border-gray-700 bg-gray-900 hover:bg-gray-800"
                        )}
                    >
                        <MoonIcon size={32} className="text-blue-400" />
                        <span className="font-medium text-white">Dark Mode</span>
                    </button>
                </div>
            ),
        },
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            completeWizard();
        } else {
            setStep((prev) => prev + 1);
        }
    };

    return (
        <Dialog
            isOpen={true}
            onClose={() => { }} // Prevent closing by clicking outside
            showCloseButton={false}
            title={currentStep.title}
            className="max-w-md"
        >
            <div className="space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentStep.description}
                </p>

                {currentStep.content}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 w-6 rounded-full transition-colors",
                                    i === step
                                        ? "bg-primary-500"
                                        : i < step
                                            ? "bg-primary-200 dark:bg-primary-900"
                                            : "bg-gray-200 dark:bg-gray-700"
                                )}
                            />
                        ))}
                    </div>
                    <Button onClick={handleNext} className="min-w-[100px]">
                        {isLastStep ? "Get Started" : "Next"}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};
