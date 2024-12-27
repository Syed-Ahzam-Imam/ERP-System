import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  HStack,
  Text,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import { getSalesReturnById } from "../../../../api/returnSaleAPI";
import { formatDateString } from "../../../../utlis/helper";

const ShowReturn = ({ selectedItemID, handleAddUpdateDeleteItem, onClose }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };

  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchSalesReturnData = async () => {
      try {
        const salesReturnId = selectedItemID;
        const salesReturnData = await getSalesReturnById(salesReturnId);

        setFormData(salesReturnData.sale);
        setTableRows(salesReturnData.items);

        
      } catch (error) {
        console.error("Error fetching sales return data:", error);
      }
    };

    fetchSalesReturnData();
  }, [selectedItemID]);

  const handleAmountChange = (event) => {
    const enteredAmount = parseFloat(event.target.value);
    setAmountPaid(enteredAmount);
  };

  const calculateTotalAmount = (enteredDiscount) => {
    let total = 0;
    let totalDiscount = 0;

    tableRows.forEach((row) => {
      total += row.unitPrice * row.quantity;
      totalDiscount += row.totalAmount || 0;
    });

    const lessDiscount = total - enteredDiscount;

    return {
      total: (total - discount).toFixed(2),
      lessDiscount: lessDiscount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
    };
  };
  return (
    <Box
      spacing={10}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      <FormControl isRequired>
        <HStack>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Customer Name
            </Text>
            <Text style={textStyles}>{formData.customerName}</Text>
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Date
            </Text>
            <Text style={textStyles}>
              {formatDateString(formData.salesReturnDate)}
            </Text>
          </Box>
          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Payment Status
            </Text>
            <Text style={textStyles}>Partially Paid</Text>
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Payment Mode
            </Text>
            <Text style={textStyles}>Cash</Text>
          </Box> */}
        </HStack>
        <Flex direction={{ base: "column", md: "row" }}>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Description
            </Text>
            <Text style={textStyles}>{formData.salesReturnDescription}</Text>
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Return Location
            </Text>
            <Text style={textStyles}>{formData.salesReturnLocation}</Text>
          </Box>
        </Flex>
        <TableContainer my={4}>
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Item Name</Th>
                <Th>Quantity</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tableRows.map((row, index) => (
                <Tr key={index}>
                  <Td>{row.productName}</Td>
                  <Td>{row.quantity}</Td>
                  <Td>{row.categoryName}</Td>
                  <Td>{row.unitPrice}</Td>
                  <Td>{row.totalAmount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex
          justify="end"
          bg={bgColorChild}
          borderRadius="lg"
          p={4}
          my={2}
          textAlign="end"
          fontSize="lg"
          gap={5}
        >
          <VStack gap={4} align="start" justify="center">
            {/* <Text fontWeight="semibold">Less Discount:</Text> */}
            <Text fontWeight="semibold">Total Amount:</Text>
            <Text fontWeight="semibold">Paid Amount:</Text>
          </VStack>
          <VStack align="start" justify="center">
            <Text fontWeight="semibold">
              {calculateTotalAmount(discount).total}
            </Text>
            <Input
              type="number"
              w="5rem"
              value={amountPaid} // Set the value of the input field to the discount state
              onChange={handleAmountChange} // Handle changes in the input field
            />
          </VStack>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default ShowReturn;
