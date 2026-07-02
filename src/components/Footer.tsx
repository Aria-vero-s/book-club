import { useLang } from "@/contexts/LanguageContext";

export function Footer({
  onViewPast,
  onNavigate,
}: {
  onViewPast: () => void;
  onNavigate?: (view: string) => void;
}) {
  const { t } = useLang();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="contact" className="bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-6 pt-14 pb-10">
        <div className="mb-10">
          <p className="font-['Quando',serif] text-[#023047] text-xl mb-4">
            The Blue Book Club
          </p>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <button
                  onClick={() => scrollTo("book")}
                  className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors focus:outline-none"
                >
                  {t("footer.thisMonth")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("howitworks")}
                  className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors focus:outline-none"
                >
                  {t("footer.howItWorks")}
                </button>
              </li>
              <li>
                <button
                  onClick={onViewPast}
                  className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors focus:outline-none"
                >
                  {t("footer.pastReads")}
                </button>
              </li>
              {onNavigate && (
                <li>
                  <button
                    onClick={() => onNavigate("library")}
                    className="font-['Lato',sans-serif] text-sm text-[#023047]/40 hover:text-[#219ebc] transition-colors focus:outline-none"
                  >
                    Library
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="h-px bg-gray-100 mb-8" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="font-['Lato',sans-serif] text-[#023047]/30 text-sm">
            <a
              href="https://github.com/arianesln"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#219ebc] transition-colors underline-offset-2 hover:underline"
            >
              {t("footer.copyright")}
            </a>
          </p>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#219ebc]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#ffb703]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#023047]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
