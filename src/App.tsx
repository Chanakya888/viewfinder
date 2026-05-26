import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Shoot from "./pages/Shoot";
import View from "./pages/View";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shoot/:sessionId" element={<Shoot />} />
      <Route path="/view/:sessionId" element={<View />} />
    </Routes>
  );
}

export default App;
