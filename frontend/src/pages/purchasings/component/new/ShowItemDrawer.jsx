import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  FormControl,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Badge,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { fetchPurchaseDetailsById } from "../../../../api/purchasingAPI";

function ShowItemDrawer({ selectedItemID, branches, onClose, isReturn }) {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
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
      const response = await fetchPurchaseDetailsById(selectedItemID);
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
      borderWidth="1px"
      bg={bgColor}
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      {loading && <Spinner size="lg" color="blue.500" />}
      {!loading && (
        <FormControl>
          <HStack>
            <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
              <Text fontWeight="bold" mb={2}>
                Purchased From
              </Text>
              <Text style={textStyles}>
                {selectedItem?.purchase?.supplierName}
              </Text>
            </Box>

            <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
              <Text fontWeight="bold" mb={2}>
                Date
              </Text>
              <Text style={textStyles}>
                {formatDate(selectedItem?.purchase?.purchaseDate)}
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
                  selectedItem?.purchase?.paymentStatus === "paid"
                    ? "green"
                    : selectedItem?.purchase?.paymentStatus === "partially"
                    ? "yellow"
                    : "red"
                }
              >
                {selectedItem?.purchase?.paymentStatus}
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
                  selectedItem?.purchase?.paymentStatus === "cash"
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
              Payment Description
            </Text>
            <Text style={textStyles}>
              {selectedItem?.purchase?.purchaseDescription.replace(' - \nDiscount = (0)', '')}
            </Text>
          </Box>
          <VStack spacing={4} align="start">
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
                    <Th>Discount</Th>
                    <Th>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedItem?.itemsWithAssignments.map((item, index) => (
                    <Tr>
                      <Td>{item?.productDetails?.productName}</Td>
                      <Td>{item?.productDetails?.quantity}</Td>
                      <Td>{item?.productDetails?.categoryName}</Td>
                      <Td>{item?.productDetails?.unitPrice}</Td>
                      <Td>{item?.productDetails?.discount}</Td>
                      <Td>
                        {(
                          item?.productDetails?.totalAmount -
                          item?.productDetails?.discount
                        ).toFixed(2)}
                      </Td>
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
                    <Text fontWeight="semibold">Sub Total :</Text>
                    <Text fontWeight="semibold">Less Discount:</Text>
                    <Text fontWeight="semibold">Discount:</Text>
                    <Text fontWeight="semibold">Total Amount:</Text>
                    {/* <Text fontWeight="semibold">Paid Amount:</Text> */}
                  </VStack>
                  <VStack align="start" justify="center">
                    <Text fontWeight="semibold">
                      {parseFloat(calculateTotalAmount().total)}
                    </Text>
                    <Text fontWeight="semibold">
                      {calculateTotalAmount().totalDiscount}
                    </Text>
                    <Text fontWeight="semibold">
                      {selectedItem?.purchase?.discount}
                    </Text>
                    <Text fontWeight="semibold">
                      {selectedItem?.purchase?.totalAmount}
                    </Text>
                    {/* <Text fontWeight="semibold">
                      {selectedItem?.purchase?.amountPaid}
                    </Text> */}
                  </VStack>
                </Flex>
              </Box>
            </Box>

            {/* Branches Section */}
            <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
              <Text fontWeight="bold" mb={2}>
                Branches
              </Text>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Branch Name</Th>
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
            </Box>
          </VStack>
        </FormControl>
      )}
    </Box>
  );
}

export default ShowItemDrawer;
