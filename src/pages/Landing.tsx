import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, GitBranch, GitCommit, Sparkles, Zap, 
  BarChart2, Clock, CheckCircle2, Layout, Github, Command
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui/UIComponents';

// --- MOCK COMPONENTS FOR HERO VISUALIZATION ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MockStatCard = ({ label, value, icon: Icon, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, duration: 0.6, type: "spring" }}
    className="glass-panel p-4 rounded-xl flex items-center gap-3 absolute"
    style={{ ...color }} // Position passed via style props in parent
  >
    <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center text-foreground shadow-inner">
      <Icon size={18} />
    </div>
    <div>
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
    </div>
  </motion.div>
);

const MockGraphCard = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8 }}
    className="glass-panel w-full max-w-lg aspect-video rounded-2xl p-6 relative overflow-hidden shadow-2xl"
  >
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-border"></div>
        <div className="w-3 h-3 rounded-full bg-border"></div>
      </div>
      <div className="h-2 w-20 bg-border rounded-full"></div>
    </div>
    <div className="flex items-end gap-2 h-32 px-2">
      {[30, 45, 35, 60, 50, 75, 55, 80, 70, 90, 65, 85].map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ delay: i * 0.05 + 0.5, duration: 0.5 }}
          className="flex-1 bg-foreground/10 rounded-t-sm hover:bg-[#D5C49F] transition-colors duration-300"
        ></motion.div>
      ))}
    </div>
    {/* Floating Tag */}
    <motion.div 
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className="absolute top-1/2 right-8 bg-[#D5C49F] text-[#0F0F0F] px-3 py-1 rounded-full text-xs font-bold shadow-lg"
    >
      +18% Growth
    </motion.div>
  </motion.div>
);

