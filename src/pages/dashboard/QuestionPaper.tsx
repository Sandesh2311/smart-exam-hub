import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, FileText, Copy, Save, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Question {
  question: string;
  marks: number;
  answer?: string;
}

interface PaperData {
  oneMarks: Question[];
  twoMarks: Question[];
  fiveMarks: Question[];
}

export default function QuestionPaperPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [subject, setSubject] = useState("");
  const [topics, setTopics] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [saving, setSaving] = useState(false);

  const canGenerate = profile?.plan !== "free" || (profile?.monthly_paper_count || 0) < 10;
  const isPremium = profile?.plan !== "free";

  const handleGenerate = async () => {
    if (!subject.trim() || !topics.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter subject and topics.",
        variant: "destructive",
      });
      return;
    }

    if (!canGenerate) {
      toast({
        title: "Daily limit reached",
        description: "Upgrade to premium for unlimited paper generation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPaper(null);

    try {
      const response = await supabase.functions.invoke("generate-paper", {
        body: {
          subject,
          topics,
          institutionName: isPremium ? institutionName : undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setPaper(response.data.paper);
      await refreshProfile();

      toast({
        title: "Question Paper Generated!",
        description: "Your question paper is ready.",
      });
    } catch (error: any) {
      console.error("Paper generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !paper) return;

    setSaving(true);
    try {
      const totalMarks =
        paper.oneMarks.length * 1 +
        paper.twoMarks.length * 2 +
        paper.fiveMarks.length * 5;

      const { error } = await supabase.from("saved_papers").insert([{
        user_id: user.id,
        title: `${subject} Question Paper`,
        subject,
        institution_name: institutionName || null,
        questions: paper as any,
        total_marks: totalMarks,
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Question paper saved to your dashboard.",
      });
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderQuestionSection = (questions: Question[], title: string, marksEach: number) => (
    <div className="space-y-4">
      <h3 className="font-display font-semibold text-lg border-b pb-2">
        Section: {title} ({marksEach} mark{marksEach > 1 ? "s" : ""} each)
      </h3>
      {questions.map((q, index) => (
        <div key={index} className="p-3 rounded-lg bg-muted/30">
          <p className="font-medium">
            {index + 1}. {q.question} <span className="text-muted-foreground">({q.marks} marks)</span>
          </p>
          {showAnswers && q.answer && (
            <p className="mt-2 text-sm text-success pl-4 border-l-2 border-success">
              <strong>Answer:</strong> {q.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-info" />
          Question Paper Generator
        </h1>
        <p className="text-muted-foreground">
          Create complete question papers with different mark categories
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate Paper</CardTitle>
            <CardDescription>
              {profile?.plan === "free"
                ? `${10 - (profile?.monthly_paper_count || 0)} generations remaining today`
                : "Unlimited generations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics">Topics (comma-separated)</Label>
              <Textarea
                id="topics"
                placeholder="e.g., Algebra, Trigonometry, Calculus"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                rows={3}
              />
            </div>

            {isPremium && (
              <div className="space-y-2">
                <Label htmlFor="institution">Institution Name (Optional)</Label>
                <Input
                  id="institution"
                  placeholder="e.g., Delhi Public School"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                />
              </div>
            )}

            {!isPremium && (
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                ⭐ Upgrade to premium to add institution branding
              </p>
            )}

            <Button
              variant="accent"
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={loading || !canGenerate}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Paper"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Paper</CardTitle>
                <CardDescription>
                  {paper ? "Your question paper is ready" : "Your paper will appear here"}
                </CardDescription>
              </div>
              {paper && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAnswers(!showAnswers)}>
                    {showAnswers ? "Hide Answers" : "Show Answers"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-info" />
                <p>Generating your question paper...</p>
              </div>
            ) : paper ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-8">
                  {/* Header */}
                  {institutionName && (
                    <div className="text-center border-b pb-4">
                      <h2 className="font-display font-bold text-xl">{institutionName}</h2>
                      <p className="text-lg font-semibold mt-2">{subject} Examination</p>
                    </div>
                  )}

                  {paper.oneMarks.length > 0 && renderQuestionSection(paper.oneMarks, "A", 1)}
                  {paper.twoMarks.length > 0 && renderQuestionSection(paper.twoMarks, "B", 2)}
                  {paper.fiveMarks.length > 0 && renderQuestionSection(paper.fiveMarks, "C", 5)}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p>Enter subject and topics to generate a paper</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
