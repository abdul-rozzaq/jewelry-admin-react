import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { getLang, setLang } from "@/src/i18n";

const languages = [
  { code: "uz", name: "O'zbekcha", flag: "🇺🇿" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
];

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState(getLang("en"));

  useEffect(() => {
    const saved = getLang("en");
    setCurrentLang(saved);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang);
    setCurrentLang(newLang);
  };

  const active = languages.find((lang) => lang.code === currentLang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{active?.flag}</span>
          <span>{active?.name}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={currentLang === language.code ? "bg-accent text-accent-foreground font-semibold" : ""}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
