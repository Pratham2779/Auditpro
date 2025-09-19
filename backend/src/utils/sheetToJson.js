// import XLSX from 'xlsx';
// import fs from 'fs';

// // Helper: normalize headers
// function normalizeHeader(header) {
//   return header
//     .toString()
//     .replace(/[^a-zA-Z0-9]/g, '')
//     .toLowerCase();
// }


// const REQUIRED_FIELDS = new Set([
//   'srno', 'date', 'primarygroup', 'group', 'style', 'cpcnumber',
//   'size', 'gross', 'other', 'net', 'fine', 'qty', 'pcs', 'location', 'creationdate', 'huid', 'hsncode'
// ]);


// export function sheetToJsonFromPath(filePath) {
//   if (!fs.existsSync(filePath)) {
//     throw new Error('File not found: ' + filePath);
//   }

//   // Read file from disk
//   const buffer = fs.readFileSync(filePath);

//   // Load Excel/CSV from buffer
//   const workbook = XLSX.read(buffer, { type: 'buffer' });
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

//   const headerRowIndex = rawRows.findIndex(row => row.includes('Sr.No'));
//   if (headerRowIndex === -1) {
//     throw new Error('Header row ("Sr.No") not found.');
//   }

//   const rawHeaders = rawRows[headerRowIndex];
//   const normalizedHeaders = rawHeaders.map((header, i) =>
//     header ? normalizeHeader(header) : `column${i}`
//   );

//   const relevantIndices = normalizedHeaders
//     .map((key, idx) => ({ key, idx }))
//     .filter(({ key }) => REQUIRED_FIELDS.has(key));

//   const dataRows = rawRows.slice(headerRowIndex + 1);

//   return dataRows
//     .filter(row => row.length && !isNaN(parseInt(row[0])))
//     .map(row =>
//       Object.fromEntries(
//         relevantIndices.map(({ key, idx }) => [key, row[idx] ?? ''])
//       )
//     );
// }



import XLSX from 'xlsx';
import fs from 'fs';

function normalizeHeader(header) {
  if (!header) return '';
  return header
    .toString()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

const REQUIRED_FIELDS = new Set([
  'srno', 'date', 'primarygroup', 'group', 'style', 'cpcnumber',
  'size', 'gross', 'other', 'net', 'fine', 'qty', 'pcs', 'location', 
  'creationdate', 'huid', 'hsncode'
]);

export function sheetToJsonFromPath(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found: ' + filePath);
  }

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const headerRowIndex = rawRows.findIndex(row => 
    Array.isArray(row) && row.some(cell => normalizeHeader(cell) === 'srno')
  );

  if (headerRowIndex === -1) {
    throw new Error('Header row containing "Sr.No" could not be found.');
  }

  const rawHeaders = rawRows[headerRowIndex];
  const normalizedHeaders = rawHeaders.map((header, i) =>
    header ? normalizeHeader(header) : `column${i}`
  );

  const relevantIndices = normalizedHeaders
    .map((key, idx) => ({ key, idx }))
    .filter(({ key }) => REQUIRED_FIELDS.has(key));

  const dataRows = rawRows.slice(headerRowIndex + 1);

  return dataRows
    .filter(row => Array.isArray(row) && row.length > 0 && !isNaN(parseInt(row[0], 10)))
    .map(row => {
      const item = Object.fromEntries(
        relevantIndices.map(({ key, idx }) => [key, row[idx] ?? ''])
      );
      
      item.isMatched = false;

      return item;
    });
}






