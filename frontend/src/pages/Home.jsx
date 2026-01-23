import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUpload, FaClipboardList, FaBrain, FaLeaf, FaArrowRight, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import CountUp from '../components/CountUp'; // <--- IMPORT THIS

// Import Three.js dependencies
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleStartCheck = () => {
    if (isLoggedIn) {
      navigate('/check/image');
    } else {
      navigate('/register');
    }
  };

  // --- Three.js Logic ---
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff5f8); 

    const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 30); 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.autoRotate = true; 
    controls.autoRotateSpeed = 1.5;

    const loader = new GLTFLoader();
    
    loader.load('/uterus 3d model.glb', (gltf) => {
      const model = gltf.scene;
      const scaleFactor = 10; 
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y -= center.y;
      model.position.z -= center.z;
      
      scene.add(model);
      setLoading(false);
    }, undefined, (error) => {
      console.error('An error happened loading the model:', error);
      setLoading(false);
    });

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);
  
  return (
    <div>
      
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-content-side">
            <span className="badge">AI-Powered Women's Health</span>
            <h1>
              Early PCOS Screening <br /> 
              <span style={{ color: 'var(--primary)' }}>Made Simple</span>
            </h1>
            <p>
              PCOSmart uses advanced AI to analyze ultrasound images and symptoms, 
              providing personalized insights. Join thousands of women taking control today.
            </p>
            <div className="flex gap-20" style={{ justifyContent: 'flex-start' }}>
              <button onClick={handleStartCheck} className="btn btn-primary">
                Start Your Check <FaArrowRight />
              </button>
              {!isLoggedIn && (
                <Link to="/register" className="btn btn-outline">
                  Create Account
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual-side">
            <div className="visual-card">
              <img 
                src="\pcos_stats.png" 
                alt="PCOS Impact Visualization" 
                className="visual-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (ANIMATED) */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div>
            <div className="stat-number">
              <CountUp end={95} suffix="%" />
            </div>
            <div>Accuracy Rate</div>
          </div>
          <div>
            <div className="stat-number">
              <CountUp end={"50K"} suffix="+" />
            </div>
            <div>Women Helped</div>
          </div>
          <div>
            <div className="stat-number">
              24/7
            </div>
            <div>Available</div>
          </div>
          <div>
            <div className="stat-number">
              <CountUp end={100} suffix="%" />
            </div>
            <div>Private & Secure</div>
          </div>
        </div>
      </section>

      {/* 3. Features */}
      <section className="container" style={{ padding: '80px 20px' }}>
        <div className="section-title">
          <h2>Why Choose PCOSmart?</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: '#718096' }}>Our comprehensive approach combines cutting-edge AI technology with medical expertise.</p>
        </div>
        <div className="features-grid">
          <div className="card">
            <div className="feature-icon"><FaUpload /></div>
            <h3>Image AI Analysis</h3>
            <p>Upload your ultrasound and get instant AI-powered PCOS probability assessment.</p>
          </div>
          <div className="card">
            <div className="feature-icon"><FaClipboardList /></div>
            <h3>Symptom Screening</h3>
            <p>Answer guided questions about your symptoms for personalized risk evaluation.</p>
          </div>
          <div className="card">
            <div className="feature-icon"><FaBrain /></div>
            <h3>Explainable Results</h3>
            <p>Understand your results with visual explanations and feature importance charts.</p>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section style={{ background: 'white', padding: '80px 0' }}>
        <div className="container">
          <div className="section-title">
            <h2>How It Works</h2>
            <p style={{ color: '#718096', marginBottom: '50px' }}>Get your personalized PCOS assessment in just four simple steps</p>
          </div>
          <div className="steps-grid">
            <div>
              <div className="step-box"><FaUpload /><div className="step-number">1</div></div>
              <h4>Upload</h4>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>Share your ultrasound image securely</p>
            </div>
            <div>
              <div className="step-box"><FaClipboardList /><div className="step-number">2</div></div>
              <h4>Answer</h4>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>Complete the symptom questionnaire</p>
            </div>
            <div>
              <div className="step-box"><FaBrain /><div className="step-number">3</div></div>
              <h4>Analyze</h4>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>AI processes and explains findings</p>
            </div>
            <div>
              <div className="step-box"><FaLeaf /><div className="step-number">4</div></div>
              <h4>Guide</h4>
              <p style={{ fontSize: '0.9rem', color: '#718096' }}>Get personalized diet & lifestyle tips</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <button onClick={handleStartCheck} className="btn-assessment">
              Start Your Assessment <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* 3D Model Section */}
      <section className="model-section">
        <div className="container">
          <div className="model-content">
            <div className="model-text">
              <h2>Interactive Anatomy</h2>
              <p>Explore the reproductive system in 3D to better understand how PCOS affects your body. Drag to rotate and visualize.</p>
            </div>
            <div className="model-viewer-container">
               {loading && <div className="loading-overlay">Loading 3D Model...</div>}
               <div ref={mountRef} className="three-canvas" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="container">
        <div className="cta-box">
          <h2>Take Control of Your Health Today</h2>
          <p>
            Join thousands of women who have taken the first step towards understanding their reproductive health. Our AI-powered screening is fast, private, and completely free to try.
          </p>
          <div className="action-buttons-container" style={{ marginTop: '30px' }}>
            {!isLoggedIn ? (
              <Link to="/register" className="btn-white">
                Get Started Free
              </Link>
            ) : (
              <Link to="/check/combined" className="btn-white">
                Go to Dashboard
              </Link>
            )}
            <Link to="/awareness" className="btn-transparent">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;