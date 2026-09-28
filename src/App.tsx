import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";
import WhyFarmish from "@/pages/WhyFarmish";
import { Footer } from "@/components/farmish/Footer";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/why-farmish" element={<WhyFarmish />} />
      </Routes>
      <Footer />
    </>
  );
}
