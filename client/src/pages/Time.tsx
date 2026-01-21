/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Pause, Play, Save, RefreshCw, Plus, Calendar, Clock, AlertTriangle, GitCommit } from 'lucide-react';
import { Card, Button, Input, SectionTitle, Badge, Modal } from '../components/ui/UIComponents';
import { useTheme } from '../context/Theme/useTheme';
import { axiosClient } from '@/utils/axiosClient';
import { toast } from 'react-toastify';

// Monochrome palette for charts
const COLORS = ['#111111', '#4B5563', '#9CA3AF', '#E5E7EB'];

type TimeLog = {
    id: string;
    project: string;
    description: string;
    minutes: number;
    startTime?: string;
    endTime?: string;
    date: string;
    source: "local" | "synced" | "manual";
    isDeepWork?: boolean;
    tags?: string[];
}

type GitHubActivity = {
    id: string;
    repo: string;
    message: string;
    timestamp: string;
    type: 'commit';
}

type TimelineItem = (TimeLog & { type: 'log' }) | GitHubActivity;

type ActiveSession = {
    startTime: number | null; // Timestamp when current segment started. Null if paused.
    accumulatedSeconds: number; // Duration tracked before the current segment
    project: string;
    description: string;
    tags: string[];
    state: 'running' | 'paused';
    lastUpdated: number;
    wasInterrupted: boolean;
}

const QUICK_TEMPLATES = [
    { label: 'Coding', description: 'Feature implementation' },
    { label: 'Bugfix', description: 'Fixing bugs' },
    { label: 'Design', description: 'Design review' },
    { label: 'Meeting', description: 'Team sync' }
];

