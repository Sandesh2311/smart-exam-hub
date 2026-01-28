import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mic, MicOff, FileText, Save, BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MCQ {
  question: string;
  options: string[];
  answer: string;
}

export default function VoiceToNotesPage() {
  const { profile, user, refreshProfile } = useAuth();
  const [title, setTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const recognitionRef = useRef<any>(null);

  const canGenerate = profile?.plan !== "free" || (profile?.monthly_voice_count || 0) < 10;

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser. Try Chrome.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = transcript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);

    toast({
      title: "Recording started",
      description: "Speak clearly into your microphone.",
    });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "You can now process your notes.",
      });
    }
  };

  const handleProcess = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No content",
        description: "Please record or type some content first.",
        variant: "destructive",
      });
      return;
    }

    if (!canGenerate) {
      toast({
        title: "Daily limit reached",
        description: "Upgrade to premium for unlimited voice notes.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSummary("");
    setMcqs([]);

    try {
      const response = await supabase.functions.invoke("process-voice-notes", {
        body: { text: transcript },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSummary(response.data.summary);
      setMcqs(response.data.mcqs);
      await refreshProfile();

      toast({
        title: "Notes processed!",
        description: "Summary and MCQs generated successfully.",
      });
    } catch (error: any) {
      console.error("Processing error:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !transcript) return;

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your notes.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("saved_notes").insert([{
        user_id: user.id,
        title,
        original_text: transcript,
        summary: summary || null,
        generated_mcqs: mcqs.length > 0 ? (mcqs as any) : null,
      }]);

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Notes saved to your dashboard.",
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
          <Mic className="w-8 h-8 text-success" />
          Voice to Notes
        </h1>
        <p className="text-muted-foreground">
          Record lectures and convert them to summarized notes and MCQs
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recording section */}
        <Card>
          <CardHeader>
            <CardTitle>Record or Type</CardTitle>
            <CardDescription>
              {profile?.plan === "free"
                ? `${10 - (profile?.monthly_voice_count || 0)} processes remaining today`
                : "Unlimited processing"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Physics Lecture - Week 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Recording button */}
            <div className="flex justify-center">
              <Button
                variant={isRecording ? "destructive" : "accent"}
                size="xl"
                className={`rounded-full w-20 h-20 ${isRecording ? "animate-pulse" : ""}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>

            {/* Transcript */}
            <div className="space-y-2">
              <Label>Transcript</Label>
              <textarea
                className="w-full h-40 p-3 rounded-lg border bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Your speech will appear here, or type/paste text manually..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="accent"
                className="flex-1"
                onClick={handleProcess}
                disabled={loading || !transcript.trim() || !canGenerate}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Process Notes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving || !transcript.trim()}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results section */}
        <Card>
          <CardHeader>
            <CardTitle>Processed Output</CardTitle>
            <CardDescription>
              AI-generated summary and questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-success" />
                <p>Processing your notes...</p>
              </div>
            ) : summary || mcqs.length > 0 ? (
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="mcqs">MCQs ({mcqs.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="prose prose-sm max-w-none">
                      {summary ? (
                        <div className="whitespace-pre-wrap">{summary}</div>
                      ) : (
                        <p className="text-muted-foreground">No summary generated yet.</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="mcqs" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {mcqs.map((mcq, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/30">
                          <p className="font-medium mb-2">Q{index + 1}. {mcq.question}</p>
                          <div className="space-y-1 ml-4">
                            {mcq.options.map((opt, i) => (
                              <p key={i} className={opt === mcq.answer ? "text-success font-medium" : ""}>
                                {String.fromCharCode(65 + i)}) {opt} {opt === mcq.answer && "✓"}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mb-4 opacity-50" />
                <p>Record or type content to generate notes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
