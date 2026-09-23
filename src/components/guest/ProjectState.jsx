import { EmptyState } from "./Elements";
import Icon from "./Icon";

export default function ProjectState({ loading, error, onRetry }) {
  if (loading) return (
    <div className="project-loading" role="status" aria-label="Memuat proyek" aria-busy="true">
      <span className="sr-only">Memuat proyek…</span>
      <div className="project-grid" aria-hidden="true">
        {[0, 1].map((key) => <div className="project-skeleton" key={key}>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
        </div>)}
      </div>
    </div>
  );
  return <div role="status"><EmptyState title="Proyek belum dapat dimuat" message={error}>
    <button className="button button-secondary" onClick={onRetry}><Icon name="refresh" size={18} />Coba lagi</button>
  </EmptyState></div>;
}
