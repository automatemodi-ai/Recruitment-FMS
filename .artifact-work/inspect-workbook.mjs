import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const source = 'D:/DELL/Downloads/Recruitment FMS.xlsx';
const outDir = path.resolve('data/workbook-previews');
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));

const summary = await workbook.inspect({
  kind: 'workbook,sheet,table,drawing,definedName',
  maxChars: 18000,
  tableMaxRows: 12,
  tableMaxCols: 18,
  tableMaxCellChars: 100,
});
console.log('=== WORKBOOK SUMMARY ===');
console.log(summary.ndjson);

const sheetInfo = await workbook.inspect({ kind: 'sheet', include: 'id,name', maxChars: 10000 });
console.log('=== SHEETS ===');
console.log(sheetInfo.ndjson);

for (let i = 0; i < workbook.worksheets.items.length; i += 1) {
  const sheet = workbook.worksheets.getItemAt(i);
  const used = sheet.getUsedRange();
  console.log(`=== SHEET ${i + 1}: ${sheet.name} ===`);
  if (used) {
    const region = await workbook.inspect({
      kind: 'region,formula',
      sheetId: sheet.name,
      range: used.address,
      maxChars: 10000,
      tableMaxRows: 20,
      tableMaxCols: 22,
      options: { maxResults: 100 },
    });
    console.log(`USED_RANGE=${used.address}`);
    console.log(region.ndjson);
  }
  try {
    const preview = await workbook.render({ sheetName: sheet.name, autoCrop: 'all', scale: 1, format: 'png' });
    const safe = sheet.name.replace(/[<>:"/\\|?*]/g, '_');
    await fs.writeFile(path.join(outDir, `${String(i + 1).padStart(2, '0')}-${safe}.png`), new Uint8Array(await preview.arrayBuffer()));
  } catch (error) {
    console.log(`RENDER_ERROR=${sheet.name}: ${error.message}`);
  }
}
