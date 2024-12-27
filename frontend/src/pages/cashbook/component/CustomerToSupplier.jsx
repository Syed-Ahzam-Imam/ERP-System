import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FaRupeeSign } from "react-icons/fa6";
import {
  fetchAccountsByBranchId,
  directTransfer,
} from "../../../api/cashBookAPI";
// import { getAllLedgerTypes } from "../../../api/ledgerAPI";
import { useBgColorChild } from "../../../utlis/colors";
import { getPaymentMethods } from "../../../api/paymentModeAPI";
import { branchId } from "../../../api/constants";
import moment from "moment";

const CustomerToSupplier = ({ onClose, handleAddUpdateDeleteItem }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [description, setDescription] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [date, setDate] = useState(moment().format("YYYY-MM-DD")); // Added state for Date
  const [btnLoading, setBtnLoading] = useState(false);

  const toast = useToast();
  const handleDirectTransfer = async () => {
    setBtnLoading(true);
    try {
      // Determine the type of account for 'from' and 'to' based on whether they are customers or suppliers
      const fromType = accountOne?.type === "CUSTOMER" ? 1 : 2;
      const toType = accountTwo?.type === "CUSTOMER" ? 1 : 2;
      const payload = {
        branchId: parseInt(branchId),
        description: description,
        date: date,
        fromId: accountOne?.id,
        fromLedgerId: fromType, // Set fromLedgerId based on accountOne type
        toId: accountTwo?.id,
        toLedgerId: toType, // Set toLedgerId based on accountTwo type
        transferAmount: parseInt(transferAmount),
      };

      const response = await directTransfer(payload);
      toast({
        title: "Direct transfer recorded successfully:",
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast({
          title: "Error",
          description: error.response.data.error,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description:
            "Failed to add direct transfer record. Please try again later.",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
      setBtnLoading(false);
    }
  };

  const [customer, setCustomer] = useState("");
  const [supplier, setSupplier] = useState("");
  const [accountOne, setAccountOne] = useState("");

  const [accountTwo, setAccountTwo] = useState("");
  const [fromLedgerId, setFromLedgerId] = useState("");
  const [toLedgerId, setToLedgerId] = useState("");
  const [accountOneSearchTerm, setAccountOneSearchTerm] = useState("");
  const [accountTwoSearchTerm, setAccountTwoSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetchAccountsByBranchId(branchId);
        const { Customers, Suppliers } = response;

        // const accounts = [];
        const allAccounts = [
          ...(Customers || []).map(customer => ({ ...customer, type: 'CUSTOMER' , id:customer.customerId})),
          ...(Suppliers || []).map(supplier => ({ ...supplier, type: 'SUPPLIER' ,id: supplier.supplierId}))
      ];
        setAccounts(allAccounts);
        // Combine both Customers and Suppliers into one array
        // const allAccounts = [...(Customers || []), ...(Suppliers || [])];
        // setAccounts(allAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);


  const accountOneSearchResults = accounts?.filter((user) =>
    user.firstName
      .toLocaleLowerCase()
      .includes(accountOneSearchTerm.toLocaleLowerCase())
  );
  const accountTwoSearchResults = accounts?.filter((user) =>
    user.firstName
      .toLocaleLowerCase()
      .includes(accountTwoSearchTerm.toLocaleLowerCase())
  );
  // const [formData, setFormData] = useState({
  //     sellerName: "",
  //     date: "",
  //     paymentStatus: "paid",
  //     description: "",
  //     paymentMethod: "",
  // });

  const [paymentModes, setPaymentModes] = useState([]);
  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        // Assuming you have an API function to fetch payment modes
        const response = await getPaymentMethods(); // Implement this function
        setPaymentModes(response.paymentMethods);
      } catch (error) {
        console.error("Error fetching payment modes:", error);
        // Handle errors (e.g., show an error toast)
      }
    };

    fetchPaymentModes();
  }, []);

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
      <FormControl isRequired>
        <Box my={2}>
          <SimpleGrid columns={2} spacing={2}>
            {/* <Box>
              <FormLabel fontWeight="semibold">Ledger Type</FormLabel>
              <Select
                placeholder="Ledger Type"
                borderColor={borderColor}
                onChange={(e) => setSelectedLedgerType(e.target.value)}
              >
                {ledgerTypes.map((type) => (
                  <option key={type.ledgerTypeId} value={type.ledgerTypeId}>
                    {type.ledgerTypeName}
                  </option>
                ))}
              </Select>
            </Box> */}
            {/* <Box>
              <FormLabel fontWeight="semibold">Payment Mode</FormLabel>
              <Select
                placeholder="Payment Mode"
                borderColor={borderColor}
                onChange={(e) => setSelectedPaymentMode(e.target.value)}
              >
                {paymentModes.map((mode, index) => (
                  <option
                    key={mode.paymentMethodId}
                    value={mode.paymentMethodId}
                  >
                    {mode?.paymentMethodName}
                  </option>
                ))}
              </Select>
            </Box> */}
            <Box>
              <FormLabel fontWeight="semibold">Date</FormLabel>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Box>
          </SimpleGrid>
        </Box>
        <Flex gap={2} mt={2} direction="column">
          <Box>
            <FormLabel fontWeight="semibold">From:</FormLabel>
            <Input
              type="text"
              value={accountOne?.firstName}
              placeholder="Search for customer or supplier"
              onChange={(e) => {
                // setId(customer?.customerId);
                // setAccountName(selectedUser?.firstName)
                setAccountOneSearchTerm(e.target.value);
                setAccountOne(null);
              }}
            />

            {accountOneSearchTerm && accountOneSearchResults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {accountOneSearchResults.map((result, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg={useBgColorChild}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      // setFormData({
                      //     ...formData,
                      //     sellerName: result?.firstName,
                      // });
                      setAccountOne(result); // Step 4: Set the selected customer object
                      setAccountOneSearchTerm("");
                    }}
                  >
                    {result.type + " | " + result?.firstName}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
          <Box>
            <FormLabel fontWeight="semibold">To:</FormLabel>
            <Input
              type="text"
              value={accountTwo?.firstName}
              placeholder="Search for customer or supplier"
              onChange={(e) => {
                // setId(supplier?.supplierId);
                // setAccountName(selectedUser?.firstName)
                // setSupplierSearchTerm(e.target.value);
                // setSupplier(null);
                setAccountTwoSearchTerm(e.target.value);
                setAccountTwo(null);
              }}
            />

            {accountTwoSearchTerm && accountTwoSearchResults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {accountTwoSearchResults.map((result, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg={useBgColorChild}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      // setFormData({
                      //     ...formData,
                      //     sellerName: result?.firstName,
                      // });
                      setAccountTwo(result); // Step 4: Set the selected customer object
                      setAccountTwoSearchTerm("");
                    }}
                  >
                    {/* {result?.firstName} */}
                    {result.type + " | " + result?.firstName}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
          <Box>
            <FormLabel fontWeight="semibold">Description</FormLabel>
            <Input
              type="text"
              placeholder="Enter description"
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          <Box>
            <FormLabel fontWeight="semibold">Transfer Amount</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <FaRupeeSign />
              </InputLeftElement>
              <Input
                type="number"
                placeholder="Enter amount"
                borderColor={borderColor}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Button
            onClick={handleDirectTransfer}
            mt={4}
            variant="solid"
            colorScheme="blue"
            isLoading={btnLoading}
          >
            Record Transfer
          </Button>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default CustomerToSupplier;
