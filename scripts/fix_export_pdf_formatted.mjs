import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

roots.forEach((root) => {
  // 1. Update PriceTagSheet.tsx for exact mathematical rotation coordinates
  const sheetPath = path.join(root, 'src/components/showroom-ims/PriceTagSheet.tsx');
  if (fs.existsSync(sheetPath)) {
    let sheetContent = fs.readFileSync(sheetPath, 'utf8');

    // Replace the translate(-50%, -50%) rotation with exact top/left coordinates
    const oldRotationBlock = `              {/* Perfectly centered absolute rotation so layout footprint matches visual boundary with 0 overflow */}
              <div
                style={{
                  position: "absolute",
                  width: CARD_W, // 68.5mm
                  height: CARD_H, // 107mm
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(-90deg)",
                  transformOrigin: "center center",
                  boxSizing: "border-box",
                }}
              >`;

    const newRotationBlock = `              {/* Mathematical rotation alignment with 0 displacement for html2canvas and print */}
              <div
                style={{
                  position: "absolute",
                  width: CARD_W, // 68.5mm
                  height: CARD_H, // 107mm
                  top: "-19.25mm",
                  left: "19.25mm",
                  transform: "rotate(-90deg)",
                  transformOrigin: "center center",
                  boxSizing: "border-box",
                }}
              >`;

    if (sheetContent.includes('transform: "translate(-50%, -50%) rotate(-90deg)"')) {
      sheetContent = sheetContent.replace(oldRotationBlock, newRotationBlock);
      fs.writeFileSync(sheetPath, sheetContent, 'utf8');
      console.log('Fixed rotation offsets in PriceTagSheet.tsx in', root);
    }
  }

  // 2. Update PriceTagTab.tsx with pristine unscaled staging container export
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');
  if (fs.existsSync(tabPath)) {
    let tabContent = fs.readFileSync(tabPath, 'utf8');

    const oldExportFunc = `  // Direct High-Resolution PDF Export
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
  };`;

    const newExportFunc = `  // Pristine High-Resolution Vector-Accurate PDF Export (A4 210mm x 297mm)
  const handleExportPdf = async () => {
    if (typeof window === "undefined") return;
    const sheetElement = document.getElementById("modi-price-tag-a4-sheet");
    if (!sheetElement) {
      alert("Sheet element not found. Please refresh.");
      return;
    }

    setIsExportingPdf(true);
    let stagingContainer: HTMLDivElement | null = null;
    try {
      // 1. Create an isolated off-screen staging container at exact A4 size (strips on-screen preview zoom)
      stagingContainer = document.createElement("div");
      stagingContainer.id = "modi-pdf-export-staging";
      stagingContainer.style.cssText = \`
        position: fixed;
        left: -9999px;
        top: 0;
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        background: #ffffff;
        box-sizing: border-box;
        overflow: hidden;
        z-index: -9999;
      \`;

      // 2. Clone the sheet node and force exact 100% unscaled A4 dimensions
      const clone = sheetElement.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      clone.style.border = "none";
      clone.style.width = "210mm";
      clone.style.height = "297mm";
      clone.style.minWidth = "210mm";
      clone.style.minHeight = "297mm";
      clone.style.maxWidth = "210mm";
      clone.style.maxHeight = "297mm";

      stagingContainer.appendChild(clone);
      document.body.appendChild(stagingContainer);

      // Wait 150ms for fonts, base64 images and styles to paint
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 3. Render ultra-crisp 2.5x canvas via html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = (html2canvasModule as any).default || html2canvasModule;

      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(clone, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        windowWidth: clone.offsetWidth,
        windowHeight: clone.offsetHeight,
      });

      // 4. Build exact A4 PDF
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(\`Modi_Furniture_Price_Tags_\${new Date().toISOString().slice(0, 10)}.pdf\`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Direct PDF generation encountered an issue. Opening Print dialog where you can choose 'Save as PDF'.");
      handlePrint();
    } finally {
      if (stagingContainer && stagingContainer.parentNode) {
        stagingContainer.parentNode.removeChild(stagingContainer);
      }
      setIsExportingPdf(false);
    }
  };`;

    if (tabContent.includes('// Direct High-Resolution PDF Export')) {
      tabContent = tabContent.replace(oldExportFunc, newExportFunc);
      fs.writeFileSync(tabPath, tabContent, 'utf8');
      console.log('Updated handleExportPdf in PriceTagTab.tsx in', root);
    }
  }
});
