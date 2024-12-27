import logo from "../images/InventoryLogoBlack.png";
import { jsPDF } from "jspdf";

import "jspdf-autotable";
import { formatDateString } from "./helper";
import { branchName } from "../api/constants";
import { calculateBalance, calculateFinalBalance } from "./functions";


const generatePdf = (productDetails, ledgerDetails, startDate, endDate, ledgerName, settings) => {

    const doc = new jsPDF();
    // const paymentDetailsWithBalance = calculateBalance(ledgerDetails);
    // const finalBalance = calculateFinalBalance(paymentDetailsWithBalance);

    let width = doc.internal.pageSize.width - 10;
    let height = 15;
    const logoWidth = 50;
    const logoHeight = 20;

    // Create a new jsPDF instance

    if (settings && settings.logoImage) {
        doc.addImage(
            settings.logoImage,
            "PNG",
            width - logoWidth,
            5,
            logoWidth,
            logoHeight
        );
    }
    doc.setFontSize(20);
    doc.text(branchName, 10, height);
    height += 7;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text("General Ledger Report", 10, height);
    height += 8;

    doc.setFont("helvetica", "semi-bold");
    doc.setFontSize(15);
    doc.text(`${productDetails.productName}`, 10, height);
    height += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("From:", 10, height);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
        `${startDate}`,
        10 + doc.getTextWidth("From:" + 5),
        height
    );

    doc.setFont("helvetica", "bold");
    doc.text("To:", 10 + doc.getTextWidth("From:" + 5 + `${startDate}` + 5), height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
        `${endDate}`,
        10 + doc.getTextWidth("From:" + 5 + `${endDate}` + 5 + "To:" + 5),
        height
    );

    height += 5;

    // table generation
    const tableOptions = {
        startY: height,
        margin: { left: 5, right: 5, bottom: 25 },
        theme: "grid",
        headerStyles: { fillColor: [35, 210, 253] },
        // bodyStyles: { lineColor: [0, 0, 0] },
        styles: {
            fontSize: 8,
            valign: "middle",
        },
        head: [
            [
                { content: "Date", styles: { fillColor: [35, 210, 253] }, columnWidth: 30 },
                { content: "Voucher #", styles: { fillColor: [35, 210, 253] }, columnWidth: 30 },
                // { content: "Type", styles: { fillColor: [35, 210, 253] }, columnWidth: 30 },
                { content: "Description", styles: { fillColor: [35, 210, 253] }, columnWidth: 80 },
                { content: "Debit", styles: { fillColor: [35, 210, 253] }, columnWidth: 25 },
                { content: "Credit", styles: { fillColor: [35, 210, 253] }, columnWidth: 25 },
                { content: "Balance", styles: { fillColor: [35, 210, 253] }, columnWidth: 30 },
                { content: "DR/CR", styles: { fillColor: [35, 210, 253] }, columnWidth: 20 },
            ],
        ],
        body: ledgerDetails.map((product, index) => [
            formatDateString(product.date),
            product.vNo ? product.vNo : "-",
            // product.type,
            {
                content:
                    (product.items && product.items.length > 0 ?
                        product.items.map(item =>
                            `${item.itemName.substring(0, 15)}... ${item.itemCategory} ${item.itemQuantity} x ${item.itemPrice} = ${item.itemQuantity * item.itemPrice}`
                        ).join("\n")
                        : ""
                    ) +
                    (product.description ? "\n" + product.description : ""),
                styles: { cellWidth: 80 },
            },
            product.debit,
            product.credit,
            Math.abs(product.balance),
            product.balance > 0 ? "DR" : "CR",
        ]),
    };

    // Add a table using jspdf-autotable
    doc.autoTable(tableOptions);
    height = doc.autoTable.previous.finalY + 10;



    addFooter(doc, settings); // Add the footer

    // Convert the PDF content to a Data URI
    return doc;
};
const addFooter = (doc, settings) => {
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
    doc.text(finalText, finalTextX, finalTextY);

    // Styling
    doc.setLineWidth(0.5);
    doc.setDrawColor(34, 209, 252); // Use your brand color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Draw a line at the bottom of the page
    doc.line(15, footerY, pageWidth - 15, footerY);

    // doc.text(`Branch Address: ${"branch address line 1"}`, 15, footerY + 5);
    // doc.text(`Branch Address: ${"branch address line 2"}`, 15, footerY + 10);
    // doc.text(`Branch Address: ${"branch address line 3"}`, 15, footerY + 15);
    doc.text(`Branch Location: ${settings.branchLocation}`, 15, footerY + 5);
    doc.text(
        `Branch Contact: ${settings.branchPhoneNumber}`,
        pageWidth -
        doc.getTextWidth(`Branch Contact: ${settings.branchPhoneNumber}`) -
        15,
        footerY + 10
    );
};

export const generalLedgerDetailedProductsPdf = (productDetails, ledgerDetails, startDate, endDate, ledgerName, settings) => {
    const doc = generatePdf(productDetails, ledgerDetails, startDate, endDate, ledgerName, settings);
    doc.save(`${ledgerName}`)
};
export const printProductsPdf = (productDetails, ledgerDetails, startDate, endDate, ledgerName, settings) => {
    const doc = generatePdf(productDetails, ledgerDetails, startDate, endDate, ledgerName, settings);

    // Create a Blob from the PDF
    const pdfBlob = doc.output("blob");

    // Create a URL for the Blob
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Open a new window for printing
    const printWindow = window.open(pdfUrl, "_blank");

    // Wait for the PDF to load before printing
    printWindow.onload = () => {
        printWindow.print();
        // Clean up after printing
        URL.revokeObjectURL(pdfUrl);
    };
};