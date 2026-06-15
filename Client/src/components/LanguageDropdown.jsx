import { useEffect, useRef, useState } from "react";
import { ChevronDown, Languages } from "lucide-react";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" },
];

const LanguageDropdown = ({ value = "en", onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = languages.find((l) => l.code === value)?.label || "Language";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-base-300 px-3 py-1.5 text-sm hover:bg-base-200"
        aria-label="Choose translation language"
      >
        <Languages size={18} />
        <span className="hidden sm:inline">{selected}</span>
        <ChevronDown size={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-base-300 bg-base-100 shadow-lg z-50">
          {languages.map((lang) => (
            <button
              type="button"
              key={lang.code}
              onClick={() => {
                onChange(lang.code);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-base-200 ${
                lang.code === value ? "font-semibold text-primary" : ""
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
