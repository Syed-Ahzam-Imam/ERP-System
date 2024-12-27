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
// import logo from "../../../../../assets/InventoryLogo.png"
import { fetchPurchasePDFDetails } from "../../../../api/purchasingAPI";
import { getSettings } from "../../../../api/settingsApi";

const InvoicePdf = ({ invoiceId, onClose }) => {
  const pdfRef = useRef();
  const [pdfDataUri, setPdfDataUri] = useState(null);
  const [purchase, setPurchase] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchPurchasePDFDetails(invoiceId);
        setProducts(result.items);
        setPurchase(result.purchase);
        //
        //
      } catch (error) {
        // Handle the error, e.g., show an error message
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [invoiceId]);
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

  // Use useEffect to call renderPdf after the state is updated
  useEffect(() => {
    renderPdf();
  }, [purchase, products]);
  const renderPdf = () => {
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true, // Enable compression
    });
    
    doc.setProperties({
      title: `${purchase.invoiceId}`,
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
    doc.text("PURCHASE INVOICE", 10, height);
    height += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Invoice #: ", 10, height);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${purchase.invoiceId}`,
      10 + doc.getTextWidth("Invoice #: " + 5),
      height
    );
    height += 5;
    const dateObject = new Date(purchase.purchaseDate);
    const formattedDate = dateObject.toLocaleDateString("en-US");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Date: ", 10, height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${formattedDate}`,
      10 + doc.getTextWidth("Invoice #: " + 5),
      height
    );
    height += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Supplier Name: ", 10, height);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${purchase.supplierName}`,
      10 + doc.getTextWidth("Supplier Name: " + 5),
      height
    );
    height += 10;

    // Add a table using jspdf-autotable
    doc.autoTable({ html: "#my-table", startY: height });
    height = doc.autoTable.previous.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Sub Total: ",
      width -
      10 -
      doc.getTextWidth(`${purchase.totalAmount}`) -
      doc.getTextWidth("Total Amount: "),
      height
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `${purchase.totalAmount}`,
      width - doc.getTextWidth(`${purchase.totalAmount}`),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Less Discount:",
      width -
      10 -
      doc.getTextWidth(`${purchase.totalAmount}`) -
      doc.getTextWidth("Total Amount: "),
      height
    );
    const lessAmount = products.reduce(
      (total, product) => total + product.discount,
      0
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `${lessAmount}`,
      width - doc.getTextWidth(`${lessAmount}`),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Discount: ",
      width -
      10 -
      doc.getTextWidth(`${purchase.totalAmount}`) -
      doc.getTextWidth("Total Amount: "),
      height
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `${purchase.discount}`,
      width - doc.getTextWidth(`${purchase.discount}`),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    doc.text(
      "Total: ",
      width -
      10 -
      doc.getTextWidth(`${purchase.totalAmount}`) -
      doc.getTextWidth("Total Amount: "),
      height
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      `${purchase.totalAmount - purchase.discount}`,
      width - doc.getTextWidth(`${purchase.totalAmount - purchase.discount}`),
      height
    );
    height += 5;

    doc.setFont("helvetica", "bold");
    // doc.text(
    //   "Paid Amount: ",
    //   width -
    //     10 -
    //     doc.getTextWidth(`${purchase.totalAmount}`) -
    //     doc.getTextWidth("Paid Amount: "),
    //   height
    // );
    // doc.setFont("helvetica", "normal");
    // doc.text(
    //   `${purchase.amountPaid}`,
    //   width - doc.getTextWidth(`${purchase.totalAmount - purchase.discount}`),
    //   height
    // );
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
      pageWidth - doc.getTextWidth(`Branch Contact: ${settings.branchPhoneNumber}`) - 15,
      footerY + 10
    );

  };

  const downloadPdf = () => {
    if (pdfDataUri) {
      const a = document.createElement("a");
      a.href = pdfDataUri;
      a.download = `${purchase.invoiceId}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
        {/* <iframe
          title="PDF Viewer"
          width="100%"
          height="600"
          ref={pdfRef}
          src={pdfDataUri}
        ></iframe> */}
        <object
          data={pdfDataUri} // URL to the PDF file
          type="application/pdf"
          width="100%"
          height="600"
        >
          <p>Alternative text if the PDF cannot be rendered</p>
        </object>
        {/* Define the table with an id for jspdf-autotable */}
        <Table id="my-table" style={{ display: "none" }}>
          <Thead>
            <Tr>
              <Th>Product Code</Th>
              <Th>Descripton</Th>
              <Th>Qty</Th>
              <Th>Rate</Th>
              <Th>Sub Total</Th>
              <Th>Discount</Th>
              <Th>Total Amount</Th>
            </Tr>
          </Thead>
          <Tbody
          alignItems="center"
          >
            {products.map((product, index) => (
              <Tr key={index}>
                <Td>{product.productId}</Td>
                <Td>{product.description}</Td>
                <Td>{product.quantity}</Td>
                <Td>{product.unitPrice}</Td>
                <Td>{product.quantity * product.unitPrice}</Td>
                <Td>{product.discount}</Td>
                <Td>
                  {product.quantity * product.unitPrice - product.discount}
                </Td>
              </Tr>
            ))}
            <Tr>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              {/* <Td fontWeight="bold">
                <Text>Total</Text>
              </Td>
              <Td>
                {products.reduce(
                  (total, product) =>
                    total +
                    (product.quantity * product.rate - product.discount),
                  0
                )}
              </Td> */}
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default InvoicePdf;
