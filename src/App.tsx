import { Routes, Route, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";
import WhyFarmish from "@/pages/WhyFarmish";
import Login from "@/pages/Login";
import Favorites from "@/pages/Favorites";
import { Footer } from "@/components/farmish/Footer";

export default function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/why-farmish" element={<WhyFarmish />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login mode="signup" />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
      {!['/login', '/signup'].includes(location.pathname) && <Footer />}
    </>
  );
}
