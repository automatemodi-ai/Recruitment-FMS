import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

const targetPattern = `                {/* 4. Website Pill */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Website URL Pill</label>
                  <input
                    type="text"
                    value={selectedTag.website}
                    onChange={(e) => updateSelectedTag({ website: e.target.value })}
                    placeholder="www.modifurniture.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#DA2128]"
                  />
                </div>`;

roots.forEach((root) => {
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');
  if (!fs.existsSync(tabPath)) return;

  let content = fs.readFileSync(tabPath, 'utf8');

  if (content.includes('Website URL Pill')) {
    // Replace the block with empty or clean comment
    content = content.replace(targetPattern, '');
    // In case indentation differs slightly, regex replace
    const regex = /\s*\{\/\* 4\. Website Pill \*\/\}[\s\S]*?<\/div>/;
    if (content.includes('Website URL Pill')) {
      content = content.replace(regex, '');
    }
    fs.writeFileSync(tabPath, content, 'utf8');
    console.log('Removed Website URL Pill field from', tabPath);
  }

  // Also in PriceTagCard.tsx, make sure website defaults to "www.modifurniture.com" permanently
  const cardPath = path.join(root, 'src/components/showroom-ims/PriceTagCard.tsx');
  if (fs.existsSync(cardPath)) {
    let cardContent = fs.readFileSync(cardPath, 'utf8');
    cardContent = cardContent.replace(
      '{tag.website || "www.modifurniture.com"}',
      'www.modifurniture.com'
    );
    fs.writeFileSync(cardPath, cardContent, 'utf8');
    console.log('Fixed website to permanent www.modifurniture.com in', cardPath);
  }
});
