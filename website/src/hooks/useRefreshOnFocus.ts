import { useEffect } from "react";

export function useRefreshOnFocus(refetch: () => Promise<unknown>) {
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refetch]);
}
