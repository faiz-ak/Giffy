import { Routes, Route } from "react-router-dom";
import LandingLayout from "./components/LandingLayout.jsx";
import NotFound from "./components/NotFound.jsx";
import Navbar from "./components/Navbar.jsx";
import Rainbow from "./components/Rainbow.jsx";
import Giffy from "./components/Giffy.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingLayout />} />
        <Route path="/rainbow" element={<Rainbow />} />
        <Route path="/giffy" element={<Giffy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}