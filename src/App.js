import { Routes, Route } from "react-router-dom";
import LandingLayout from "./components/LandingLayout";

import NotFound from "./components/NotFound";
import Navbar from "./components/Navbar";
import Rainbow from "./components/Rainbow";
import Giffy from "./components/Giffy";


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
