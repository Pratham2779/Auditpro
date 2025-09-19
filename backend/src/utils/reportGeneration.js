import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import PDFDocument from 'pdfkit';

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Main function
export async function generateAuditReport(reportData) {
  try {
    const tempDir = path.join(__dirname, './public/temp/', 'audit-reports');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const fileName = `${reportData.reportId}.pdf`;
    const filePath = path.join(tempDir, fileName);
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 } 
    });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Page dimensions
    const PAGE_HEIGHT = 842;
    const MARGIN_BOTTOM = 50;
    const USABLE_HEIGHT = PAGE_HEIGHT - MARGIN_BOTTOM;

    // Utility: add image
    async function addImageToPDF(imageUrl, x, y, width, height) {
      try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data);
        doc.image(imageBuffer, x, y, { width, height, fit: [width, height] });
      } catch {
        doc.rect(x, y, width, height).stroke();
        doc.fontSize(8).text('Image unavailable', x + 5, y + height / 2);
      }
    }

    // Utility: format date
    function formatDate(dateValue) {
      if (dateValue instanceof Date) {
        return dateValue.toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
      }
      if (typeof dateValue === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 86400000);
        return date.toLocaleDateString('en-IN');
      }
      return String(dateValue);
    }

    const colors = {
      primary: '#2C3E50', secondary: '#3498DB', accent: '#E74C3C',
      success: '#27AE60', warning: '#F39C12', light: '#ECF0F1', dark: '#34495E'
    };

    let yPosition = 50;

    // HEADER
    doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);
    doc.fillColor('white')
      .fontSize(28).font('Helvetica-Bold').text('INVENTORY AUDIT REPORT', 50, 30, { align: 'center' });
    doc.fontSize(14).font('Helvetica')
      .text(`Report ID: ${reportData.reportId}`, 50, 70)
      .text(`Generated: ${formatDate(reportData.auditDateTime)}`, 50, 90);
    yPosition = 140;

    // SUMMARY SECTION
    if (yPosition + 120 > USABLE_HEIGHT) {
      doc.addPage(); yPosition = 50;
    }
    
    doc.fillColor(colors.dark).fontSize(18).font('Helvetica-Bold').text('AUDIT SUMMARY', 50, yPosition);
    yPosition += 30;

    const summaryData = [
      { label: 'Total Items Scanned', value: reportData.totalItems, color: colors.secondary },
      { label: 'Matched Items', value: reportData.matchedItems.length, color: colors.success },
      { label: 'Unmatched Items', value: reportData.unmatchedItems.length, color: colors.warning },
      { label: 'Missing Items', value: reportData.missingItems.length, color: colors.accent }
    ];

    const cardWidth = 120;
    const cardHeight = 60;
    let xPos = 50;

    summaryData.forEach(item => {
      doc.rect(xPos, yPosition, cardWidth, cardHeight).fill(item.color).stroke();
      doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
        .text(item.value.toString(), xPos + 10, yPosition + 10, { width: cardWidth - 20, align: 'center' });
      doc.fontSize(10).font('Helvetica')
        .text(item.label, xPos + 5, yPosition + 35, { width: cardWidth - 10, align: 'center' });
      xPos += cardWidth + 20;
    });

    yPosition += 90;

    // PERSONNEL SECTION
    if (yPosition + 140 > USABLE_HEIGHT) {
      doc.addPage(); yPosition = 50;
    }
    
    doc.fillColor(colors.dark).fontSize(16).font('Helvetica-Bold').text('PERSONNEL INFORMATION', 50, yPosition);
    yPosition += 25;

    const columnWidth = 250;
    doc.rect(50, yPosition, columnWidth, 120).fill(colors.light).stroke();
    doc.fillColor(colors.dark).fontSize(14).font('Helvetica-Bold').text('AUDITOR', 60, yPosition + 10);
    if (reportData.auditor.avatar) await addImageToPDF(reportData.auditor.avatar, 60, yPosition + 30, 50, 50);
    doc.fontSize(11).font('Helvetica')
      .text(`Name: ${reportData.auditor.fullName}`, 120, yPosition + 35)
      .text(`Email: ${reportData.auditor.email}`, 120, yPosition + 50)
      .text(`Phone: ${reportData.auditor.phoneNumber}`, 120, yPosition + 65);

    doc.rect(320, yPosition, columnWidth, 120).fill(colors.light).stroke();
    doc.fillColor(colors.dark).fontSize(14).font('Helvetica-Bold').text('SALESMAN', 330, yPosition + 10);
    if (reportData.salesman.avatar) await addImageToPDF(reportData.salesman.avatar, 330, yPosition + 30, 50, 50);
    doc.fontSize(11).font('Helvetica')
      .text(`Name: ${reportData.salesman.fullName}`, 390, yPosition + 35)
      .text(`Email: ${reportData.salesman.email}`, 390, yPosition + 50)
      .text(`Phone: ${reportData.salesman.phoneNumber}`, 390, yPosition + 65);

    yPosition += 140;

    // COUNTER SECTION
    if (yPosition + 60 > USABLE_HEIGHT) {
      doc.addPage(); yPosition = 50;
    }

    doc.rect(50, yPosition, 500, 40).fill(colors.secondary).stroke();
    doc.fillColor('white').fontSize(14).font('Helvetica-Bold').text('COUNTER DETAILS', 60, yPosition + 5);
    doc.fontSize(11).font('Helvetica')
      .text(`Counter: ${reportData.counter.name} | Location: ${reportData.counter.location} | Number: ${reportData.counter.counterNumber}`, 60, yPosition + 22);
    yPosition += 60;

    // UNMATCHED ITEMS SECTION
    if (reportData.unmatchedItems.length > 0) {
      const sectionHeaderHeight = 30;
      const tableHeaderHeight = 25;
      const rowHeight = 20;

      if (yPosition + sectionHeaderHeight + tableHeaderHeight > USABLE_HEIGHT) {
        doc.addPage(); yPosition = 50;
      }

      doc.fillColor(colors.accent).fontSize(18).font('Helvetica-Bold').text('UNMATCHED ITEMS', 50, yPosition);
      yPosition += sectionHeaderHeight;

      doc.rect(50, yPosition, 500, tableHeaderHeight).fill(colors.accent);
      doc.fillColor('white').fontSize(12)
        .text('CPC Number', 60, yPosition + 8)
        .text('Scanned At', 300, yPosition + 8);
      yPosition += tableHeaderHeight;

      reportData.unmatchedItems.forEach((item, index) => {
        if (yPosition + rowHeight > USABLE_HEIGHT) {
          doc.addPage(); yPosition = 50;
          doc.rect(50, yPosition, 500, tableHeaderHeight).fill(colors.accent);
          doc.fillColor('white').fontSize(12)
            .text('CPC Number', 60, yPosition + 8)
            .text('Scanned At', 300, yPosition + 8);
          yPosition += tableHeaderHeight;
        }

        const rowColor = index % 2 === 0 ? colors.light : 'white';
        doc.rect(50, yPosition, 500, rowHeight).fill(rowColor);
        doc.fillColor(colors.dark).fontSize(10)
          .text(item.cpcnumber, 60, yPosition + 6)
          .text(formatDate(item.scannedAt), 300, yPosition + 6);
        yPosition += rowHeight;
      });
      yPosition += 30;
    }

    // MISSING ITEMS SECTION
    if (reportData.missingItems.length > 0) {
      const sectionHeaderHeight = 30;
      const itemHeight = 140;

      if (yPosition + sectionHeaderHeight > USABLE_HEIGHT) {
        doc.addPage(); yPosition = 50;
      }

      doc.fillColor(colors.warning).fontSize(18).font('Helvetica-Bold')
        .text('MISSING ITEMS DETAILED REPORT', 50, yPosition);
      yPosition += sectionHeaderHeight;

      reportData.missingItems.forEach((item) => {
        if (yPosition + itemHeight > USABLE_HEIGHT) {
          doc.addPage(); yPosition = 50;
        }

        doc.rect(50, yPosition, 500, 140).fill('white').stroke();
        doc.rect(50, yPosition, 500, 30).fill(colors.warning);
        doc.fillColor('white').fontSize(12).font('Helvetica-Bold')
          .text(`${item.group} - ${item.style}`, 60, yPosition + 10)
          .text(`CPC: ${item.cpcnumber}`, 400, yPosition + 10);

        const detailsY = yPosition + 35;
        const left = [
          `HUID: ${item.huid || 'N/A'}`, `Size: ${item.size}`, 
          `Gross Weight: ${item.gross}g`, `Net Weight: ${item.net}g`, 
          `Fine Weight: ${item.fine}g`
        ];
        const right = [
          `Date: ${formatDate(item.date)}`, `Quantity: ${item.qty}`,
          `Pieces: ${item.pcs}`, `HSN Code: ${item.hsncode}`,
          `Location: ${item.location}`
        ];

        doc.fillColor(colors.dark).fontSize(10);
        left.forEach((text, i) => doc.text(text, 60, detailsY + (i * 15)));
        right.forEach((text, i) => doc.text(text, 300, detailsY + (i * 15)));

        yPosition += itemHeight;
      });
    }

    // FOOTER
    if (yPosition > USABLE_HEIGHT) {
      doc.addPage(); yPosition = 50;
    } else {
      yPosition = PAGE_HEIGHT - 100;
    }

    doc.rect(0, yPosition, doc.page.width, 100).fill(colors.primary);
    doc.fillColor('white').fontSize(12).font('Helvetica')
      .text('This is an automated audit report generated by the Inventory Management System', 50, yPosition + 20, { align: 'center' })
      .text(`Report generated on: ${new Date().toLocaleString('en-IN')}`, 50, yPosition + 40, { align: 'center' })
      .text('For any queries, please contact the system administrator', 50, yPosition + 60, { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', (error) => reject(error));
    });

  } catch (error) {
    console.error('Error in generateAuditReport:', error);
    throw error;
  }
}
