import { Moon, Star, Sparkles, BookOpen, Target, Heart, Shield, ArrowRight, Dumbbell, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background" data-testid="page-landing">
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-primary/30"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + "s",
            }}
          />
        ))}
      </div>

      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10 -z-10" />

      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Moon className="h-7 w-7 text-primary animate-float" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-logo">
              Eunoia
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button onClick={onGetStarted} data-testid="button-header-login">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm" data-testid="badge-tagline">
                <Star className="h-4 w-4 text-accent" />
                Your personal sanctuary for reflection
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight" data-testid="text-hero-title">
                Your private
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  space for daily reflection
                </span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-hero-description">
                Eunoia is your trusted journaling companion. Track your thoughts, set daily intentions, 
                monitor your wellness journey, and build habits that lead to a more mindful, balanced life.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={onGetStarted} data-testid="button-get-started">
                  Start Your Journal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
              <Card className="relative border-primary/20 bg-background/80 backdrop-blur-sm" data-testid="card-preview">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Moon className="h-5 w-5 text-primary" />
                    <span className="text-sm">Today's Entry</span>
                  </div>
                  <div className="p-4 rounded-md bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 text-accent-foreground mb-2">
                      <Target className="h-4 w-4" />
                      <span className="text-sm font-medium">Daily Intention</span>
                    </div>
                    <p className="text-sm text-foreground/80 italic">
                      "Focus on being present and grateful for the small moments today..."
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">Evening Reflection</span>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Grateful for a productive day. Completed my morning workout and had a meaningful 
                      conversation with a friend. Tomorrow I'll focus on...
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <div className="flex items-center gap-1 text-emerald-500">
                      <Dumbbell className="h-4 w-4" />
                      <span className="text-xs">Worked Out</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Smile className="h-4 w-4" />
                      <span className="text-xs">Good Mood</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted/30 py-16" data-testid="section-features">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-features-title">
                Everything you need for mindful journaling
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Eunoia combines powerful journaling features with wellness tracking to help you 
                build self-awareness and achieve your personal goals.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={BookOpen}
                title="Daily Reflections"
                description="Capture your thoughts, experiences, and insights. Build a personal history of your journey through life."
              />
              <FeatureCard
                icon={Target}
                title="Goal Setting"
                description="Set daily intentions each morning and track whether you achieved them. Build accountability and momentum."
              />
              <FeatureCard
                icon={Dumbbell}
                title="Wellness Tracking"
                description="Log your workouts, meals, and mood. See patterns in your physical and mental wellbeing over time."
              />
              <FeatureCard
                icon={Smile}
                title="Mood Insights"
                description="Track how you're feeling day to day. Understand what influences your emotional state."
              />
              <FeatureCard
                icon={Star}
                title="Daily Inspiration"
                description="Start each day with a motivational quote. Let wisdom guide your reflection and intention-setting."
              />
              <FeatureCard
                icon={Shield}
                title="Private & Secure"
                description="Your journal is completely private. Your thoughts are protected and never shared with anyone."
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 max-w-4xl text-center" data-testid="section-philosophy">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Moon className="h-12 w-12 text-primary animate-float" />
                <Sparkles className="h-5 w-5 text-accent absolute -top-2 -right-2" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold" data-testid="text-philosophy-title">
              What is Eunoia?
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              <span className="text-foreground font-medium">Eunoia</span> (pronounced "you-noy-ah") is an ancient Greek word 
              meaning "beautiful thinking" or "a well-mind." It represents a state of goodwill and mental clarity, 
              the very essence of what mindful journaling can help you achieve.
            </p>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We believe that taking a few minutes each day to reflect, set intentions, and track your wellness 
              can transform your relationship with yourself. Eunoia is designed to make that practice simple, 
              beautiful, and rewarding.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16" data-testid="section-cta">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold" data-testid="text-cta-title">
                Begin your journey today
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Use Eunoia to cultivate mindfulness, track your wellness, 
                and build a deeper understanding of yourself.
              </p>
              <Button size="lg" onClick={onGetStarted} data-testid="button-cta">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Your Free Journal
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8" data-testid="footer">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-primary" />
            <span>Made with love for mindful journaling</span>
          </div>
          <p>Eunoia - Beautiful Thinking, Every Day</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
  return (
    <Card className="border-primary/10" data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6 space-y-3">
        <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
