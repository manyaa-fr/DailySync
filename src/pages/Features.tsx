import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import {
  Timer, Github, Brain, Target, BarChart2, Clock,
  TrendingUp, Activity, Zap, CheckCircle2, Layout,
  GitBranch, GitCommit, Sparkles, Command, ArrowRight,
  Calendar, PieChart, LineChart, Users, Settings
} from 'lucide-react';
import { Button, Card } from '../components/ui/UIComponents';

const categories = [
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'integrations', label: 'Integrations', icon: Github },
  { id: 'ai-insights', label: 'AI Insights', icon: Brain },
  { id: 'planning', label: 'Planning & Goals', icon: Target },
];

const features = {
  productivity: [
    {
      icon: Timer,
      title: 'Smart Time Tracking',
      description: 'Automatically tracks coding time with focus-aware detection. Understand when you do your best work and optimize your schedule accordingly.',
      highlight: true,
    },
    {
      icon: Activity,
      title: 'Focus Sessions',
      description: 'Identify deep work periods and maintain flow state. Get notified when you enter peak productivity zones.',
    },
    {
      icon: Zap,
      title: 'Streak Tracking',
      description: 'Build consistent coding habits with visual streak indicators. Maintain momentum with daily activity goals.',
    },
    {
      icon: CheckCircle2,
      title: 'Task Completion',
      description: 'Track completed tasks and milestones. See your progress over time with detailed completion analytics.',
    },
  ],
  analytics: [
    {
      icon: BarChart2,
      title: 'Commit Analytics',
      description: 'Comprehensive analysis of your commit patterns, frequency, and distribution across repositories.',
      highlight: true,
    },
    {
      icon: LineChart,
      title: 'Productivity Trends',
      description: 'Visualize your coding activity over time. Identify patterns and optimize your workflow.',
    },
    {
      icon: PieChart,
      title: 'Repository Insights',
      description: 'Understand which projects consume most of your time. Balance your work across multiple repositories.',
    },
    {
      icon: TrendingUp,
      title: 'Growth Metrics',
      description: 'Track your development velocity and improvement over weeks and months.',
    },
  ],
  integrations: [
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Seamless connection to all your repositories. Real-time sync of commits, branches, and pull requests.',
      highlight: true,
    },
    {
      icon: GitBranch,
      title: 'Branch Tracking',
      description: 'Monitor branch activity and merge patterns. Understand your Git workflow efficiency.',
    },
    {
      icon: GitCommit,
      title: 'Commit History',
      description: 'Complete commit timeline with detailed metadata. Search and filter by repository, date, or message.',
    },
  ],
  'ai-insights': [
    {
      icon: Brain,
      title: 'AI Weekly Summary',
      description: 'Get intelligent insights about your coding week. Understand patterns, strengths, and areas for improvement.',
      highlight: true,
    },
    {
      icon: Sparkles,
      title: 'Personalized Recommendations',
      description: 'Receive actionable suggestions based on your coding patterns. Optimize your workflow with AI-powered insights.',
    },
    {
      icon: Activity,
      title: 'Pattern Detection',
      description: 'AI identifies your most productive hours, preferred coding styles, and optimal work patterns.',
    },
  ],
  planning: [
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and track coding goals with clear milestones. Maintain accountability with visual progress indicators.',
      highlight: true,
    },
    {
      icon: Calendar,
      title: 'Time Planning',
      description: 'Plan your coding schedule and allocate time across projects. Balance work effectively.',
    },
    {
      icon: CheckCircle2,
      title: 'Milestone Tracking',
      description: 'Break down large projects into trackable milestones. Celebrate achievements and maintain momentum.',
    },
  ],
};

const deepFeatures = [
  {
    id: 'time-tracking',
    title: 'Intelligent Time Tracking',
    subtitle: 'Understand your coding rhythm',
    description: 'DailySync automatically tracks your coding activity with precision. Our focus-aware detection distinguishes between active coding and idle time, giving you accurate insights into your actual productivity.',
    benefits: [
      'Automatic detection of coding sessions',
      'Focus state recognition',
      'Idle time filtering',
      'Multi-repository tracking',
    ],
    icon: Timer,
  },
  {
    id: 'ai-summary',
    title: 'AI-Powered Weekly Summary',
    subtitle: 'Insights that matter',
    description: 'Every week, receive a comprehensive AI-generated summary of your coding activity. Understand your patterns, identify strengths, and discover opportunities for improvement.',
    benefits: [
      'Natural language summaries',
      'Pattern recognition',
      'Productivity insights',
      'Actionable recommendations',
    ],
    icon: Brain,
  },
  {
    id: 'github-integration',
    title: 'Complete GitHub Integration',
    subtitle: 'Your entire workflow in one place',
    description: 'Connect your GitHub account and instantly access all your repositories, commits, branches, and pull requests. Real-time synchronization ensures your data is always up to date.',
    benefits: [
      'Real-time repository sync',
      'Commit history analysis',
      'Branch activity tracking',
      'Pull request insights',
    ],
    icon: Github,
  },
];

