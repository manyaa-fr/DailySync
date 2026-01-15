/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Brush
} from 'recharts';
import { 
  GitCommit, 
  Clock, 
  Flame, 
  Zap, 
  ArrowUpRight, 
  GitBranch, 
  RefreshCw, 
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../components/ui/UIComponents';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/Dashboard/UseDashboard';

// --- Dashboard Components ---

const MetricCard = ({ title, value, subtext, icon: Icon, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <Card className="p-6 h-full flex flex-col justify-between bg-card border-border shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-lg bg-secondary text-foreground">
          <Icon size={20} />
        </div>
        {subtext && (
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowUpRight size={12} /> {subtext}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-semibold text-foreground">{value}</h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">{title}</p>
      </div>
    </Card>
  </motion.div>
)

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
      <p className="text-xs font-semibold mb-1.5 text-foreground">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: entry.stroke || entry.fill }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-mono font-medium text-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const dashboard = useDashboard();
  const navigate = useNavigate();

if (dashboard.status === 'loading') {
  return (
    <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
      Loading dashboard…
    </div>
  );
}

if (dashboard.status === 'needs_github') {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <p className="text-lg font-medium">Connect your GitHub to continue</p>
      <Button onClick={() => (window.location.href = '/api/auth/github')}>
        Connect GitHub
      </Button>
    </div>
  );
}

const data = dashboard.data;

  const weeklyChartData = data.weeklyActivity.map(d => ({
    name: d.name,
    value: d.commits,
    secondary: d.minutes
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Weekly Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title = "Weekly Commits" 
          value = {data.metrics.weeklyCommits}
          icon = {GitCommit}
        />
        <MetricCard 
          title = "Coding Minutes" 
          value = {data.metrics.codingMinutes}
          icon = {Clock}
        />
        <MetricCard 
          title = "Day Streak" 
          value = {data.metrics.streakDays}
          icon = {Flame}
        />
        <MetricCard 
          title = "AI Score" 
          value = {data.metrics.aiScore}
          icon = {Zap}
        />
      </div>

      {/* 2. Weekly Progress Chart */}
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4 }}
      >
        <Card className="p-8 shadow-sm border-border">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">Weekly Progress</h3>
                <p className="text-base text-muted-foreground mt-1">Commits vs Coding Minutes</p>
             </div>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                   <span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-line-1)]"></span> Commits
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                   <span className="w-2.5 h-2.5 rounded-full bg-[var(--chart-line-2)]"></span> Minutes
                </div>
             </div>
          </div>
          
          {weeklyChartData.length === 0 ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No activity data available yet.
              </p>
            </div>
          ) : 
          (<div  style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-line-1)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--chart-line-1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }} />
                
                {/* Brush for Zoom/Pan */}
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="var(--chart-line-2)" 
                  fill="var(--background)" 
                  tickFormatter={() => ''}
                  className="opacity-50"
                />

                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="Commits"
                  stroke="var(--chart-line-1)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorWarm)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--chart-line-1)', stroke: 'var(--background)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="secondary" 
                  name="Minutes"
                  stroke="var(--chart-line-2)" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  fill="transparent" 
                  activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--chart-line-2)', stroke: 'var(--background)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>)}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. GitHub Quick View */}
        <motion.div
           initial={{ opacity: 0, x: -10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5 }}
           className="h-full"
        >
          <Card className="h-full flex flex-col shadow-sm border-border">
             <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <GitBranch className="text-muted-foreground" size={18} />
                   <h3 className="font-semibold text-foreground">GitHub Quick View</h3>
                </div>
                <Badge variant="outline">{data.meta.source}</Badge>
             </div>
             
             {/* Mini Sparkline + Stats */}
             <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-secondary/30">
                <div className="p-6">
                  <div  style={{ width: '100%', height: 48 }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyChartData}>
                           <Line 
                             type="monotone" 
                             dataKey="value" 
                             stroke="var(--chart-line-1)" 
                             strokeWidth={2} 
                             dot={false} 
                           />
                           <Tooltip content={<ChartTooltip />} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-muted-foreground">Most Active: <span className="text-foreground font-medium">Thursday</span></p>
                </div>
                <div className="p-6 flex flex-col justify-center items-center">
                   <p className="text-3xl font-bold text-foreground">4</p>
                   <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Repos Touched</p>
                </div>
             </div>

             {/* Recent Commits List */}
             <div className="flex-1 p-0">
                { data.github.recentCommits.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">
                  No recent commits available.
                </p>
              ) :
                (data.github.recentCommits.slice(0, 3).map((commit  ) => (
                   <div key={commit.id} className="p-4 flex items-center gap-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-[#A27D5C] flex-shrink-0 mt-1 self-start"></div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-medium truncate text-foreground">{commit.message}</p>
                         <p className="text-xs text-muted-foreground mt-0.5">{commit.repo} • {commit.timestamp}</p>
                      </div>
                   </div>
                )))}
             </div>
          </Card>
        </motion.div>

        {/* 4. Coding Time Snapshot */}
        <motion.div
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5 }}
        >
          <Card className="h-full p-8 flex flex-col shadow-sm border-border">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-semibold text-foreground">Coding Time Snapshot</h3>
                <Badge variant="primary">Peak: {data.codingTime.peakHourLabel}</Badge>
             </div>

             {data.codingTime.hourly.length === 0 ? (
                <div className="min-h-[200px] flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No coding time data available.
                  </p>
                </div>
              ) : (
             <div style={{flex: 1, width: '100%',height: 200}}>
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data.codingTime.hourly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.4} />
                      <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
                      />
                      <Tooltip 
                         cursor={{fill: 'var(--secondary)', opacity: 0.3}}
                         content={<ChartTooltip />}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         {data.codingTime.hourly.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.value > 80 ? 'var(--chart-line-1)' : 'var(--muted-foreground)'} 
                            />
                         ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>)}
             
             <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4">
                <div>
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Daily Average</p>
                   <p className="text-3xl font-semibold text-foreground mt-1">{data.codingTime.dailyAverageMinutes}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Most Productive</p>
                   <p className="text-3xl font-semibold text-[#A27D5C] mt-1">{data.codingTime.mostProductiveTime}</p>
                </div>
             </div>
          </Card>
        </motion.div>
      </div>

      {/* 5. AI Summary Preview */}
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.6 }}
      >
        <Card className="relative overflow-hidden border-border bg-secondary/30 shadow-sm">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#A27D5C]"></div>
           <div className="p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-2 text-[#A27D5C] font-medium mb-1">
                    <Sparkles size={18} />
                    <span className="uppercase tracking-wide text-xs font-bold">This Week's AI Insight</span>
                 </div>
                 {data.aiInsight.title && data.aiInsight.summary ? (
                    <>
                      <h3 className="text-xl font-semibold text-foreground">
                        {data.aiInsight.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {data.aiInsight.summary}
                      </p>
                      <Button className="shrink-0 gap-2 shadow-sm border-0" onClick={() => navigate('/app/aiinsight')} variant="primary">
                          View Full Summary <ArrowUpRight size={16} />
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      AI insights will appear here once enough activity data is available.
                    </p>
                  )}
              </div>
           </div>
        </Card>
      </motion.div>

      {/* 6. Quick Actions Row */}
      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.7 }}
         className="flex flex-wrap gap-4 pt-2"
      >
        <NavLink to="/app/time">
           <Button variant="outline" className="gap-2 h-12">
              <Clock size={16} /> Log Coding Time
           </Button>
        </NavLink>
        <Button variant="outline" className="gap-2 h-12">
           <RefreshCw size={16} /> Refresh GitHub
        </Button>
        <NavLink to="/app/aiinsight">
           <Button variant="outline" className="gap-2 h-12">
              <Sparkles size={16} /> Generate AI Summary
           </Button>
        </NavLink>
      </motion.div>
    </div>
  );
}