import React, { useEffect } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import LayoutShell from "./components/LayoutShell";
import { ThemeProvider } from "./context/Theme/ThemeProvider";
import { BrowserRouter } from "react-router-dom";
import PricingPage from "./pages/Pricing";
import {Login} from "./pages/Login";
import {Register} from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { axiosClient } from "./utils/axiosClient";
import { DashboardProvider } from "./context/Dashboard/DasboardProvider";

export default function App(){

    const checkServerHealth = async () => {
        try {
            const response = await axiosClient.get("/health");
            const data = await response.data;
            console.log("Server Health:", data);
        } catch (error) {
            console.error("Error checking server health:", error);
        }
    };

    useEffect(() => {
        checkServerHealth();
    }, []);

    if (import.meta.env.DEV) {
        const originalWarn = console.warn

        // eslint-disable-next-line react-hooks/immutability
        console.warn = (...args) => {
            const message = args[0]
            if (
            typeof message === 'string' &&
            message.includes('The width(') &&
            message.includes('height(')
            ) {
            return
            }
            originalWarn(...args)
        }
    }

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/layout" element={<LayoutShell />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/" replace />} />    
                    <Route path="/app" element={<LayoutShell />}>
                    <Route
                        path="dashboard"
                        element={
                        <DashboardProvider height={0} width={0}>
                            <Dashboard />
                        </DashboardProvider>
                        }
                    />
                    <Route index element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}