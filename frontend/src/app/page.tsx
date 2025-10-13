import HeroSection from "@/components/sections/HeroSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import FeaturedQuestsSection from "@/components/sections/FeaturedQuestsSection";

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <HowItWorksSection />
      <FeaturedQuestsSection />
    </div>
  );
}
