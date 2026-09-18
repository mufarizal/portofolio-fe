const paths = {
  arrow: <path d="M7 17 17 7M7 7h10v10" />,
  right: <path d="M4 12h16m-6-6 6 6-6 6" />,
  left: <path d="M20 12H4m6-6-6 6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20" />,
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0" />
    </>
  ),
  tools: <path d="m5 6 5 6-5 6m8 0h6" />,
  document: <path d="M14 2H5v20h14V7l-5-5v5h5M8 12h8m-8 4h6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V3H3v13h5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  expand: <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8" cy="8" r="1.5" />
      <path d="m21 16-6-6L3 21" />
    </>
  ),
  refresh: <path d="M20 7A9 9 0 1 0 21 14M20 2v6h-6" />,
  github: (
    <path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.5-.5-2 3-.4 6-1.5 6-6A4.6 4.6 0 0 0 19 7c.2-1 .1-2.4-.3-3.4 0 0-1.2-.4-4 1.4a13 13 0 0 0-6 0c-2.8-1.8-4-1.4-4-1.4C4.3 4.6 4.2 6 4.4 7A4.6 4.6 0 0 0 3 10c0 4.5 3 5.6 6 6-.6.5-.5 1-.5 2v4" />
  ),
  linkedin: (
    <>
      <rect x="3" y="8" width="4" height="13" />
      <path d="M11 21V8h4v2c1-3 6-3 6 2v9h-4v-8c0-2-2-2-2 0v8" />
      <circle cx="5" cy="3.5" r="1.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17 7h.01" />
    </>
  ),
};

export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}
