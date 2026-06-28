import { jsPDF } from "jspdf";
import { isFeatureEnabled } from "@/lib/features.config";
import { FEST_CONTENT } from "@/lib/content";

interface ConfirmationPDFData {
  participantName: string;
  confirmationCode: string;
  events: Array<{
    name: string;
    vertical: string;
    date: string;
  }>;
  dateIssued: string;
}

/**
 * Generate a confirmation PDF for a registered participant.
 * Returns a base64-encoded PDF string.
 */
export function generateConfirmationPDF(
  data: ConfirmationPDFData
): string | null {
  if (!isFeatureEnabled("PDF_CONFIRMATION")) return null;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 30;

  // Header background
  doc.setFillColor(0, 53, 128); // #003580
  doc.rect(0, 0, pageWidth, 60, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("USHUS 2026", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Theme
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${FEST_CONTENT.theme} — ${FEST_CONTENT.tagline}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 10;

  // Subtitle
  doc.setFontSize(12);
  doc.text("Registration Confirmation", pageWidth / 2, yPos, {
    align: "center",
  });

  // Gold accent line
  yPos = 65;
  doc.setDrawColor(245, 166, 35); // #F5A623
  doc.setLineWidth(1.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Participant name
  yPos = 80;
  doc.setTextColor(26, 26, 46); // #1A1A2E
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("This confirms that", pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.participantName, pageWidth / 2, yPos, { align: "center" });
  yPos += 12;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    "has been registered for the following events at USHUS 2026:",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Confirmation code box
  yPos += 16;
  doc.setFillColor(248, 249, 250); // #F8F9FA
  doc.setDrawColor(229, 231, 235); // #E5E7EB
  doc.roundedRect(margin + 20, yPos - 6, pageWidth - 2 * margin - 40, 18, 3, 3, "FD");

  doc.setFontSize(14);
  doc.setFont("courier", "bold");
  doc.setTextColor(0, 53, 128);
  doc.text(data.confirmationCode, pageWidth / 2, yPos + 5, {
    align: "center",
  });

  // Events table
  yPos += 25;
  doc.setTextColor(26, 26, 46);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Registered Events", margin, yPos);

  yPos += 8;
  doc.setLineWidth(0.5);
  doc.setDrawColor(229, 231, 235);

  // Table header
  doc.setFillColor(248, 249, 250);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Event", margin + 5, yPos + 1);
  doc.text("Vertical", margin + 80, yPos + 1);
  doc.text("Date", margin + 130, yPos + 1);
  yPos += 10;

  // Table rows
  doc.setFont("helvetica", "normal");
  for (const event of data.events) {
    doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4);
    doc.text(event.name, margin + 5, yPos + 1);
    doc.text(event.vertical, margin + 80, yPos + 1);
    doc.text(event.date, margin + 130, yPos + 1);
    yPos += 10;
  }
  doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4);

  // Venue info
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Venue", margin, yPos);
  yPos += 6;
  doc.setFont("helvetica", "normal");
  doc.text(FEST_CONTENT.venue, margin, yPos);
  yPos += 6;
  doc.text(FEST_CONTENT.dates, margin, yPos);

  // Date issued
  yPos += 15;
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125); // #6C757D
  doc.text(`Date Issued: ${data.dateIssued}`, margin, yPos);

  // Footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(0, 53, 128);
  doc.rect(0, yPos - 5, pageWidth, 25, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(
    "© 2026 USHUS — Christ University, Bangalore Central Campus. All rights reserved.",
    pageWidth / 2,
    yPos + 5,
    { align: "center" }
  );

  return doc.output("datauristring");
}
