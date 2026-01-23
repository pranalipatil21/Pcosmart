import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { FaQuestion, FaBrain, FaHeartbeat, FaNotesMedical, FaPills, FaTimesCircle, FaCheckCircle, FaDna } from 'react-icons/fa';

const AboutPCOS = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleAssessmentClick = () => {
    if (isLoggedIn) {
      navigate('/check/combined');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="container page-spacing" style={{ maxWidth: '1200px', paddingBottom: '80px' }}>
      
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE */}
      <div className="about-header-section">
        <div className="hero-overlay">
          <span className="badge">Education & Awareness</span>
          <h1 style={{ fontSize: '3.5rem', margin: '20px 0', fontWeight: 'bold' }}>
            Understanding PCOS
          </h1>
          <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.8' }}>
            Empower yourself with knowledge. Learn about causes, symptoms, and how to manage Polycystic Ovary Syndrome effectively.
          </p>
        </div>
      </div>

      {/* 2. WHAT IS PCOS (Image Right) */}
      <div className="info-card">
        <div className="info-card-grid">
          <div className="info-card-content">
            <div className="icon-square" style={{ background: '#D6689C' }}>
              <FaQuestion />
            </div>
            <h2 style={{ marginBottom: '20px', fontSize: '2rem', color: '#2D3748' }}>What is PCOS?</h2>
            <p style={{ color: '#4A5568', lineHeight: '1.8', fontSize: '1.05rem' }}>
              Polycystic Ovary Syndrome (PCOS) is a chronic hormonal and metabolic disorder affecting women of reproductive age. It is characterized by an imbalance of reproductive hormones, which can interfere with normal ovulation.
              <br /><br />
              The ovaries may develop numerous small fluid-filled sacs called follicles. While not dangerous, they indicate that ovulation is not happening regularly. PCOS affects metabolism, mental health, and heart health, making early management crucial.
            </p>
          </div>
          <img 
            src="https://defensetalks.com/wp-content/uploads/2021/10/questioning-woman.jpg" 
            alt="Ovarian follicles illustration" 
            className="info-card-image"
          />
        </div>
      </div>

      {/* 3. CAUSES (Image Left) - Tightened layout to remove empty space */}
      <div className="info-card">
        <div className="info-card-grid">
          <img 
            src="https://southendfertilityclinic.com.ng/wp-content/uploads/2018/01/PCOS.png" 
            alt="Doctor consultation" 
            className="info-card-image"
            style={{ order: window.innerWidth < 900 ? -1 : 0 }} 
          />
          <div className="info-card-content">
            <div className="icon-square" style={{ background: '#805AD5' }}>
              <FaDna />
            </div>
            <h2 style={{ marginBottom: '20px', fontSize: '2rem', color: '#2D3748' }}>Root Causes</h2>
            <p style={{ color: '#4A5568', lineHeight: '1.8', marginBottom: '20px' }}>
              The exact cause is unknown, but several factors play a key role:
            </p>
            {/* Added a background container to fill 'empty' space */}
            <div className="causes-compact-container">
              <div className="check-item-red"><FaBrain color="#805AD5"/> <div><strong>Insulin Resistance:</strong> High insulin levels trigger androgen production.</div></div>
              <div className="check-item-red"><FaHeartbeat color="#805AD5"/> <div><strong>Inflammation:</strong> Chronic low-grade inflammation stimulates ovaries to produce testosterone.</div></div>
              <div className="check-item-red"><FaDna color="#805AD5"/> <div><strong>Genetics:</strong> PCOS often runs in families.</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SYMPTOMS (Image Left, Text Right) */}
      <div className="info-card">
        <div className="info-card-grid">
          <img 
            src="https://cdn.sanity.io/images/iy559jeo/production/0a0dff27ebd31c93f92705481e4f3f446398ffef-4896x3264.jpg?w=3840&q=75&fit=clip&auto=format" 
            alt="PCOS symptoms representation" 
            className="info-card-image"
            style={{ order: window.innerWidth < 900 ? -1 : 0 }} 
          />
          <div className="info-card-content">
            <div className="icon-square" style={{ background: '#D6689C' }}>
              <FaNotesMedical />
            </div>
            <h2 style={{ marginBottom: '20px', fontSize: '2.2rem', color: '#2D3748' }}>Common Symptoms</h2>
            
            <div className="symptoms-split-grid">
              <div className="check-list-vertical">
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Irregular or absent menstrual cycles</div>
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Difficulty conceiving (Infertility)</div>
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Excess hair growth (Hirsutism)</div>
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Unexplained weight gain</div>
              </div>
              <div className="check-list-vertical">
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Thinning hair on the scalp</div>
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Severe acne or oily skin</div>
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Darkening of skin (Acanthosis)</div>
                <div className="check-item-red"><FaCheckCircle className="icon-circle-outline" /> Fatigue and mood swings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TREATMENT (Image Right) */}
      <div className="info-card">
        <div className="info-card-grid">
          <div className="info-card-content">
            <div className="icon-square" style={{ background: '#38A169' }}>
              <FaPills />
            </div>
            <h2 style={{ marginBottom: '20px', fontSize: '2rem', color: '#2D3748' }}>Treatment Options</h2>
            <p style={{ color: '#4A5568', lineHeight: '1.8', marginBottom: '20px' }}>
              While there is no cure, symptoms can be managed effectively through lifestyle changes and medical treatment.
            </p>
            <div className="check-list-vertical">
              <div className="check-item-red"><FaCheckCircle color="#38A169"/> Lifestyle: Diet (Low GI) and regular exercise</div>
              <div className="check-item-red"><FaCheckCircle color="#38A169"/> Medications: Birth control or Metformin</div>
              <div className="check-item-red"><FaCheckCircle color="#38A169"/> Fertility treatments if trying to conceive</div>
              <div className="check-item-red"><FaCheckCircle color="#38A169"/> Supplements: Inositol, Vitamin D, Omega-3</div>
            </div>
          </div>
          <img 
            src="https://medlineplus.gov/images/WomensHealthCheckup_Share.jpg" 
            alt="Healthy Lifestyle" 
            className="info-card-image"
          />
        </div>
      </div>

      {/* 6. MYTHS VS FACTS SECTION */}
      <div className="section-title" style={{ marginTop: '80px', marginBottom: '50px' }}>
        <h2>Myths vs <span style={{ color: '#D6689C' }}>Facts</span></h2>
        <p style={{ color: '#718096' }}>Debunking common misconceptions to help you understand the reality.</p>
      </div>

      <div className="myth-fact-grid-wrapper">
        <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">PCOS only affects overweight women.</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">PCOS affects women of all sizes. "Lean PCOS" is common, where metabolic issues still occur.</p>
          </div>
        </div>

        <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">You can't get pregnant with PCOS.</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">Most women with PCOS can conceive naturally or with minor fertility assistance.</p>
          </div>
        </div>

        <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">PCOS is just an ovary problem.</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">PCOS is a metabolic disorder that affects the whole body, including heart and mental health.</p>
          </div>
        </div>
      </div>

      {/* 8. CTA Card */}
      <div className="info-card cta-card">
        <h2 style={{ fontSize: '2.2rem', marginBottom: '15px' }}>Think You Might Have PCOS?</h2>
        <p style={{ color: '#718096', maxWidth: '600px', margin: '0 auto 30px auto', fontSize: '1.1rem' }}>
          Early detection is the key to managing your health. Take our AI-powered screening test today.
        </p>
        <button onClick={handleAssessmentClick} className="btn-assessment">
          Start Your Assessment
        </button>
      </div>

    </div>
  );
};

export default AboutPCOS;