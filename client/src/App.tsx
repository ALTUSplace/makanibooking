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
import Home from "./pages/Home";
import Search from "./pages/Search";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import Success from "./pages/Success";
import Dashboard from "./pages/Dashboard";
import AddCar from "./pages/AddCar";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/car/:id" component={CarDetails} />
          <Route path="/booking" component={Booking} />
          <Route path="/success" component={Success} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/add-car" component={AddCar} />
          <Route path="/my-bookings" component={MyBookings} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/profile" component={Profile} />
          <Route path="/help" component={Help} />
          <Route path="/about" component={About} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <RoleProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </RoleProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
