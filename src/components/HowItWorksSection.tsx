import img1 from "@/imports/1920WLight/02fcd00bcd724eecf83f5f9db77efaa918c241bf.png";
import imgGirlReading from "@/imports/girl_reading.jpeg";
import imgSpeechBubble from "@/imports/speech_bubble.jpeg";
import { useLang } from "@/contexts/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLang();

  const items = [
    { img: img1, title: t("how.discover.title"), desc: t("how.discover.desc") },
    { img: imgGirlReading, title: t("how.read.title"), desc: t("how.read.desc") },
    { img: imgSpeechBubble, title: t("how.share.title"), desc: t("how.share.desc") },
  ];

  return (
    <section id="howitworks" className="py-20 bg-[#f4fafb]">
      <div className="max-w-4xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="font-['Quando',serif] text-[#023047] text-3xl">
            {t("how.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((c, i) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-[#219ebc]/25 hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-[#219ebc]/10 flex items-center justify-center mx-auto mb-5 font-['Quando',serif] text-[#219ebc] text-lg font-bold group-hover:bg-[#219ebc] group-hover:text-white transition-all">
                {i + 1}
              </div>
              <div className="h-28 flex items-center justify-center mb-5">
                <img
                  src={c.img}
                  alt={c.title}
                  className="w-28 h-full object-contain"
                />
              </div>
              <h3 className="font-['Quando',serif] text-[#023047] text-xl mb-3">{c.title}</h3>
              <p className="font-['Lato',sans-serif] text-[#023047]/55 text-sm leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
