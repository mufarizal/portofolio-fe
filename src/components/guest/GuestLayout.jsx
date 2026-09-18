import { useEffect, useLayoutEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigationType } from "react-router-dom";
import { usePortofolio } from "../../context/portofolioState";
import Sidebar from "./Sidebar";
import Icon from "./Icon";
import { EmptyState } from "./Elements";
import { scrollBehavior } from "../../utils/motion";
import "../../styles/guest.css";

const historyPositions = new Map();
const pagePositions = new Map();

function remember(map, key, value) {
  map.set(key, value);
  if (map.size > 60) map.delete(map.keys().next().value);
}

function GuestScroll({ ready }) {
  const { pathname, search, hash, key, state } = useLocation();
  const navigation = useNavigationType();
  const previousPath = useRef(null);
  const pageKey = pathname + search;

  useLayoutEffect(() => {
    if (!ready) return;
    const firstVisit = previousPath.current === null;
    const changedPage = previousPath.current !== pathname;
    const restore = navigation === "POP" && historyPositions.has(key)
      ? historyPositions.get(key)
      : state?.restore ? pagePositions.get(pageKey) : undefined;
    let frame;

    // Restore a different document before paint; animate navigation within it.
    // This prevents scrolling through an unrelated page when returning to a list.
    if (restore !== undefined) {
      window.scrollTo({ top: restore, behavior: changedPage || firstVisit ? "instant" : scrollBehavior() });
    } else if (hash) {
      let id;
      try { id = decodeURIComponent(hash.slice(1)); } catch { id = hash.slice(1); }
      if (changedPage) window.scrollTo({ top: 0, behavior: "instant" });
      frame = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          block: "start", behavior: firstVisit ? "instant" : scrollBehavior(),
        });
      });
    } else if (changedPage) {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (changedPage || hash) document.getElementById("guest-main")?.focus({ preventScroll: true });
    previousPath.current = pathname;
    return () => cancelAnimationFrame(frame);
  }, [ready, pathname, pageKey, hash, key, state, navigation]);

  useEffect(() => {
    if (!ready) return;
    let frame;
    const save = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        remember(historyPositions, key, window.scrollY);
        remember(pagePositions, pageKey, window.scrollY);
      });
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => { window.removeEventListener("scroll", save); cancelAnimationFrame(frame); };
  }, [ready, pageKey, key]);
  return null;
}

function LoadingState() {
  return (
    <div className="loading-state" role="status" aria-label="Memuat portofolio">
      <p className="eyebrow">Memuat portofolio</p>
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-title short" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-line" />
      <div className="loading-cards">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
      <span className="sr-only">Mohon tunggu, konten sedang dimuat.</span>
    </div>
  );
}

export default function GuestLayout() {
  const { data, loading, error, reload } = usePortofolio();
  const location = useLocation();
  const page = useRef(null);
  const ready = Boolean(data) && !loading && !error;
  useLayoutEffect(() => {
    if (!ready || scrollBehavior() === "instant") return;
    const animation = page.current?.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 240, easing: "ease-out" },
    );
    return () => animation?.cancel();
  }, [location.pathname, ready]);
  useEffect(() => {
    document.documentElement.classList.add("guest-document");
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      document.documentElement.classList.remove("guest-document");
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);
  return (
    <div className="guest-app">
      <a className="skip-link" href="#guest-main">
        Langsung ke konten
      </a>
      <Sidebar
        key={location.pathname}
        profile={data?.profile}
        ready={Boolean(data) && !loading}
      />
      <GuestScroll ready={Boolean(data) && !loading && !error} />
      <main id="guest-main" className="guest-main" tabIndex={-1} ref={page}>
        {loading ? (
          <LoadingState />
        ) : error || !data ? (
          <EmptyState
            title="Belum dapat terhubung"
            message={error || "Data portofolio belum tersedia."}
          >
            <button className="button button-primary" onClick={reload}>
              <Icon name="refresh" size={18} />
              Coba lagi
            </button>
          </EmptyState>
        ) : (
          <Outlet />
        )}
      </main>
      <footer className="guest-footer">
        <span>
          © {new Date().getFullYear()} {data?.profile?.nama || "Portofolio"}
        </span>
        <Link to="/#home" className="text-link">
          Kembali ke atas <Icon name="arrow" size={16} />
        </Link>
      </footer>
    </div>
  );
}