export default function Landing() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
//   const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);


  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground font-sans selection:bg-[#D5C49F]/30 overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="fixed w-full z-50 top-0 bg-background/60 backdrop-blur-xl border-b border-white/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Command size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">DailySync</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <NavLink to="/demo" className="hover:text-foreground transition-colors">Demo</NavLink>
            <a href="#" className="hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <NavLink to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Log in
            </NavLink>
            <NavLink to="/auth/register">
              <Button size="sm" variant="primary" className="rounded-full px-6">Get Started</Button>
            </NavLink>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        
        {/* 2. HERO SECTION */}
        <section className="px-6 min-h-[90vh] flex flex-col justify-center relative">
          {/* Background Glows */}
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-[#D5C49F]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
            
            {/* Left: Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 text-center lg:text-left"
            >
              <Badge variant="gold" className="rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold">
                New: AI Summary Engine 2.0
              </Badge>

              <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.05] text-foreground">
                Your Coding Week.<br/>
                <span className="text-muted-foreground">Fully Understood.</span><br/>
                <span className="text-[#D5C49F]">Automatically.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                GitHub analytics, coding time, streaks, focus patterns, and AI insights — all in one premium dashboard made for developers.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <NavLink to="/demo">
                  <Button size="lg" variant="gold" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                    Try Demo Mode <ArrowRight size={18} className="ml-2" />
                  </Button>
                </NavLink>
                <NavLink to="/auth/register">
                  <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg gap-2 w-full sm:w-auto bg-background/50 backdrop-blur-md">
                    <Github size={20} /> Connect GitHub
                  </Button>
                </NavLink>
              </div>
            </motion.div>

            {/* Right: Floating Glass Visualization */}
            <div className="relative h-[500px] w-full hidden lg:block perspective-[2000px]">
              <motion.div style={{ y: y1 }} className="absolute inset-0 flex items-center justify-center">
                
                {/* Main Graph Card */}
                <div className="relative z-10">
                  <MockGraphCard />
                </div>

                {/* Floating Widgets */}
                <MockStatCard 
                  label="Current Streak" 
                  value="12 Days" 
                  icon={Zap} 
                  delay={1.0}
                  color={{ top: '-40px', left: '-20px', zIndex: 20 }}
                />
                <MockStatCard 
                  label="Coding Time" 
                  value="34h 12m" 
                  icon={Clock} 
                  delay={1.2}
                  color={{ bottom: '40px', right: '-40px', zIndex: 20 }}
                />
                <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 1.4 }}
                   className="absolute top-10 right-0 glass-panel p-4 rounded-xl max-w-[200px] z-0 opacity-80"
                >
                   <div className="flex gap-2 mb-2">
                      <Sparkles size={16} className="text-[#D5C49F]" />
                      <span className="text-xs font-bold text-[#D5C49F] uppercase">AI Insight</span>
                   </div>
                   <div className="h-2 w-full bg-foreground/10 rounded-full mb-2"></div>
                   <div className="h-2 w-2/3 bg-foreground/10 rounded-full"></div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. VALUE BLOCK */}
        <section className="px-6 py-24 relative z-20">
           <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
              <ValueCard 
                icon={BarChart2}
                title="Real Developer Analytics"
                desc="See daily commits, streaks, repo focus, and productivity rhythm."
              />
              <ValueCard 
                icon={Sparkles}
                title="AI-Powered Weekly Summary"
                desc="Personalized insights that explain your coding week like a mentor."
              />
              <ValueCard 
                icon={Github}
                title="Zero Setup. Just Connect."
                desc="No integrations, no configuration. Your week appears instantly."
              />
           </div>
        </section>

        {/* 4. DEMO PREVIEW (Slider) */}
        <section className="py-32 overflow-hidden bg-secondary/30 border-y border-border">
           <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
              <div>
                 <h2 className="text-3xl font-semibold tracking-tight">Interactive Preview</h2>
                 <p className="text-muted-foreground mt-2">See exactly what you get.</p>
              </div>
              <div className="flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#D5C49F]"></div>
                 <div className="w-2 h-2 rounded-full bg-border"></div>
                 <div className="w-2 h-2 rounded-full bg-border"></div>
              </div>
           </div>
           
           {/* Horizontal Scroll Area */}
           <div className="flex gap-8 px-6 overflow-x-auto pb-12 snap-x snap-mandatory no-scrollbar max-w-[100vw]">
              <div className="snap-center shrink-0 w-[70vw] md:w-[400px]">
                 <Card variant="glass" className="h-[300px] p-6 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D5C49F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-center space-y-3">
                       <GitCommit size={40} className="mx-auto text-[#D5C49F]" />
                       <h3 className="text-lg font-bold">Commit Activity</h3>
                       <p className="text-sm text-muted-foreground">Visualized by hour and repository.</p>
                    </div>
                 </Card>
              </div>
              <div className="snap-center shrink-0 w-[70vw] md:w-[400px]">
                 <Card variant="glass" className="h-[300px] p-6 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D5C49F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-center space-y-3">
                       <Sparkles size={40} className="mx-auto text-[#D5C49F]" />
                       <h3 className="text-lg font-bold">AI Insights</h3>
                       <p className="text-sm text-muted-foreground">Natural language summaries of your work.</p>
                    </div>
                 </Card>
              </div>
              <div className="snap-center shrink-0 w-[70vw] md:w-[400px]">
                 <Card variant="glass" className="h-[300px] p-6 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D5C49F]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-center space-y-3">
                       <Zap size={40} className="mx-auto text-[#D5C49F]" />
                       <h3 className="text-lg font-bold">Focus Streaks</h3>
                       <p className="text-sm text-muted-foreground">Gamified consistency tracking.</p>
                    </div>
                 </Card>
              </div>
           </div>
        </section>

        {/* 5. FEATURE GRID */}
        <section id="features" className="px-6 py-32">
           <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <FeatureCard icon={GitBranch} title="Commit Tracking" desc="Granular history of every push." />
                 <FeatureCard icon={Layout} title="Repo Insights" desc="Identify your most active projects." />
                 <FeatureCard icon={Zap} title="Streak & Consistency" desc="Build a daily coding habit." />
                 <FeatureCard icon={Clock} title="Coding Time Analytics" desc="Track deep work sessions." />
                 <FeatureCard icon={Sparkles} title="AI Developer Summary" desc="Auto-generated weekly reports." />
                 <FeatureCard icon={CheckCircle2} title="Pattern Detection" desc="Know your peak productive hours." />
              </div>
           </div>
        </section>

        {/* 6. THE WHY */}
        <section className="px-6 py-24 bg-card border-y border-border">
           <div className="max-w-4xl mx-auto text-center space-y-12">
              <h2 className="text-4xl font-semibold tracking-tight">Made for Developers Who Care About Growth</h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                 <div className="space-y-3">
                    <div className="w-8 h-8 rounded-full bg-[#D5C49F] flex items-center justify-center text-[#0F0F0F] font-bold">1</div>
                    <h4 className="font-semibold text-lg">Real Progress</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">Stop relying on vanity metrics. See actual output patterns and code churn.</p>
                 </div>
                 <div className="space-y-3">
                    <div className="w-8 h-8 rounded-full bg-[#D5C49F] flex items-center justify-center text-[#0F0F0F] font-bold">2</div>
                    <h4 className="font-semibold text-lg">Consistency</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">Visual streaks help you show up every day, even for just 15 minutes.</p>
                 </div>
                 <div className="space-y-3">
                    <div className="w-8 h-8 rounded-full bg-[#D5C49F] flex items-center justify-center text-[#0F0F0F] font-bold">3</div>
                    <h4 className="font-semibold text-lg">Proof of Skill</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">Give recruiters one glance proof of your discipline and technical distribution.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 7. CTA SECTION */}
        <section className="px-6 py-32">
           <div className="max-w-4xl mx-auto relative">
              <div className="absolute inset-0 bg-[#D5C49F]/20 blur-[100px] rounded-full"></div>
              <Card variant="glass" className="relative p-16 text-center space-y-8 border-white/20 dark:border-white/10 shadow-2xl">
                 <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
                    Level up your coding journey.<br/>
                    <span className="text-muted-foreground text-2xl md:text-3xl font-light mt-4 block">One dashboard. Zero effort.</span>
                 </h2>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                    <NavLink to="/demo">
                       <Button size="lg" variant="gold" className="rounded-full h-14 px-10 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1">
                          Start Demo Mode
                       </Button>
                    </NavLink>
                    <NavLink to="/auth/register">
                       <Button variant="outline" size="lg" className="rounded-full h-14 px-10 text-lg border-foreground/20 hover:bg-foreground/5">
                          Connect GitHub
                       </Button>
                    </NavLink>
                 </div>
                 <p className="text-xs text-muted-foreground mt-8 uppercase tracking-widest font-medium">Free for individual developers</p>
              </Card>
           </div>
        </section>

      </main>

      <footer className="border-t border-border py-12 px-6 bg-background">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
                  <Command className="text-background" size={12} />
               </div>
               <span className="font-bold text-sm">DailySync</span>
            </div>
            <div className="text-sm text-muted-foreground flex gap-8">
               <a href="#" className="hover:text-foreground">GitHub</a>
               <a href="#" className="hover:text-foreground">Privacy</a>
               <a href="#" className="hover:text-foreground">Terms</a>
            </div>
            <p className="text-xs text-muted-foreground">Made with ♥</p>
         </div>
      </footer>
    </div>
  );
}

// --- SUBCOMPONENTS ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ValueCard = ({ icon: Icon, title, desc }: any) => (
  <Card variant="glass" className="p-8 hover:-translate-y-2 transition-transform duration-300">
    <div className="w-12 h-12 rounded-xl bg-[#D5C49F]/10 flex items-center justify-center mb-6 text-[#D5C49F]">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{desc}</p>
  </Card>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FeatureCard = ({ icon: Icon, title, desc }: any) => (
  <div className="group p-6 rounded-2xl border border-transparent hover:border-border hover:bg-secondary/30 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-lg bg-background border border-border group-hover:border-[#D5C49F] transition-colors">
        <Icon size={20} className="text-foreground group-hover:text-[#D5C49F] transition-colors" />
      </div>
      <ArrowRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
    </div>
    <h4 className="font-semibold text-lg mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);
