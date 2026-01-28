import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, BookOpen, FileText, Mic } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* CTA Section */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to Ace Your Exams?
            </h2>
            <p className="text-primary-foreground/70 mb-8">
              Join thousands of students and teachers who trust Smart Exam Toolkit
            </p>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Start For Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-xl">🔥</span>
              </div>
              <span className="font-display font-bold text-xl">Smart Exam</span>
            </div>
            <p className="text-sm text-primary-foreground/60 mb-4">
              AI-powered education platform for students and teachers.
            </p>
            {/* WhatsApp Support */}
            <a 
              href="https://wa.me/919999999999?text=Hi! I need help with Smart Exam Toolkit" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="accent-outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </Button>
            </a>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-display font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>
                <Link to="/dashboard/mcq" className="hover:text-accent transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  MCQ Generator
                </Link>
              </li>
              <li>
                <Link to="/dashboard/paper" className="hover:text-accent transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Question Paper
                </Link>
              </li>
              <li>
                <Link to="/dashboard/voice" className="hover:text-accent transition-colors flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voice to Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li>
                <Link to="/pricing" className="hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-accent transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/60">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@smartexam.in
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {currentYear} Smart Exam Toolkit. All rights reserved. Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
