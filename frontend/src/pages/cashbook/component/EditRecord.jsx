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
  getCashbookEntryById,
  updateCashbookEntry,
} from "../../../api/cashBookAPI";
import { useBgColorChild, useBorderColor } from "../../../utlis/colors";
import { branchId } from "../../../api/constants";
import { getPaymentMethods } from "../../../api/paymentModeAPI";
import { getAllLedgerTypes } from "../../../api/ledgerAPI";

const EditRecord = ({ selectedItem, onClose, handleAddUpdateDeleteItem }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [date, setDate] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [accountName, setAccountName] = useState(selectedItem.accountName);
  const [accountId, setAccountId] = useState(selectedItem.accountId);
  const [selectedLedgerType, setSelectedLedgerType] = useState(
    selectedItem.ledgerTypeName
  );
  const [ledgerTypes, setLedgerTypes] = useState([]);
  const [description, setDescription] = useState(selectedItem.description);
  const [amount, setAmount] = useState(
    selectedItem.receipt > 0 ? selectedItem.receipt : selectedItem.payment
  );
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(
    selectedItem.paymentMode
  );
  const [id, setId] = useState(""); // Added state for Id
  const [selectedUser, setSelectedUser] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    sellerName: "",
    date: "",
    paymentStatus: "paid",
    description: "",
    paymentMethod: "",
  });
  const [paymentModes, setPaymentModes] = useState([]);
  const toast = useToast();

  useEffect(() => {
    // Format the date string to "YYYY-MM-DD"
    if (selectedItem.date) {
      const formattedDate = new Date(selectedItem.date)
        .toISOString()
        .split("T")[0];
      setDate(formattedDate);
    }

    setSelectedLedgerType(selectedItem.ledgerTypeId);
    setSelectedPaymentMode(selectedItem.paymentMethod);
    setSelectedUser({
      branchId: selectedItem.branchId,
      customerId: selectedItem.accountId,
      firstName: selectedItem.accountName,
    });
  }, [
    selectedItem.date,
    selectedItem.ledgerTypeId,
    selectedItem.paymentMethod,
    selectedItem.branchId,
    selectedItem.accountId,
    selectedItem.accountName,
  ]);

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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetchAccountsByBranchId(branchId);
        const { Customers, Suppliers } = response;
        // Combine both Customers and Suppliers into one array
        const allAccounts = [
          ...(Customers || []).map((customer) => ({
            ...customer,
            type: "CUSTOMER",
            id: customer.customerId,
          })),
          ...(Suppliers || []).map((supplier) => ({
            ...supplier,
            type: "SUPPLIER",
            id: supplier.supplierId,
          })),
        ];
        setAccounts(allAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const userSearchresults = accounts?.filter((user) =>
    user.firstName
      .toLocaleLowerCase()
      .includes(userSearchTerm.toLocaleLowerCase())
  );

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        // Assuming you have an API function to fetch payment modes
        const response = await getPaymentMethods(); // Implement this function
        setPaymentModes(response?.paymentMethods);
        const initialPaymentMode = response?.paymentMethods.find(
          (mode) => mode.paymentMethodName === selectedItem.paymentMethod
        );
        if (initialPaymentMode) {
          setSelectedPaymentMode(initialPaymentMode.paymentMethodId);
        }
      } catch (error) {
        console.error("Error fetching payment modes:", error);
        // Handle errors (e.g., show an error toast)
      }
    };

    fetchPaymentModes();
  }, [selectedItem.paymentMethod]);

  const handleUpdate = async () => {
    setBtnLoading(true);
    try {
      const data = {
        // branchId: selectedItem.branchId,
        accountId: selectedUser.id,
        accountName: selectedUser.firstName,
        description,
        receipt: selectedItem.receipt > 0 ? amount : 0,
        payment: selectedItem.payment > 0 ? amount : 0,
        date,
        ledgerTypeId: selectedLedgerType,
        paymentMethodId: selectedPaymentMode,
        // accountId:
      };

      await updateCashbookEntry(selectedItem.cashbookId, data);

      toast({
        title: "Record Updated",
        description: "Cashbook entry has been updated successfully.",
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      onClose();
      // Handle any additional actions or state updates after successful update
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
        console.error("Error updating record:", error);

        toast({
          title: "Error",
          description: "Error updating cashbook entry",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setBtnLoading(false);
    }
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
      <FormControl isRequired>
        <Box my={2}>
          <SimpleGrid columns={2} spacing={2}>
            <Box>
              <FormLabel fontWeight="semibold">Ledger Type</FormLabel>
              <Select
                placeholder="Ledger Type"
                borderColor={useBorderColor}
                onChange={(e) => setSelectedLedgerType(e.target.value)}
                value={selectedLedgerType}
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
                borderColor={useBorderColor}
                value={selectedPaymentMode}
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
              value={ledgerTypeName}
              onChange={(e) => setLedgerTypeName(e.target.value)}
            />
          </Box> */}
          <Box
            display={
              selectedLedgerType === "1" ||
              selectedLedgerType === "2" ||
              selectedLedgerType === 1 ||
              selectedLedgerType === 2
                ? "block"
                : "none"
            }
          >
            <FormLabel fontWeight="semibold">Customer/Supplier</FormLabel>
            <Input
              type="text"
              value={selectedUser?.firstName}
              placeholder="Search for customer or supplier"
              onChange={(e) => {
                setId(selectedUser?.id);
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
                    {`${result?.firstName}  `}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>
          <Box>
            <Box>
              <FormLabel fontWeight="semibold">
                {selectedItem.receipt > 0 ? "Received Amount" : "Spent Amount"}
              </FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <FaRupeeSign />
                </InputLeftElement>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  borderColor={borderColor}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </InputGroup>
            </Box>
          </Box>
          <Button
            mt={4}
            variant="solid"
            colorScheme="yellow"
            onClick={handleUpdate}
            isLoading={btnLoading}
          >
            {selectedItem.receipt > 0 ? "Update Revenue" : "Update Expense"}
          </Button>
        </Flex>
      </FormControl>
    </Box>
  );
};

export default EditRecord;
