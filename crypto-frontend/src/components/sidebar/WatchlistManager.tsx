import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import { useAppStore } from "@/store/app.store";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, XIcon, DownloadIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { exportToCsv } from "@/utils/export";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

export const WatchlistManager: React.FC = () => {
    const { selectedWatchlist, setWatchlist } = useAppStore();
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [newWatchlistName, setNewWatchlistName] = useState("");
    const [editingWatchlist, setEditingWatchlist] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const { data: watchlists, isLoading } = useQuery({
        queryKey: ["watchlists"],
        queryFn: () => apiService.getWatchlists(),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => apiService.createWatchlist(name),
        onSuccess: (data) => {
            queryClient.setQueryData(["watchlists"], data);
            setIsCreating(false);
            setNewWatchlistName("");
            toast.success("Watchlist created");
            // Select the new watchlist
            setWatchlist(newWatchlistName);
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ name, newName }: { name: string; newName: string }) =>
            apiService.updateWatchlist(name, newName),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(["watchlists"], data);
            setEditingWatchlist(null);
            setEditName("");
            toast.success("Watchlist updated");
            if (selectedWatchlist === variables.name) {
                setWatchlist(variables.newName);
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (name: string) => apiService.deleteWatchlist(name),
        onSuccess: (data, deletedName) => {
            queryClient.setQueryData(["watchlists"], data);
            toast.success("Watchlist deleted");
            if (selectedWatchlist === deletedName && data.length > 0) {
                setWatchlist(data[0].name);
            } else if (data.length === 0) {
                setWatchlist("");
            }
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    const [watchlistToDelete, setWatchlistToDelete] = useState<string | null>(null);

    const handleCreate = () => {
        if (!newWatchlistName.trim()) return;
        createMutation.mutate(newWatchlistName);
    };

    const handleUpdate = () => {
        if (!editName.trim() || !editingWatchlist) return;
        updateMutation.mutate({ name: editingWatchlist, newName: editName });
    };

    const startEditing = (name: string) => {
        setEditingWatchlist(name);
        setEditName(name);
    };

    const handleExport = () => {
        if (!watchlists || !selectedWatchlist) return;

        const currentWatchlist = watchlists.find(w => w.name === selectedWatchlist);
        if (!currentWatchlist || !currentWatchlist.assets || currentWatchlist.assets.length === 0) {
            toast.error("No symbols to export");
            return;
        }

        const data = currentWatchlist.assets.map((symbol: any) => ({ symbol }));
        exportToCsv(data, `${selectedWatchlist}_watchlist.csv`);
        toast.success("Watchlist exported");
    };

    return (
        <div id="tour-watchlist" className="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-light-muted dark:text-dark-muted">Watchlists</h2>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={handleExport}
                            title="Export Watchlist"
                            disabled={!selectedWatchlist}
                        >
                            <DownloadIcon size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setIsCreating(true)}
                            disabled={isCreating}
                            title="Create Watchlist"
                        >
                            <PlusIcon size={16} />
                        </Button>
                    </div>
                </div>

                {isCreating && (
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="text"
                            value={newWatchlistName}
                            onChange={(e) => setNewWatchlistName(e.target.value)}
                            className="flex-1 h-8 text-sm px-2 rounded border bg-transparent dark:border-gray-700 focus:outline-none focus:border-primary-500"
                            placeholder="Name..."
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                        >
                            <CheckIcon size={16} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => setIsCreating(false)}
                        >
                            <XIcon size={16} />
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-full rounded-md" />
                    ))
                ) : (
                    watchlists?.map((wl) => (
                        <div key={wl.name} className="group relative flex items-center">
                            {editingWatchlist === wl.name ? (
                                <div className="flex items-center gap-2 w-full px-2 py-1">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 h-7 text-sm px-2 rounded border bg-transparent dark:border-gray-700 focus:outline-none focus:border-primary-500"
                                        autoFocus
                                        onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-green-500"
                                        onClick={handleUpdate}
                                        disabled={updateMutation.isPending}
                                    >
                                        <CheckIcon size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-red-500"
                                        onClick={() => setEditingWatchlist(null)}
                                    >
                                        <XIcon size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Button
                                        variant={selectedWatchlist === wl.name ? "secondary" : "ghost"}
                                        className={cn(
                                            "w-full justify-start truncate pr-8",
                                            selectedWatchlist === wl.name && "bg-gray-100 dark:bg-gray-800"
                                        )}
                                        onClick={() => setWatchlist(wl.name)}
                                    >
                                        {wl.name}
                                    </Button>
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-white dark:bg-gray-900 shadow-sm rounded-md">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-gray-500 hover:text-blue-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditing(wl.name);
                                            }}
                                        >
                                            <PencilIcon size={12} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWatchlistToDelete(wl.name);
                                            }}
                                        >
                                            <TrashIcon size={12} />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
                {!isLoading && (!watchlists || watchlists.length === 0) && (
                    <div className="text-sm text-muted-foreground p-2 text-center">
                        No watchlists
                    </div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={!!watchlistToDelete}
                onClose={() => setWatchlistToDelete(null)}
                onConfirm={() => {
                    if (watchlistToDelete) {
                        deleteMutation.mutate(watchlistToDelete);
                        setWatchlistToDelete(null);
                    }
                }}
                title="Delete Watchlist"
                description={`Are you sure you want to delete "${watchlistToDelete}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                checklist={[
                    "I understand this action cannot be undone",
                ]}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};
