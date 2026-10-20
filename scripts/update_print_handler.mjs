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

  // Replace handlePrint with the enhanced version that grabs existingStyles
  const oldTarget = `  // High-Precision Native A4 Print Function
  const handlePrint = () => {
    const sheetElement = document.getElementById("modi-price-tag-a4-sheet");
    if (!sheetElement) {
      window.print();
      return;
    }

    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    if (!doc) {
      window.print();
      frame.remove();
      return;
    }

    doc.open();
    doc.write(\`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Modi Furniture - Price Tags (6.896 cm x 10.7 cm)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: 'Lato', sans-serif !important;
      width: 210mm;
      height: 297mm;
      overflow: hidden;
    }
    .a4-sheet {
      width: 210mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border: none !important;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="font-family: 'Lato', sans-serif;">
  \${sheetElement.outerHTML}
</body>
</html>\`);
    doc.close();`;

  const newPrint = `  // High-Precision Native A4 Print Function
  const handlePrint = () => {
    const sheetElement = document.getElementById("modi-price-tag-a4-sheet");
    if (!sheetElement) {
      window.print();
      return;
    }

    const frame = document.createElement("iframe");
    frame.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);

    const doc = frame.contentDocument;
    if (!doc) {
      window.print();
      frame.remove();
      return;
    }

    const existingStyles = typeof document !== "undefined"
      ? Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
          .map((n) => n.outerHTML)
          .join("\\n")
      : "";

    doc.open();
    doc.write(\`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Modi Furniture - Price Tags (6.896 cm x 10.7 cm)</title>
  \${existingStyles}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      font-family: 'Lato', sans-serif !important;
      width: 210mm !important;
      height: 297mm !important;
      overflow: hidden !important;
    }
    .a4-sheet {
      width: 210mm !important;
      height: 297mm !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      box-shadow: none !important;
      border: none !important;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body style="font-family: 'Lato', sans-serif;">
  \${sheetElement.outerHTML}
</body>
</html>\`);
    doc.close();`;

  if (content.includes('const sheetElement = document.getElementById("modi-price-tag-a4-sheet");')) {
    content = content.replace(oldTarget, newPrint);
    fs.writeFileSync(tabPath, content, 'utf8');
    console.log('Updated handlePrint in', tabPath);
  }
});
