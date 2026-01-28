import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, BookOpen, FileText, Mic, Trash2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SavedMCQ {
  id: string;
  title: string;
  subject: string;
  topic: string | null;
  difficulty: string;
  questions: any[];
  question_count: number;
  created_at: string;
}

interface SavedPaper {
  id: string;
  title: string;
  subject: string;
  institution_name: string | null;
  questions: any;
  total_marks: number | null;
  created_at: string;
}

interface SavedNote {
  id: string;
  title: string;
  original_text: string;
  summary: string | null;
  generated_mcqs: any[] | null;
  created_at: string;
}

export default function SavedContentPage() {
  const { user } = useAuth();
  const [mcqs, setMcqs] = useState<SavedMCQ[]>([]);
  const [papers, setPapers] = useState<SavedPaper[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewType, setViewType] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchSavedContent();
    }
  }, [user]);

  const fetchSavedContent = async () => {
    setLoading(true);
    try {
      const [mcqRes, paperRes, notesRes] = await Promise.all([
        supabase.from("saved_mcqs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("saved_papers").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("saved_notes").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      ]);

      if (mcqRes.data) setMcqs(mcqRes.data as any);
      if (paperRes.data) setPapers(paperRes.data as any);
      if (notesRes.data) setNotes(notesRes.data as any);
    } catch (error) {
      console.error("Error fetching saved content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    const table = type === "mcq" ? "saved_mcqs" : type === "paper" ? "saved_papers" : "saved_notes";
    
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Deleted", description: "Item removed from saved content." });
      fetchSavedContent();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const renderMCQContent = (item: SavedMCQ) => (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-display font-semibold text-lg">{item.title}</h3>
          <p className="text-sm text-muted-foreground">
            {item.subject} • {item.difficulty} • {item.question_count} questions
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(item.created_at), "MMM d, yyyy")}
        </span>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {item.questions.map((q: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-muted/30">
              <p className="font-medium">Q{i + 1}. {q.question}</p>
              <div className="ml-4 mt-2 space-y-1">
                {q.options.map((opt: string, j: number) => (
                  <p key={j} className={opt === q.answer ? "text-success" : ""}>
                    {String.fromCharCode(65 + j)}) {opt}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderContentList = (items: any[], type: string, icon: any) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Save className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No saved {type}s yet</p>
        </div>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(item.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(item);
                    setViewType(type);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(type, item.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
          <Save className="w-8 h-8 text-primary" />
          Saved Content
        </h1>
        <p className="text-muted-foreground">
          Access your saved MCQs, question papers, and notes
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mcqs">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mcqs">MCQs ({mcqs.length})</TabsTrigger>
                  <TabsTrigger value="papers">Papers ({papers.length})</TabsTrigger>
                  <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="mcqs" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {renderContentList(mcqs, "mcq", <BookOpen className="w-5 h-5 text-accent" />)}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="papers" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {renderContentList(papers, "paper", <FileText className="w-5 h-5 text-info" />)}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="notes" className="mt-4">
                  <ScrollArea className="h-[400px]">
                    {renderContentList(notes, "note", <Mic className="w-5 h-5 text-success" />)}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                {selectedItem ? "Viewing selected item" : "Select an item to preview"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                viewType === "mcq" ? renderMCQContent(selectedItem) : (
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold">{selectedItem.title}</h3>
                    <ScrollArea className="h-[300px]">
                      <div className="prose prose-sm max-w-none">
                        {viewType === "note" && selectedItem.summary && (
                          <div>
                            <h4>Summary</h4>
                            <p>{selectedItem.summary}</p>
                          </div>
                        )}
                        {viewType === "paper" && selectedItem.questions && (
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(selectedItem.questions, null, 2)}
                          </pre>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Eye className="w-12 h-12 mb-4 opacity-50" />
                  <p>Click on an item to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
