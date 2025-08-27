import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import GameMap from "./pages/GameMap.jsx";
import Fase1 from "./pages/Fase1.jsx";
import Fase2 from "./pages/Fase2.jsx";
import Fase3 from "./pages/Fase3.jsx";
import Fase4 from "./pages/Fase4.jsx";
import Fase5 from "./pages/Fase5.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa-do-jogo" element={<GameMap />} />
        <Route path="/fase-1" element={<Fase1 />} />
        <Route path="/fase-2" element={<Fase2 />} />
        <Route path="/fase-3" element={<Fase3 />} />
        <Route path="/fase-4" element={<Fase4 />} />
        <Route path="/fase-5" element={<Fase5 />} />
      </Routes>
    </Router>
  );
}
