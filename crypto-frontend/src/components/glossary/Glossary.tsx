import React, { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { glossaryTerms } from "@/constants/glossary";
import { SearchIcon } from "lucide-react";

interface GlossaryProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Glossary: React.FC<GlossaryProps> = ({ isOpen, onClose }) => {
    const [search, setSearch] = useState("");

    const filteredTerms = glossaryTerms.filter(
        (item) =>
            item.term.toLowerCase().includes(search.toLowerCase()) ||
            item.definition.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Crypto Glossary"
            className="max-w-2xl h-[80vh] flex flex-col"
        >
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                    <SearchIcon
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search terms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredTerms.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No terms found matching "{search}"
                    </div>
                ) : (
                    filteredTerms.map((item, index) => (
                        <div
                            key={index}
                            className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {item.term}
                                </h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                                    {item.category}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                {item.definition}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </Dialog>
    );
};
