import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LayoutShell from "./components/LayoutShell";
import { ThemeProvider } from "./context/ThemeProvider";
import { BrowserRouter } from "react-router-dom";

export default function App(){
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/app" element={<LayoutShell />} />
                    <Route path="*" element={<Navigate to="/" replace />} />    
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}