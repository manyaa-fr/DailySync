import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Check, ArrowRight, Command } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button, Card, Badge } from "../components/ui/UIComponents";

/* -------------------- animations -------------------- */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

/* -------------------- page -------------------- */

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
    {/* Navbar */}
      <Navbar />
      <main className="pt-32">
        {/* HERO */}
        <section className="px-6">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Badge variant="gold">Pricing</Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl font-semibold tracking-tight"
            >
              One plan. Everything you need.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              DailySync is free to use while we build the product in the open.
              No hidden costs, no locked features.
            </motion.p>
          </div>
        </section>

        {/* PRICING CARD */}
        <section className="py-32 px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-xl mx-auto"
          >
            <Card
              variant="glass"
              className="p-10 text-center space-y-8 shadow-2xl"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Free</h2>
                <p className="text-muted-foreground">
                  For individual developers getting started
                </p>
              </div>

              <div className="text-5xl font-semibold">
                $0
                <span className="text-base text-muted-foreground font-normal">
                  {" "}
                  / forever
                </span>
              </div>

              <NavLink to="/auth/register">
                <Button
                  size="lg"
                  variant="gold"
                  className="rounded-full w-full"
                >
                  Get Started <ArrowRight size={18} className="ml-2" />
                </Button>
              </NavLink>

              <div className="pt-6 border-t border-border space-y-6 text-left">
                <FeatureGroup
                  title="Productivity"
                  items={[
                    "Smart coding time tracking",
                    "Daily and weekly activity view",
                    "Consistency and streak tracking",
                  ]}
                />

                <FeatureGroup
                  title="Analytics"
                  items={[
                    "Commit activity overview",
                    "High-level productivity trends",
                    "Basic insights dashboard",
                  ]}
                />

                <FeatureGroup
                  title="Integrations"
                  items={[
                    "GitHub account connection",
                    "Repository activity tracking",
                  ]}
                />
              </div>
            </Card>
          </motion.div>
        </section>

        {/* TRANSPARENCY */}
        <section className="px-6 pb-32">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-semibold">
                Why only a Free plan?
              </h3>
              <p className="text-muted-foreground">
                DailySync is currently early-stage. We’re focused on building a
                solid foundation, learning from real usage, and improving core
                workflows before introducing paid plans.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-semibold">
                What happens later?
              </h3>
              <p className="text-muted-foreground">
                Pricing may evolve as advanced capabilities are added. Early
                users will always be treated fairly and transparently.
              </p>
            </motion.div>
          </div>
        </section>

        {/* COMING SOON */}
        <section className="px-6 pb-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-2xl font-semibold">Planned additions</h3>
            <p className="text-muted-foreground">
              These are directions we’re actively exploring.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                Advanced AI summaries and deeper insights
              </Card>
              <Card variant="glass" className="p-6">
                Long-term trends and historical comparisons
              </Card>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-3xl font-semibold">
              Start using DailySync today
            </h3>
            <p className="text-muted-foreground">
              Explore the demo or sign up and start understanding your work.
            </p>

            <div className="flex justify-center gap-4">
              <NavLink to="/demo">
                <Button variant="secondary">Try Demo</Button>
              </NavLink>
              <NavLink to="/auth/register">
                <Button variant="gold">Get Started</Button>
              </NavLink>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* -------------------- helpers -------------------- */

// Features Navbar Component
const Navbar = () => {
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


function FeatureGroup({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <Check size={16} className="mt-0.5 text-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
