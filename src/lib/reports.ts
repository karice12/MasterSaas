import { jsPDF } from "jspdf";
import "jspdf-autotable";

type ReportData = {
  title: string;
  headers: string[];
  rows: any[][];
  filename: string;
};

export const generatePDFReport = ({ title, headers, rows, filename }: ReportData) => {
  const doc = new jsPDF() as any;

  // Add Title
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(title, 14, 22);

  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

  // Add Table
  doc.autoTable({
    startY: 40,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], fontSize: 11, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`MenuMaster SaaS - Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`${filename}.pdf`);
};
