import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoleProvider } from "./contexts/RoleContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNavigationBar from "./components/BottomNavigationBar";
import BreadcrumbNav from "./components/BreadcrumbNav";
import { PageTransition } from "./components/PageTransition";
import { lazy, Suspense } from "react";
import { useAuth } from "./_core/hooks/useAuth";
import { startLogin } from "./const";
import { Button } from "@/components/ui/button";

// Lazy-loaded pages keep the initial mobile bundle small.
import HostDashboard from "./pages/HostDashboard";
import AIChatWidget from './components/AIChatWidget';

const HomePage = lazy(() => import("./pages/Home"));
const SearchPage = lazy(() => import("./pages/Search"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailWithVideo"));
const DisputeResolutionPage = lazy(() => import('./pages/DisputeResolution'));
const TermsPage = lazy(() => import('./pages/TermsOfService'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPolicy'));
const AddCarPage = lazy(() => import("./pages/AddCar"));
const MyBookingsPage = lazy(() => import("./pages/MyBookings"));
const HelpPage = lazy(() => import("./pages/Help"));
const FavoritesPage = lazy(() => import("./pages/Favorites"));
const AboutPage = lazy(() => import("./pages/About"));
const SupportTicketsPage = lazy(() => import("./pages/SupportTickets"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const CarDetailsPage = lazy(() => import("./pages/CarDetails"));
const BookingPage = lazy(() => import("./pages/Booking"));
const SuccessPage = lazy(() => import("./pages/Success"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboard"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const KycVerificationPage = lazy(() => import("./pages/KycVerification"));

function AccessGuard({ area, children }: { area: 'admin' | 'host'; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[50vh] flex items-center justify-center">جاري التحقق من الصلاحيات...</div>;
  if (!user) return <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-6 text-center"><h1 className="text-2xl font-bold">يلزم تسجيل الدخول</h1><p className="text-muted-foreground">سجّل الدخول للوصول إلى هذه اللوحة.</p><Button onClick={() => startLogin()}>تسجيل الدخول</Button></div>;
  const allowed = area === 'admin' ? user.role === 'admin' : user.role === 'owner' || user.role === 'admin';
  if (!allowed) return <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-6 text-center"><h1 className="text-2xl font-bold">403 — الوصول غير مسموح</h1><p className="text-muted-foreground">ليس لديك الصلاحية لفتح هذه اللوحة.</p></div>;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري التحميل...</div></div>}>
          <HomePage />
        </Suspense>
      </Route>
      <Route path={"/search"}>
        {() => (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري تحميل نتائج البحث...</div></div>}>
            <SearchPage />
          </Suspense>
        )}
      </Route>
      <Route path="/property/:id" component={PropertyDetailPage} />
      <Route path="/car/:id">
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
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground"><div className="animate-spin text-amber-500 font-bold text-lg">جاري معالجة التأكيد...</div></div>}>
            <SuccessPage />
          </Suspense>
        )}
      </Route>
      <Route path="/dashboard">{() => <AccessGuard area="host"><HostDashboard /></AccessGuard>}</Route>
      <Route path="/admin">{() => <AccessGuard area="admin"><Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">جاري تحميل لوحة الإدارة...</div>}><AdminDashboardPage /></Suspense></AccessGuard>}</Route>
      <Route path="/dispute-resolution" component={DisputeResolutionPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/host">{() => <AccessGuard area="host"><HostDashboard /></AccessGuard>}</Route>
      <Route path="/host-dashboard">{() => <AccessGuard area="host"><HostDashboard /></AccessGuard>}</Route>
      <Route path="/partner">{() => <AccessGuard area="host"><HostDashboard /></AccessGuard>}</Route>
      <Route path="/partner-dashboard">{() => <AccessGuard area="host"><HostDashboard /></AccessGuard>}</Route>
      <Route path="/add-car">{() => <AccessGuard area="host"><AddCarPage /></AccessGuard>}</Route>
      <Route path={"/my-bookings"} component={MyBookingsPage} />
      <Route path={"/profile"} component={ProfilePage} />
      <Route path={"/checkout"} component={CheckoutPage} />
      <Route path={"/kyc"}>{() => <Suspense fallback={<div className="min-h-screen grid place-items-center">جاري تحميل التحقق...</div>}><KycVerificationPage /></Suspense>}</Route>
      <Route path={"/help"}>{() => <Redirect to="/support-tickets" replace />}</Route>
      <Route path={"/support-tickets"} component={SupportTicketsPage} />
      <Route path={"/notifications"} component={NotificationsPage} />
      <Route path={"/favorites"} component={FavoritesPage} />
      <Route path={"/about"}>
        <AboutPage />
      </Route>
      <Route path={"/blog"}>
        <BlogPage />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <RoleProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <TooltipProvider>
                <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
                  <Navbar />
                  <BreadcrumbNav />
                  <main className="flex-1 pb-16 md:pb-0">
                    <PageTransition>
                      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center bg-background text-foreground"><div className="text-amber-500 font-bold">جاري تحميل الصفحة...</div></div>}>
                        <Router />
                      </Suspense>
                    </PageTransition>
                  </main>
                  <Footer />
                  <BottomNavigationBar />
                  <AIChatWidget />
                </div>
              </TooltipProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </RoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
