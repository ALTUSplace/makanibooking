import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoleProvider } from "./contexts/RoleContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { PageTransition } from "./components/PageTransition";
import { lazy, Suspense } from "react";

// Lazy-loaded pages for performance optimization & code splitting
import Home from "./pages/Home";
const SearchPage = lazy(() => import("./pages/Search"));
const CarDetailsPage = lazy(() => import("./pages/CarDetails"));
const BookingPage = lazy(() => import("./pages/Booking"));
const SuccessPage = lazy(() => import("./pages/Success"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboard"));
const ProfilePage = lazy(() => import("./pages/Profile"));

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري التحميل...</div></div>}>
          <Home />
        </Suspense>
      </Route>
      <Route path={"/search"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل نتائج البحث...</div></div>}>
            <SearchPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/car/:id"}>
        {params => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل التفاصيل...</div></div>}>
            <CarDetailsPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/booking"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل صفحة الحجز...</div></div>}>
            <BookingPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/success"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري إعداد العقد الرقمي...</div></div>}>
            <SuccessPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/dashboard"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل لوحة التحكم...</div></div>}>
            <DashboardPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/admin"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل لوحة المشرف العام...</div></div>}>
            <AdminDashboardPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/profile"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل الملف الشخصي...</div></div>}>
            <ProfilePage />
          </Suspense>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <RoleProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-1">
                  <PageTransition>
                    <Router />
                  </PageTransition>
                </main>
                <Footer />
              </div>
            </TooltipProvider>
          </LanguageProvider>
        </RoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
