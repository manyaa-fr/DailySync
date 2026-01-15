import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, Sparkles, Zap, 
  BarChart2, Clock, Layout, Github, Command,
  Timer, Target, Brain, TrendingUp, Activity
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui/UIComponents';
import { useAuth } from '../auth/useAuth';

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

  async function connectGitHub() {
    window.location.href = "http://localhost:8000/api/v1/github/login";
  }

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

const { isAuthenticated } = useAuth();

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
//   const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  // Smooth scroll for anchor links
  React.useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);


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
            <NavLink to="/features" className="hover:text-foreground transition-colors">Features</NavLink>
            <NavLink to="/app/dashboard?demo=true" className="hover:text-foreground transition-colors">Demo</NavLink>
            <NavLink to="/pricing" className="hover:text-foreground transition-colors">Pricing</NavLink>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
            <NavLink to="/app/dashboard">
                <Button size="sm" variant="primary" className="rounded-full px-6">
                Go to Dashboard
                </Button>
            </NavLink>
            ) : (
            <>
                <NavLink
                to="/auth/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                >
                Log in
                </NavLink>

                <NavLink to="/auth/register">
                <Button size="sm" variant="primary" className="rounded-full px-6">
                    Get Started
                </Button>
                </NavLink>
            </>
            )}
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
                <NavLink to="/app/dashboard?demo=true">
                  <Button size="lg" variant="gold" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto">
                    Try Demo Mode <ArrowRight size={18} className="ml-2" />
                  </Button>
                </NavLink>
                {/* <a href={`${import.meta.env.VITE_APP_BACKEND_URI}/auth/github-login`}> */}
                  <Button onClick={connectGitHub} variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg gap-2 w-full sm:w-auto bg-background/50 backdrop-blur-md">
                    <Github size={20} /> Connect GitHub
                  </Button>
                {/* </a> */}
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

        {/* 3. FEATURED SECTION */}
        <FeaturedSection />

        {/* 4. DEMO PREVIEW SECTION */}
        <DemoSection />

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
                    <NavLink to="/app/dashboard?demo=true">
                       <Button size="lg" variant="gold" className="rounded-full h-14 px-10 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1">
                          Start Demo Mode
                       </Button>
                    </NavLink>
                    {/* <a href={`${import.meta.env.VITE_APP_BACKEND_URI}/auth/github-login`}> */}
                       <Button onClick={connectGitHub} variant="outline" size="lg" className="rounded-full h-14 px-10 text-lg border-foreground/20 hover:bg-foreground/5">
                          Connect GitHub
                       </Button>
                    {/* </a> */}
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

// Demo Section Component
const DemoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleDemoClick = () => {
    window.location.href = '/app/dashboard?demo=true';
  };

const handleFeaturesClick = () => {
    window.location.href = '/features';
};

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section
      id="demo"
      ref={ref}
      className="relative py-32 px-6 overflow-hidden bg-secondary/20 border-y border-border"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
        >
          {/* Left: Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div>
              <div className="inline-flex items-center justify-center mb-4">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                  Product Demo
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">
                See how DailySync turns work into insight
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Experience a real-time view of your coding activity, commit patterns, and productivity metrics. 
                Everything you need to understand your development workflow at a glance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="gold"
                onClick={handleDemoClick}
                className="rounded-full h-14 px-8 text-lg"
              >
                Try Interactive Demo
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <button
                onClick={handleFeaturesClick}
                className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-4"
              >
                View Features
              </button>
            </div>
          </motion.div>

          {/* Right: Demo Preview */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <DashboardPreview />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Dashboard Preview Component
const DashboardPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative"
    >
      <Card
        variant="glass"
        className="overflow-hidden border border-border/50 shadow-2xl"
      >
        {/* Top Bar */}
        <div className="h-12 bg-background/80 border-b border-border/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
          </div>
          <div className="text-xs font-medium text-muted-foreground">DailySync Dashboard</div>
          <div className="w-16"></div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-16 bg-background/60 border-r border-border/50 p-3 flex flex-col gap-3">
            {[Layout, BarChart2, Clock, Sparkles].map((Icon, i) => (
              <motion.div
                key={i}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={cardVariants}
                transition={{ delay: i * 0.1 }}
                className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/30"
              >
                <Icon size={18} className="text-muted-foreground" />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Today", value: "4h 32m", icon: Timer },
                { label: "This Week", value: "28h 15m", icon: Activity },
                { label: "Streak", value: "12 days", icon: Zap },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={cardVariants}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card variant="glass" className="p-4 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                      <stat.icon size={14} className="text-muted-foreground" />
                    </div>
                    <div className="text-lg font-semibold text-foreground">{stat.value}</div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Chart Card */}
            <motion.div
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={cardVariants}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass" className="p-6 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Commit Activity</h3>
                  <TrendingUp size={16} className="text-muted-foreground" />
                </div>
                <div className="h-32 flex items-end gap-2">
                  {[45, 60, 55, 75, 65, 80, 70, 85, 75, 90, 80, 88].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={isInView ? { height: `${height}%` } : { height: 0 }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.4, ease: "easeOut" }}
                      className="flex-1 bg-accent/30 rounded-t-sm hover:bg-accent/50 transition-colors"
                    />
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Bottom Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Top Repos", icon: Github },
                { title: "Focus Time", icon: Clock },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  variants={cardVariants}
                  transition={{ delay: (i + 4) * 0.1 }}
                >
                  <Card variant="glass" className="p-4 border border-border/30">
                    <div className="flex items-center gap-2 mb-3">
                      <item.icon size={16} className="text-muted-foreground" />
                      <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-2 bg-secondary/50 rounded-full" />
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// --- SUBCOMPONENTS ---

// Premium Featured Section Component
const FeaturedSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Timer,
      title: "Smart Time Tracking",
      description: "Automatically tracks coding time with focus-aware detection. Understand your deep work patterns and optimize productivity.",
    },
    {
      icon: Github,
      title: "GitHub Integration",
      description: "Seamless connection to your repositories. Real-time activity tracking, commit analysis, and repository insights.",
    },
    {
      icon: Brain,
      title: "AI Weekly Summary",
      description: "Get intelligent progress insights every week. Understand your coding patterns, strengths, and areas for growth.",
    },
    {
      icon: Target,
      title: "Goal & Task Monitoring",
      description: "Set clear objectives and track progress. Maintain accountability with visual progress indicators and milestone tracking.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section 
      ref={ref}
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Why DailySync
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
            Built for Serious Developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional-grade analytics that help you understand and improve your coding workflow.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <PremiumFeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Premium Feature Card Component
interface PremiumFeatureCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variants: any;
}

const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  variants,
}) => {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group"
    >
      <Card
        variant="glass"
        className="h-full p-6 md:p-8 border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg"
      >
        {/* Icon Container */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center group-hover:border-accent/30 transition-colors duration-300">
            <Icon size={22} className="text-foreground group-hover:text-accent transition-colors duration-300" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-foreground mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </Card>
    </motion.div>
  );
};