import React, { useState } from "react";
import {Outlet, NavLink, useLocation} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {
    Github,
    X,
    LayoutDashboard,
    Clock,
    User,
    Menu,
    FileText,
    LogOut,
    Settings,
    Command,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from "../context/Theme/useTheme";
import { DemoBanner } from "./ui/UIComponents";

const SidebarContent = ({onClose, navItems }) => (
<div className="flex flex-col h-full bg-card border-r border-border">
    <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Command size={18} />
        </div>
    <span className="font-bold text-lg tracking-tight text-foreground">DailySync</span>
    </div>

    <nav className="flex-1 px-4 space-y-1 py-4">
        {navItems.map((item) => (
            <NavLink
            key={item.path}
            to={item.path}
            onClick={() => onClose(false)}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive? 
                'bg-secondary text-primary border border-border shadow-sm' :
                'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`
            }
        >
            <item.icon size={18} />
            {item.label}
        </NavLink>
    ))}
    </nav>

    <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs font-bold ring-1 ring-border">
                JD
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-foreground">Jane Developer</p>
                <p className="text-xs text-muted-foreground truncate">jane@example.com</p>
            </div>
            <NavLink to="/" title="Logout">
                <LogOut size={16} className="text-muted-foreground hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </NavLink>
        </div>
    </div>
</div>
);
export default function LayoutShell(){
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const isDemo = location.pathname.includes('/demo');

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: isDemo ? '/demo' : '/app/dashboard' },
        { icon: Github, label: 'GitHub', path: '/app/github' },
        { icon: Clock, label: 'Time Tracking', path: '/app/time' },
        { icon: FileText, label: 'Daily Summary', path: '/app/summary' },
        { icon: User, label: 'Profile', path: '/app/profile' },
        { icon: Settings, label: 'Settings', path: '/app/settings' },
    ]


    return(
        <div className="relative min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden transition-colors duration-300">
      
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
                    <Command size={14} />
                </div>
                DailySync
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-muted-foreground hover:text-foreground">
                <Menu size={24} />
            </button>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
            {isMobileMenuOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-64 bg-background z-50 md:hidden shadow-2xl border-r border-border"
                    >
                        <SidebarContent
                            onClose={() => setIsMobileMenuOpen(false)}
                            navItems = {navItems}
                        />
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 h-screen sticky top-0 z-30">
                <SidebarContent
                    onClose={() => setIsMobileMenuOpen(false)}
                    navItems = {navItems}
                />
            </div>

        {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                {/* Topbar */}
                <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-border bg-background/50 backdrop-blur-sm z-20">
                <div className="text-sm breadcrumbs text-muted-foreground">
                    <span className="hidden sm:inline">Application</span> / <span className="font-medium text-foreground capitalize">{location.pathname.split('/').pop()}</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
                </header>

                {isDemo && <DemoBanner />}

                {/* Page Scroll Area */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-background">
            <div className="max-w-6xl mx-auto space-y-6 pb-10">
                <Outlet />
            </div>
            </main>
        </div>
        </div>
    )
};