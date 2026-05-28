import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";


function App() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [scanStep, setScanStep] = useState("");

  const handleScan = async () => {
    if (!target) return;

    setLoading(true);

    setScanStep("Initializing scanner...");

    setTimeout(() => {
      setScanStep("Resolving target...");
    }, 800);

    setTimeout(() => {
      setScanStep("Scanning open ports...");
    }, 1600);

    setTimeout(() => {
      setScanStep("Fingerprinting services...");
    }, 2400);

    setTimeout(() => {
      setScanStep("Running AI analysis...");
    }, 3200);

    try {
      const response = await axios.post("http://127.0.0.1:5000/scan", {
        target,
      });

      setScanData(response.data);
    } catch (error) {
      console.error(error);
      alert("Scan failed");
    }

    setLoading(false);
  };

  const getSeverity = () => {
    if (!scanData) return "Unknown";

    const ports = scanData.results.length;

    if (ports >= 6) return "Critical";
    if (ports >= 4) return "High";
    if (ports >= 2) return "Medium";

    return "Low";
  };

  const severity = getSeverity();
  const getCVSSScore = () => {
    if (!scanData) return 0;

    const ports = scanData.results.length;

    if (ports >= 6) return 9.8;
    if (ports >= 4) return 8.2;
    if (ports >= 2) return 6.5;

    return 3.1;
  };

  const cvss = getCVSSScore();
  const downloadPDF = () => {

  try {

    const pdf = new jsPDF();

    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(24);

    pdf.text("VULNSCAN Security Report", 20, 20);

    pdf.setFontSize(12);

    pdf.setFont("helvetica", "normal");

    pdf.text(`Target: ${scanData.target}`, 20, 40);

    pdf.text(`Severity: ${severity}`, 20, 50);

    pdf.text(`CVSS Score: ${cvss}/10`, 20, 60);

    pdf.text(
      `Open Ports: ${scanData.results.length}`,
      20,
      70
    );

    // Ports Section
    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(18);

    pdf.text("Open Ports & Services", 20, 90);

    let y = 105;

    scanData.results.forEach((item, index) => {

      pdf.setFontSize(12);

      pdf.setFont("helvetica", "normal");

      pdf.text(
        `${index + 1}. Port ${item.port} | ${item.service} | ${item.product || "Unknown"} | Version: ${item.version || "Unknown"}`,
        20,
        y
      );

      y += 10;

      // Auto new page
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    // AI Analysis
    pdf.setFont("helvetica", "bold");

    pdf.setFontSize(18);

    pdf.text("AI Security Analysis", 20, y + 10);

    y += 25;

    pdf.setFont("helvetica", "normal");

    pdf.setFontSize(11);

    const splitText = pdf.splitTextToSize(
      cleanText(scanData.ai_analysis),
      170
    );

    pdf.text(splitText, 20, y);

    pdf.save("VULNSCAN_Report.pdf");

  } catch (error) {

    console.error(error);

    alert("PDF generation failed");
  }
};
  const formatAIAnalysis = (text) => {
    if (!text) return {};

    return {
      risks:
        text.match(/Security Risks([\s\S]*?)Severity Assessment/i)?.[1] || "",

      severity:
        text.match(/Severity Assessment([\s\S]*?)Remediation Steps/i)?.[1] ||
        "",

      remediation:
        text.match(/Remediation Steps([\s\S]*?)Final Recommendation/i)?.[1] ||
        "",

      recommendation: text.match(/Final Recommendation([\s\S]*)/i)?.[1] || "",
    };
  };

  const aiSections = formatAIAnalysis(scanData?.ai_analysis);
  const cleanText = (text) => {
    if (!text) return "";

    return text
      .replace(/##/g, "")
      .replace(/\*\*/g, "")
      .replace(/^\s*[-]\s*/gm, "")
      .replace(/^\s*\d+\.\s*/gm, "")
      .trim();
  };
  const severityColor = {
    Low: "bg-cyan-500",
    Medium: "bg-yellow-500",
    High: "bg-orange-500",
    Critical: "bg-red-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0b1026] to-black text-white p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full top-[-100px] left-[-100px]" />

        <div className="absolute w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full bottom-[-100px] right-[-100px]" />
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          VULNSCAN
        </h1>

        <p className="text-cyan-200/70 text-lg tracking-wide">
          AI-Powered Cybersecurity & Vulnerability Intelligence Platform
        </p>
      </div>

      {/* Scan Box */}
      <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 mb-10">
        <input
          type="text"
          placeholder="Enter IP Address or Domain"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-full bg-black/40 border border-cyan-400/40 rounded-2xl p-5 text-lg mb-5 outline-none"
        />

        <button
          onClick={handleScan}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300"
        >
          Start Scan
        </button>
      </div>

      {/* Loader */}
      {loading && (
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-10 mb-10">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />

            <div>
              <h2 className="text-3xl font-bold text-cyan-300">
                Vulnerability Scan Running
              </h2>

              <p className="text-gray-400 mt-2">
                Please wait while the system analyzes the target...
              </p>
            </div>
          </div>

          <div className="bg-black/50 border border-cyan-500/20 rounded-2xl p-6 font-mono text-sm text-green-400 space-y-3">
            <p>[+] Initializing VULNSCAN engine...</p>

            <p>[+] Loading Nmap modules...</p>

            <p>[+] Establishing scan session...</p>

            <p className="text-cyan-300 animate-pulse">[~] {scanStep}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && scanData && (
        <>
          <div id="report-section">
            <div className="flex justify-end mb-6">
              <button
                onClick={downloadPDF}
                className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all duration-300"
              >
                Download PDF Report
              </button>
            </div>
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-3xl p-6">
                <h2 className="text-gray-400 mb-2">Target</h2>

                <p className="text-2xl font-bold text-cyan-300">
                  {scanData.target}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-3xl p-6">
                <h2 className="text-gray-400 mb-2">Open Ports</h2>

                <p className="text-2xl font-bold text-cyan-300">
                  {scanData.results.length}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-3xl p-6">
                <h2 className="text-gray-400 mb-2">Severity</h2>

                <div
                  className={`inline-block px-5 py-2 rounded-full text-white font-bold ${severityColor[severity]}`}
                >
                  {severity}
                </div>
              </div>
            </div>

            {/* Risk Meter */}
            <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-3xl p-8 mb-10">
              <h2 className="text-3xl font-bold text-cyan-300 mb-6">
                Risk Meter
              </h2>

              <div className="w-full bg-zinc-800 rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${severityColor[severity]}`}
                  style={{
                    width:
                      severity === "Low"
                        ? "25%"
                        : severity === "Medium"
                          ? "50%"
                          : severity === "High"
                            ? "75%"
                            : "100%",
                  }}
                />
              </div>
            </div>
            {/* CVSS Score */}
            <div className="bg-white/5 backdrop-blur-lg border border-purple-500/20 rounded-3xl p-8 mb-10">
              <h2 className="text-3xl font-bold text-purple-300 mb-8">
                CVSS Risk Score
              </h2>

              <div className="flex items-center gap-10 flex-wrap">
                {/* Circular Meter */}
                <div className="relative w-44 h-44">
                  <svg className="w-44 h-44 transform -rotate-90">
                    {/* Background */}
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke="#1e293b"
                      strokeWidth="14"
                      fill="transparent"
                    />

                    {/* Progress */}
                    <circle
                      cx="88"
                      cy="88"
                      r="70"
                      stroke={
                        cvss >= 9
                          ? "#dc2626"
                          : cvss >= 7
                            ? "#f97316"
                            : cvss >= 4
                              ? "#eab308"
                              : "#06b6d4"
                      }
                      strokeWidth="14"
                      fill="transparent"
                      strokeDasharray={`${(cvss / 10) * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <h3 className="text-5xl font-extrabold text-white">
                      {cvss}
                    </h3>

                    <p className="text-gray-400 mt-2">/ 10</p>
                  </div>
                </div>

                {/* CVSS Details */}
                <div className="space-y-5">
                  <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-5">
                    <h3 className="text-purple-300 text-xl font-bold mb-2">
                      Risk Classification
                    </h3>

                    <p className="text-2xl font-bold">{severity}</p>
                  </div>

                  <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-5">
                    <h3 className="text-cyan-300 text-xl font-bold mb-2">
                      Exposure Level
                    </h3>

                    <p className="text-gray-300">
                      Open services detected and exposed externally.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ports */}
            <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-3xl p-8 mb-10">
              <h2 className="text-3xl font-bold text-cyan-300 mb-6">
                Open Ports & Services
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                {scanData.results.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#0a0f1f] border border-cyan-500/20 rounded-2xl p-5"
                  >
                    <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                      Port {item.port}
                    </h3>

                    <div className="space-y-2 text-gray-300">
                      <p>
                        <span className="text-cyan-400 font-semibold">
                          Service:
                        </span>{" "}
                        {item.service}
                      </p>

                      <p>
                        <span className="text-cyan-400 font-semibold">
                          Product:
                        </span>{" "}
                        {item.product || "Unknown"}
                      </p>

                      <p>
                        <span className="text-cyan-400 font-semibold">
                          Version:
                        </span>{" "}
                        {item.version || "Unknown"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8">
              <h2 className="text-4xl font-bold text-cyan-300 mb-10">
                AI Threat Intelligence
              </h2>

              <div className="space-y-8">
                {/* Risks */}
                <div className="bg-[#0a0f1f] border border-red-500/20 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-4">
                    Security Risks
                  </h3>

                  <p className="text-gray-300 leading-8 whitespace-pre-line">
                    {cleanText(aiSections.risks)}
                  </p>
                </div>

                {/* Severity */}
                <div className="bg-[#0a0f1f] border border-yellow-500/20 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                    Severity Assessment
                  </h3>

                  <p className="text-gray-300 leading-8 whitespace-pre-line">
                    {cleanText(aiSections.severity)}
                  </p>
                </div>

                {/* Remediation */}
                <div className="bg-[#0a0f1f] border border-green-500/20 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">
                    Remediation Steps
                  </h3>

                  <div className="space-y-4">
                    {cleanText(aiSections.remediation)
                      .split("\n")
                      .filter((step) => step.trim() !== "")
                      .map((step, index) => (
                        <div
                          key={index}
                          className="bg-black/40 border border-green-500/10 rounded-xl p-4"
                        >
                          <p className="text-gray-300">✅ {step.trim()}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Final Recommendation */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    Final Recommendation
                  </h3>

                  <p className="text-gray-300 leading-8 whitespace-pre-line">
                    {aiSections.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
