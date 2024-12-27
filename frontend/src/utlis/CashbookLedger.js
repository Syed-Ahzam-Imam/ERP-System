import logo from "../images/InventoryLogoBlack.png";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatDateString } from "./helper";
import { calculateBalance, calculateFinalBalance, calculateFinalBalanceCashBook } from "./functions";

let totalReceipt = 0, totalPayment = 0, finalBalance = 0;

const generatePdf = (ledgerDetails, selectedBranch, fromDate, toDate, selectedType, settings) => {
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
    const paymentDetailsWithBalance = calculateBalance(ledgerDetails, fromDate);
    const {
        finalBalance: calculatedFinalBalance,
        paymentTotal: calculatedTotalPayment,
        receiptTotal: calculatedTotalReceipt,
    } = calculateFinalBalanceCashBook(paymentDetailsWithBalance);

    totalReceipt = calculatedTotalReceipt;
    totalPayment = calculatedTotalPayment;
    finalBalance = calculatedFinalBalance;

    paymentDetailsWithBalance.sort((a, b) => new Date(a.date) - new Date(b.date));

    doc.addImage(logo, "JPEG", width - logoWidth, 5, logoWidth, logoHeight);
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.text(selectedType === "" ? "Cashbook Ledger" : `${selectedType} Ledger`, 10, height);
    height += 7;

    doc.setFontSize(16);
    doc.text(selectedBranch === "" ? "Admin" : selectedBranch, 10, height);
    height += 15;

    doc.setFontSize(10);
    doc.setFont("halvetica", "bold");
    doc.text("Date:", 10, height);
    height += 5;

    doc.setFont("halvetica", "normal");
    doc.text(fromDate, 10, height);
    doc.text(" - ", 10 + doc.getTextWidth(fromDate), height);
    doc.text(toDate, 10 + doc.getTextWidth(fromDate) + doc.getTextWidth(" - "), height);
    height += 5;

    doc.setFontSize(8);

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
            0: { cellWidth: 23 }, // "Head"
            1: { cellWidth: 20 }, // "Date"
            2: { cellWidth: 30 }, // "Name"
            3: { cellWidth: 38 }, // "Description"
            4: { cellWidth: 25 }, // "Branch"
            5: { cellWidth: 17 }, // "Receipt"
            6: { cellWidth: 17 }, // "Payment"
            7: { cellWidth: 17 }, // "Balance"
            8: { cellWidth: 13 }, // "DR/CR"
        },
        head: [
            [
                { content: "Head", styles: { fillColor: [35, 210, 253] } },  // Head column added back
                { content: "Date", styles: { fillColor: [35, 210, 253] } },  // Moved Date here
                { content: "Name", styles: { fillColor: [35, 210, 253] } },  // Moved Name here
                { content: "Description", styles: { fillColor: [35, 210, 253] } },  // Description column added back
                { content: "Branch", styles: { fillColor: [35, 210, 253] } },  // Branch column moved
                { content: "Receipt", styles: { fillColor: [35, 210, 253] } },
                { content: "Payment", styles: { fillColor: [35, 210, 253] } },
                { content: "Balance", styles: { fillColor: [35, 210, 253] } },
                { content: "DR/CR", styles: { fillColor: [35, 210, 253] } },
            ]
        ],
        body: paymentDetailsWithBalance.map((product, index) => [
            product.ledgerTypeName, // Head column data
            formatDateString(product.date), // Date
            product.accountName, // Name
            product.description, // Description
            product.branchName, // Branch
            product.receipt, // Receipt
            product.payment, // Payment
            Math.abs(product.balance), // Balance
            product.balance > 0 ? "DR" : "CR", // DR/CR
        ]),
    };
    
    doc.autoTable(tableOptions);
    height = doc.autoTable.previous.finalY + 10;
    doc.text(`Total Receipt: ${totalReceipt}`, width - doc.getTextWidth(`Total Receipt: ${totalReceipt}`), height);
    doc.text(`Total Payment: ${totalPayment}`, width - doc.getTextWidth(`Total Payment: ${totalPayment}`), height + 5);
    doc.text(`Total Balance: ${totalPayment - totalReceipt}`, width - doc.getTextWidth(`Total Balance: ${totalPayment - totalReceipt}`), height + 10);
    
    addFooter(doc, settings); // Add the footer
    
    return doc;
};    

const addFooter = (doc, settings) => {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const footerY = pageHeight - 20; // Adjust the Y position as needed

    const finalText =
        "This document is computer generated, does not need any signature.";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const finalTextWidth = doc.getTextWidth(finalText);
    const finalTextX = (pageWidth - finalTextWidth) / 2;
    const finalTextY = footerY - 2;
    doc.text(finalText, finalTextX, finalTextY);

    doc.setLineWidth(0.5);
    doc.setDrawColor(34, 209, 252); // Use your brand color
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    doc.line(15, footerY, pageWidth - 15, footerY);
    doc.text(`Branch Location: ${settings?.branchLocation}`, 15, footerY + 5);
    doc.text(
        `Branch Contact: ${settings?.branchPhoneNumber}`,
        pageWidth - doc.getTextWidth(`Branch Contact: ${settings?.branchPhoneNumber}`) - 15,
        footerY + 10
    );
};

export const cashbookLedgerPdf = (ledgerDetails, selectedBranch, fromDate, toDate, selectedType, settings) => {
    const doc = generatePdf(ledgerDetails, selectedBranch, fromDate, toDate, selectedType, settings);
    const ledgerName = selectedType === "" ? "General ledger" : `${selectedType} Ledger`;
    doc.save(`${ledgerName}`);
};

export const ledgerPreview = (ledgerDetails, selectedBranch, fromDate, toDate, selectedType, settings) => {
    const doc = generatePdf(ledgerDetails, selectedBranch, fromDate, toDate, selectedType, settings); // Generate PDF
    const blob = doc.output("blob"); // Get the PDF as a Blob
    const blobUrl = URL.createObjectURL(blob); // Create a URL for the Blob

    window.open(blobUrl); // Open the Blob URL in a new tab for preview
};
