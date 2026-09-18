import { useCallback, useEffect, useRef, useState } from "react";
import { portofolioService } from "../services/portofolioService";
import { PortofolioContext } from "./portofolioState";
import { normalizePortfolio } from "../utils/guest";

export function PortofolioProvider({ children }) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const request = useRef(null);
  const reload = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    try {
      const payload = await portofolioService.get(controller.signal);
      if (!controller.signal.aborted)
        setState({
          data: normalizePortfolio(payload),
          loading: false,
          error: "",
        });
    } catch {
      if (!controller.signal.aborted)
        setState((previous) => ({
          ...previous,
          loading: false,
          error:
            "Portofolio belum dapat dimuat. Periksa koneksi Anda, lalu coba kembali.",
        }));
    }
  }, []);
  useEffect(() => {
    const start = setTimeout(reload, 0);
    return () => {
      clearTimeout(start);
      request.current?.abort();
    };
  }, [reload]);
  return (
    <PortofolioContext.Provider value={{ ...state, reload }}>
      {children}
    </PortofolioContext.Provider>
  );
}
