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

  // 1. Remove handleImportSelectedProducts
  const importStart = content.indexOf('// Import selected products from database');
  const importEnd = content.indexOf('// High-Precision Native A4 Print Function');
  if (importStart !== -1 && importEnd !== -1) {
    content = content.slice(0, importStart) + content.slice(importEnd);
    console.log('Removed handleImportSelectedProducts');
  }

  // 2. Remove modal JSX
  const modalStart = content.indexOf('{/* Database Product Selection Modal */}');
  const modalEnd = content.lastIndexOf('</div>\n  );\n}');
  if (modalStart !== -1 && modalEnd !== -1) {
    content = content.slice(0, modalStart) + content.slice(modalEnd);
    console.log('Removed Database Product Selection Modal JSX');
  }

  // Also clean up Button import if Button is only used in modal
  if (!content.includes('<Button')) {
    content = content.replace('import { Button } from "@/components/ui/Button";\n', '');
  }

  fs.writeFileSync(tabPath, content, 'utf8');
  console.log('Updated PriceTagTab in', root);
});
