import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { LanguageProvider } from "@/i18n";
import { AuthProvider } from "@/lib/auth-context";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminRevenueDaily from "./pages/admin/RevenueDaily";
import AdminRevenueMonthly from "./pages/admin/RevenueMonthly";
import AdminSettings from "./pages/admin/Settings";
import AdminSessions from "./pages/admin/Sessions";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={Login} />
      <Route path="/orders" component={Orders} />
      

      {/* ✅ ADMIN (مفصول بالكامل) */}
<Route path="/admin/login" component={AdminLogin} />
<Route path="/admin/dashboard" component={AdminDashboard} />
<Route path="/admin/orders" component={AdminOrders} />
<Route path="/admin/products" component={AdminProducts} />
<Route path="/admin/revenue/daily" component={AdminRevenueDaily} />
<Route path="/admin/revenue/monthly" component={AdminRevenueMonthly} />
<Route path="/admin/settings" component={AdminSettings} />
<Route path="/admin/sessions" component={AdminSessions} />


<Route path="/admin" component={AdminLogin} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
             <ScrollToTop />
              <Router />
            </WouterRouter>
           <div className="pointer-events-none">
  <Toaster />
</div>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;