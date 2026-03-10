/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  GitBranch,
  GitCommit,
  Flame,
  BrainCircuit,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, SectionTitle, Button } from '../components/ui/UIComponents';
import { useDashboard } from '../context/Dashboard/UseDashboard';
import { axiosClient } from '../utils/axiosClient';

// --- Local Components ---

const MetricStat = ({ icon: Icon, value, label, trend }: any) => (
  <Card className="p-6 border-border shadow-sm flex items-center justify-between">
    <div>
      <p className="text-3xl font-semibold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
    <div className="text-right">
       <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground mb-1 ml-auto">
          <Icon size={20} />
       </div>
       {trend && <span className="text-xs font-medium text-[#A27D5C]">{trend}</span>}
    </div>
  </Card>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
        <p className="text-xs font-semibold mb-1.5 text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
           <div key={index} className="flex items-center gap-2 text-xs mb-1 last:mb-0">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }}></div>
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-mono font-medium text-foreground">{entry.value}</span>
           </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GithubPage() {
    const dashboard = useDashboard();
    const [refreshing, setRefreshing] = React.useState(false);

    const refreshGithub = async () => {
        try {
            setRefreshing(true)
            await axiosClient.post('/github/sync', {}, {withCredentials: true})
            window.location.reload()
        } finally {
            setRefreshing(false)
        }
    }

    if(dashboard.status === 'loading'){
        return (
            <div className='h-[60vh] flex items-center justify-center text-muted-foreground'>
                Loading Github Insights...
            </div>
        )
    }

    if (dashboard.status === 'needs_github'){
        return(
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-lg font-medium">Connect GitHub to view insights</p>
                <Button onClick={() => (window.location.href = `${import.meta.env.VITE_API_URL}/github/login`)}>
                Connect GitHub
                </Button>
            </div>
        )
    }

    const data = dashboard.data
    const metrics = data.metrics ?? {}

    const hasCommits =
        metrics.weeklyCommits !== undefined &&
        metrics.weeklyCommits > 0

    if (!hasCommits) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">
                    No GitHub activity yet. Sync your account to see stats.
                </p>
                <button
                    onClick={refreshGithub}
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing…' : 'Refresh GitHub'}
                </button>
            </div>
        )
    }

    const activityData = (data.weeklyActivity ?? []).map(d => ({
        name: d.name,
        value: d.commits ?? 0,
    }))

    const codingHourly = data.codingTime?.hourly ?? []
    const codingBarData = codingHourly.map(item => ({
        hour: item.name,
        value: item.value ?? 0,
    }))

    const languages = data.languages ?? []
    const repos = data.repos ?? []

  return (
    <div className="space-y-8">
      {/* 1. Header and Quick Stats */}
      <div>
        <div className="flex items-center justify-between">
            <SectionTitle title="GitHub Intelligence" subtitle="Deep dive into your contribution patterns and code quality." />
            <Button onClick={refreshGithub} disabled={refreshing} variant="outline" className="gap-2">
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Syncing...' : 'Sync Data'}
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
           <MetricStat
             icon={GitCommit}
             value={metrics.weeklyCommits}
             label="Weekly Commits"
           />
           <MetricStat
             icon={Clock}
             value={metrics.codingMinutes}
             label="Coding Minutes"
           />
           <MetricStat
             icon={Flame}
             value={metrics.streakDays}
             label="Day Streak"
           />
           <MetricStat
             icon={GitBranch}
             value={data.github?.reposTouched ?? 0}
             label="Active Repos"
           />
        </div>
      </div>

      {/* 2. Main Activity Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Daily Activity Chart */}
         <Card className="lg:col-span-2 p-8 border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-semibold text-foreground">30-Day Activity</h3>
               <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#A27D5C]"></div> Commits</span>
               </div>
            </div>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  {activityData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Activity data not available yet.
                    </div>
                  ) : (
                  <AreaChart data={activityData}>
                     <defs>
                        <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#A27D5C" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#A27D5C" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                     <XAxis dataKey="name" hide />
                     <Tooltip content={<ChartTooltip />} />
                     <Area
                        type="monotone"
                        dataKey="value"
                        name="Commits"
                        stroke="#A27D5C"
                        strokeWidth={2}
                        fill="url(#colorActivity)"
                     />
                  </AreaChart>
                  )}
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Hourly Rhythm */}
         <Card className="p-8 border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-semibold text-foreground">Coding Rhythm</h3>
               <Badge variant="neutral">{data.codingTime?.peakHourLabel ?? '—'}</Badge>
            </div>
            {codingBarData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                No coding rhythm data available.
                </div>
            ) : 
            (<div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={codingBarData.filter((_, i) => i % 2 === 0)} barSize={12}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="hour" type="category" width={30} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                     <Tooltip content={<ChartTooltip />} />
                     <Bar dataKey="value" name="Minutes" radius={[0, 4, 4, 0]}>
                        {codingBarData.map((entry, index) => (
                           <Cell
                             key={`cell-${index}`}
                             fill={entry.value > 80 ? '#A27D5C' : 'var(--muted-foreground)'}
                             opacity={entry.value > 0 ? 1 : 0.3}
                           />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>)
                    }
         </Card>
      </div>

      {/* 3. Workload & Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Code Churn */}
         <Card className="p-8 border-border shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="font-semibold text-foreground">Code Churn Impact</h3>
               <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#A27D5C]"></div> Added</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-foreground"></div> Deleted</span>
               </div>
            </div>
            {Array.isArray(data.codeChurn) && data.codeChurn.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.codeChurn}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="additions"
                      name="Added"
                      stackId="churn"
                      fill="#A27D5C"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="deletions"
                      name="Deleted"
                      stackId="churn"
                      fill="var(--foreground)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                Code churn data will appear once commit history is analyzed.
              </div>
            )}
         </Card>

         {/* Language Distribution */}
         <Card className="p-8 border-border shadow-sm flex flex-col">
            <h3 className="font-semibold text-foreground mb-2">Tech Stack Distribution</h3>
            <p className="text-sm text-muted-foreground mb-6">Based on GitHub language statistics.</p>
            
            <div className="flex-1 flex items-center justify-center relative">
               {languages.length === 0 ? (
                 <div className="text-sm text-muted-foreground">
                   Language distribution data not available yet.
                 </div>
               ) : (
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={languages}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="percentage"
                        stroke="var(--card)"
                        strokeWidth={2}
                     >
                        {languages.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
               </ResponsiveContainer>
               )}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none pr-20">
                  <div className="text-center">
                     <span className="text-2xl font-bold text-foreground">
                        {data.primaryLanguage ?? '—'}
                     </span>
                     <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Primary</p>
                  </div>
               </div>
            </div>
         </Card>
      </div>

      {/* 4. AI Summary Insight */}
      <Card className="p-1 bg-gradient-to-r from-secondary to-transparent border-border shadow-sm">
         <div className="bg-card p-8 rounded-lg flex flex-col md:flex-row gap-8 items-center">
             <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <BrainCircuit size={32} className="text-[#A27D5C]" />
             </div>
             <div className="flex-1 space-y-4">
                <div>
                   <h3 className="text-lg font-bold text-foreground">Weekly AI Analysis</h3>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                   <p>
                     AI insights will be available in a future update once analysis is enabled.
                   </p>
                </div>
             </div>
             <Button variant="outline" className="shrink-0">View Detailed Report</Button>
         </div>
      </Card>

      {/* 5. Repo Insights */}
         <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">Active Repositories</h3>
            <Button variant="ghost" size="sm">View All</Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.length === 0 ? (
               <p className="text-sm text-muted-foreground col-span-full">
                 Repository insights are not available yet.
               </p>
            ) : (
            repos.map((repo) => (
               <Card key={repo.name} className="p-6 border-border shadow-sm hover:border-foreground/30 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-foreground text-background">
                           <GitBranch size={18} />
                        </div>
                        <div>
                           <h4 className="font-semibold text-foreground text-sm group-hover:underline decoration-1 underline-offset-4">{repo.name}</h4>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-6 pt-4 border-t border-border">
                     <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock size={14} /> {repo.lastActive}
                     </span>
                     <Badge variant="neutral">{repo.commitCount} commits</Badge>
                  </div>
               </Card>
            )))}
         </div>
      </div>
    </div>
  );
}
