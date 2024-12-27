
import logo from "../images/InventoryLogoBlack.png";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDateString } from "./helper";
import { calculateTotalSale } from "./functions";



const generatePdf = (salesDetails, fromDate, toDate) => {

   

    const doc = new jsPDF();
    let width = doc.internal.pageSize.width - 10;
    let height = 15;
    const logoWidth = 50;
    const logoHeight = 20;
    const totalSale = calculateTotalSale(salesDetails)

    doc.setFontSize(20);
    doc.setFont("halvetica", "bold");
    doc.text(`All Sales`, 10, height);
    doc.addImage(logo, "JPEG", width - logoWidth, 5, logoWidth, logoHeight);
    doc.setFont("times", "bold");
    height += 17;


    doc.setFontSize(10);
    doc.setFont("halvetica", "bold");
    doc.text(`From ${fromDate} to ${toDate}`, 10, height);
    height += 5;



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
            2: { cellWidth: 70 }, // Assuming "Description" is the third column (index 2)
        },
        head: [
            [
                { content: "Customer Name", styles: { fillColor: [35, 210, 253] } },
                { content: "Branch", styles: { fillColor: [35, 210, 253] } },
                { content: "Description", styles: { fillColor: [35, 210, 253] } },
                { content: "Amount", styles: { fillColor: [35, 210, 253] } },
                { content: "Date", styles: { fillColor: [35, 210, 253] } },
            ]
        ],
        body: salesDetails.map((sale, index) => [
            sale.customerName,
            sale.branchName,
            sale.saleDescription.replace(' - \nDiscount = (0)', ''),
            sale.totalAmount,
            formatDateString(sale.saleDate),
        ]),


    }
    doc.autoTable(tableOptions);
    height = doc.autoTable.previous.finalY + 10;
    doc.text(`Total Sale: ${totalSale}`, width - doc.getTextWidth(`Total Sale: ${totalSale}`), height);
    addFooter(doc); // Add the footer

    return doc;
}
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
    // doc.text(`Branch Location: ${settings.branchLocation}`, 15, footerY + 5);
    // doc.text(
    //     `Branch Contact: ${settings.branchPhoneNumber}`,
    //     pageWidth -
    //     doc.getTextWidth(`Branch Contact: ${settings.branchPhoneNumber}`) -
    //     15,
    //     footerY + 10
    // );
};






export const salesPdf = (salesDetails, fromDate, toDate) => {

   
    const doc = generatePdf(salesDetails, fromDate, toDate);
    const ledgerName = `All Sales`;
    doc.save(`${ledgerName}`);
}