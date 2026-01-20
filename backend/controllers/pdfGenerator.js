const PDFDocument = require("pdfkit");
const axios = require("axios");

// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================

const fetchImageAsBuffer = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
    return Buffer.from(response.data);
  } catch (error) {
    return null;
  }
};

const getChartUrl = (factors) => {
  if (!factors || factors.length === 0) return null;
  const topFactors = factors.slice(0, 5);
  const labels = topFactors.map((f) => f.feature || "Unknown");
  const data = topFactors.map((f) => Math.abs(Number(f.impact) || 0).toFixed(2));

  const chartConfig = {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Impact",
        data: data,
        backgroundColor: "rgba(214, 104, 156, 0.6)",
        borderColor: "rgb(214, 104, 156)",
        borderWidth: 1,
      }],
    },
    options: {
      scales: { y: { beginAtZero: true } },
      plugins: { legend: { display: false }, title: { display: true, text: "Top Risk Factors" } }
    },
  };
  return `https://quickchart.io/chart?w=500&h=300&c=${encodeURIComponent(JSON.stringify(chartConfig))}`;
};

const formatPercent = (p) => `${Math.round((Number(p) || 0) * 100)}%`;

// ==========================================
// 2. MAIN GENERATOR
// ==========================================

const generatePredictionPdfBuffer = async ({
  inputMode,
  submissionId,
  mlResult,
  inputSnapshot,
  imageUrl,
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Setup Document
      const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const PRIMARY = "#D6689C";   // Pink
      const SECONDARY = "#2D3748"; // Dark Grey
      const BG_HEADER = "#FFF5F8"; // Light Pink BG

      // ---------------------------------------------------------
      // SECTION 1: HEADER & RESULTS
      // ---------------------------------------------------------
      
      // Header Background
      doc.rect(0, 0, 595, 130).fill(BG_HEADER);
      
      // Logo & Title
      doc.fillColor(PRIMARY).fontSize(26).font("Helvetica-Bold").text("PCOSmart", 50, 45);
      doc.fillColor(SECONDARY).fontSize(10).font("Helvetica").text("AI-Powered Women's Health Assessment", 50, 75);

      // Meta Data (Right Aligned)
      doc.fontSize(9).text(`Report ID: ${submissionId.slice(-8)}`, 350, 45, { width: 195, align: "right" });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 350, 60, { width: 195, align: "right" });
      doc.text(`Mode: ${String(inputMode).toUpperCase()}`, 350, 75, { width: 195, align: "right" });

      doc.moveDown(5); // Move past header

      // Result Summary Box
      const prob = mlResult?.probability || 0;
      const risk = mlResult?.risk_level || (prob > 0.5 ? "High" : "Low");
      const riskColor = risk.toLowerCase().includes("high") ? "#C53030" : "#2F855A";

      // Draw Box
      doc.roundedRect(50, 150, 495, 70, 8).fillAndStroke("white", PRIMARY);
      
      // Box Content
      doc.fillColor(SECONDARY).fontSize(12).font("Helvetica-Bold").text("ASSESSMENT RESULT", 70, 165);
      doc.fontSize(14).font("Helvetica").text(`Probability: `, 70, 185, { continued: true });
      doc.font("Helvetica-Bold").text(formatPercent(prob));
      
      doc.font("Helvetica").text(`Risk Level: `, 300, 185, { continued: true });
      doc.fillColor(riskColor).font("Helvetica-Bold").text(risk);

      doc.y = 240; // Hard reset Y position below box

      // ---------------------------------------------------------
      // SECTION 2: VISUALS (Image & Graph)
      // ---------------------------------------------------------

      // 1. Ultrasound Image
      if ((inputMode === "image" || inputMode === "combined") && imageUrl) {
        doc.fillColor(PRIMARY).fontSize(16).font("Helvetica-Bold").text("Analyzed Ultrasound", 50, doc.y);
        doc.moveDown(0.5);

        const imgBuf = await fetchImageAsBuffer(imageUrl);
        if (imgBuf) {
          if (doc.y > 600) doc.addPage();
          doc.image(imgBuf, { fit: [400, 250], align: 'center' });
          doc.moveDown(1);
        }
      }

      // 2. Chart
      if (mlResult?.top_factors && mlResult.top_factors.length > 0) {
        if (doc.y > 550) doc.addPage(); 
        else doc.moveDown(2);

        doc.fillColor(PRIMARY).fontSize(16).font("Helvetica-Bold").text("Symptom Analysis", 50, doc.y);
        doc.moveDown(0.5);

        const chartUrl = getChartUrl(mlResult.top_factors);
        const chartBuf = await fetchImageAsBuffer(chartUrl);
        if (chartBuf) {
          doc.image(chartBuf, { width: 450, align: "center" });
        }
      }

      // ---------------------------------------------------------
      // SECTION 3: EXPLANATION & RECOMMENDATIONS (Page 2)
      // ---------------------------------------------------------
      doc.addPage(); // Start fresh for text

      // Narrative
      if (mlResult?.narration) {
        doc.fillColor(PRIMARY).fontSize(18).font("Helvetica-Bold").text("Clinical Explanation");
        doc.moveDown(0.5);
        doc.fillColor(SECONDARY).fontSize(11).font("Helvetica").text(mlResult.narration, {
          align: 'justify',
          lineGap: 5
        });
        doc.moveDown(2);
      }

      // Recommendations (SPACIOUS LAYOUT)
      if (mlResult?.recommendations) {
        doc.fillColor(PRIMARY).fontSize(18).font("Helvetica-Bold").text("Action Plan");
        doc.moveDown(1);

        // Diet Header
        doc.fillColor("#2C7A7B").fontSize(14).font("Helvetica-Bold").text("DIETARY RECOMMENDATIONS");
        doc.moveDown(0.5);
        
        // Diet Body
        doc.fillColor(SECONDARY).fontSize(11).font("Helvetica").text(
          mlResult.recommendations.diet || "Eat whole foods.", 
          { width: 480, align: 'left', lineGap: 6 } // Increased line gap
        );
        
        doc.moveDown(2); // Space between sections

        // Exercise Header
        doc.fillColor("#C53030").fontSize(14).font("Helvetica-Bold").text("EXERCISE RECOMMENDATIONS");
        doc.moveDown(0.5);
        
        // Exercise Body
        doc.fillColor(SECONDARY).fontSize(11).font("Helvetica").text(
          mlResult.recommendations.exercise || "Exercise regularly.", 
          { width: 480, align: 'left', lineGap: 6 } // Increased line gap
        );
        doc.moveDown(2);
      }

      // ---------------------------------------------------------
      // SECTION 4: DATA SNAPSHOT
      // ---------------------------------------------------------
      if (inputSnapshot && Object.keys(inputSnapshot).length > 0) {
        if (doc.y > 600) doc.addPage();
        else doc.moveDown(1);

        doc.fillColor(PRIMARY).fontSize(14).font("Helvetica-Bold").text("Input Data Summary");
        doc.moveDown(0.5);
        
        let y = doc.y;
        doc.fontSize(9).font("Helvetica");

        const keys = Object.keys(inputSnapshot).filter(k => k !== 'imageUrl' && inputSnapshot[k] !== null);

        keys.forEach((key, index) => {
          if (y > 750) { doc.addPage(); y = 50; }

          if (index % 2 === 0) doc.rect(50, y - 2, 495, 16).fill("#F9FAFB");

          doc.fillColor(SECONDARY).text(key, 60, y + 2);
          doc.text(String(inputSnapshot[key]).substring(0, 50), 300, y + 2);
          
          y += 18;
        });
      }

      // ---------------------------------------------------------
      // FINAL FOOTER (Just once at the end)
      // ---------------------------------------------------------
      doc.moveDown(4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).strokeColor("#E2E8F0").stroke();
      doc.moveDown(1);
      doc.fontSize(10).fillColor(PRIMARY).font("Helvetica-Bold").text(
        "Please consult a doctor for a full medical diagnosis.", 
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      console.error("PDF Gen Error:", err);
      reject(err);
    }
  });
};

module.exports = { generatePredictionPdfBuffer };