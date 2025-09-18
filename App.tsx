import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Page1 from "./Fatherside";
import Page2 from "./Motherside";
import "./index.scss";

const App: React.FC = () => {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/page1" className="nav-link">
          Page 1
        </Link>
        <Link to="/page2" className="nav-link">
          Page 2
        </Link>
      </nav>
      <div className="page-content">
        <Routes>
          <Route path="/page1" element={<Page1 />} />
          <Route path="/page2" element={<Page2 />} />
          <Route path="*" element={<Page1 />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
