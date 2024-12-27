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
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { FaRupeeSign } from "react-icons/fa6";
import {
  fetchAccountsByBranchId,
  recordExpenseOrRevenue,
} from "../../../api/cashBookAPI";
import { getAllLedgerTypes } from "../../../api/ledgerAPI";
import {
  useBgColor,
  useBgColorChild,
  useBorderColor,
} from "../../../utlis/colors";
import { branchId } from "../../../api/constants";
import { getPaymentMethods } from "../../../api/paymentModeAPI";
import moment from "moment";

const RecordRevenue = ({ onClose, handleAddUpdateDeleteItem }) => {
  const [accountName, setAccountName] = useState("");
  const [description, setDescription] = useState("");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [selectedLedgerType, setSelectedLedgerType] = useState("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("");
  const [ledgerTypes, setLedgerTypes] = useState([]);
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [id, setId] = useState(""); // Added state for Id
  const [btnLoading,setBtnLoading]=useState(false);
  useEffect(() => {
    const fetchLedgerTypes = async () => {
      try {
        const response = await getAllLedgerTypes();
        setLedgerTypes(response);
      } catch (error) {
        // Handle errors (e.g., show an error toast)
        console.error("Error fetching ledger types:", error);
      }
    };

    fetchLedgerTypes();
  }, []);
  const toast = useToast();
  const handleRecordExpense = async () => {
    setBtnLoading(true);
    try {
      const payload = {
        branchId: branchId,
        accountId: selectedUser?.customerId || selectedUser?.supplierId || id,
        accountName: selectedUser?.firstName,
        description: description,
        receipt: parseFloat(receivedAmount),
        payment: 0,
        date: date,
        ledgerTypeId: selectedLedgerType,
        paymentMethodId: selectedPaymentMode, // Add the paymentMethodId to the payload
      };
      const response = await recordExpenseOrRevenue(payload);
      toast({
        title: "Revenue recorded successfully:",
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
      } else
        toast({
          title: "Error",
          description: "Failed to add Revenue record. Please try again later.",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
        setBtnLoading(false);
    }
  };

  const [selectedUser, setSelectedUser] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);

  // Fetch and filter accounts based on ledger type
  useEffect(() => {
    const fetchAccounts = async () => {
        try {
            const response = await fetchAccountsByBranchId(branchId);
            const { Customers, Suppliers } = response;
            // Combine both Customers and Suppliers into one array
            const allAccounts = [
                ...(Customers || []).map(customer => ({ ...customer, type: 'customer' })),
                ...(Suppliers || []).map(supplier => ({ ...supplier, type: 'supplier' }))
            ];
            setAccounts(allAccounts);
        } catch (error) {
            console.error("Error fetching accounts:", error);
        }
    };

    fetchAccounts();
}, []);

// Filter accounts based on ledger type
const filteredAccounts = accounts.filter(account => {
    if (selectedLedgerType === "1") {
        // Show only accounts of type 'customer' if ledger type is 1
        return account.type === 'customer';
    } else if (selectedLedgerType === "2") {
        // Show only accounts of type 'supplier' if ledger type is 2
        return account.type === 'supplier';
    } else {
        // For other ledger types, show all accounts
        return true;
    }
});
  const userSearchresults = filteredAccounts?.filter((user) =>
    user.firstName
      .toLocaleLowerCase()
      .includes(userSearchTerm.toLocaleLowerCase())
  );
  const [formData, setFormData] = useState({
    sellerName: "",
    date: "",
    paymentStatus: "paid",
    description: "",
    paymentMethod: "",
  });
  const [paymentModes, setPaymentModes] = useState([]);
  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        // Assuming you have an API function to fetch payment modes
        const response = await getPaymentMethods(); // Implement this function
        setPaymentModes(response?.paymentMethods);
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
      bg={useBgColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      <FormControl isRequired>
        <Box my={2}>
          <SimpleGrid columns={2} spacing={2}>
            <Box>
              <FormLabel fontWeight="semibold">Ledger Type</FormLabel>
              <Select
                placeholder="Ledger Type"
                borderColor={useBorderColor}
                onChange={(e) => setSelectedLedgerType(e.target.value)}
              >
                {ledgerTypes.map((type) => (
                  <option key={type.ledgerTypeId} value={type.ledgerTypeId}>
                    {type.ledgerTypeName}
                  </option>
                ))}
              </Select>
            </Box>
            <Box>
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
            </Box>
          </SimpleGrid>
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
          <Box>
            <FormLabel fontWeight="semibold">Date</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Box>
          {/* <Box>
            <FormLabel fontWeight="semibold">Account</FormLabel>
            <Input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </Box> */}
        </SimpleGrid>
        <Flex gap={2} mt={2} direction="column">
          {/* <Box>
            <FormLabel fontWeight="semibold">Name</FormLabel>
            <Input
              type="text"
              placeholder="Enter name"
              onChange={(e) => setAccountName(e.target.value)}
            />
          </Box> */}
          <Box
            display={(selectedLedgerType === "1" || selectedLedgerType === "2") ? "block" : "none"}
          >
            <FormLabel fontWeight="semibold">Customer/Supplier</FormLabel>
            <Input
              type="text"
              value={selectedUser?.firstName}
              placeholder="Search for customer or supplier"
              onChange={(e) => {
                setId(selectedUser?.customerId || selectedUser?.supplierId);
                setUserSearchTerm(e.target.value);
                setSelectedUser(null);
              }}
            />

            {userSearchTerm && userSearchresults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {userSearchresults.map((result, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg={useBgColorChild}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        sellerName: result?.firstName,
                      });
                      setSelectedUser(result); // Step 4: Set the selected customer object
                      setUserSearchTerm("");
                    }}
                  >
                    {result?.firstName}
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
            <FormLabel fontWeight="semibold">Received Amount</FormLabel>
            <InputGroup>
              <InputLeftElement>
                <FaRupeeSign />
              </InputLeftElement>
              <Input
                type="number"
                placeholder="Enter amount"
                borderColor={useBorderColor}
                onChange={(e) => setReceivedAmount(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Button
            mt={4}
            variant="solid"
            colorScheme="blue"
            onClick={handleRecordExpense}
            isLoading={btnLoading}
          >
            Record Revenue
          </Button>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default RecordRevenue;
