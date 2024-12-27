
import logo from "../images/InventoryLogoBlack.png";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDateString } from "./helper";
import { calculateBalance, calculateFinalBalance } from "./functions";

const generatePdf = (ledgerDetails, selectedCategory) => {
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
    const paymentDetailsWithBalance = calculateBalance(ledgerDetails);
    const finalBalance = calculateFinalBalance(paymentDetailsWithBalance);

    doc.addImage(logo, "JPEG", width - logoWidth, 5, logoWidth, logoHeight);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text(selectedCategory ? `${selectedCategory + " products"}` : "All products", 10, height);
    height += 10;

    // doc.setFontSize(16);
    // doc.text(selectedBranch === "" ? "Admin" : selectedBranch, 10, height);
    // height += 15;


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
        margin: { left: 5, right: 5, bottom: 25 },
        theme: "grid",
        headerStyles: { fillColor: [35, 210, 253] },
        // bodyStyles: { lineColor: [0, 0, 0] },
        styles: {
            fontSize: 8,
            valign: "middle",
        },
        columnStyles: {
            // Define the custom style for the "Description" column
            1: { cellWidth: 70 }, // Assuming "Description" is the third column (index 2)
        },
        head: [
            [
                { content: "Name", styles: { fillColor: [35, 210, 253] } },
                { content: "Description", styles: { fillColor: [35, 210, 253] } },
                { content: "Category", styles: { fillColor: [35, 210, 253] } },
                { content: "Brand", styles: { fillColor: [35, 210, 253] } },
            ]
        ],
        body: paymentDetailsWithBalance.map((product, index) => [
            product.productName,
            product.productDescription,
            product.categoryName,
            product.brandName,
        ]),
        

    }
    doc.autoTable(tableOptions);
    height = doc.autoTable.previous.finalY + 10;

    addFooter(doc); // Add the footer

    return doc;
}
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

    // doc.text(`Branch Address: ${"branch address line 1"}`, 15, footerY + 5);
    // doc.text(`Branch Address: ${"branch address line 2"}`, 15, footerY + 10);
    // doc.text(`Branch Address: ${"branch address line 3"}`, 15, footerY + 15);
    // doc.text(
    //     `Branch Contact: ${"03XX XXXXXXX"}`,
    //     pageWidth - doc.getTextWidth(`Branch Contact: ${"03XX XXXXXXX"}`) - 15,
    //     footerY + 10
    // );
};

export const productsPdf = (ledgerDetails, selectedCategory) => {
    const doc = generatePdf(ledgerDetails, selectedCategory);
    const ledgerName = selectedCategory ? `${selectedCategory + " Products"}` : "All Products";
    doc.save(`${ledgerName}`);
}