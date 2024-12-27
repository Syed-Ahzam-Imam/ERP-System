import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
  Spinner, // Import Spinner component
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { getAllProducts } from "../../../../api/productAPI";
import { getBranches } from "../../../../api/branchAPI";
import { createPurchase } from "../../../../api/purchasingAPI";
import { getAllSuppliers } from "../../../../api/supplierAPI";
import { getSaleDetails } from "../../../../api/saleAPI";
import { formatDate } from "../../../common";

function ShowSale({ selectedItemID, handleAddUpdateDeleteItem, onClose }) {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };

  const [loading, setLoading] = useState(true); // Loading state

  const [sale, setSales] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchSaleData(selectedItemID);
  }, []);

  const fetchSaleData = async (invoiceId) => {
    try {
      const data = await getSaleDetails(selectedItemID);
      setSales(data.sale);
      setItems(data.items);

      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching sale details:", error);
      toast({
        title: "Error",
        description: "Error fetching sale details:",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      setLoading(false); // Set loading to false in case of an error
    }
  };

  const [discount, setDiscount] = useState(0); // Initialize discount state with 0

  const calculateTotalAmount = (enteredDiscount) => {
    let total = 0;
    let lessDiscount = sale.discount;

    // Calculate the total of all item prices
    items.forEach((item) => {
      total += item.totalPrice;
    });
    total = total - lessDiscount;
    return {
      total: total.toFixed(2), // Return the total amount after applying the discount
    };
  };

  const toast = useToast();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    sale && (
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
              <FormLabel fontWeight="bold" mb={2}>
                {sale.isSupplier ? "Supplier Name" : "Customer Name"}
              </FormLabel>
              <Text style={textStyles}>{sale.customerName}</Text>
            </Box>



            <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
              <FormLabel fontWeight="bold" mb={2}>
                Date
              </FormLabel>
              <Text style={textStyles}>{formatDate(sale.saleDate)}</Text>

            </Box>

            {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Payment Status
            </FormLabel>
            <Badge
              variant="outline"
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
              colorScheme={sale.paymentStatus === "paid" ? "green" : sale.paymentStatus === "unpaid" ? "red" : "yellow"}
            >
              {sale.paymentStatus}
            </Badge>
          </Box> */}
            {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Payment Mode
            </FormLabel>
            <Badge
              variant="outline"
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
              colorScheme={sale.paymentStatus === "cash" ? "green" : "yellow"}
            >
              Cash
            </Badge>
          </Box> */}
          </HStack>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Description
            </FormLabel>
            <Text style={textStyles}>{sale.saleDescription.replace(' - \nDiscount = (0)', '')}</Text>
          </Box>
          <TableContainer my={4}>
            <Table size="sm" variant="striped">
              <Thead>
                <Tr>
                  <Th>Item Name</Th>
                  <Th>Quantity</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  {/* <Th>Dicount</Th> */}
                  <Th>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* {tableRows.map((row, index) => ( */}
                {items.map((item, index) => (
                  <Tr key={index}>
                    <Td>
                      <Text style={textStyles}>{item.productName}</Text>
                    </Td>
                    <Td>
                      <Text style={textStyles}>{item.quantity}</Text>
                    </Td>
                    <Td>
                      <Text style={textStyles}>{item.categoryName}</Text>
                    </Td>
                    <Td>
                      <Text style={textStyles}>{item.unitPrice}</Text>
                    </Td>
                    <Td>
                      <Text style={textStyles}>{item.totalAmount}</Text>
                    </Td>
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
            <VStack align="start" justify="center">
              <Text fontWeight="semibold" >
                Less Discount:
              </Text>
              <Text fontWeight="semibold" >
                Total Amount:
              </Text>
              {/* <Text fontWeight="semibold" >
              Received Amount:
            </Text> */}
            </VStack>
            <VStack align="start" justify="center">
              <Text fontWeight="semibold">{sale.discount}</Text>
              <Text fontWeight="semibold">
                {sale.totalAmount}
              </Text>
              {/* <Text fontWeight="semibold">
             {sale.amountRecieved}
            </Text> */}

            </VStack>
          </Flex>
        </FormControl>
      </Box>
    )
  );
}

export default ShowSale;
