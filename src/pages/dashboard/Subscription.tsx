import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["10 MCQs per day", "10 Papers per day", "10 Voice notes per day", "Save to dashboard"],
    current: true,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹49",
    period: "/month",
    features: ["Unlimited MCQs", "Unlimited Papers", "Unlimited Voice notes", "PDF export", "Institution branding"],
    popular: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "₹99",
    period: "one-time",
    features: ["Everything in Monthly", "Lifetime access", "Future updates", "VIP support"],
    badge: "Best Value",
  },
];

export default function SubscriptionPage() {
  const { profile, refreshProfile } = useAuth();

  const handleUpgrade = async (planId: string) => {
    // For now, show a message about Razorpay integration
    toast({
      title: "Coming Soon",
      description: "Razorpay payment integration will be available soon. For now, enjoy the free tier!",
    });
  };

  const currentPlan = profile?.plan || "free";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-warning" />
          Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current plan */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              {currentPlan === "lifetime" ? (
                <Crown className="w-6 h-6 text-warning" />
              ) : (
                <Sparkles className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-display font-semibold">Current Plan: <span className="capitalize">{currentPlan}</span></h3>
              <p className="text-sm text-muted-foreground">
                {currentPlan === "free" 
                  ? "Upgrade to unlock unlimited access" 
                  : currentPlan === "lifetime"
                  ? "You have lifetime access to all features"
                  : "You have unlimited access to all features"}
              </p>
            </div>
          </div>
          {currentPlan !== "free" && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentPlan === "lifetime" ? "badge-lifetime" : "badge-monthly"
            }`}>
              {currentPlan === "lifetime" && <Crown className="w-3 h-3 inline mr-1" />}
              Active
            </span>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isUpgrade = 
            (currentPlan === "free" && plan.id !== "free") ||
            (currentPlan === "monthly" && plan.id === "lifetime");

          return (
            <Card 
              key={plan.id}
              variant={plan.popular ? "pricing-featured" : isCurrent ? "outline" : "pricing"}
              className="relative"
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold badge-lifetime">
                    <Crown className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}
              {plan.popular && !plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  variant={isCurrent ? "outline" : plan.id === "lifetime" ? "premium" : "accent"}
                  className="w-full"
                  disabled={isCurrent || currentPlan === "lifetime"}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrent ? "Current Plan" : isUpgrade ? "Upgrade" : "Downgrade"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
