import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { Activity, Users, FileText, Calendar, Pill, LogIn, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import PatientRegistration from "./components/PatientRegistration";
import PatientList from "./components/PatientList";
import ClinicalRecords from "./components/ClinicalRecords";
import FollowUps from "./components/FollowUps";
import Prescriptions from "./components/Prescriptions";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function App() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState("patients");
  const isLoggedIn = loginStatus === "success" && identity;

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen bg-background">
        <Toaster />
        
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Activity className="h-7 w-7 text-primary" />
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">OPD Manager</h1>
                <p className="text-xs text-muted-foreground">Outpatient Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isLoggedIn ? (
                <Button onClick={clear} variant="outline" size="sm" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <Button 
                  onClick={login} 
                  disabled={loginStatus === "logging-in"}
                  size="sm"
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  {loginStatus === "logging-in" ? "Connecting..." : "Login"}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-6">
                <Activity className="h-16 w-16 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-3">Welcome to OPD Manager</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                A complete outpatient department management system for patient registration, 
                clinical records, follow-ups, and prescriptions.
              </p>
              <Button onClick={login} size="lg" className="gap-2">
                <LogIn className="h-5 w-5" />
                Login to Continue
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
                <TabsTrigger value="patients" className="gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Patients</span>
                </TabsTrigger>
                <TabsTrigger value="registration" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Register</span>
                </TabsTrigger>
                <TabsTrigger value="clinical" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Clinical</span>
                </TabsTrigger>
                <TabsTrigger value="followups" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Follow-ups</span>
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="gap-2">
                  <Pill className="h-4 w-4" />
                  <span className="hidden sm:inline">Prescriptions</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patients" className="space-y-4">
                <PatientList onSelectPatient={(patientId) => {
                  // Switch to clinical tab when patient is selected
                  setActiveTab("clinical");
                }} />
              </TabsContent>

              <TabsContent value="registration" className="space-y-4">
                <PatientRegistration />
              </TabsContent>

              <TabsContent value="clinical" className="space-y-4">
                <ClinicalRecords />
              </TabsContent>

              <TabsContent value="followups" className="space-y-4">
                <FollowUps />
              </TabsContent>

              <TabsContent value="prescriptions" className="space-y-4">
                <Prescriptions />
              </TabsContent>
            </Tabs>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-border bg-card/50 py-8 no-print">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026. Built with love using{" "}
            <a 
              href="https://caffeine.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
