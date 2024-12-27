import logo from "../images/InventoryLogoBlack.png";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDateString } from "./helper";

const generatePdf = (ledgerDetails) => {
    // Debug: Log the incoming ledger details
    console.log("Ledger Details Input:", ledgerDetails);

    const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true, // Enable compression
    });

    let width = doc.internal.pageSize.width - 10;
    let height = 15;
    const logoWidth = 50;
    const logoHeight = 20;

    doc.addImage(logo, "JPEG", width - logoWidth, 5, logoWidth, logoHeight);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text("Purchases", 10, height);
    height += 15;

    doc.setFontSize(8);

    // Calculate total amount
    const totalAmount = ledgerDetails.reduce((sum, product) => sum + (product.totalAmount || 0), 0);

    const tableOptions = {
        startY: height,
        margin: { left: 5, right: 5, bottom: 25 },
        theme: "grid",
        headerStyles: { fillColor: [35, 210, 253] },
        styles: {
            fontSize: 8,
            valign: "middle",
        },
        columnStyles: {
            1: { cellWidth: 70 }, // Adjust column width for "Description"
            4: { halign: 'right' }, // Align "Total Amount" column to the right
        },
        head: [
            [
                { content: "Invoice #", styles: { fillColor: [35, 210, 253] } },
                { content: "Description", styles: { fillColor: [35, 210, 253] } },
                { content: "Purchased From", styles: { fillColor: [35, 210, 253] } },
                { content: "Date", styles: { fillColor: [35, 210, 253] } },
                { content: "Total Amount", styles: { fillColor: [35, 210, 253] } }, // Move this column to the end
            ],
        ],
        body: ledgerDetails.map((product, index) => {
            // Debug: Log each row being processed
            console.log(`Processing Row ${index + 1}:`, product);

            // Handle missing or undefined data gracefully
            return [
                product.invoiceId || "N/A",
                (product.purchaseDescription || "").replace(' - \nDiscount = (0)', ''),
                product.supplierName || "Unknown",
                formatDateString(product.purchaseDate || new Date()),
                product.totalAmount ? product.totalAmount.toFixed(2) : "0.00", // Display totalAmount in the last column
            ];
        }),
    };

    // Debug: Log the table body
    console.log("Table Data:", tableOptions.body);

    doc.autoTable(tableOptions);

    // Add the total amount under the "Total Amount" column at the bottom
    const lastRowY = doc.autoTable.previous.finalY;
    const totalAmountText = "Total Amount: " + totalAmount;

    // Calculate the X position to align the total amount under the last column
    const lastColumnX = doc.internal.pageSize.width - 6; // Adjust based on your right margin

    doc.setFontSize(10);
    doc.text(totalAmountText, lastColumnX - doc.getTextWidth(totalAmountText), lastRowY + 10); // Align to the right under the "Total Amount" column

    height = lastRowY + 20;

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
    doc.text(finalText, finalTextX, finalTextY);

    // Styling
    doc.setLineWidth(0.5);
    doc.setDrawColor(34, 209, 252); // Use your brand color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    // Draw a line at the bottom of the page
    doc.line(15, footerY, pageWidth - 15, footerY);
};

export const purchasesPdf = (ledgerDetails) => {
    try {
        console.log("Generating PDF...");
        const doc = generatePdf(ledgerDetails);

        // Debug: Log the ledger name and download start
        const ledgerName = "Purchases Pdf";
        console.log(`Saving PDF as ${ledgerName}.pdf`);
        doc.save(`${ledgerName}.pdf`);
    } catch (error) {
        // Log errors for debugging
        console.error("Error generating PDF:", error);
    }
};