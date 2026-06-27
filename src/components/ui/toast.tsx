import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
  onClose: () => void;
}

const Toast = ({ message, type = "info", visible, onClose }: ToastProps) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const bgMap = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-button",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-5 py-3 text-white shadow-lg",
          bgMap[type]
        )}
      >
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
};

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = React.createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = React.useState<{ message: string; type?: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    visible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

export { Toast };
