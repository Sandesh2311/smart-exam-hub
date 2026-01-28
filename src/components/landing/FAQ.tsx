import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the MCQ Generator work?",
    answer: "Our AI analyzes your topic and difficulty level to generate relevant multiple choice questions. Simply enter your subject, topic, select the difficulty, and specify the number of questions you need. The AI creates accurate, curriculum-aligned MCQs in seconds.",
  },
  {
    question: "Can I use this for competitive exam preparation?",
    answer: "Absolutely! Smart Exam Toolkit is designed for all types of exams - board exams, competitive exams (JEE, NEET, UPSC), and institutional tests. The AI generates questions based on actual exam patterns and syllabus requirements.",
  },
  {
    question: "Is the lifetime plan really one-time payment?",
    answer: "Yes! Pay ₹99 once and get unlimited access forever. This includes all current features and any future updates we add to the platform. No hidden fees, no renewal charges.",
  },
  {
    question: "How accurate is the Voice to Notes feature?",
    answer: "Our speech-to-text technology is highly accurate for clear audio. It works best with English and Hindi. The AI then summarizes the transcribed content and can generate MCQs from your lecture notes.",
  },
  {
    question: "Can teachers add their institution branding?",
    answer: "Yes! Premium users can add their school/college logo and name to generated question papers. This makes the papers look professional and ready for official use.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major payment methods through Razorpay - UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking, and wallets. All payments are secure and encrypted.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we take privacy seriously. Your generated content and personal data are encrypted and never shared with third parties. You can delete your data anytime from your dashboard.",
  },
  {
    question: "Can I export my content?",
    answer: "Free users can save content to their dashboard. Premium users get PDF and DOCX export options for all generated MCQs, question papers, and notes.",
  },
];

export function FAQ() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Frequently Asked
            <span className="gradient-text"> Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Smart Exam Toolkit
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-xl border px-6 shadow-sm animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
