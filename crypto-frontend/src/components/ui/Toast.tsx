import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

export const Toaster = () => <SonnerToaster theme="system" position="top-right" richColors />;
export const toast = sonnerToast;
