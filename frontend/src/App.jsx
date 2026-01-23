import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext'; // <--- Import this

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AboutPCOS from './pages/AboutPCOS';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Awareness from './pages/Awareness';
import DietExercise from './pages/DietExercise';
import ImageTest from './pages/ImageTest';
import SymptomTest from './pages/SymptomTest';
import CombinedTest from './pages/CombinedTest';
import ImageResult from './pages/ImageResult';
import SymptomResult from './pages/SymptomResult';
import CombinedResult from './pages/CombinedResult';

function App() {
  return (
    <AuthProvider> {/* Wrap everything in AuthProvider */}
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPCOS />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/awareness" element={<Awareness />} />
              <Route path="/diet" element={<DietExercise />} />
              
              {/* Test Routes */}
              <Route path="/check/image" element={<ImageTest />} />
              <Route path="/check/symptom" element={<SymptomTest />} />
              <Route path="/check/combined" element={<CombinedTest />} />

              {/* Result Routes */}
              <Route path="/result/image" element={<ImageResult />} />
              <Route path="/result/symptom" element={<SymptomResult />} />
              <Route path="/result/combined" element={<CombinedResult />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;