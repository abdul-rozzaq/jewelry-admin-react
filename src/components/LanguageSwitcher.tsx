import { useState } from "react";
import { Globe } from "lucide-react";
import { setLang, getLang } from "@/src/i18n";

const LANGS = [
  { code: "en", label: "English" },
  { code: "uz", label: "O‘zbekcha" },
  { code: "tr", label: "Türkçe" },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const currentLang = getLang("en");

  return (
    <div
      className="fixed bottom-6 right-6 flex flex-col items-center group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={`flex flex-col mb-2 space-y-2 transition-all duration-300 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {LANGS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLang(lang.code)}
            className={`px-3 py-1 rounded-lg shadow bg-white text-sm hover:bg-gray-200 transition ${
              currentLang === lang.code ? "font-bold text-blue-600" : "text-gray-700"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <button className="p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition">
        <Globe size={20} />
      </button>
    </div>
  );
}
