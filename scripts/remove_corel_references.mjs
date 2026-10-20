import fs from 'fs';
import path from 'path';

const roots = [
  'C:/Softwares/Modi-furniture/frontend',
  'C:/Users/ok/Desktop/Modi-furniture/frontend',
];

roots.forEach((root) => {
  // 1. Update PriceTagTab.tsx
  const tabPath = path.join(root, 'src/components/showroom-ims/PriceTagTab.tsx');
  if (fs.existsSync(tabPath)) {
    let content = fs.readFileSync(tabPath, 'utf8');

    // Remove badge mentioning CorelDRAW
    content = content.replace(
      /CorelDRAW Size: 6\.896 cm [×x] 10\.7 cm/g,
      'Standard Size: 6.85 cm × 10.7 cm'
    );
    content = content.replace(
      /CorelDRAW Size:[^<]*/g,
      'Standard Size: 6.85 cm × 10.7 cm'
    );

    // Remove subtext mentioning 6.896
    content = content.replace(
      'Formatted for 6.896 cm × 10.7 cm labels with Modi Furniture QR code and Lato typography',
      'Formatted for 6.85 cm × 10.7 cm labels with Modi Furniture QR code and Lato typography'
    );
    content = content.replace(
      'Formatted for 6.896 cm x 10.7 cm labels with Modi Furniture QR code and Lato typography',
      'Formatted for 6.85 cm × 10.7 cm labels with Modi Furniture QR code and Lato typography'
    );

    // Remove CorelDRAW button title & label
    content = content.replace(
      'title="CorelDRAW Exact Match: 7 Tags per Sheet (3 Top + 1 Rotated + 3 Bottom)"',
      'title="7 Tags per A4 Sheet (3 Top + 1 Middle + 3 Bottom)"'
    );
    content = content.replace(
      '>7 Tags (CorelDRAW)<',
      '>7 Tags / A4<'
    );
    content = content.replace(
      '7 Tags (CorelDRAW)',
      '7 Tags / A4'
    );

    // Remove (Image 1)
    content = content.replace(
      'title="Print Foldable Tent Standees with Inverted Header"',
      'title="Print Foldable Tent Standees with Header"'
    );
    content = content.replace(
      '>Standee (Image 1)<',
      '>Foldable Standee<'
    );
    content = content.replace(
      'Standee (Image 1)',
      'Foldable Standee'
    );

    // Remove (Corel) from preview toggle
    content = content.replace(
      'layout === "7-tag" ? "7 Labels (Corel)" : "Standees"',
      'layout === "7-tag" ? "7 Labels" : "Standees"'
    );
    content = content.replace(
      'Single Label (6.896 × 10.7 cm)',
      'Single Label (6.85 × 10.7 cm)'
    );
    content = content.replace(
      'Single Label (6.896 x 10.7 cm)',
      'Single Label (6.85 × 10.7 cm)'
    );

    // Clean any remaining case-insensitive occurrences
    content = content.replace(/coreldraw/gi, 'Standard A4');
    content = content.replace(/coral/gi, 'Standard');

    fs.writeFileSync(tabPath, content, 'utf8');
    console.log('Removed Corel references from PriceTagTab.tsx in', root);
  }

  // 2. Update PriceTagSheet.tsx
  const sheetPath = path.join(root, 'src/components/showroom-ims/PriceTagSheet.tsx');
  if (fs.existsSync(sheetPath)) {
    let sheetContent = fs.readFileSync(sheetPath, 'utf8');
    sheetContent = sheetContent.replace(/CorelDRAW/gi, 'Standard Sheet');
    sheetContent = sheetContent.replace(/Image 1/gi, 'Standard');
    fs.writeFileSync(sheetPath, sheetContent, 'utf8');
    console.log('Removed Corel references from PriceTagSheet.tsx in', root);
  }
});