export default function TimePage() {
    const { theme } = useTheme();

    //----------------- Real-Time Timer (Ground Truth) -----------------

    const [activeSession, setActiveSession] = React.useState<ActiveSession | null>(() => {
        try {
            const raw = localStorage.getItem('activeTimeSession');
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [seconds, setSeconds] = React.useState(0);

    // Persist active session to localStorage
    React.useEffect(() => {
        if (activeSession) {
            localStorage.setItem('activeTimeSession', JSON.stringify(activeSession));
        } else {
            localStorage.removeItem('activeTimeSession');
        }
    }, [activeSession]);

    // Sync across tabs
    React.useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'activeTimeSession') {
                setActiveSession(e.newValue ? JSON.parse(e.newValue) : null);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Timer Tick (Visual Only - derived from start time)
    React.useEffect(() => {
        if (!activeSession || activeSession.state === 'paused') {
            if (activeSession) {
                setSeconds(activeSession.accumulatedSeconds);
            } else {
                setSeconds(0);
            }
            return;
        }

        const tick = () => {
            const now = Date.now();
            const currentSegment = activeSession.startTime ? Math.floor((now - activeSession.startTime) / 1000) : 0;
            setSeconds(activeSession.accumulatedSeconds + currentSegment);
        };

        tick(); // Immediate update
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const formattedTime = React.useMemo(() => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
    }, [seconds]);

    const handleStart = () => {
        const now = Date.now();
        setActiveSession(prev => {
            if (prev) {
                // Resume
                return {
                    ...prev,
                    state: 'running',
                    startTime: now,
                    lastUpdated: now
                };
            }
            // New Session
            return {
                startTime: now,
                accumulatedSeconds: 0,
                project: '',
                description: '',
                tags: [],
                state: 'running',
                lastUpdated: now,
                wasInterrupted: false
            };
        });
    };

    const handlePause = () => {
        const now = Date.now();
        setActiveSession(prev => {
            if (!prev || prev.state !== 'running' || !prev.startTime) return prev;
            const elapsed = Math.floor((now - prev.startTime) / 1000);
            return {
                ...prev,
                state: 'paused',
                startTime: null,
                accumulatedSeconds: prev.accumulatedSeconds + elapsed,
                lastUpdated: now,
                wasInterrupted: true
            };
        });
    };

    const handleUpdateDetails = (field: 'project' | 'description', value: string) => {
        setActiveSession(prev => {
            const base = prev || {
                startTime: null,
                accumulatedSeconds: 0,
                project: '',
                description: '',
                tags: [],
                state: 'paused', // Default to paused if creating from scratch via input
                lastUpdated: Date.now(),
                wasInterrupted: false
            };
            return { ...base, [field]: value };
        });
    };

    const handleUpdateTags = (value: string) => {
        const tags = value.split(',').map(t => t.trim()).filter(Boolean);
        setActiveSession(prev => {
            const base = prev || {
                startTime: null,
                accumulatedSeconds: 0,
                project: '',
                description: '',
                tags: [],
                state: 'paused',
                lastUpdated: Date.now(),
                wasInterrupted: false
            };
            return { ...base, tags };
        });
    };
    
    // ----------------- Data State -----------------

    const [unsyncedLogs, setUnsyncedLogs] = React.useState<TimeLog[]>(() => {
        const raw = localStorage.getItem('unsyncedTimeLogs');
        return raw ? JSON.parse(raw) : [];
    });

    const [backendLogs, setBackendLogs] = React.useState<TimeLog[]>([]);
    // backendDistribution is fetched but not used in UI; kept for future analytics expansion
    const [, setBackendDistribution] = React.useState<{project: string, minutes: number}[]>([]);
    const [activity, setActivity] = React.useState<GitHubActivity[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [backendAvailable, setBackendAvailable] = React.useState(true);
    const [dateFilter, setDateFilter] = React.useState<string>('');

    const allLogsOnly = React.useMemo(() => {
        return [...unsyncedLogs, ...backendLogs];
    }, [unsyncedLogs, backendLogs]);

    // Persist local logs
    React.useEffect(() => {
        localStorage.setItem('unsyncedTimeLogs', JSON.stringify(unsyncedLogs));
    }, [unsyncedLogs]);

    // Fetch backend logs & activity
    const fetchData = React.useCallback(async () => {
        try {
            // Parallel fetch
            const [logsRes, dashRes] = await Promise.allSettled([
                axiosClient.get('/time/logs', { withCredentials: true }),
                axiosClient.get('/dashboard', { withCredentials: true })
            ]);

            // Handle Logs
            if (logsRes.status === 'fulfilled') {
                setBackendLogs(logsRes.value.data.recentLogs.map((l: any) => ({ ...l, source: l.source || 'synced' })));
                setBackendDistribution(logsRes.value.data.distribution);
                setBackendAvailable(true);
            } else {
                console.error("Failed to fetch logs", logsRes.reason);
                setBackendAvailable(false);
            }

            // Handle Activity
            if (dashRes.status === 'fulfilled' && dashRes.value.data.github?.recentCommits) {
                const commits = dashRes.value.data.github.recentCommits.map((c: any) => ({
                    id: c.id,
                    repo: c.repo,
                    message: c.message,
                    timestamp: c.timestamp,
                    type: 'commit' as const
                }));
                setActivity(commits);
            }

        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Sync unsynced logs
    React.useEffect(() => {
        if (backendAvailable && unsyncedLogs.length > 0) {
            const sync = async () => {
                const remaining: TimeLog[] = [];
                for (const log of unsyncedLogs) {
                    try {
                        await axiosClient.post('/time/logs', log, { withCredentials: true });
                    } catch {
                        remaining.push(log);
                    }
                }
                if (remaining.length !== unsyncedLogs.length) {
                    setUnsyncedLogs(remaining);
                    fetchData();
                    toast.success('Synced offline logs');
                }
            };
            sync();
        }
    }, [backendAvailable, fetchData, unsyncedLogs]); 

    // ----------------- Actions -----------------

    const saveLog = async (newLog: TimeLog) => {
        // Optimistic UI
        setUnsyncedLogs(prev => [newLog, ...prev]);

        // Try to save to backend
        try {
            await axiosClient.post('/time/logs', newLog, { withCredentials: true });
            fetchData(); 
        } catch {
            console.log("Backend offline, saving locally");
            toast.info("Backend offline. Saved locally.");
        }
    };

    const handleSave = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        // Finalize calculation
        let finalSeconds = seconds;
        if (activeSession?.state === 'running' && activeSession.startTime) {
            finalSeconds = activeSession.accumulatedSeconds + Math.floor((Date.now() - activeSession.startTime) / 1000);
        }

        if (finalSeconds === 0) return;

        const mins = Math.max(1, Math.round(finalSeconds / 60));
        
        // Strict Deep Work: >= 50 mins AND no interruptions (pauses)
        const isDeepWork = mins >= 50 && !activeSession?.wasInterrupted; 

        const newLog: TimeLog = {
            id: crypto.randomUUID(),
            project: activeSession?.project || 'Untitled Project',
            description: activeSession?.description || 'No description',
            minutes: mins,
            date: new Date().toISOString().split('T')[0],
            startTime: activeSession?.startTime ? new Date(activeSession.startTime).toISOString() : undefined, // Approximation for start
            endTime: new Date().toISOString(),
            source: 'local',
            isDeepWork,
            tags: activeSession?.tags || []
        };

        if (checkOverlap(newLog, allLogsOnly)) {
            toast.error("Time overlap detected! Please adjust times.");
            return;
        }

        // Clear Session
        setActiveSession(null);
        setSeconds(0);

        await saveLog(newLog);
    };

    // ----------------- Manual Entry -----------------
    const [isManualOpen, setIsManualOpen] = React.useState(false);
    const [manualEntry, setManualEntry] = React.useState({
        project: '',
        description: '',
        tags: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: ''
    });

    const handleManualSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!manualEntry.startTime || !manualEntry.endTime) {
            toast.error("Please enter start and end times");
            return;
        }

        const start = new Date(`${manualEntry.date}T${manualEntry.startTime}`);
        const end = new Date(`${manualEntry.date}T${manualEntry.endTime}`);

        if (end <= start) {
            toast.error("End time must be after start time");
            return;
        }

        const diffMs = end.getTime() - start.getTime();
        const mins = Math.round(diffMs / 60000);

        const newLog: TimeLog = {
            id: crypto.randomUUID(),
            project: manualEntry.project || 'Manual Entry',
            description: manualEntry.description || 'Manual Time Log',
            minutes: mins,
            date: manualEntry.date,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            source: 'manual',
            isDeepWork: mins >= 50,
            tags: manualEntry.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        if (checkOverlap(newLog, allLogsOnly)) {
            toast.error("Time overlap detected! Please adjust times.");
            return;
        }

        await saveLog(newLog);
        setIsManualOpen(false);
        setManualEntry({
            project: '',
            description: '',
            tags: '',
            date: new Date().toISOString().split('T')[0],
            startTime: '',
            endTime: ''
        });
        toast.success("Manual entry added");
    };

    // ----------------- History & Overlap Detection -----------------

    const groupedTimeline = React.useMemo(() => {
        const logs: TimelineItem[] = [...unsyncedLogs, ...backendLogs].map(l => ({ ...l, type: 'log' }));
        let combined = [...logs, ...activity];

        if (dateFilter) {
            combined = combined.filter(item => {
                const d = item.type === 'log' ? item.date : new Date(item.timestamp).toISOString().split('T')[0];
                return d === dateFilter;
            });
        }

        // Sort by timestamp desc
        combined.sort((a, b) => {
            const timeA = a.type === 'log' 
                ? (a.startTime ? new Date(a.startTime).getTime() : new Date(a.date).getTime())
                : new Date(a.timestamp).getTime();
            const timeB = b.type === 'log'
                ? (b.startTime ? new Date(b.startTime).getTime() : new Date(b.date).getTime())
                : new Date(b.timestamp).getTime();
            return timeB - timeA;
        });

        // Group by Date
        const groups: Record<string, TimelineItem[]> = {};
        combined.forEach(item => {
            const dateStr = item.type === 'log' 
                ? item.date 
                : new Date(item.timestamp).toISOString().split('T')[0];
            
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(item);
        });
        return groups;
    }, [unsyncedLogs, backendLogs, activity, dateFilter]);

    const checkOverlap = (current: TimeLog, all: TimeLog[]) => {
        if (!current.startTime || !current.endTime) return false;
        const currentStart = new Date(current.startTime).getTime();
        const currentEnd = new Date(current.endTime).getTime();

        return all.some(other => {
            if (other.id === current.id) return false;
            if (!other.startTime || !other.endTime) return false;
            const otherStart = new Date(other.startTime).getTime();
            const otherEnd = new Date(other.endTime).getTime();
            
            return (currentStart < otherEnd && currentEnd > otherStart);
        });
    };

    const distribution = React.useMemo(() => {
        const logs = dateFilter 
            ? allLogsOnly.filter(l => l.date === dateFilter)
            : allLogsOnly;

        const dist: Record<string, number> = {};
        logs.forEach(l => {
            dist[l.project] = (dist[l.project] || 0) + l.minutes;
        });

        return Object.entries(dist).map(([name, value]) => ({ name, value }));
    }, [unsyncedLogs, backendLogs, dateFilter]);

    const projectValue = activeSession?.project || '';
    const descriptionValue = activeSession?.description || '';
    const isRunning = activeSession?.state === 'running';

    const metrics = React.useMemo(() => {
        const logs = dateFilter 
            ? allLogsOnly.filter(l => l.date === dateFilter)
            : allLogsOnly;
        
        const totalMinutes = logs.reduce((acc, l) => acc + l.minutes, 0);
        const deepWorkLogs = logs.filter(l => l.isDeepWork);
        const deepWorkMinutes = deepWorkLogs.reduce((acc, l) => acc + l.minutes, 0);
        const deepWorkSessions = deepWorkLogs.length;
        const sessionCount = logs.length;
        
        const projectCounts: Record<string, number> = {};
        logs.forEach(l => { projectCounts[l.project] = (projectCounts[l.project] || 0) + l.minutes; });
        const topProject = Object.entries(projectCounts).sort((a, b) => b[1] - a[1])[0];

        return { totalMinutes, deepWorkMinutes, deepWorkSessions, sessionCount, topProject: topProject ? topProject[0] : 'N/A' };
    }, [allLogsOnly, dateFilter]);

    return (
        <>
            <SectionTitle title="Time Tracking" subtitle="Track your focus time without distractions" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timer / Logger */}
                <Card className="p-8 h-fit lg:col-span-1 shadow-sm border-border">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-semibold text-foreground">Focus Timer</h3>
                        <Badge variant={isRunning ? 'primary' : 'outline'}>
                            {isRunning ? 'Live' : 'Ready'}
                        </Badge>
                    </div>

                    <div className={`flex flex-col items-center justify-center py-10 mb-8 border border-dashed rounded-xl transition-colors ${isRunning ? 'border-primary/50 bg-primary/5' : 'border-border bg-secondary/30'}`}>
                        <span className="text-5xl font-mono font-bold text-foreground mb-3">{formattedTime}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                            {isRunning ? 'Tracking...' : activeSession?.state === 'paused' ? 'Paused' : 'Session Time'}
                        </span>
                    </div>

                    <form className="space-y-5" onSubmit={handleSave}>
                        <Input 
                            label="Project" 
                            placeholder="e.g. daily-sync" 
                            value={projectValue}
                            onChange={(e: any) => handleUpdateDetails('project', e.target.value)}
                        />
                        <div>
                            <Input 
                                label="Description" 
                                placeholder="What are you working on?" 
                                value={descriptionValue}
                                onChange={(e: any) => handleUpdateDetails('description', e.target.value)}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {QUICK_TEMPLATES.map(t => (
                                    <Badge 
                                        key={t.label} 
                                        variant="outline" 
                                        className="cursor-pointer hover:bg-secondary/50 text-[10px] py-1 px-2 border-dashed"
                                        onClick={() => handleUpdateDetails('description', t.description)}
                                    >
                                        + {t.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Input 
                            label="Tags" 
                            placeholder="frontend, bugfix (comma separated)" 
                            value={activeSession?.tags?.join(', ') || ''}
                            onChange={(e: any) => handleUpdateTags(e.target.value)}
                        />
                        
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {isRunning ? (
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    onClick={handlePause}
                                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10">
                                    <Pause size={16} /> Pause
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    className="w-full gap-2"
                                    onClick={handleStart}
                                >
                                    <Play size={16} fill="currentColor" /> 
                                    {seconds > 0 ? 'Resume' : 'Start'}
                                </Button>
                            )}
                            
                            <Button
                                type="submit"
                                className="w-full gap-2"
                                variant={seconds > 0 ? "primary" : "ghost"}
                                disabled={seconds === 0}
                            >
                                <Save size={16} />
                                Save
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border">
                        <Button variant="outline" className="w-full gap-2" onClick={() => setIsManualOpen(true)}>
                            <Plus size={16} /> Add Manual Entry
                        </Button>
                    </div>
                </Card>

                <div className="lg:col-span-2 space-y-8">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Time</p>
                            <p className="text-2xl font-mono font-bold text-foreground mt-1">{Math.floor(metrics.totalMinutes / 60)}h {metrics.totalMinutes % 60}m</p>
                        </Card>
                        <Card className="p-4 border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Deep Work</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-mono font-bold text-foreground">{Math.floor(metrics.deepWorkMinutes / 60)}h {metrics.deepWorkMinutes % 60}m</p>
                                <span className="text-xs text-muted-foreground">({metrics.deepWorkSessions} sess)</span>
                            </div>
                        </Card>
                        <Card className="p-4 border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Sessions</p>
                            <p className="text-2xl font-mono font-bold text-foreground mt-1">{metrics.sessionCount}</p>
                        </Card>
                        <Card className="p-4 border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Top Project</p>
                            <p className="text-xl font-medium text-foreground mt-1 truncate" title={metrics.topProject}>{metrics.topProject}</p>
                        </Card>
                    </div>

                    {/* Analytics */}
                    <Card className="p-8 shadow-sm border-border">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-semibold text-foreground">Time Distribution</h3>
                            {!backendAvailable && (
                                <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-900/10 dark:border-orange-900/30">
                                    <RefreshCw size={12} className="mr-1" /> Offline Mode
                                </Badge>
                            )}
                        </div>
                        
                        {loading && allLogsOnly.length === 0 ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                <p>Loading...</p>
                            </div>
                        ) : allLogsOnly.length === 0 ? (
                            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                                <p>Start a timer or log a session to see tracked time.</p>
                            </div>
                        ) : (
                            <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            stroke="var(--background)"
                                            strokeWidth={2}
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={theme === 'dark' ? ['#E5E7EB', '#9CA3AF', '#4B5563', '#1F2937'][index % 4] : COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>

                    {/* Timeline History */}
                    <Card className="shadow-sm border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <h3 className="font-semibold text-foreground">Timeline History</h3>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="date" 
                                        value={dateFilter}
                                        onChange={(e: any) => setDateFilter(e.target.value)}
                                        className="h-8 w-auto text-xs py-1"
                                    />
                                    {dateFilter && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setDateFilter('')}
                                            className="h-8 px-2 text-xs"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <Badge variant="neutral" className="text-xs">
                                {Object.values(groupedTimeline).flat().filter(i => i.type === 'log').length} Sessions
                            </Badge>
                        </div>

                        {loading && Object.keys(groupedTimeline).length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">Loading...</p>
                        ) : Object.keys(groupedTimeline).length === 0 ? (
                            <p className="p-6 text-sm text-muted-foreground">
                                No sessions logged yet.
                            </p>
                        ) : (
                            <div className="max-h-[600px] overflow-y-auto">
                                {Object.entries(groupedTimeline).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, items]) => (
                                    <div key={date}>
                                        <div className="bg-secondary/30 px-6 py-2 border-y border-border flex items-center gap-2 sticky top-0 backdrop-blur-sm z-10">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-border">
                                            {items.map(item => {
                                                if (item.type === 'commit') {
                                                    return (
                                                        <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-secondary/10 transition-colors opacity-75">
                                                            <div className="mt-1">
                                                                <GitCommit size={16} className="text-muted-foreground" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-foreground">{item.message}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-muted-foreground font-mono">{item.repo}</span>
                                                                    <span className="text-[10px] text-muted-foreground border border-border px-1.5 rounded-full">Activity Context</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                // TimeLog Item
                                                const log = item as TimeLog & { type: 'log' };
                                                const isOverlap = checkOverlap(log, allLogsOnly);
                                                return (
                                                    <div key={log.id} className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors group">
                                                        <div className="flex-1 min-w-0 mr-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-medium text-foreground text-sm truncate">{log.project}</p>
                                                                {log.tags && log.tags.length > 0 && log.tags.map(tag => (
                                                                    <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1 bg-secondary/50">#{tag}</Badge>
                                                                ))}
                                                                {log.isDeepWork && (
                                                                    <Badge variant="gold" className="text-[10px] h-4 px-1">Deep Work</Badge>
                                                                )}
                                                                {isOverlap && (
                                                                    <Badge variant="warning" className="text-[10px] h-4 px-1 gap-1 text-orange-600 bg-orange-100 border-orange-200">
                                                                        <AlertTriangle size={8} /> Overlap
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">{log.description}</p>
                                                            {log.startTime && log.endTime && (
                                                                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                                                    <Clock size={10} />
                                                                    <span>
                                                                        {new Date(log.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                                                        {new Date(log.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-right whitespace-nowrap">
                                                            <p className="font-mono text-sm font-semibold text-foreground">{log.minutes}m</p>
                                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                                <Badge variant={log.source === 'synced' ? 'outline' : log.source === 'manual' ? 'primary' : 'neutral'} className="text-[10px] h-5 px-1.5 capitalize">
                                                                    {log.source}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Manual Entry Modal */}
            <Modal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} title="Manual Time Entry">
                <form onSubmit={handleManualSave} className="space-y-4">
                    <Input 
                        label="Project" 
                        placeholder="Project name"
                        value={manualEntry.project}
                        onChange={(e: any) => setManualEntry({...manualEntry, project: e.target.value})}
                        required
                    />
                    <Input 
                        label="Description" 
                        placeholder="What did you do?"
                        value={manualEntry.description}
                        onChange={(e: any) => setManualEntry({...manualEntry, description: e.target.value})}
                    />
                    <Input 
                        label="Tags" 
                        placeholder="frontend, bugfix (comma separated)"
                        value={manualEntry.tags}
                        onChange={(e: any) => setManualEntry({...manualEntry, tags: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Date" 
                            type="date"
                            value={manualEntry.date}
                            onChange={(e: any) => setManualEntry({...manualEntry, date: e.target.value})}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Start Time" 
                            type="time"
                            value={manualEntry.startTime}
                            onChange={(e: any) => setManualEntry({...manualEntry, startTime: e.target.value})}
                            required
                        />
                        <Input 
                            label="End Time" 
                            type="time"
                            value={manualEntry.endTime}
                            onChange={(e: any) => setManualEntry({...manualEntry, endTime: e.target.value})}
                            required
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsManualOpen(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Add Log
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