export default function Features() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Smooth scroll to top of content area
    const contentArea = document.getElementById('features-content');
    if (contentArea) {
      const offset = 150;
      const elementPosition = contentArea.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <FeaturesNavbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Sticky Navigation */}
      <StickyNavigation
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Feature Categories - Only show active category */}
      <div id="features-content" className="max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {categories
            .filter((category) => category.id === activeCategory)
            .map((category) => (
              <FeatureCategory
                key={category.id}
                category={category}
                features={features[category.id as keyof typeof features]}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Deep Feature Sections */}
      <DeepFeatureSections features={deepFeatures} />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

// Features Navbar Component
const FeaturesNavbar = () => {
  return (
    <nav className="fixed w-full z-50 top-0 bg-background/60 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-[70px] flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Command size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">DailySync</span>
        </NavLink>
        
        <div className="flex items-center gap-4">
          <NavLink to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </NavLink>
          <NavLink to="/#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Demo
          </NavLink>
          <NavLink to="/">
            <Button size="sm" variant="primary" className="rounded-full px-6">
              Get Started
            </Button>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

// Hero Section Component
const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 overflow-hidden border-b border-border mt-[70px]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-6">
            Everything you need to understand your coding workflow
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            DailySync provides developers with comprehensive analytics, intelligent insights, and powerful tools to optimize productivity and track progress.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Sticky Navigation Component
interface StickyNavigationProps {
  categories: typeof categories;
  activeCategory: string;
  onCategoryClick: (id: string) => void;
}

const StickyNavigation: React.FC<StickyNavigationProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
}) => {
  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCategoryClick(category.id);
                  }
                }}
                aria-pressed={isActive}
                aria-label={`View ${category.label} features`}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
                  whitespace-nowrap border-b-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
                  ${
                    isActive
                      ? 'text-foreground border-accent bg-accent/5'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border hover:bg-secondary/30'
                  }
                `}
              >
                <Icon size={16} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Feature Category Component
interface FeatureCategoryProps {
  category: typeof categories[0];
  features: typeof features.productivity;
}

const FeatureCategory: React.FC<FeatureCategoryProps> = ({ category, features }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    exit: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <motion.div
      key={category.id}
      id={category.id}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="py-8"
    >
      <motion.div
        variants={itemVariants}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <category.icon size={24} className="text-accent" />
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {category.label}
          </h2>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Comprehensive tools and insights to enhance your {category.label.toLowerCase()} workflow.
        </p>
      </motion.div>

      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={feature.highlight ? 'sm:col-span-2 lg:col-span-1' : ''}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};


// Feature Card Component
interface FeatureCardProps {
  feature: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description: string;
    highlight?: boolean;
  };
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const Icon = feature.icon;

  return (
    <Card
      variant="glass"
      className={`
        h-full p-6 border border-border/50 hover:border-border transition-all duration-300
        hover:shadow-lg group
        ${feature.highlight ? 'lg:p-8' : ''}
      `}
    >
      <div className="mb-4">
        <div className="w-12 h-12 rounded-xl bg-background/80 border border-border/50 flex items-center justify-center group-hover:border-accent/30 transition-colors duration-300">
          <Icon size={22} className="text-foreground group-hover:text-accent transition-colors duration-300" />
        </div>
      </div>

      <h3 className={`font-semibold text-foreground mb-3 tracking-tight ${feature.highlight ? 'text-xl' : 'text-lg'}`}>
        {feature.title}
      </h3>
      <p className={`text-muted-foreground leading-relaxed ${feature.highlight ? 'text-base' : 'text-sm'}`}>
        {feature.description}
      </p>
    </Card>
  );
};

// Deep Feature Sections Component
interface DeepFeatureSectionsProps {
  features: typeof deepFeatures;
}

const DeepFeatureSections: React.FC<DeepFeatureSectionsProps> = ({ features }) => {
  return (
    <section className="py-24 px-6 bg-secondary/20 border-y border-border">
      <div className="max-w-7xl mx-auto space-y-32">
        {features.map((feature, index) => (
          <DeepFeatureSection
            key={feature.id}
            feature={feature}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
};

// Deep Feature Section Component
interface DeepFeatureSectionProps {
  feature: typeof deepFeatures[0];
  reverse: boolean;
}

const DeepFeatureSection: React.FC<DeepFeatureSectionProps> = ({ feature, reverse }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
    >
      <motion.div
        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? 30 : -30 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={reverse ? 'lg:order-2' : ''}
      >
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Icon size={24} className="text-accent" />
            <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              {feature.subtitle}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
            {feature.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            {feature.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {feature.benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <span className="text-sm text-foreground">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: reverse ? -30 : 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: reverse ? -30 : 30 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        className={reverse ? 'lg:order-1' : ''}
      >
        <Card variant="glass" className="p-8 border border-border/50">
          <div className="space-y-6">
            <div className="h-48 bg-secondary/30 rounded-lg flex items-center justify-center">
              <Icon size={48} className="text-muted-foreground/30" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-secondary/30 rounded w-3/4" />
              <div className="h-4 bg-secondary/30 rounded w-1/2" />
              <div className="h-4 bg-secondary/30 rounded w-2/3" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// CTA Section Component
const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="py-24 px-6"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-6">
            Ready to optimize your coding workflow?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start tracking your productivity and gain insights into your development patterns today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink to="/">
              <Button size="lg" variant="gold" className="rounded-full h-14 px-8 text-lg">
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </NavLink>
            <NavLink to="/#demo">
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg">
                View Demo
              </Button>
            </NavLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

