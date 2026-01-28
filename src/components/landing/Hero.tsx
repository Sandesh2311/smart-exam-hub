import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BookOpen, Mic, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-hero-gradient">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-primary-foreground/90">
                AI-Powered Education Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
              Smart Exam
              <span className="block gradient-text">Toolkit</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg">
              Generate MCQs, question papers, and study notes instantly with AI. 
              The ultimate toolkit for students and educators.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="w-full sm:w-auto pulse-glow">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button 
                  variant="accent-outline" 
                  size="xl" 
                  className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-primary-foreground">10K+</div>
                <div className="text-sm text-primary-foreground/60">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">50K+</div>
                <div className="text-sm text-primary-foreground/60">MCQs Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-foreground">4.9★</div>
                <div className="text-sm text-primary-foreground/60">User Rating</div>
              </div>
            </div>
          </div>

          {/* Right content - Feature cards */}
          <div className="relative lg:pl-8">
            <div className="grid gap-4">
              {/* MCQ Card */}
              <div className="glass rounded-2xl p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">MCQ Generator</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate unlimited MCQs on any topic with AI-powered accuracy
                    </p>
                  </div>
                </div>
              </div>

              {/* Paper Card */}
              <div className="glass rounded-2xl p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-info/10">
                    <FileText className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">Question Papers</h3>
                    <p className="text-sm text-muted-foreground">
                      Create formatted exam papers with marking schemes
                    </p>
                  </div>
                </div>
              </div>

              {/* Voice Card */}
              <div className="glass rounded-2xl p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <Mic className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">Voice to Notes</h3>
                    <p className="text-sm text-muted-foreground">
                      Convert lectures to summarized notes and MCQs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
