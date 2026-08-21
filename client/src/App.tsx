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
import BottomNavigationBar from "./components/BottomNavigationBar";
import BreadcrumbNav from "./components/BreadcrumbNav";
import { PageTransition } from "./components/PageTransition";
import { lazy, Suspense } from "react";

// Lazy-loaded pages for performance optimization & code splitting
import Home from "./pages/Home";
import RenterDashboard from "./pages/RenterDashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import AddCar from "./pages/AddCar";
import MyBookings from "./pages/MyBookings";
import Help from "./pages/Help";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import SupportTickets from "./pages/SupportTickets";
import { CurrencyProvider } from "./contexts/CurrencyContext";

const SearchPage = lazy(() => import("./pages/Search"));
const CarDetailsPage = lazy(() => import("./pages/CarDetails"));
const BookingPage = lazy(() => import("./pages/Booking"));
const SuccessPage = lazy(() => import("./pages/Success"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboard"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));

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
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري التحميل...</div></div>}>
            <SuccessPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/checkout"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل واجهة الدفع...</div></div>}>
            <CheckoutPage />
          </Suspense>
        )}
      </Route>
      <Route path={"/dashboard"} component={DashboardPage} />
      <Route path={"/admin"} component={AdminDashboardPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/renter-dashboard"} component={RenterDashboard} />
      <Route path={"/partner-dashboard"} component={PartnerDashboard} />
      <Route path={"/add-car"} component={AddCar} />
      <Route path={"/my-bookings"} component={MyBookings} />
      <Route path={"/help"} component={Help} />
      <Route path={"/support-tickets"} component={SupportTickets} />
      <Route path={"/favorites"} component={Favorites} />
      <Route path={"/about"} component={About} />
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
            <CurrencyProvider>
              <TooltipProvider>
              <Toaster />
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-1">
                  <BreadcrumbNav />
                  <PageTransition>
                    <Router />
                  </PageTransition>
                </main>
                <Footer />
                <BottomNavigationBar />
              </div>
            </TooltipProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </RoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
