export default function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  required = false,
  readOnly = false,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-black mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        readOnly={readOnly}
        className="w-full px-3 py-2 border border-black/20 bg-white text-black focus:outline-none focus:border-black transition-colors resize-none"
      />
    </div>
  );
}
