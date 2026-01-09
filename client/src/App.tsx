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
import { axiosClient } from "./utils/axiosClient";

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

    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/app" element={<LayoutShell />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/" replace />} />    
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}