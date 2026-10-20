import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

roots.forEach((root) => {
  // 1. Update PriceTagCard.tsx to remove dummy fallback text
  const cardPath = path.join(root, 'src/components/showroom-ims/PriceTagCard.tsx');
  if (fs.existsSync(cardPath)) {
    let cardContent = fs.readFileSync(cardPath, 'utf8');

    // Replace fallback dummy text with empty strings
    cardContent = cardContent.replace(
      '{tag.name || "NAME"}',
      '{tag.name || ""}'
    );
    cardContent = cardContent.replace(
      '{tag.subtitle || "(REVOLVING)"}',
      '{tag.subtitle || ""}'
    );
    cardContent = cardContent.replace(
      '{tag.code ? (tag.code.startsWith("Code-") ? tag.code : "Code- " + tag.code) : "Code- MC-MRA-HB-BK"}',
      '{tag.code ? (tag.code.startsWith("Code-") ? tag.code : "Code- " + tag.code) : ""}'
    );

    fs.writeFileSync(cardPath, cardContent, 'utf8');
    console.log('Cleaned fallback dummy text from PriceTagCard.tsx in', root);
  }

  // 2. Update PriceTagTab.tsx
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');
  if (fs.existsSync(tabPath)) {
    let tabContent = fs.readFileSync(tabPath, 'utf8');

    // Remove DEFAULT_CORELDRAW_TAGS array definition
    const defaultTagsRegex = /\/\/ Default preset matching CorelDRAW[\s\S]*?const DEFAULT_CORELDRAW_TAGS: PriceTagData\[\] = \[[\s\S]*?\n\];/;
    if (tabContent.match(defaultTagsRegex)) {
      tabContent = tabContent.replace(defaultTagsRegex, '');
    }

    // Helper createEmptyTag
    const emptyTagFunc = `export const createEmptyTag = (idSuffix = "1"): PriceTagData => ({
  id: "tag-" + Date.now() + "-" + idSuffix,
  name: "",
  subtitle: "",
  code: "",
  website: "www.modifurniture.com",
  price: 0,
  gstPercent: 18,
  gstAmount: 0,
  netPrice: 0,
  imageUrl: "",
  qrCodeImageUrl: "/templates/modi-qr.png",
  imageScale: 100,
  imageOffsetY: 0,
  imageOffsetX: 0,
  showTableSize: false,
  showColours: false,
  format: "card",
  copies: 1,
});`;

    if (!tabContent.includes('export const createEmptyTag')) {
      tabContent = tabContent.replace(
        'interface PriceTagTabProps {',
        `${emptyTagFunc}\n\ninterface PriceTagTabProps {`
      );
    }

    // Replace initial tags state to start with 1 empty tag and NO dummy data
    const initialTagsRegex = /const \[tags, setTags\] = useState<PriceTagData\[\]>\(\(\) => \{[\s\S]*?return DEFAULT_CORELDRAW_TAGS\.slice\(0, 5\);\s*\}\);/;
    const newInitialTags = `const [tags, setTags] = useState<PriceTagData[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts.map((p, idx) => ({
        id: "prod-" + (p.itemCode || idx) + "-" + Date.now(),
        name: (p.itemName || p.name || "").toUpperCase(),
        subtitle: p.subcategory || p.category || "",
        code: p.itemCode || p.sku || "",
        website: "www.modifurniture.com",
        price: Number(p.unitCostINR || p.price || p.sellingPrice) || 0,
        gstPercent: 18,
        imageUrl: p.imageUrl || "",
        qrCodeImageUrl: "/templates/modi-qr.png",
        imageScale: 100,
        imageOffsetY: 0,
        imageOffsetX: 0,
        showTableSize: false,
        showColours: false,
        format: "card",
        copies: 1,
      }));
    }
    return [createEmptyTag("1")];
  });`;

    if (tabContent.match(initialTagsRegex)) {
      tabContent = tabContent.replace(initialTagsRegex, newInitialTags);
    }

    // Update handleAddBlankTag to use createEmptyTag
    const addBlankRegex = /const handleAddBlankTag = \(\) => \{[\s\S]*?setTags\(\(prev\) => \[\.\.\.prev, newTag\]\);\s*setSelectedTagId\(newTag\.id\);\s*\};/;
    const newAddBlank = `const handleAddBlankTag = () => {
    const newTag = createEmptyTag(String(tags.length + 1));
    setTags((prev) => [...prev, newTag]);
    setSelectedTagId(newTag.id);
  };`;
    if (tabContent.match(addBlankRegex)) {
      tabContent = tabContent.replace(addBlankRegex, newAddBlank);
    }

    // Remove handleLoadPreset function
    const loadPresetRegex = /\s*\/\/ Load Preset\s*const handleLoadPreset = \([\s\S]*?\n  \};/;
    if (tabContent.match(loadPresetRegex)) {
      tabContent = tabContent.replace(loadPresetRegex, '');
    }

    // Remove the two buttons: "Select Products" and "Load BANO / TATVA Preset"
    const buttonsBlockRegex = /\{?\/\* Import \/ Preset Buttons \*\/\s*\}?[\s\S]*?<button[\s\S]*?Select Products[\s\S]*?<\/button>\s*<button[\s\S]*?Load BANO \/ TATVA Preset[\s\S]*?<\/button>/;
    if (tabContent.match(buttonsBlockRegex)) {
      tabContent = tabContent.replace(buttonsBlockRegex, '');
    } else {
      // Try individual removals
      const btn1Regex = /<button[\s\S]*?setShowPickerModal\(true\)[\s\S]*?<\/button>/;
      const btn2Regex = /<button[\s\S]*?handleLoadPreset[\s\S]*?<\/button>/;
      tabContent = tabContent.replace(btn1Regex, '').replace(btn2Regex, '');
    }

    // Remove showPickerModal modal JSX block
    const modalBlockRegex = /\{showPickerModal && \([\s\S]*?\{\/\* Live Quick Preview Card \*\/\}/;
    if (tabContent.match(modalBlockRegex)) {
      tabContent = tabContent.replace(modalBlockRegex, '{/* Live Quick Preview Card */}');
    }

    // Clean up unused imports
    tabContent = tabContent.replace('Sparkles,\n', '');
    tabContent = tabContent.replace('FolderOpen,\n', '');

    fs.writeFileSync(tabPath, tabContent, 'utf8');
    console.log('Removed preset buttons and dummy data from PriceTagTab.tsx in', root);
  }
});
