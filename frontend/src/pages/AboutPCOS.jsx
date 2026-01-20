import React from 'react';
// FIX: Added 'useNavigate' and removed unused 'Link'
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; // FIX: Added missing slash
// FIX: Removed unused 'FaArrowRight'
import { FaQuestion, FaBrain, FaHeartbeat, FaNotesMedical, FaPills, FaTimesCircle, FaCheckCircle, FaHeart } from 'react-icons/fa';

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
    <div className="container page-spacing" style={{ maxWidth: '1000px', paddingBottom: '80px' }}>
      
      {/* 1. Header Section */}
      <div className="about-header-section">
        <span className="badge">Education & Awareness</span>
        <h1 style={{ fontSize: '3rem', margin: '20px 0' }}>
          Understanding <span style={{ color: '#D6689C' }}>PCOS</span>
        </h1>
        <p style={{ color: '#718096', maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem' }}>
          Learn about Polycystic Ovary Syndrome, its causes, symptoms, and treatment options. 
          Knowledge is the first step towards managing your health.
        </p>
      </div>

      {/* 2. What is PCOS Card */}
      <div className="info-card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="icon-square" style={{ background: '#D6689C', minWidth: '50px' }}>
            <FaQuestion />
          </div>
          <div>
            <h2 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>What is PCOS?</h2>
            <p style={{ color: '#4A5568', lineHeight: '1.7' }}>
              Polycystic Ovary Syndrome (PCOS) is a chronic hormonal and metabolic disorder that affects women during their reproductive years (typically ages 15–44). It is characterized by an imbalance of reproductive hormones, which can interfere with normal ovulation. As a result, the ovaries may not release eggs regularly and may contain multiple small, fluid-filled sacs called follicles (often mistakenly referred to as cysts).
              PCOS is one of the leading causes of infertility, but it also affects overall health, including metabolism, mental well-being, and cardiovascular health. The condition varies widely—some women have severe symptoms, while others may have mild or no noticeable symptoms.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Causes Card */}
      <div className="info-card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="icon-square" style={{ background: '#C068D6', minWidth: '50px' }}>
            <FaBrain />
          </div>
          <div>
            <h2 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Causes of PCOS</h2>
            <p style={{ color: '#4A5568', lineHeight: '1.7' }}>
              The exact cause of PCOS is not fully understood, but research suggests it results from a combination of genetic, hormonal, and environmental factors:<br></br>
              <b>1. Insulin resistance:</b> Many women with PCOS have insulin resistance, meaning their bodies do not use insulin effectively. This leads to higher insulin levels, which stimulate the ovaries to produce excess androgens.<br></br>
              <b>2. Excess androgen production:</b> Elevated levels of male hormones (such as testosterone) disrupt ovulation and cause symptoms like acne and excessive hair growth.<br></br>
              <b>3. Low-grade inflammation:</b> Women with PCOS often have chronic low-level inflammation, which may trigger androgen production.<br></br>
              <b>4. Genetics:</b> PCOS tends to run in families, suggesting a hereditary component.<br></br>
              <b>5. Lifestyle factors:</b> Poor diet, physical inactivity, and weight gain can worsen symptoms, though PCOS can occur in women of all body types.<br></br>
              Early diagnosis and management can significantly reduce the risk of long-term complications.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Symptoms Card */}
      <div className="info-card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="icon-square" style={{ background: '#C068D6', minWidth: '50px' }}>
            <FaNotesMedical />
          </div>
          <div style={{ width: '100%' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Common Symptoms</h2>
            <div className="check-list-vertical">
              {[
                "Irregular menstrual cycles: Infrequent, prolonged, or absent periods due to lack of regular ovulation",
                "Infertility: Difficulty conceiving because ovulation may not occur consistently",
                "Hirsutism: Excess hair growth on the face, chest, abdomen, or back",
                "Weight gain: Especially around the abdomen, linked to insulin resistance",
                "Hair thinning or hair loss: Male-pattern hair thinning on the scalp",
                "Acne and oily skin: Caused by increased androgen levels",
                "Skin darkening (acanthosis nigricans): Dark, thickened patches of skin, commonly on the neck, underarms, or groin"
              ].map((item, index) => (
                <div key={index} className="check-item-red">
                  <FaCheckCircle className="icon-circle-outline" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Health Risks Card */}
      <div className="info-card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="icon-square" style={{ background: '#D6689C', minWidth: '50px' }}>
            <FaHeartbeat />
          </div>
          <div style={{ width: '100%' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Health Risks</h2>
            <div className="check-list-vertical">
              {[
                "Type 2 diabetes or prediabetes: Due to insulin resistance",
                "High blood pressure (hypertension): Raises cardiovascular risk",
                "Abnormal cholesterol levels: Increased LDL (“bad”) cholesterol and decreased HDL (“good”) cholesterol",
                "Heart disease and stroke: Higher long-term cardiovascular risk",
                "Endometrial cancer: Irregular or absent periods can cause thickening of the uterine lining",
                "Mental health disorders: Increased risk of depression, anxiety, and eating disorders",
                "Sleep apnea: Particularly in women who are overweight or obese"
              ].map((item, index) => (
                <div key={index} className="check-item-red">
                  <FaCheckCircle className="icon-circle-outline" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Treatment Options Card */}
      <div className="info-card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div className="icon-square" style={{ background: '#C068D6', minWidth: '50px' }}>
            <FaPills />
          </div>
          <div>
            <h2 style={{ marginBottom: '15px', fontSize: '1.5rem' }}>Treatment Options</h2>
            <p style={{ color: '#4A5568', lineHeight: '1.7', marginBottom: '20px' }}>
              There is no cure for PCOS, but treatments are highly effective at managing symptoms and preventing complications. Treatment plans are individualized based on symptoms and reproductive goals.
            </p>
            <div className="check-list-vertical">
              {[
                "Lifestyle modifications (diet and exercise)",
                "Birth control pills to regulate periods",
                "Metformin to improve insulin resistance",
                "Fertility treatments if trying to conceive",
                "Anti-androgen medications",
                "Hair removal treatments"
              ].map((item, index) => (
                <div key={index} className="check-item-red">
                  <FaCheckCircle className="icon-circle-outline" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Myths vs Facts Section */}
      <div className="section-title" style={{ marginTop: '60px' }}>
        <h2>Myths vs <span style={{ color: '#D6689C' }}>Facts</span></h2>
        <p style={{ color: '#718096' }}>Let's clear up some common misconceptions about PCOS</p>
      </div>

      <div className="myth-fact-grid-wrapper">
        <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">PCOS only affects overweight women</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">PCOS affects women of all body types. While weight can worsen symptoms, lean women can also have PCOS.</p>
          </div>
        </div>

        <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">You can't get pregnant with PCOS</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">With proper treatment, many women with PCOS can conceive naturally or with fertility assistance.</p>
          </div>
        </div>

        <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">PCOS symptoms are the same for everyone</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">PCOS manifests differently in each person. Some may have all symptoms, others only a few.</p>
          </div>
        </div>
        
         <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">Birth control cures PCOS</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">Birth control manages symptoms but doesn't cure PCOS. Symptoms may return after stopping.</p>
          </div>
        </div>
        
         <div className="myth-fact-container">
          <div className="myth-card">
            <div className="myth-label"><FaTimesCircle /> Myth</div>
            <p className="myth-fact-text">PCOS only affects reproductive health</p>
          </div>
          <div className="fact-card">
            <div className="fact-label"><FaCheckCircle /> Fact</div>
            <p className="myth-fact-text">PCOS is a metabolic disorder affecting heart health, mental health, and more.</p>
          </div>
        </div>

      </div>

      {/* 8. CTA Card */}
      <div className="info-card" style={{ textAlign: 'center', marginTop: '40px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <FaHeart style={{ fontSize: '3rem', color: '#D6689C', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>Think You Might Have PCOS?</h2>
        <p style={{ color: '#718096', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          Take our AI-powered screening test to get personalized insights about your symptoms. 
          Early detection can help you manage PCOS more effectively.
        </p>
        
        <button onClick={handleAssessmentClick} className="btn-assessment">
          Start Your Assessment
        </button>
      </div>

    </div>
  );
};

export default AboutPCOS;