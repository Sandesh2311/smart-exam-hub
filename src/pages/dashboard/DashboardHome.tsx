import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Mic, Crown, TrendingUp, Clock, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardHome() {
  const { profile, user } = useAuth();

  const getUsagePercentage = (count: number) => {
    if (profile?.plan !== "free") return 0;
    return Math.min((count / 10) * 100, 100);
  };

  const getRemainingUsage = (count: number) => {
    if (profile?.plan !== "free") return "Unlimited";
    return `${10 - count} remaining`;
  };

  const tools = [
    {
      title: "MCQ Generator",
      description: "Generate multiple choice questions on any topic",
      icon: BookOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
      href: "/dashboard/mcq",
      usage: profile?.monthly_mcq_count || 0,
    },
    {
      title: "Question Paper",
      description: "Create complete question papers with marking schemes",
      icon: FileText,
      color: "text-info",
      bgColor: "bg-info/10",
      href: "/dashboard/paper",
      usage: profile?.monthly_paper_count || 0,
    },
    {
      title: "Voice to Notes",
      description: "Convert speech to summarized notes and MCQs",
      icon: Mic,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/dashboard/voice",
      usage: profile?.monthly_voice_count || 0,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">
          Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Ready to ace your exams? Choose a tool to get started.
        </p>
      </div>

      {/* Subscription banner for free users */}
      {profile?.plan === "free" && (
        <Card className="bg-gradient-to-r from-accent/10 to-warning/10 border-accent/20">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/20">
                <Crown className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited access to all tools for just ₹49/month or ₹99 lifetime
                </p>
              </div>
            </div>
            <Link to="/dashboard/subscription">
              <Button variant="accent">Upgrade Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Tools grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.title} variant="feature" className="group">
            <CardHeader>
              <div className={`w-12 h-12 rounded-xl ${tool.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <tool.icon className={`w-6 h-6 ${tool.color}`} />
              </div>
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.plan === "free" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Daily usage</span>
                    <span className="font-medium">{getRemainingUsage(tool.usage)}</span>
                  </div>
                  <Progress value={getUsagePercentage(tool.usage)} className="h-2" />
                </div>
              )}
              <Link to={tool.href}>
                <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-colors">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-accent/10">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(profile?.monthly_mcq_count || 0) + (profile?.monthly_paper_count || 0) + (profile?.monthly_voice_count || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Generated</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-info/10">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">Active</p>
              <p className="text-sm text-muted-foreground">Account Status</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-full bg-success/10">
              <Crown className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold capitalize">{profile?.plan || "Free"}</p>
              <p className="text-sm text-muted-foreground">Current Plan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
