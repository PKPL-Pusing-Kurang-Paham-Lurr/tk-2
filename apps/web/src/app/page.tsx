import Footer from "@/components/footer";
import IntroSection from "@/components/intro-section";
import PublicCardsSection from "@/components/public-cards-section";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <IntroSection />
      <div className="flex flex-1 flex-col items-center px-4 pb-8">
        <PublicCardsSection />

        <div className="mt-16 flex gap-2">
          <div className="h-1 w-8 rounded-full bg-primary/60" />
          <div className="h-1 w-8 rounded-full bg-primary/40" />
          <div className="h-1 w-8 rounded-full bg-primary/20" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
