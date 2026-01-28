import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Copy, Save, Download, Eye, EyeOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export default function MCQGeneratorPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [count, setCount] = useState([5]);
  const [loading, setLoading] = useState(false);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [saving, setSaving] = useState(false);

  const canGenerate = profile?.plan !== "free" || (profile?.monthly_mcq_count || 0) < 10;

  const handleGenerate = async () => {
    if (!subject.trim() || !topic.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both subject and topic.",
        variant: "destructive",
      });
      return;
    }

    if (!canGenerate) {
      toast({
        title: "Daily limit reached",
        description: "Upgrade to premium for unlimited MCQ generation.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setMcqs([]);

    try {
      const response = await supabase.functions.invoke("generate-mcq", {
        body: {
          subject,
          topic,
          difficulty,
          count: count[0],
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setMcqs(response.data.mcqs);
      await refreshProfile();
      
      toast({
        title: "MCQs Generated!",
        description: `Successfully generated ${response.data.mcqs.length} questions.`,
      });
    } catch (error: any) {
      console.error("MCQ generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate MCQs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || mcqs.length === 0) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("saved_mcqs").insert([{
        user_id: user.id,
        title: `${subject} - ${topic}`,
        subject,
        topic,
        difficulty,
        questions: mcqs as any,
        question_count: mcqs.length,
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "MCQs saved to your dashboard.",
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

  const copyToClipboard = () => {
    const text = mcqs
      .map((mcq, i) => {
        let str = `Q${i + 1}. ${mcq.question}\n`;
        mcq.options.forEach((opt, j) => {
          str += `   ${String.fromCharCode(65 + j)}) ${opt}\n`;
        });
        if (showAnswers) {
          str += `   Answer: ${mcq.answer}\n`;
        }
        return str;
      })
      .join("\n");

    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "MCQs copied to clipboard.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-accent" />
          MCQ Generator
        </h1>
        <p className="text-muted-foreground">
          Generate AI-powered multiple choice questions on any topic
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Generate MCQs</CardTitle>
            <CardDescription>
              {profile?.plan === "free"
                ? `${10 - (profile?.monthly_mcq_count || 0)} generations remaining today`
                : "Unlimited generations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Physics, History, Biology"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Newton's Laws, World War II"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Number of Questions: {count[0]}</Label>
              <Slider
                value={count}
                onValueChange={setCount}
                min={1}
                max={20}
                step={1}
                className="py-4"
              />
            </div>

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
                "Generate MCQs"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated MCQs</CardTitle>
                <CardDescription>
                  {mcqs.length > 0 ? `${mcqs.length} questions generated` : "Your questions will appear here"}
                </CardDescription>
              </div>
              {mcqs.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAnswers(!showAnswers)}>
                    {showAnswers ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showAnswers ? "Hide" : "Show"} Answers
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
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
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent" />
                <p>Generating your MCQs...</p>
              </div>
            ) : mcqs.length > 0 ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {mcqs.map((mcq, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-muted/30">
                      <p className="font-semibold mb-3">
                        Q{index + 1}. {mcq.question}
                      </p>
                      <div className="space-y-2 ml-4">
                        {mcq.options.map((option, optIndex) => {
                          const isAnswer = showAnswers && option === mcq.answer;
                          return (
                            <p
                              key={optIndex}
                              className={`${isAnswer ? "text-success font-medium" : ""}`}
                            >
                              {String.fromCharCode(65 + optIndex)}) {option}
                              {isAnswer && " ✓"}
                            </p>
                          );
                        })}
                      </div>
                      {showAnswers && mcq.explanation && (
                        <p className="mt-3 text-sm text-muted-foreground border-t pt-2">
                          <strong>Explanation:</strong> {mcq.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                <p>Enter a subject and topic to generate MCQs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
