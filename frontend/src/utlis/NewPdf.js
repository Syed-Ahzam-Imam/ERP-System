import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  calculateQuoteTotal,
  numberToWords,
} from "./functions";
import phoneIcon from "../images/icons/telephone.png";
import mailIcon from "../images/icons/mail.png";
import addressIcon from "../images/icons/location.png";
import { BASE_URL } from "../api/constants";


const address = localStorage.getItem("address");
const email = localStorage.getItem("email");
const branchName = localStorage.getItem("branchName");
const phoneNumber = localStorage.getItem("phoneNumber");
const logo = localStorage.getItem("logo");


const addHeader = (doc, settings) => {
  const logoWidth = 35;
  const logoHeight = 15;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const rectHeight = 25;
  doc.setFillColor(35, 42, 51);

  doc.roundedRect(10, 10, pageWidth / 2, rectHeight + 10, 15, 15, "F");
  doc.rect(10, 10, 20, rectHeight + 10, "F");
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont("Helvetica", "bold");
  // doc.addImage(logo, "JPEG", 14, rectHeight - 5, logoWidth, logoHeight);
    doc.addImage(
      `${BASE_URL}/uploads/logo/${logo}`,
      "PNG",
      14,
      rectHeight - 10,
      logoWidth,
      logoHeight
    );
  doc.text(branchName, 15, rectHeight + 15);

  // Red rectangle
  doc.setFillColor(35, 210, 253);
  doc.roundedRect(50, 10, pageWidth - 60, rectHeight, 15, 15, "F");
  doc.rect(pageWidth - 30, 10, 20, rectHeight, "F");

  doc.setFontSize(10);
  const startX = 55;
  const startY = 20;
  const columnGap = 40;
  const iconSize = 5;
  const textOffset = 6;

  doc.addImage(phoneIcon, "PNG", startX, startY, iconSize, iconSize);
  doc.text(`| ${phoneNumber}`, startX + textOffset, startY + iconSize - 1);

  doc.addImage(mailIcon, "PNG", startX + columnGap, startY, iconSize, iconSize);
  doc.text(
    `| ${email}`,
    startX + columnGap + textOffset,
    startY + iconSize - 1
  );

  const maxWidth = 40;
  const addressLines = doc.splitTextToSize(address, maxWidth);
  doc.addImage(
    addressIcon,
    "PNG",
    startX + columnGap * 2 + 15,
    startY,
    iconSize,
    iconSize
  ); // Add address icon
  doc.text(
    addressLines,
    startX + columnGap * 2 + textOffset + 15,
    startY + iconSize - doc.getTextDimensions(addressLines).h / 2
  );
};

