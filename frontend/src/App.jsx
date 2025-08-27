import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import GameMap from "./pages/GameMap.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mapa-do-jogo" element={<GameMap />} />
      </Routes>
    </Router>
  );
}
