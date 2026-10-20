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

  // Remove modal block from JSX
  const modalRegex = /\s*\{\/\* Database Product Selection Modal \*\/\}[\s\S]*?\{\/\* Modal Footer \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\}\)/;
  if (content.match(modalRegex)) {
    content = content.replace(modalRegex, '');
  }

  // Remove handleImportSelectedProducts
  const importFuncRegex = /\s*\/\/ Import selected products into tags[\s\S]*?setShowPickerModal\(false\);\s*\};/;
  if (content.match(importFuncRegex)) {
    content = content.replace(importFuncRegex, '');
  }

  // Remove dbProducts state and useEffect
  const dbStatesRegex = /\s*\/\/ Database Products picker modal[\s\S]*?const \[selectedDbCodes, setSelectedDbCodes\] = useState<string\[\]>\(\[\]\);/;
  if (content.match(dbStatesRegex)) {
    content = content.replace(dbStatesRegex, '');
  }

  const dbEffectRegex = /\s*\/\/ Load database products for selection[\s\S]*?\}, \[refreshKey\]\);/;
  if (content.match(dbEffectRegex)) {
    content = content.replace(dbEffectRegex, '');
  }

  // Clean unused request import
  content = content.replace('import { request } from "@/api/client";\n', '');

  fs.writeFileSync(tabPath, content, 'utf8');
  console.log('Cleaned modal and picker states in', tabPath);
});
