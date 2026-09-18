import { Link } from "react-router-dom";
import { EmptyState, PageMeta } from "../../components/guest/Elements";
import Icon from "../../components/guest/Icon";

export default function NotFound() {
  return <><PageMeta title="Halaman tidak ditemukan — Portofolio" /><EmptyState title="Halaman tidak ditemukan" message="Alamat yang Anda buka tidak tersedia. Kembali ke beranda untuk menjelajahi portofolio."><Link to="/" className="button button-primary"><Icon name="left" size={18} />Kembali ke beranda</Link></EmptyState></>;
}