const generatePdf = (
  ledgerDetails,
  clientName,
  selectedBranch,
  date,
  termsAndConditions,
  settings
) => {
  const doc = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  let width = doc.internal.pageSize.width - 10;
  let height = 55;
  // const paymentDetailsWithBalance = calculateBalance(ledgerDetails);
  // const finalBalance = calculateFinalBalance(paymentDetailsWithBalance);
  const totalAmount = calculateQuoteTotal(ledgerDetails, selectedBranch);

  addHeader(doc, settings);
  //   doc.addImage(logo, "JPEG", width - logoWidth, height, logoWidth, logoHeight);

  //RIGHT SIDE DETAILS
  height -= 5;
  doc.setFont("halvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(36, 209, 252);
  doc.text("ESTIMATE", width / 2 + 20, height);

  height += 10;
  doc.setFont("halvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Date:", width / 2 + 20, height);
  doc.text(date, width / 2 + doc.getTextWidth("Date: ") + 20, height);

  height = 55;
  doc.setFont("halvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(36, 209, 252);
  doc.text("ESTIMATE FOR:", 10, height);
  height += 6;

  doc.setFont("halvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(clientName, 10, height);
  height += 5;

  doc.setFont("halvetica", "normal");
  doc.setFontSize(10);
  doc.text(selectedBranch ? `${selectedBranch}` : "", 10, height);
  height += 10;

  // doc.setFontSize(10);
  // doc.setFont("halvetica", "bold");
  // doc.text("Date:", 10, height);
  // height += 5;

  // doc.setFont("halvetica", "normal");
  // doc.text(fromDate, 10, height);
  // doc.text(" - ", 10 + doc.getTextWidth(fromDate), height);
  // doc.text(toDate, 10 + doc.getTextWidth(fromDate) + doc.getTextWidth(" - "), height);
  // height += 5;

  doc.setFontSize(8);

  const tableOptions = {
    startY: height,
    margin: { left: 10, right: 10, bottom: 25 },
    theme: "grid",
    headerStyles: { fillColor: [35, 210, 253] },
    // bodyStyles: { lineColor: [0, 0, 0] },
    styles: {
      fontSize: 8,
      valign: "middle",
    },
    columnStyles: {
      1: { cellWidth: 70, fontStyle: "bold" },
      2: { fontStyle: "bold" },
      3: { fontStyle: "bold" },
      4: { fontStyle: "bold" },
    },
    head: [
      [
        { content: "#", styles: { fillColor: [35, 210, 253] } },
        {
          content: "Name",
          styles: { fillColor: [35, 210, 253] },
        },
        {
          content: "Quantity",
          styles: { fillColor: [35, 210, 253] },
        },
        { content: "Avg. Price", styles: { fillColor: [35, 210, 253] } },
        { content: "Total", styles: { fillColor: [35, 210, 253] } },
      ],
    ],
    body: ledgerDetails.map((product, index) => [
      index + 1,
      product.productName,
      product.itemQuantity,
      product.productPrice,
      product.itemQuantity * product.productPrice - product.productDiscount,
    ]),
  };
  doc.autoTable(tableOptions);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  height = doc.autoTable.previous.finalY + 10;
  doc.text(
    `Total Amount: Rs ${totalAmount}`,
    width - doc.getTextWidth(`Total Amount:  Rs ${totalAmount}`),
    height
  );
  height += 5;

  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  doc.text("Estimate Amount in Words", 15, height);
  height += 5;
  doc.setFont("Helvetica", "normal");
  doc.text(numberToWords(totalAmount), 15, height);
  height += 7;

  if (termsAndConditions) {
    doc.setFontSize(10);
    doc.setFont("Helvetica", "bold");
    doc.text("Term & Conditions", 15, height);
    height += 5;
    doc.setFont("Helvetica", "normal");

    const maxWidth = width - 15;
    const terms = doc.splitTextToSize(termsAndConditions, maxWidth);
    doc.text(terms, 15, height);
  }

  addFooter(doc); // Add the footer

  return doc;
};
const addFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const footerY = pageHeight - 20; // Adjust the Y position as needed

  // Add the final text above the footer line
  const finalText =
    "This document is computer generated, does not need any signature.";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const finalTextWidth = doc.getTextWidth(finalText);
  const finalTextX = (pageWidth - finalTextWidth) / 2;
  const finalTextY = footerY - 2; // Adjust the Y-coordinate as needed

  // Styling
  doc.setLineWidth(0.5);
  doc.setDrawColor(34, 209, 252);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Draw a line at the bottom of the page
  doc.setFillColor(35, 42, 51);
  doc.rect(15, footerY + 5, pageWidth / 2, 5, "F");

  doc.setFillColor(35, 210, 253);
  doc.roundedRect(pageWidth / 2 - 20, footerY, pageWidth / 2, 10, 5, 5, "F");
  doc.rect(pageWidth - 30, footerY, 15, 10, "F");

  doc.text(finalText, finalTextX, finalTextY);
  doc.line(15, footerY, pageWidth - 15, footerY);

  // doc.text(`Branch Address: ${"branch address line 1"}`, 15, footerY + 5);
  // doc.text(`Branch Address: ${"branch address line 2"}`, 15, footerY + 10);
  // doc.text(`Branch Address: ${"branch address line 3"}`, 15, footerY + 15);
  // doc.text(
  //     `Branch phoneNumber: ${"03XX XXXXXXX"}`,
  //     pageWidth - doc.getTextWidth(`Branch phoneNumber: ${"03XX XXXXXXX"}`) - 15,
  //     footerY + 10
  // );
};

export const newPdf = (
  ledgerDetails,
  clientName,
  selectedBranch,
  date,
  settings
) => {
  const doc = generatePdf(
    ledgerDetails,
    clientName,
    selectedBranch,
    date,
    settings
  );
  const ledgerName = `${clientName} Quote`;
  doc.save(`${ledgerName}`);
};
