import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, History } from 'lucide-react';
import { Card, Button, SectionTitle, Badge } from '../components/ui/UIComponents';
import { axiosClient } from '../utils/axiosClient';
import { MOCK_SUMMARIES } from '../mock/demoDashboard';
import { useSearchParams } from 'react-router-dom';

const ReactMarkdown = ({ children }: { children: string }) => (
  <div dangerouslySetInnerHTML={{ __html: children.replace(/\n/g, '<br />') }} />
);
export default function SummaryPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<string | null>(null);
  const [history, setHistory] = useState<typeof MOCK_SUMMARIES>([]);
  const [params] = useSearchParams();
  const isDemo = params.get('demo') === 'true';

  const fetchHistory = async () => {
    try {
        const { data } = await axiosClient.get('/summary/');
        setHistory(data);
    } catch (error) {
        console.error("Failed to fetch history", error);
    }
  };

  useEffect(() => {
    if (isDemo) {
        setHistory(MOCK_SUMMARIES);
    } else {
        fetchHistory();
    }
  }, [isDemo]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    if (isDemo) {
        // Mock data only for demo mode
        setTimeout(() => {
            setCurrentSummary("## Demo Summary\n\nThis is a **mock summary** generated for demonstration purposes. \n\n- You committed 5 times to *DailySync*.\n- You fixed 2 critical bugs.\n- **Productivity Score**: High");
            setIsGenerating(false);
        }, 1500);
        return;
    }

    try {
        const { data } = await axiosClient.post('/summary/generate');
        setCurrentSummary(data.summary);
        // Refresh history after generation
        fetchHistory();
    } catch (error) {
        console.error("Failed to generate summary", error);
        setCurrentSummary("❌ Failed to generate summary. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <>
      <SectionTitle title="Daily Summary" subtitle="AI-powered insights for your daily standup" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Generator Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-1 overflow-hidden border-border bg-card">
             <div className="bg-secondary rounded-t-lg p-8 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                   <BrainCircuit size={24} className="text-foreground" />
                   <h2 className="text-lg font-bold text-foreground">Generate Today's Report</h2>
                </div>
                <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                   DailySync analyzes your commits, time logs, and calendar events to create a perfect summary for your team sync.
                </p>
             </div>
             <div className="p-8 bg-card rounded-b-lg">
                {!currentSummary ? (
                   <div className="text-center py-12">
                      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                         <Sparkles size={24} />
                      </div>
                      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                         Ready to summarize your activity for today? Click the button below to start the magic.
                      </p>
                      <Button 
                         onClick={handleGenerate} 
                         disabled={isGenerating}
                         size="lg"
                         className="min-w-[180px]"
                      >
                         {isGenerating ? 'Analyzing Work...' : 'Generate Summary'}
                      </Button>
                   </div>
                ) : (
                   <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                         <div className="flex items-center gap-2">
                            <Badge variant="primary">Generated Just Now</Badge>
                         </div>
                         <Button variant="ghost" size="sm" onClick={() => setCurrentSummary(null)}>Clear</Button>
                      </div>
                      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none leading-loose">
                         <ReactMarkdown>{currentSummary}</ReactMarkdown>
                      </div>
                      <div className="mt-8 pt-6 border-t border-border flex gap-3">
                         <Button size="sm" variant="outline">Copy to Clipboard</Button>
                         <Button size="sm">Post to Slack</Button>
                      </div>
                   </div>
                )}
             </div>
          </Card>
        </div>

        {/* History Sidebar */}
        <div className="space-y-6">
           <h3 className="font-semibold text-foreground flex items-center gap-2">
              <History size={18} /> History
           </h3>
           <div className="space-y-4">
              {history.map(summary => (
                 <Card key={summary.id} className="p-5 cursor-pointer hover:border-foreground/30 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-xs font-semibold text-muted-foreground">{summary.date}</span>
                       <Badge variant={summary.mood === 'productive' ? 'primary' : 'neutral'} className="capitalize">{summary.mood}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors leading-relaxed">
                       {summary.content}
                    </p>
                 </Card>
              ))}
           </div>
        </div>
      </div>
    </>
  );
}