import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import { BiFileBlank } from "react-icons/bi";
import { getSaleRecord, recordSalePayment } from "../../../../api/saleAPI";

const RecordPayment = ({
  selectedItemID,
  onClose,
  handleAddUpdateDeleteItem,
}) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputStyles = {
    border: "1px solid grey",
  };

  //   const [tableRows, setTableRows] = useState([]);
  const [paymentModes, setPaymentModes] = useState(["Cash", "Credit"]);

  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Cash");

  const paymentColors = {
    PAID: "green",
    "PARTIALLY PAID": "yellow",
    UNPAID: "red",
  };
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [paymentData, setPaymentData] = useState([]);

  useEffect(() => {
    const fetchSaleRecord = async () => {
      try {
        setLoading(true); // Set loading to true when starting the API call
        const saleRecord = await getSaleRecord(selectedItemID);
        setPaymentData(saleRecord.record);
        
        // You can log the fetched data for debugging
        
      } catch (error) {
        console.error("Error fetching sale record:", error);
        // Handle the error as needed
      } finally {
        setLoading(false); // Set loading to false when the API call is complete, whether it succeeds or fails
      }
    };
    
    if (selectedItemID) {
      fetchSaleRecord();
    }
  }, [selectedItemID]);
  const toast = useToast();

  const handleRecordPayment = async () => {
    try {
      const paymentData = {
        date: paymentDate,
        amountRecieved: paymentAmount,
        description: paymentDescription,
        paymentMode: selectedPaymentMode.toLowerCase(),
        salesId: selectedItemID,
      };
      
      const response = await recordSalePayment(paymentData);

      

      handleAddUpdateDeleteItem();

      toast({
        title: "Payment Recorded",
        description: "Payment recorded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // If the server returns a specific error message, use that
        const errorMessage = error.response.data.message;

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to record payment. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error("Error recording payment:", error);
      }
    }
  };
  if (loading) {
    return (
      <Center>
        <Text>Loading</Text>
      </Center>
    );
  } else
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
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
        >
          <HStack>
            <Text fontWeight="bold" fontSize="lg">
              Sale # 123123
            </Text>
            <Badge
              // colorScheme={paymentColors[data.InvoiceData.payment_status]}
              variant="solid"
              fontSize="0.8rem"
            >
              Partially paid
            </Badge>
          </HStack>
          <HStack>
            <Button variant="ghost" onClick={onClose}>
              <SmallCloseIcon
                mr={2}
                borderRadius="50%"
                border="1px solid black"
              />{" "}
              Cancel
            </Button>
          </HStack>
        </Flex>
        <Divider orientation="horizontal" my={4} />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} alignItems="start">
          <Flex direction="column">
            <FormControl isRequired>
              <FormLabel my={4}>Date</FormLabel>
              <Input
                type="date"
                style={inputStyles}
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              ></Input>

              <FormLabel my={4}>Amount</FormLabel>
              <Input
                type="number"
                style={inputStyles}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              ></Input>
              <FormLabel my={4}>Description</FormLabel>
              <Input
                type="text"
                style={inputStyles}
                value={paymentDescription}
                onChange={(e) => setPaymentDescription(e.target.value)}
              ></Input>
              <FormLabel my={4}>Payment Mode</FormLabel>
              <Select
                style={inputStyles}
                value={selectedPaymentMode}
                onChange={(e) => setSelectedPaymentMode(e.target.value)}
              >
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
          <Stack direction="column" mt={8} p={4} maxWidth="md">
            <Box>
              <HStack fontWeight="bold" justify="space-between">
                <Text>Customer: </Text>
                <Text justifyItems="start">{paymentData.customerName}</Text>
              </HStack>
            </Box>
            {/* <Box>
            <HStack fontWeight="thin" justify="space-between">
              <Text>Date: </Text>
              <Text>{dummyData[0].date}</Text>
            </HStack>
          </Box> */}

            <Box>
              <HStack fontWeight="thin" justify="space-between">
                <Text>Address: </Text>
                <Text>{paymentData.address}</Text>
              </HStack>
            </Box>
            <Box>
              <HStack fontWeight="thin" justify="space-between">
                <Text>Phone: </Text>
                <Text>{paymentData.phoneNumber}</Text>
              </HStack>
            </Box>
            <Box>
              <HStack fontWeight="thin" justify="space-between">
                <Text>Payment Status: </Text>
                <Text>{paymentData.paymentStatus}</Text>
              </HStack>
            </Box>
            {/* <Box>
            <HStack fontWeight="thin" justify="space-between">
              <Text>Payment Mode: </Text>
              <Text>{dummyData[0].paymentMode}</Text>
            </HStack>
          </Box> */}

            <Box>
              <HStack fontWeight="semibold" justify="space-between">
                <Text>Total Amount: </Text>
                <Text>{`${paymentData.totalAmount}`}</Text>
              </HStack>
            </Box>
            <Box>
              <HStack fontWeight="semibold" justify="space-between">
                <Text>Received Amount: </Text>
                <Text>{paymentData.amountRecieved}</Text>
              </HStack>
            </Box>
            <Box>
              <HStack fontWeight="semibold" justify="space-between">
                <Text>Balance: </Text>
                <Text>{`${paymentData.amountRemaining}`}</Text>
              </HStack>
            </Box>
          </Stack>
        </SimpleGrid>
        <Button
          variant="solid"
          colorScheme="blue"
          mt={4}
          onClick={handleRecordPayment}
        >
          Record Payment
        </Button>
      </Box>
    );
};

export default RecordPayment;
