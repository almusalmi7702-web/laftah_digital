import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Pricing from './pages/Pricing';
import Portfolio from './pages/Portfolio';
import PortfolioDetail from './pages/PortfolioDetail';
import ServiceDetail from './pages/ServiceDetail';
import FreeAudit from './pages/FreeAudit';
import Contact from './pages/Contact';
import Faqs from './pages/Faqs';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminPortfolioForm from './pages/admin/AdminPortfolioForm';
import AdminServices from './pages/admin/AdminServices';
import AdminServicesForm from './pages/admin/AdminServicesForm';
import AdminPricing from './pages/admin/AdminPricing';
import AdminPricingForm from './pages/admin/AdminPricingForm';
import AdminFaqs from './pages/admin/AdminFaqs';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
            <Route path="/free-audit" element={<FreeAudit />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            {/* Portfolio */}
            <Route path="portfolio" element={<AdminPortfolio />} />
            <Route path="portfolio/new" element={<AdminPortfolioForm />} />
            <Route path="portfolio/:id/edit" element={<AdminPortfolioForm />} />
            {/* Services */}
            <Route path="services" element={<AdminServices />} />
            <Route path="services/new" element={<AdminServicesForm />} />
            <Route path="services/:id/edit" element={<AdminServicesForm />} />
            {/* Pricing */}
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="pricing/new" element={<AdminPricingForm />} />
            <Route path="pricing/:id/edit" element={<AdminPricingForm />} />
            {/* FAQs */}
            <Route path="faqs" element={<AdminFaqs />} />
            {/* Settings */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
