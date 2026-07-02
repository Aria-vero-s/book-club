export function MeetupBanner() {
  return (
    <div className="bg-[#023047] text-white">
      <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-center gap-2 flex-wrap text-center">
        <span className="font-['Lato',sans-serif] text-sm text-white/70">
          📅 The meetup is automatically set to:
        </span>
        <span className="font-['Lato',sans-serif] text-sm font-bold text-white">
          Last Sunday of the month at 19:00 · École 42 Paris
        </span>
      </div>
    </div>
  );
}
