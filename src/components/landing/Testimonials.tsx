import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Medical Student, AIIMS",
    content: "Smart Exam Toolkit saved me hours of study time. The MCQ generator creates questions that are actually relevant to my syllabus!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Physics Teacher, DPS",
    content: "I use this to create question papers for my classes. The AI understands the curriculum perfectly. Highly recommended for educators.",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Engineering Student, IIT",
    content: "The voice-to-notes feature is amazing! I record my lectures and get summarized notes instantly. Game changer for exam prep.",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Coaching Center Owner",
    content: "We've integrated this tool into our coaching center. Students love it, and it's helped us provide better study material.",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Commerce Student, St. Xavier's",
    content: "The ₹99 lifetime plan is such a steal! I've been using it for 6 months and it's worth every rupee.",
    rating: 5,
  },
  {
    name: "Arun Kumar",
    role: "School Principal",
    content: "We've adopted Smart Exam Toolkit school-wide. Teachers create better assessments and students prepare more effectively.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Loved by
            <span className="gradient-text"> Students & Teachers</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users have to say about Smart Exam Toolkit
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name}
              variant="elevated"
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-4">&ldquo;{testimonial.content}&rdquo;</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
