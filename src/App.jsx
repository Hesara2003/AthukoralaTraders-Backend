import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { RecentlyViewedProvider } from "./contexts/RecentlyViewedContext";
import { ProductComparisonProvider } from "./contexts/ProductComparisonContext";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import BusinessLogin from "./pages/Auth/BusinessLogin";
import ProductList from "./pages/Admin/ProductList";
import ProductForm from "./pages/Admin/ProductForm";
import InvoiceList from "./pages/Admin/InvoiceList";
import UserList from "./pages/Admin/UserList";
import ProductPage from "./pages/Customer/ProductPage";
import ProductDetail from "./pages/Customer/ProductDetail";
import OrderHistory from "./pages/Customer/OrderHistory";
import CheckoutPage from "./pages/Customer/CheckoutPage";
import OrderConfirmation from "./pages/Customer/OrderConfirmation";
import PaymentGateway from "./pages/Customer/PaymentGateway";
import PromotionList from "./pages/Admin/PromotionList";
import PromotionForm from "./pages/Admin/PromotionForm";
import Dashboard from "./pages/Admin/Dashboard";
import Reports from "./pages/Admin/Reports";
import QuickSale from "./pages/Sales/QuickSale";
import SupplierPurchaseOrderList from "./pages/Supplier/PurchaseOrderList";
import SupplierPurchaseOrderForm from "./pages/Supplier/PurchaseOrderForm";
import Homepage from "./pages/Homepage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import SearchDemo from "./pages/SearchDemo";
import DeliveryTimelineDemo from "./pages/DeliveryTimelineDemo";
import ApiTestPage from "./pages/ApiTestPage";
import InvoiceDetails from "./pages/Finance/InvoiceDetails";
import FinanceInvoiceList from "./pages/Finance/InvoiceList";
import FinanceUpload from "./pages/Finance/UploadInvoice";
import ReceiveGoods from "./pages/Admin/ReceiveGoods";
import GRNList from "./pages/Admin/GRNList";
import ProcessReturnExchange from "./pages/Admin/ProcessReturnExchange";
import AuditLogs from "./pages/Admin/AuditLogs";
import OrderManagement from "./pages/Admin/OrderManagement";
import FulfillmentDashboard from "./pages/Staff/FulfillmentDashboard";
import ShiftManagement from "./pages/Staff/ShiftManagement";
import CatalogManagement from "./pages/Supplier/CatalogManagement";
import ReconciliationDashboard from "./pages/Supplier/ReconciliationDashboard";
import InvoiceMatching from "./pages/Supplier/InvoiceMatching";
import OrderTrackingPage from "./pages/Customer/OrderTrackingPage";
import ReturnsRefunds from "./pages/Customer/ReturnsRefunds";
import WishlistPage from "./pages/Customer/WishlistPage";
import APIDebugger from "./components/APIDebugger";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <ProductComparisonProvider>
              <Router>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#fff',
                      color: '#363636',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                      fontWeight: '600',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                <Routes>
            {/* ✅ Public Routes - No Authentication Required */}
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/search-demo" element={<SearchDemo />} />
            <Route path="/delivery-timeline-demo" element={<DeliveryTimelineDemo />} />
            <Route path="/api-test" element={<ApiTestPage />} />
            <Route path="/api-debug" element={<APIDebugger />} />
            
            {/* Order Tracking - Public */}
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/track-order/:orderId" element={<OrderTrackingPage />} />
            
            {/* ✅ Authentication Routes */}
            {/* Customer-only auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Business (Admin/Staff/Supplier) auth */}
            <Route path="/business-login" element={<BusinessLogin />} />
          {/* ✅ Protected Customer Routes (for logged-in users) */}
          <Route 
            path="/customer/products" 
            element={
              <PrivateRoute>
                <ProductPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/customer/orders" 
            element={
              <PrivateRoute>
                <OrderHistory />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            } 
          />
          <Route
            path="/checkout/payment/:method"
            element={
              <PrivateRoute>
                <PaymentGateway />
              </PrivateRoute>
            }
          />
          <Route 
            path="/order-confirmation" 
            element={
              <PrivateRoute>
                <OrderConfirmation />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/customer/checkout" 
            element={<Navigate to="/checkout" replace />} 
          />
          <Route 
            path="/customer/products/:id" 
            element={
              <PrivateRoute>
                <ProductDetail />
              </PrivateRoute>
            } 
          />
          
          {/* Returns & Refunds */}
          <Route 
            path="/customer/returns" 
            element={
              <PrivateRoute>
                <ReturnsRefunds />
              </PrivateRoute>
            } 
          />

          {/* Wishlist */}
          <Route 
            path="/customer/wishlist" 
            element={
              <PrivateRoute>
                <WishlistPage />
              </PrivateRoute>
            } 
          />

          {/* ✅ Protected Admin Product Management Routes */}
          <Route 
            path="/admin/orders" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <OrderManagement />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <ProductList />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/admin/invoices"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <InvoiceList />
              </RoleBasedRoute>
            }
          />
          <Route 
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <UserList />
              </RoleBasedRoute>
            }
          />
          <Route 
            path="/admin/products/new" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <ProductForm />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/admin/products/edit/:id" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <ProductForm />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Protected Admin Promotion Management Routes */}
          <Route 
            path="/admin/promotions" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <PromotionList />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/admin/promotions/new" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <PromotionForm />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/admin/promotions/:id/edit" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <PromotionForm />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Supplier Portal - Purchase Orders (SCRUM-14, SCRUM-34) */}
          <Route 
            path="/supplier/purchase-orders" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPPLIER']}>
                <SupplierPurchaseOrderList />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/supplier/purchase-orders/new" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPPLIER']}>
                <SupplierPurchaseOrderForm />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/supplier/purchase-orders/:id/edit" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPPLIER']}>
                <SupplierPurchaseOrderForm />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Supplier Portal - Catalog Management */}
          <Route 
            path="/supplier/catalog" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPPLIER']}>
                <CatalogManagement />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Supplier Portal - Reconciliation */}
          <Route 
            path="/supplier/reconciliation" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPPLIER']}>
                <ReconciliationDashboard />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Supplier Portal - Invoice Matching */}
          <Route 
            path="/supplier/invoices/matching" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF', 'SUPPLIER']}>
                <InvoiceMatching />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Staff Portal - Fulfillment */}
          <Route 
            path="/staff/fulfillment" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <FulfillmentDashboard />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Staff Portal - Shift Management */}
          <Route 
            path="/staff/shifts" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <ShiftManagement />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Finance Portal - Invoice Management & Details Display */}
          <Route 
            path="/finance/invoices" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <FinanceInvoiceList />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/finance/invoices/upload"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <FinanceUpload />
              </RoleBasedRoute>
            }
          />
          <Route 
            path="/finance/invoices/:id" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <InvoiceDetails />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={<Navigate to="/finance/invoices" replace />} 
          />

          {/* ✅ Protected Admin Dashboard Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <Dashboard />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Quick Sale - Fast in-store sales processing */}
          <Route
            path="/quick-sale"
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <QuickSale />
              </RoleBasedRoute>
            }
          />
          
          {/* ✅ Protected Admin Reports Route */}
          <Route 
            path="/admin/reports" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <Reports />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Audit Logs - Track all admin actions */}
          <Route 
            path="/admin/audit-logs" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN']}>
                <AuditLogs />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ GRN (Goods Receipt Note) Management - Inventory Receiving */}
          <Route 
            path="/admin/receive-goods" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <ReceiveGoods />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="/admin/grn-list" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <GRNList />
              </RoleBasedRoute>
            } 
          />

          {/* ✅ Return/Exchange Management - Process customer returns and exchanges */}
          <Route 
            path="/admin/returns" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <ProcessReturnExchange />
              </RoleBasedRoute>
            } 
          />
          
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
            </ProductComparisonProvider>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
