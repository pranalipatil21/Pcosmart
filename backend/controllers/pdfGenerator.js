const PDFDocument = require("pdfkit");

const fetchImageAsBuffer = async (url) => {
    const resp = await axios.get(url, { responseType: "arraybuffer", timeout: 30000 });
    return Buffer.from(resp.data);
};

const formatPercent = (p) => `${Math.round((Number(p) || 0) * 100)}%`;

const generatePredictionPdfBuffer = async ({
    inputMode,          // "simple" | "clinical" | "image"
    submissionId,
    mlResult,           // {probability, risk_level, top_factors, narration}
    inputSnapshot,      // object to print (optional)
    imageUrl,           // for image mode only
}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A4", margin: 50 });
            const chunks = [];

            doc.on("data", (c) => chunks.push(c));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);

            // Header
            doc.fontSize(18).font("Helvetica-Bold").text("PCOSmart Screening Report", { align: "center" });
            doc.moveDown(0.5);
            doc.fontSize(10).font("Helvetica")
                .text(`Mode: ${String(inputMode).toUpperCase()}`, { align: "center" })
                .text(`Submission ID: ${submissionId}`, { align: "center" })
                .text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });

            doc.moveDown(1);

            // Summary
            doc.fontSize(13).font("Helvetica-Bold").text("Summary");
            doc.moveDown(0.3);
            doc.fontSize(11).font("Helvetica");
            doc.text(`PCOS Probability: ${formatPercent(mlResult?.probability)}`);
            doc.text(`Risk Level: ${mlResult?.risk_level || "Unknown"}`);

            doc.moveDown(1);

            // Inputs (optional snapshot)
            if (inputSnapshot && typeof inputSnapshot === "object") {
                doc.fontSize(13).font("Helvetica-Bold").text("Inputs (Snapshot)");
                doc.moveDown(0.3);
                doc.fontSize(9).font("Helvetica");

                // print key-values (avoid dumping huge nested objects)
                Object.entries(inputSnapshot).forEach(([k, v]) => {
                    if (v === undefined) return;
                    if (typeof v === "object" && v !== null) return;
                    doc.text(`${k}: ${String(v)}`);
                });

                doc.moveDown(1);
            }

            // Image (only for image mode)
            if (inputMode === "image" && imageUrl) {
                doc.fontSize(13).font("Helvetica-Bold").text("Ultrasound Image");
                doc.moveDown(0.3);

                try {
                    const imgBuf = await fetchImageAsBuffer(imageUrl);
                    doc.image(imgBuf, { fit: [450, 300], align: "center" });
                } catch (e) {
                    doc.fontSize(9).fillColor("red").text("Could not embed image in PDF.");
                    doc.fillColor("black");
                }

                doc.moveDown(1);
            }

            // Top factors
            doc.fontSize(13).font("Helvetica-Bold").text("Top Contributing Factors");
            doc.moveDown(0.3);
            doc.fontSize(10).font("Helvetica");

            const top = mlResult?.top_factors || [];
            if (!top.length) {
                doc.text("No factor breakdown returned.");
            } else {
                top.slice(0, 8).forEach((f, idx) => {
                    doc.text(
                        `${idx + 1}. ${f.feature} | impact: ${Number(f.impact).toFixed(3)} | ${f.direction}`
                    );
                });
            }

            doc.moveDown(1);

            // Narration
            doc.fontSize(13).font("Helvetica-Bold").text("Explanation");
            doc.moveDown(0.3);
            doc.fontSize(11).font("Helvetica");
            doc.text(String(mlResult?.narration || "").replace(/\*\*/g, ""), { lineGap: 3 });

            doc.moveDown(1);

            // Disclaimer
            doc.fontSize(10).font("Helvetica-Bold").text("Disclaimer");
            doc.font("Helvetica").text(
                "This is a screening tool, not a medical diagnosis. Please consult a qualified healthcare professional."
            );

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};


module.exports = {
    generatePredictionPdfBuffer,
    
};