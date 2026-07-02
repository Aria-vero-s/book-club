import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { SignInButton } from "@/components/SignInButton";
import imgLanding from "@/imports/1920WLight/61f9d38cef5dfc577b507b3f35af5181e51ce63b.png";

export function Hero() {
  const { user } = useAuth();
  const { t } = useLang();

  return (
    <section id="hero" className="pt-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-4 flex justify-center">
        <img
          src={imgLanding}
          alt="The Blue Book Club — stack of books with club logo"
          className="w-full max-w-2xl object-contain"
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-12 text-center">
        <p className="font-['Quando',serif] text-[#219ebc] text-xl leading-relaxed italic">
          {t("hero.tagline")}
        </p>

        {!user && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <SignInButton large />
            <button
              disabled
              aria-disabled="true"
              title="Coming soon"
              className="inline-flex items-center gap-2.5 bg-gray-100 text-gray-400 font-['Lato',sans-serif] font-bold rounded-full px-7 py-3.5 text-base cursor-not-allowed opacity-60"
            >
              <span className="font-black text-sm w-5 h-5 flex items-center justify-center">
                42
              </span>
              Continue with 42 School (Coming Soon)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
