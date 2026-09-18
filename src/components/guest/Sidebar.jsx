import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { socialLinks, storageUrl } from "../../utils/guest";
import { guestIdentity } from "../../config/guest";
import { Avatar } from "./Elements";
import Icon from "./Icon";

const navItems = [
  { id: "home", label: "Beranda" },
  { id: "projects", label: "Proyek" },
  { id: "skills", label: "Keahlian" },
  { id: "karir", label: "Pengalaman" },
  { id: "pendidikan", label: "Pendidikan" },
  { id: "sertifikat", label: "Sertifikat" },
  { id: "contact", label: "Kontak" },
];

export default function Sidebar({ profile = {}, ready }) {
  const location = useLocation();
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButton = useRef(null);
  const mobileMenu = useRef(null);
  const isHome = location.pathname === "/";
  const selected = isHome
    ? active
    : location.pathname.startsWith("/sertifikat")
      ? "sertifikat"
      : "projects";

  useEffect(() => {
    if (!ready || !isHome) return;
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      () => {
        const cutoff = window.innerHeight * 0.32;
        const current = sections
          .filter((section) => section.getBoundingClientRect().top <= cutoff)
          .at(-1);
        setActive(current?.id || "home");
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: [0, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome, ready]);

  useEffect(() => {
    if (!mobileOpen) return;
    const dismiss = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    const outside = (event) => {
      if (
        !mobileMenu.current?.contains(event.target) &&
        !menuButton.current?.contains(event.target)
      )
        setMobileOpen(false);
    };
    const wideScreen = window.matchMedia("(min-width: 1200px)");
    const close = () => setMobileOpen(false);
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    wideScreen.addEventListener("change", close);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
      wideScreen.removeEventListener("change", close);
    };
  }, [mobileOpen]);

  const links = socialLinks(profile);
  const navigation = (mobile = false) =>
    navItems.map((item, index) => (
      <Link
        key={item.id}
        to={`/#${item.id}`}
        aria-current={selected === item.id ? "location" : undefined}
        className={`side-link ${selected === item.id ? "is-active" : ""}`}
        onClick={() => {
          setMobileOpen(false);
          setActive(item.id);
        }}
      >
        <span className="nav-number" aria-hidden="true">
          {String(index).padStart(2, "0")}
        </span>
        <span>{item.label}</span>
        <Icon name="arrow" size={14} />
        {mobile && <span className="sr-only">, bagian beranda</span>}
      </Link>
    ));

  return (
    <>
      <aside className="guest-sidebar">
        <div className="sidebar-top">
          <Link to="/#home" className="wordmark">
            PORTOFOLIO<span aria-hidden="true"> / </span>
          </Link>
          <Link to="/#home" className="sidebar-identity">
            <Avatar profile={profile} />
            <span className="sidebar-name">{profile.nama || "Portofolio"}</span>
            <span className="sidebar-role">{guestIdentity.focus}</span>
          </Link>
          <nav aria-label="Navigasi utama">{navigation()}</nav>
        </div>
        <div className="sidebar-bottom">
          {storageUrl(profile.cv) && (
            <a
              className="sidebar-cv"
              href={storageUrl(profile.cv)}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="document" size={17} />
              Lihat CV
              <Icon name="arrow" size={15} />
            </a>
          )}
          <div className="sidebar-socials">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label} (tab baru)`}
              >
                <Icon name={link.icon} size={18} />
              </a>
            ))}
          </div>
          <p className="sidebar-note">{guestIdentity.discipline}</p>
        </div>
      </aside>
      <header className="guest-mobile-header">
        <Link to="/#home" className="mobile-identity">
          <Avatar profile={profile} />
          <span>
            {profile.nama || "Portofolio"}
            <small>{guestIdentity.focus}</small>
          </span>
        </Link>
        <button
          ref={menuButton}
          className="icon-button"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          aria-controls="guest-mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Icon name={mobileOpen ? "close" : "menu"} />
        </button>
        <nav
          ref={mobileMenu}
          id="guest-mobile-menu"
          aria-label="Navigasi mobile"
          className={`guest-mobile-menu ${mobileOpen ? "is-open" : ""}`}
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
        >
          {navigation(true)}
        </nav>
      </header>
    </>
  );
}
