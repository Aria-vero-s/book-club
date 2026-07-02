import { Hero } from "@/components/Hero";
import { MeetupBanner } from "@/components/MeetupBanner";
import { BookOfMonth } from "@/components/BookOfMonth";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { VotingSection } from "@/components/VotingSection";
import { Footer } from "@/components/Footer";

export function HomePage({
  onNavigate,
}: {
  onNavigate: (view: "home" | "past" | "library") => void;
}) {
  return (
    <>
      <Hero />
      <MeetupBanner />
      <BookOfMonth />
      <HowItWorksSection />
      <VotingSection />
      <Footer
        onViewPast={() => onNavigate("past")}
        onNavigate={onNavigate}
      />
    </>
  );
}
