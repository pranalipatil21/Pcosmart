import React, { useState, useEffect } from 'react';
import { 
  FaAppleAlt, FaDumbbell, FaMoon, FaLeaf, FaBan, FaQuestion, 
  FaChevronDown, FaPaperPlane, FaTimes, FaMortarPestle, FaFire,
  FaChevronLeft, FaChevronRight, FaChevronUp
} from 'react-icons/fa';

const DietExercise = () => {
  // ==========================
  // 1. STATE MANAGEMENT
  // ==========================
  const [faqIndex, setFaqIndex] = useState(null);
  
  // Dropdown States (for Nutrition/Ayurveda lists)
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Slideshow State (for Exercise)
  const [exerciseSlide, setExerciseSlide] = useState(0);

  // Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "model", parts: [{ text: "Hi! I'm Cora, your PCOS health companion. How can I help you today?" }] }
  ]);

  // ==========================
  // 2. DATA CONSTANTS
  // ==========================
  
  // Nutrition Data
  const embraceFoods = [
    { title: "Leafy Greens", desc: "Spinach, kale, and broccoli help reduce inflammation", type: "green" },
    { title: "Lean Proteins", desc: "Fish, chicken, and legumes for stable blood sugar", type: "green" },
    { title: "Whole Grains", desc: "Quinoa, oats, and brown rice for sustained energy", type: "green" },
    { title: "Healthy Fats", desc: "Avocados, nuts, and olive oil support hormone balance", type: "green" },
    { title: "Berries", desc: "Antioxidant-rich fruits that combat oxidative stress", type: "green" }
  ];

  const limitFoods = [
    { title: "Refined Carbs", desc: "White bread, pastries, and sugary snacks", type: "red" },
    { title: "Sugary Drinks", desc: "Sodas, fruit juices, and sweetened beverages", type: "red" },
    { title: "Processed Foods", desc: "Fast food, packaged snacks, and ready meals", type: "red" },
    { title: "Excessive Dairy", desc: "May worsen hormonal imbalances in some", type: "red" },
    { title: "Alcohol", desc: "Can affect hormone levels and liver function", type: "red" }
  ];

  // Ayurveda Data
  const ayurvedaRituals = [
    { title: "Warm Water Start", desc: "Start the day with warm water and lemon to aid digestion", type: "orange" },
    { title: "Seed Cycling", desc: "Rotate flax/pumpkin seeds (Phase 1) and sesame/sunflower (Phase 2)", type: "orange" },
    { title: "Mindful Eating", desc: "Eat largest meal at noon when digestive fire (Agni) is strongest", type: "orange" }
  ];

  const ayurvedaHerbs = [
    { title: "Ashwagandha", desc: "Adaptogen that helps manage stress and balance cortisol", type: "green" },
    { title: "Shatavari", desc: "Supports female reproductive health and hormonal balance", type: "green" },
    { title: "Cinnamon & Turmeric", desc: "Spices that improve insulin sensitivity", type: "green" }
  ];

  // Exercise Slideshow Data
  const exerciseSlides = [
    {
      level: "Low Risk",
      color: "low", // css class suffix
      routine: [
        { name: "Brisk Walking", detail: "30 min • Daily" },
        { name: "Yoga", detail: "45 min • 3x/week" },
        { name: "Swimming", detail: "30 min • 2x/week" }
      ]
    },
    {
      level: "Moderate Risk",
      color: "mod",
      routine: [
        { name: "HIIT Training", detail: "20 min • 3x/week" },
        { name: "Strength Training", detail: "45 min • 3x/week" },
        { name: "Cycling", detail: "30 min • 4x/week" }
      ]
    },
    {
      level: "High Risk",
      color: "high",
      routine: [
        { name: "Gentle Walking", detail: "20 min • Daily" },
        { name: "Restorative Yoga", detail: "30 min • 4x/week" },
        { name: "Light Stretching", detail: "15 min • Daily" }
      ]
    }
  ];

  const faqs = [
    { q: "Can diet alone cure PCOS?", a: "Diet helps manage symptoms but is not a complete cure on its own." },
    { q: "How quickly will I see results?", a: "Energy improves in 2-3 weeks; weight/cycles take 3-6 months." },
    { q: "Keto or Paleo?", a: "No one-size-fits-all. Focus on whole foods and blood sugar stability." },
    { q: "Cardio or Weights?", a: "A mix is best. Weights for insulin, cardio for heart health." },
    { q: "Supplements?", a: "Inositol, Vitamin D, and Magnesium are common, but consult a doctor." }
  ];

  // ==========================
  // 3. HANDLERS
  // ==========================
  const toggleFAQ = (index) => setFaqIndex(faqIndex === index ? null : index);
  
  const toggleDropdown = (section, index) => {
    const key = `${section}-${index}`;
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const nextSlide = () => {
    setExerciseSlide((prev) => (prev === exerciseSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setExerciseSlide((prev) => (prev === 0 ? exerciseSlides.length - 1 : prev - 1));
  };

const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // 1. Create the user message object
    const userMsg = { role: "user", parts: [{ text: chatInput }] };
    
    // 2. Update UI immediately
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      // 3. Filter History: Remove the first "Hi I'm Cora" message because 
      // Gemini history MUST start with a 'user' message, not 'model'.
      // We also verify we aren't sending the message we just typed (it goes in 'message' body)
      const historyForBackend = chatHistory.slice(1); 

      // 4. Send Request
      const response = await fetch('http://localhost:5000/api/auth/pcos-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg.parts[0].text, // Send the text directly
          history: historyForBackend 
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        setChatHistory(prev => [...prev, { role: "model", parts: [{ text: data.text }] }]);
      } else {
        throw new Error(data.error || "Server error");
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setChatHistory(prev => [...prev, { 
        role: "model", 
        parts: [{ text: "I'm having a little trouble connecting. Please check your internet or try again." }] 
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  return (
    <div className="container page-spacing">
      
      {/* Header */}
      <div className="hero-header mb-12 fade-in">
        <div className="hero-content text-center">
          <span className="badge" style={{ background: 'rgba(255,255,255,0.95)' }}>Lifestyle Guide</span>
          <h1 style={{ fontSize: '3.5rem', margin: '15px 0', color: '#1A202C' }}>Diet & <span style={{ color: '#D53F8C' }}>Exercise</span></h1>
          <p style={{ color: '#2D3748', fontWeight: '500' }}>Interactive guide for PCOS nutrition and fitness</p>
        </div>
      </div>

      {/* 1. NUTRITION DROPDOWNS */}
      <div className="diet-section-header fade-in">
        <div className="icon-header-lg"><FaAppleAlt /></div>
        <h2 style={{ fontSize: '2rem' }}>Nutrition <span style={{ color: '#D6689C' }}>Guidelines</span></h2>
      </div>

      <div className="grid md:grid-cols-2 gap-8 fade-in-up">
        {/* Embrace Card */}
        <div className="card md:flex">
          <div className="flex-1 pr-4">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaLeaf style={{ color: '#48BB78' }} /> Foods to Embrace
            </h3>
            <div className="dropdown-list">
              {embraceFoods.map((item, idx) => (
                <div key={idx} className="dropdown-item" onClick={() => toggleDropdown('embrace', idx)}>
                  <div className="dropdown-header">
                    <span className="dot-indicator dot-green">{item.title}</span>
                    {openDropdowns[`embrace-${idx}`] ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                  </div>
                  <div className={`dropdown-content ${openDropdowns[`embrace-${idx}`] ? 'open' : ''}`}>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block w-1/3 ml-4 overflow-hidden rounded-xl">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Healthy Foods" className="w-full h-full object-cover" style={{ minHeight: '300px' }} />
          </div>
        </div>

        {/* Limit Card */}
        <div className="card md:flex">
          <div className="flex-1 pr-4">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaBan style={{ color: '#F56565' }} /> Foods to Limit
            </h3>
            <div className="dropdown-list">
              {limitFoods.map((item, idx) => (
                <div key={idx} className="dropdown-item" onClick={() => toggleDropdown('limit', idx)}>
                  <div className="dropdown-header">
                    <span className="dot-indicator dot-red">{item.title}</span>
                    {openDropdowns[`limit-${idx}`] ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                  </div>
                  <div className={`dropdown-content ${openDropdowns[`limit-${idx}`] ? 'open' : ''}`}>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:block w-1/3 ml-4 overflow-hidden rounded-xl">
            <img src="https://www.adityabirlacapital.com/healthinsurance/active-together/wp-content/uploads/2018/10/Unhealthy-Food-Chart.jpg" alt="Unhealthy Foods" className="w-full h-full object-cover" style={{ minHeight: '300px' }} />
          </div>
        </div>
      </div>

      {/* 2. AYURVEDA DROPDOWNS */}
      <div className="diet-section-header fade-in" style={{ marginTop: '80px' }}>
        <div className="icon-header-lg" style={{ background: '#FFEDD5', color: '#DD6B20' }}><FaMortarPestle /></div>
        <h2 style={{ fontSize: '2rem' }}>Ayurvedic <span style={{ color: '#DD6B20' }}>Wisdom</span></h2>
        <p style={{ color: '#718096', marginTop: '10px' }}>Ancient practices for modern balance</p>
      </div>

      {/* PARENT CONTAINER: Uses Flexbox to force side-by-side layout */}
      <div className="fade-in-up" style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: '30px', 
        marginTop: '30px', 
        justifyContent: 'center' 
      }}>
        
        {/* Rituals Card */}
        <div className="card" style={{ 
            padding: 0, 
            overflow: 'hidden', 
            border: '1px solid #FFEDD5', 
            background: '#FFFaf0',
            flex: '1',              /* Makes it share width equally */
            minWidth: '300px',      /* Prevents it from getting too small */
            maxWidth: '500px'       /* Prevents it from getting too big */
          }}>
          
          <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
            <img 
              src="https://www.hopkinsmedicine.org/-/media/images/health/3_-wellness/integrative-medicine/ayurveda-hero.jpg?h=500&iar=0&mh=500&mw=1300&w=1297&hash=DD0B0188ECBAD543471211F37C1A2B38" 
              alt="Ayurveda Morning Ritual" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1))' }}></div>
          </div>

          <div style={{ padding: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#C05621', fontSize: '1.25rem' }}>
              <FaFire style={{ color: '#DD6B20' }} /> Daily Rituals
            </h3>
            
            <div className="dropdown-list">
              {ayurvedaRituals.map((item, idx) => (
                <div key={idx} className="dropdown-item" onClick={() => toggleDropdown('ritual', idx)} style={{ background: 'white' }}>
                  <div className="dropdown-header">
                    <span className="dot-indicator dot-orange">{item.title}</span>
                    {openDropdowns[`ritual-${idx}`] ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                  </div>
                  <div className={`dropdown-content ${openDropdowns[`ritual-${idx}`] ? 'open' : ''}`}>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Herbs Card */}
        <div className="card" style={{ 
            padding: 0, 
            overflow: 'hidden', 
            border: '1px solid #C6F6D5', 
            background: '#F0FFF4',
            flex: '1',              /* Makes it share width equally */
            minWidth: '300px',      /* Prevents it from getting too small */
            maxWidth: '500px'       /* Prevents it from getting too big */
          }}>
          
          <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
            <img 
              src="https://ayurhealing.net/wp-content/uploads/2018/02/Benefits-of-Ayurveda-Treatment-Dr.-Mini-Nair-AyurHealing-Hospital.jpg" 
              alt="Ayurvedic Herbs" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
             <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.1))' }}></div>
          </div>

          <div style={{ padding: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#2F855A', fontSize: '1.25rem' }}>
              <FaLeaf style={{ color: '#38A169' }} /> Healing Herbs
            </h3>
            
            <div className="dropdown-list">
              {ayurvedaHerbs.map((item, idx) => (
                <div key={idx} className="dropdown-item" onClick={() => toggleDropdown('herb', idx)} style={{ background: 'white' }}>
                  <div className="dropdown-header">
                    <span className="dot-indicator dot-green">{item.title}</span>
                    {openDropdowns[`herb-${idx}`] ? <FaChevronUp size={12}/> : <FaChevronDown size={12}/>}
                  </div>
                  <div className={`dropdown-content ${openDropdowns[`herb-${idx}`] ? 'open' : ''}`}>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      
      {/* 3. EXERCISE SLIDESHOW */}
      <div className="diet-section-header fade-in" style={{ marginTop: '80px' }}>
        <div className="icon-header-lg"><FaDumbbell /></div>
        <h2 style={{ fontSize: '2rem' }}>Exercise <span style={{ color: '#D6689C' }}>Slideshow</span></h2>
        <p style={{ color: '#718096', marginTop: '10px' }}>Swipe through risk-based routines</p>
      </div>

      <div className="slideshow-container fade-in-up" style={{ marginTop: '30px' }}>
        <div className="card slideshow-card">
          
          <div className="slideshow-controls">
            <button onClick={prevSlide} className="slide-btn"><FaChevronLeft /></button>
            <span className={`risk-tag tag-${exerciseSlides[exerciseSlide].color}`}>
              {exerciseSlides[exerciseSlide].level}
            </span>
            <button onClick={nextSlide} className="slide-btn"><FaChevronRight /></button>
          </div>

          <div className="slide-content-wrapper">
             {/* Key changes to trigger animation on slide change */}
            <div key={exerciseSlide} className="slide-content fade-in-slide">
              {exerciseSlides[exerciseSlide].routine.map((ex, i) => (
                <div key={i} className="exercise-box">
                  <span className="exercise-name">{ex.name}</span>
                  <span className="exercise-detail">{ex.detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="slide-indicators">
            {exerciseSlides.map((_, idx) => (
              <div 
                key={idx} 
                className={`indicator ${idx === exerciseSlide ? 'active' : ''}`}
                onClick={() => setExerciseSlide(idx)}
              ></div>
            ))}
          </div>

        </div>
      </div>

      {/* 4. FAQ DROPDOWNS */}
      <div style={{ marginTop: '80px', marginBottom: '40px' }} className="fade-in">
        <div className="diet-section-header">
          <div className="icon-header-lg"><FaQuestion /></div>
          <h2 style={{ fontSize: '2.5rem' }}>Common <span style={{ color: '#D6689C' }}>Questions</span></h2>
        </div>
        <div style={{ maxWidth: '900px', margin: '40px auto 0 auto' }}>
          {faqs.map((item, index) => (
            <div key={index} className={`faq-item ${faqIndex === index ? 'faq-open' : ''}`} onClick={() => toggleFAQ(index)}>
              <div className="faq-header">
                <span>{item.q}</span>
                <FaChevronDown className="faq-icon" size={14} />
              </div>
              {faqIndex === index && <div className="faq-body">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      
 {/* Chatbot (Kept as is) */}
      <div className={`chat-bot-container ${isChatOpen ? 'open' : ''}`}>
        {!isChatOpen ? (
          <button className="chat-toggle-btn" onClick={() => setIsChatOpen(true)}>
            <FaQuestion /><span>Ask Cora</span>
          </button>
        ) : (
          <div className="chat-window">
            <div className="chat-header">
              <span>Cora: PCOS Expert</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: 'none', border: 'none', color: 'white' }}><FaTimes /></button>
            </div>
            <div className="chat-messages">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`message-bubble ${msg.role === 'user' ? 'user' : 'model'}`}>{msg.parts[0].text}</div>
              ))}
              {isTyping && <div className="message-bubble model">Cora is typing...</div>}
            </div>
            <form className="chat-input-area" onSubmit={handleChatSubmit}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask..." />
              <button type="submit"><FaPaperPlane /></button>
            </form>
          </div>
        )}
      </div>

    </div>  );
};

export default DietExercise;