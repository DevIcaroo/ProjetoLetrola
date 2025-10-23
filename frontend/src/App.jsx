import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import GameMap from "./pages/GameMap.jsx";
import Fase from "./pages/Fase.jsx"
import Ajuda from "./pages/Ajuda.jsx"
import Credits from "./pages/Credits.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa-do-jogo" element={<GameMap />} />
        <Route path="/mundo/:mundoId/fase/:faseId" element={<Fase />} />
        <Route path="/ajuda" element={<Ajuda />} />
        <Route path="/creditos" element={<Credits />} />
      </Routes>
    </Router>
  );
}
