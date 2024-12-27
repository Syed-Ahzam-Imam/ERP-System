import React, { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import logo from "../../../../images/InventoryLogoBlack.png";
import { getSaleDetails } from "../../../../api/saleAPI";
import { getSettings } from "../../../../api/settingsApi";
import { getSalesReturnById } from "../../../../api/returnSaleAPI";
import { formatDateString } from "../../../../utlis/helper";

const products = [
  {
    productCode: "01164",
    description: "Description 1",
    quantity: 10,
    rate: 2400,
    discount: 0,
  },
  // ... (other product data)
];

const ReturnPdf = ({ selectedItemID, onClose }) => {
  const pdfRef = useRef();
  const [pdfDataUri, setPdfDataUri] = useState(null);
  const [saleData, setSaleData] = useState(null); // State to store fetched sale data

  const invoiceNumber = saleData ? `Invoice #${saleData.sale.invoiceId}` : ""; // Use saleData instead of selectedItemID

  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        const data = await getSalesReturnById(selectedItemID);
        setSaleData(data);
        
        
      } catch (error) {
        console.error("Error fetching sale details:", error);
      }
    };

    fetchSaleData();
  }, [selectedItemID]);

  const [settings, setSettings] = useState({}); // Initialize as an empty object
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await getSettings();
        setSettings(result.settings);
      } catch (error) {
        // Handle the error, e.g., show an error message
        console.error("Error fetching data:", error);
      }
    };

    fetchSettings();
  }, []);

  const renderPdf = () => {
    if (!saleData || !saleData.items) {
      return; // Return if saleData or saleData.items is not available
    }

    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true, // Enable compression
    });
    
    doc.setProperties({
      title: `${invoiceNumber}`,
    });

    // Set the title
    let width = doc.internal.pageSize.width - 10;
    let height = 15;
    const logoWidth = 50;
    const logoHeight = 20;

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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SALES INVOICE", 10, height);
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CREDIT BILL", 10, height);
    height += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Invoice #: ", 10, height);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${saleData.sale.invoiceId}`,
      10 + doc.getTextWidth("Invoice #: " + 5),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Date: ", 10, height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${formatDateString(saleData.sale.salesReturnDate)}`,
      10 + doc.getTextWidth("Invoice #: " + 5),
      height
    );
    height += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Customer Name: ", 10, height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${saleData.sale.customerName}`,
      10 + doc.getTextWidth("Customer Name: " + 5),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Contact No: ", 10, height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${saleData.sale.customerPhoneNumber}`,
      10 + doc.getTextWidth("Contact No: " + 5),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Address: ", 10, height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${saleData.sale.customerAddress}`,
      10 + doc.getTextWidth("Address: " + 5),
      height
    );
    height += 10;

    // Add a table using jspdf-autotable
    const tableOptions = {
      startY: height,
      margin: { left: 5, right: 5, bottom: 25 },
      theme: "grid",
      headerStyles: { fillColor: [35, 210, 253] },
      // bodyStyles: { lineColor: [0, 0, 0] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 80 },
      },
      head: [
        [
          { content: "Product Code" },
          { content: "Product Name" },
          { content: "Qty" },
          { content: "Rate" },
          { content: "Amount" },
        ]
      ],
      body: saleData.items.map((product, index) => [
        product.productId,
        product.productName,
        product.quantity,
        product.unitPrice,
        product.totalAmount,
      ]),
    }
    doc.autoTable(tableOptions);
    height = doc.autoTable.previous.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Less Discount: ",
      width -
      10 -
      doc.getTextWidth(`${saleData.sale.totalAmount}`) -
      doc.getTextWidth("Received Amount:"),
      height
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `${saleData.sale.discount}`,
      width - doc.getTextWidth(`${saleData.sale.discount}`),
      height
    );
    height += 5;
    const total = parseFloat(saleData.sale.totalAmount);
    //  -
    // parseFloat(saleData.sale.discount);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Total Amount:",
      width -
      10 -
      doc.getTextWidth(`${saleData.sale.totalAmount}`) -
      doc.getTextWidth("Received Amount:"),
      height
    );
    doc.setFont("helvetica", "normal");
    doc.text(`${total}`, width - doc.getTextWidth(`${total}`), height);
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Received Amount:",
      width -
      10 -
      doc.getTextWidth(`${saleData.sale.totalAmount}`) -
      doc.getTextWidth("Received Amount:"),
      height
    );
    doc.setFont("helvetica", "normal");
    doc.text(`----`, width - doc.getTextWidth(`${total}`), height);

    // doc.setFont('helvetica', 'bold');
    addFooter(doc); // Add the footer

    // Convert the PDF content to a Data URI
    const dataUri = doc.output("datauristring");
    setPdfDataUri(dataUri);
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

  useEffect(() => {
    renderPdf();
  }, [saleData]);

  const downloadPdf = () => {
    if (pdfDataUri) {
      const a = document.createElement("a");
      a.href = pdfDataUri;
      a.download = `${invoiceNumber}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  if (!saleData || !saleData.items) {
    return; // Return if saleData or saleData.items is not available
  }
  return (
    <Flex direction="column" justify="center" align="center">
      <Flex
        direction="column"
        mt="10rem"
        display={{ base: "flex", lg: "none" }}
      >
        <Heading fontSize="xl">Download PDF to view.</Heading>
        <Button variant="solid" colorScheme="blue" mt={2} onClick={downloadPdf}>
          Download PDF
        </Button>
      </Flex>
      <Button
        alignSelf="end"
        variant="solid"
        colorScheme="blue"
        mb={2}
        onClick={downloadPdf}
        display={{ base: "none", lg: "block" }}
      >
        Download PDF
      </Button>
      <Box w="100%" display={{ base: "none", lg: "block" }}>
        <object
          data={pdfDataUri}
          type="application/pdf"
          width="100%"
          height="600"
        >
          <p>Alternative text if the PDF cannot be rendered</p>
        </object>
      </Box>
    </Flex>
  );
};

export default ReturnPdf;
