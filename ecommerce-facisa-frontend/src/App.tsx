import { Route, Routes } from "react-router-dom";
import Login from "./login/Login";
import SignUp from "./sign-up/SignUp";
import Home from "./home/Home";
import ProductForm from "./admin/ProductForm";
import AdminDashboard from "./admin/AdminDashboard";
import ManageUsers from "./admin/ManageUsers";
import ManageProducts from "./admin/ManageProducts";
import ManagePromotions from "./admin/ManagePromotions";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/admin/add-product" element={<ProductForm />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/products" element={<ManageProducts />} />
      <Route path="/admin/promotions" element={<ManagePromotions />} />
    </Routes>
  );
}

export default App;
