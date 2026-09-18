import { useEffect, useRef, useState } from "react";
import { storageUrl } from "../../utils/guest";
import { MediaImage } from "./Elements";
import Icon from "./Icon";

export default function ProjectGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const selected = images[active];
  const step = (direction) =>
    setActive(
      (current) => (current + direction + images.length) % images.length,
    );
  const thumbnailStart = Math.floor(active / 8) * 8;
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);
  const enlarge = () => {
    dialog.current.showModal();
    setOpen(true);
  };
  const close = () => dialog.current.close();
  const image = (large = false) => (
    <MediaImage
      src={storageUrl(selected.gambar)}
      alt={`Tampilan ${active + 1} dari ${images.length} — ${name}`}
      width="1200"
      height="750"
      className={large ? "lightbox-image" : "gallery-image"}
      decoding="async"
      loading={large ? "eager" : "lazy"}
    />
  );
  return (
    <div className="project-gallery">
      <div className="gallery-stage">
        {image()}
        <button
          className="gallery-expand button button-secondary"
          onClick={enlarge}
        >
          <Icon name="expand" size={17} />
          Perbesar gambar
        </button>
      </div>
      <div className="gallery-controls">
        <p className="mono" aria-live="polite">
          Tampilan {String(active + 1).padStart(2, "0")} /{" "}
          {String(images.length).padStart(2, "0")}
        </p>
        {images.length > 1 && (
          <div className="gallery-arrows">
            <button
              className="icon-button"
              aria-label="Gambar sebelumnya"
              onClick={() => step(-1)}
            >
              <Icon name="left" size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Gambar berikutnya"
              onClick={() => step(1)}
            >
              <Icon name="right" size={18} />
            </button>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Pilih tampilan proyek">
          {images
            .slice(thumbnailStart, thumbnailStart + 8)
            .map((item, offset) => {
              const index = thumbnailStart + offset;
              return (
                <button
                  key={item.id || item.gambar}
                  className={active === index ? "is-selected" : ""}
                  aria-label={`Lihat gambar ${index + 1}`}
                  aria-pressed={active === index}
                  onClick={() => setActive(index)}
                >
                  <MediaImage
                    src={storageUrl(item.gambar)}
                    alt=""
                    loading="lazy"
                    width="160"
                    height="100"
                    fallback={<Icon name="image" size={18} />}
                  />
                </button>
              );
            })}
        </div>
      )}
      <dialog
        ref={dialog}
        className="guest-lightbox"
        aria-labelledby="lightbox-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
        }}
      >
        <div className="lightbox-header">
          <h2 id="lightbox-title">{name}</h2>
          <button
            className="icon-button"
            aria-label="Tutup galeri"
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="lightbox-stage">{open && image(true)}</div>
        <div className="lightbox-footer">
          {images.length > 1 && (
            <button
              className="icon-button"
              aria-label="Gambar sebelumnya dalam galeri"
              onClick={() => step(-1)}
            >
              <Icon name="left" />
            </button>
          )}
          <span className="mono" aria-live="polite">
            {active + 1} / {images.length}
          </span>
          {images.length > 1 && (
            <button
              className="icon-button"
              aria-label="Gambar berikutnya dalam galeri"
              onClick={() => step(1)}
            >
              <Icon name="right" />
            </button>
          )}
        </div>
      </dialog>
    </div>
  );
}
