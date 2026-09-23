import { useCallback, useEffect, useRef, useState } from "react";
import { portofolioService } from "../services/portofolioService";
import { PortofolioContext } from "./portofolioState";
import { normalizePortfolio, normalizePublicProjects } from "../utils/guest";

const loadPortfolio = async (signal) => normalizePortfolio(await portofolioService.get(signal));
const loadProjects = async (signal) => normalizePublicProjects(await portofolioService.getProjects(signal));
const emptyProjects = [];
const portfolioError = () => "Portofolio belum dapat dimuat. Periksa koneksi Anda, lalu coba kembali.";
const projectError = (error) => error.response?.status === 429
  ? "Terlalu banyak permintaan. Tunggu sebentar, lalu coba lagi."
  : "Daftar proyek belum dapat dimuat. Silakan coba kembali.";

function usePublicResource(load, initialData, message) {
  const [state, setState] = useState({ data: initialData, loading: true, error: "" });
  const request = useRef(null);
  const reload = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState({ data: initialData, loading: true, error: "" });
    try {
      const data = await load(controller.signal);
      if (!controller.signal.aborted) setState({ data, loading: false, error: "" });
    } catch (error) {
      if (!controller.signal.aborted) setState({ data: initialData, loading: false, error: message(error) });
    }
  }, [load, initialData, message]);
  useEffect(() => {
    const start = setTimeout(reload, 0);
    return () => {
      clearTimeout(start);
      request.current?.abort();
    };
  }, [reload]);
  return { ...state, reload };
}

export function PortofolioProvider({ children }) {
  // Independent requests keep the rest of the portfolio readable if projects fail.
  const portfolio = usePublicResource(loadPortfolio, null, portfolioError);
  const projects = usePublicResource(loadProjects, emptyProjects, projectError);
  return (
    <PortofolioContext.Provider value={{
      ...portfolio,
      projects: projects.data,
      projectsLoading: projects.loading,
      projectsError: projects.error,
      reloadProjects: projects.reload,
    }}>
      {children}
    </PortofolioContext.Provider>
  );
}
