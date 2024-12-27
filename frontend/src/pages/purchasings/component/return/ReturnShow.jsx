import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  HStack,
  Heading,
  IconButton,
  Input,
  Select,
  SimpleGrid,
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
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { getAllProducts } from "../../../../api/productAPI";
import { getBranches } from "../../../../api/branchAPI";
import { getAllSuppliers } from "../../../../api/supplierAPI";
import { fetchReturnPurchaseDetailsById } from "../../../../api/returnPurchase";

const ReturnShow = ({ handleAddUpdateDeleteItem, onClose, selectedItemID }) => {
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

  const [selectedItem, setselectedItem] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const fetchPurchaseDetails = async () => {
    try {
      const response = await fetchReturnPurchaseDetailsById(selectedItemID);
      setselectedItem(response);
   
      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      setLoading(false); // Set loading to false in case of an error
    }
  };
  useEffect(() => {
    // Fetch purchase details when component mounts or purchaseId changes
    fetchPurchaseDetails(); // Fetch purchase details
  }, [selectedItemID]); // Trigger fetch when purchaseId changes

  // Sample hardcoded data for selectedItem?

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateTotalAmount = () => {
    let total = 0;
    let totalDiscount = 0;

    selectedItem?.itemsWithAssignments?.forEach((item) => {
      total += item.productDetails.unitPrice * item.productDetails.quantity;
      totalDiscount += item.productDetails.discount || 0;
    });

    const lessDiscount = total - totalDiscount;
    return {
      total: total.toFixed(2),
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
              Supplier Name
            </Text>
            <Text style={textStyles}>
              {" "}
              {selectedItem?.purchaseReturn?.supplierName}
            </Text>
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Date
            </Text>
            <Text style={textStyles}>
              {formatDate(selectedItem?.purchaseReturn?.purchaseDate)}
            </Text>
          </Box>
          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Payment Status
            </Text>
            <Badge
              variant="outline"
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
              colorScheme={
                selectedItem?.purchaseReturn?.paymentStatus === "paid"
                  ? "green"
                  : selectedItem?.purchase?.paymentStatus === "partially"
                  ? "yellow"
                  : "red"
              }
            >
              {selectedItem?.purchaseReturn?.paymentStatus}
            </Badge>
          </Box> */}

          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Payment Mode
            </Text>
            <Badge
              variant="solid"
              fontSize={{ base: "xs", md: "sm", lg: "md" }}
              colorScheme={
                selectedItem?.purchaseReturn?.paymentStatus === "cash"
                  ? "green"
                  : "yellow"
              }
            >
              CASH
            </Badge>
          </Box> */}
        </HStack>
        <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
          <Text fontWeight="bold" mb={2}>
            Description
          </Text>
          <Text style={textStyles}>
            {selectedItem?.purchaseReturn?.purchaseReturnDescription}
          </Text>
        </Box>
        <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
          <Text fontWeight="bold" mb={2}>
            Items
          </Text>
          <Table>
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
              {selectedItem?.itemsWithAssignments.map((item, index) => (
                <Tr>
                  <Td>{item?.productDetails?.productName}</Td>
                  <Td>{item?.productDetails?.quantity}</Td>
                  <Td>{item?.productDetails?.categoryName}</Td>
                  {/* <Td>{item?.productDetails?.unitPrice}</Td> */}
                  <Td>
                    {(
                      item?.productDetails?.totalAmount /
                      item?.productDetails?.quantity
                    ).toFixed(2)}
                  </Td>
                  <Td>{(item?.productDetails?.totalAmount).toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Box
            justifySelf="end"
            bg={bgColorChild}
            borderRadius="lg"
            p={4}
            my={2}
            textAlign="end"
            fontSize="lg"
          >
            <Flex gap={5} justify="end">
              <VStack align="start" justify="center">
                <Text fontWeight="semibold">Total Amount:</Text>
                {/* <Text fontWeight="semibold">Amount Received:</Text> */}
              </VStack>
              <VStack align="start" justify="center">
                <Text fontWeight="semibold">
                  {selectedItem?.purchaseReturn?.totalAmount}
                </Text>

                {/* <Text fontWeight="semibold">
                  {selectedItem?.purchase?.amountPaid}
                </Text> */}
              </VStack>
            </Flex>
          </Box>
        </Box>
        {/* 
        <Box
          justifySelf="end"
          bg={bgColorChild}
          borderRadius="lg"
          p={4}
          my={2}
          textAlign="end"
          fontSize="lg"
        >
          <Flex gap={5} justify="end">
            <VStack align="start" justify="center">
              <Text fontWeight="semibold">Total Amount:</Text>
              <Text
                fontWeight="semibold"
                mt={2}
                display={formData.paymentMode === "unpaid" ? "none" : "flex"}
              >
                Amount Received:
              </Text>
            </VStack>

            <VStack align="end" justify="center">
              <Text fontWeight="semibold">
                {calculateTotalAmount().totalDiscount}
              </Text>

              <Input
                w="5rem"
                type="number"
                display={formData.paymentMode === "unpaid" ? "none" : "flex"}
                value={amountRecieved}
                onChange={(e) => setAmountRecieved(parseFloat(e.target.value))}
              />
            </VStack>
          </Flex>
        </Box> */}
        <Heading fontSize="md" textAlign="center" my={4}>
          Assign to Branch(s)
        </Heading>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Branch</Th>
                <Th>Item</Th>
                <Th>Quantity</Th>
              </Tr>
            </Thead>
            <Tbody>
              {selectedItem?.itemsWithAssignments.map((item) =>
                item?.itemAssignments.map((branch, index) => (
                  <Tr key={index}>
                    <Td>{branch?.branchName}</Td>
                    <Td>{item?.productDetails?.productName}</Td>
                    <Td>{branch?.quantity}</Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </FormControl>
    </Box>
  );
};

export default ReturnShow;
