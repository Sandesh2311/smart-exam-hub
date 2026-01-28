import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  Mic, 
  Download, 
  Shield, 
  Zap,
  Brain,
  Clock
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "MCQ Generator",
    description: "Generate multiple choice questions on any subject with adjustable difficulty levels. Perfect for self-study and exam prep.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: FileText,
    title: "Question Papers",
    description: "Create complete question papers with 1-mark, 2-mark, and 5-mark questions. Add your institution branding.",
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    icon: Mic,
    title: "Voice to Notes",
    description: "Record lectures and convert them to summarized notes. AI generates study material and MCQs from your audio.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Download,
    title: "Export to PDF",
    description: "Download your generated content as beautifully formatted PDFs. Share with classmates or print for offline study.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Brain,
    title: "AI-Powered",
    description: "Powered by advanced AI models for accurate, relevant, and high-quality educational content generation.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "Save Time",
    description: "What used to take hours now takes seconds. Focus on learning while AI handles content creation.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and never shared. Study with confidence knowing your content is safe.",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate content in seconds, not minutes. Our optimized AI delivers results at blazing speed.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Excel</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful AI tools designed specifically for students and educators. 
            Create, study, and succeed with our comprehensive toolkit.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              variant="feature"
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
