import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

roots.forEach((root) => {
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');
  if (!fs.existsSync(tabPath)) return;

  let content = fs.readFileSync(tabPath, 'utf8');

  // 1. Add Download to lucide-react imports if not present
  if (!content.includes('Download,')) {
    content = content.replace('Printer,\n', 'Printer,\n  Download,\n');
  }

  // 2. Add isExportingPdf state if not present
  if (!content.includes('isExportingPdf')) {
    content = content.replace(
      'const [viewMode, setViewMode] = useState<"sheet" | "card">("sheet");',
      'const [viewMode, setViewMode] = useState<"sheet" | "card">("sheet");\n  const [isExportingPdf, setIsExportingPdf] = useState(false);'
    );
  }

  // 3. Add handleExportPdf function right before handlePrint
  const exportPdfFunc = `  // Direct High-Resolution PDF Export
  const handleExportPdf = async () => {
    if (typeof window === "undefined") return;
    const sheetElement = document.getElementById("modi-price-tag-a4-sheet");
    if (!sheetElement) {
      alert("Sheet element not found. Please refresh.");
      return;
    }

    setIsExportingPdf(true);
    try {
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = (html2pdfModule as any).default || html2pdfModule;

      const opt = {
        margin: 0,
        filename: \`Modi_Furniture_Price_Tags_\${new Date().toISOString().slice(0, 10)}.pdf\`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait" as const,
        },
      };

      await html2pdf().set(opt).from(sheetElement).save();
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Direct PDF generation failed. Opening Print dialog where you can choose 'Save as PDF'.");
      handlePrint();
    } finally {
      setIsExportingPdf(false);
    }
  };

`;

  if (!content.includes('const handleExportPdf =')) {
    content = content.replace(
      '  // High-Precision Native A4 Print Function',
      `${exportPdfFunc}  // High-Precision Native A4 Print Function`
    );
  }

  // 4. Add Export PDF button next to Print button
  const exportButtonJsx = `          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-extrabold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Download Price Tags directly as PDF file"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{isExportingPdf ? "Exporting PDF..." : "Export PDF"}</span>
          </button>

          {/* Print Button */}`;

  if (!content.includes('Export PDF') && content.includes('{/* Print Button */}')) {
    content = content.replace(
      '{/* Print Button */}',
      exportButtonJsx
    );
  }

  fs.writeFileSync(tabPath, content, 'utf8');
  console.log('Added Export PDF functionality to', tabPath);
});
