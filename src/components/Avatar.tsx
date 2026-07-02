import { useState } from "react";

export function Avatar({
  src,
  name,
  size = 10,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const dim = `w-${size} h-${size}`;
  const letter = (name ?? "?").charAt(0).toUpperCase();

  if (src && !imgFailed) {
    return (
      <img
        src={
          src.includes("pravatar.cc") && !src.includes("?u=")
            ? `${src}?u=${encodeURIComponent(name ?? src)}`
            : src
        }
        alt={name ?? "User"}
        className={`${dim} rounded-full object-cover ring-2 ring-white flex-shrink-0`}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-[#219ebc] flex items-center justify-center flex-shrink-0 ring-2 ring-white select-none`}
    >
      <span
        className="text-white font-bold leading-none"
        style={{ fontSize: `${Math.max(9, size * 2)}px` }}
      >
        {letter}
      </span>
    </div>
  );
}
