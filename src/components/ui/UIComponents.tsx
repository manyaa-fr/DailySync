import React from "react";

// CARDS COMPONENT
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant? : 'default' | 'glass' | 'ghost';
}

export const Card: React.FC<CardProps> = ({  className = '', variant = 'default', ...props }) => {
    const variants = {
        default: "bg-card text-card-foreground border border-border shadow-sm",
        glass: "glass-panel text-foreground",
        ghost: "bg-transparent border-0 shadow-none"
    };

    return (
        <div
            className={`rounded-2xl transition-all duration-300 ${variants[variant]} ${className}`}
            {...props}
        />
    );
};

// BUTTONS COMPONENT
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant? : 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'white' | 'gold';
  size? : 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none rounded-xl tracking-tight active:scale-[0.98]";
  
    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-transparent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
        ghost: "bg-transparent text-foreground hover:bg-secondary/50",
        outline: "border border-border bg-transparent hover:bg-secondary/40 text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        white: "bg-white text-stone-900 border border-stone-200 hover:bg-stone-50 shadow-sm",
        gold: "bg-[#D5C49F] text-[#0F0F0F] hover:bg-[#C7B893] shadow-md border border-transparent"
    };

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-9 w-9 p-0"
    };

    return(
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}>{children}</button>
    );
}

// INPUT TEXT FIELD COMPONENT
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-foreground/80">{label}</label>}
    <input
      className={`flex h-12 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
      {...props}
    />
  </div>
);

// BADGE COMPONENT
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'neutral' | 'outline' | 'primary' | 'pastel' | 'gold';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({children, className = '', variant = 'neutral'}) => {
    const styles = {
        success: "bg-secondary text-foreground border-border",
        warning: "bg-secondary text-foreground border-border",
        primary: "bg-primary/10 text-primary border-transparent",
        gold: "bg-[#D5C49F]/10 text-[#D5C49F] border-[#D5C49F]/20",
        pastel: "bg-secondary text-muted-foreground border-transparent",
        neutral: "bg-secondary text-secondary-foreground border-transparent",
        outline: "border-border text-muted-foreground",
    };

    return (
        <span className={`inline-flex items-center ... ${styles[variant]} ${className}`}>
            {children}
        </span>
    );
}

// SECTION TITLE COMPONENT
export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
    {subtitle && <p className="text-base text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>}
  </div>
);

// DEMO BANNER COMPONENT
export const DemoBanner: React.FC = () => (
  <div className="bg-[#D5C49F]/20 border-b border-[#D5C49F]/30 px-4 py-2 text-center text-xs font-semibold text-[#D5C49F] tracking-wide uppercase">
    Demo Mode Active
  </div>
);