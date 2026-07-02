import { useState } from "react";
import { Star } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const { t } = useLang();
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div
      className="flex gap-0.5"
      role={readonly ? "img" : "group"}
      aria-label={readonly ? `${value} out of 5 stars` : "Rate this book"}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          aria-label={`${s} star${s !== 1 ? "s" : ""}`}
          className={`transition-transform duration-100 ${
            readonly
              ? "cursor-default pointer-events-none"
              : "cursor-pointer hover:scale-110 focus:outline-none focus:scale-110"
          }`}
          onMouseEnter={() => !readonly && setHover(s)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(s)}
        >
          <Star
            size={size}
            className={`transition-colors duration-100 ${
              active >= s ? "fill-[#ffb703] text-[#ffb703]" : "fill-transparent text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
