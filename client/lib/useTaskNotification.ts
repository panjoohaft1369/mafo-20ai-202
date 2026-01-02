import { useState, useCallback, useEffect } from "react";

type NotificationStatus = "loading" | "success" | "error";

interface TaskNotificationState {
  isOpen: boolean;
  message: string;
  status: NotificationStatus;
  pageId?: string; // To track which page the notification belongs to
}

// Store notification state in sessionStorage
const STORAGE_KEY = "task_notification";

export function useTaskNotification(currentPageId: string) {
  const [notification, setNotification] = useState<TaskNotificationState>(() => {
    // Check if there's a saved notification in sessionStorage
    if (typeof window === "undefined") {
      return { isOpen: false, message: "", status: "loading" };
    }

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if it belongs to the current page and user is on that page
        if (parsed.pageId === currentPageId) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error reading notification from sessionStorage:", e);
    }

    return { isOpen: false, message: "", status: "loading" };
  });

  // Save notification to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stateToSave = {
        ...notification,
        pageId: currentPageId,
      };
      if (notification.isOpen) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Error saving notification to sessionStorage:", e);
    }
  }, [notification, currentPageId]);

  const showLoading = useCallback((message: string) => {
    setNotification({
      isOpen: true,
      message,
      status: "loading",
      pageId: currentPageId,
    });
  }, [currentPageId]);

  const showSuccess = useCallback((message: string) => {
    setNotification({
      isOpen: true,
      message,
      status: "success",
      pageId: currentPageId,
    });
  }, [currentPageId]);

  const showError = useCallback((message: string) => {
    setNotification({
      isOpen: true,
      message,
      status: "error",
      pageId: currentPageId,
    });
  }, [currentPageId]);

  const close = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const clear = useCallback(() => {
    setNotification({
      isOpen: false,
      message: "",
      status: "loading",
    });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    ...notification,
    showLoading,
    showSuccess,
    showError,
    close,
    clear,
  };
}
