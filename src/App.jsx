import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
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
import PromotionList from "./pages/Admin/PromotionList";
import PromotionForm from "./pages/Admin/PromotionForm";
import Dashboard from "./pages/Admin/Dashboard";
import SupplierPurchaseOrderList from "./pages/Supplier/PurchaseOrderList";
import SupplierPurchaseOrderForm from "./pages/Supplier/PurchaseOrderForm";
import Homepage from "./pages/Homepage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ✅ Public Routes - No Authentication Required */}
            <Route path="/" element={<Homepage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            
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
            path="/customer/products/:id" 
            element={
              <PrivateRoute>
                <ProductDetail />
              </PrivateRoute>
            } 
          />

          {/* ✅ Protected Admin Product Management Routes */}
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

          {/* ✅ Protected Admin Dashboard Route */}
          <Route 
            path="/admin/dashboard" 
            element={
              <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}>
                <Dashboard />
              </RoleBasedRoute>
            } 
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
