import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { initiatePayment } from "@/lib/razorpay";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for trying out the platform",
    features: [
      "10 MCQs per day",
      "10 Question papers per day",
      "10 Voice notes per day",
      "Save to dashboard",
      "Basic export options",
    ],
    notIncluded: [
      "PDF export",
      "Institution branding",
      "Priority support",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Monthly",
    price: "₹49",
    period: "/month",
    description: "Best for regular students and teachers",
    features: [
      "Unlimited MCQs",
      "Unlimited Question papers",
      "Unlimited Voice notes",
      "Save to dashboard",
      "PDF & DOCX export",
      "Institution branding",
      "Priority support",
    ],
    notIncluded: [],
    buttonText: "Subscribe Now",
    buttonVariant: "accent" as const,
    popular: true,
  },
  {
    name: "Lifetime",
    price: "₹99",
    period: "one-time",
    description: "Pay once, use forever",
    features: [
      "Everything in Monthly",
      "Lifetime access",
      "Future feature updates",
      "VIP support",
      "Early access to new tools",
    ],
    notIncluded: [],
    buttonText: "Get Lifetime Access",
    buttonVariant: "premium" as const,
    popular: false,
    badge: "Best Value",
  },
];

export function Pricing() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.name === "Free") {
      navigate("/auth");
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    // User is logged in, initiate payment
    setLoadingPlan(plan.name);
    
    const planId = plan.name.toLowerCase() as "monthly" | "lifetime";
    
    initiatePayment(
      planId,
      user.email,
      profile?.full_name || undefined,
      async (newPlan) => {
        setLoadingPlan(null);
        toast({
          title: "Payment Successful! 🎉",
          description: `You're now on the ${newPlan} plan. Enjoy unlimited access!`,
        });
        await refreshProfile();
        navigate("/dashboard");
      },
      (error) => {
        setLoadingPlan(null);
        if (error !== "Payment cancelled") {
          toast({
            title: "Payment Failed",
            description: error,
            variant: "destructive",
          });
        }
      }
    );
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Simple, Transparent
            <span className="gradient-text"> Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that works best for you. Upgrade anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              variant={plan.popular ? "pricing-featured" : "pricing"}
              className={`relative animate-fade-in ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold badge-lifetime">
                    <Crown className="w-3 h-3" />
                    {plan.badge}
                  </span>
                </div>
              )}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-4 h-4 shrink-0 text-center">—</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full" 
                  size="lg"
                  disabled={loadingPlan !== null}
                  onClick={() => handlePlanClick(plan)}
                >
                  {loadingPlan === plan.name ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
