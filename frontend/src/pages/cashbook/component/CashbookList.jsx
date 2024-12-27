import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorModeValue,
  Button,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
  Input,
  useToast,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Badge,
  useDisclosure,
} from "@chakra-ui/react";
import DeleteAlert from "../../../components/DeleteAlert";
import moment from "moment";

import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import {
  BiSearch,
  BiChevronLeft,
  BiChevronRight,
  BiShow,
} from "react-icons/bi";
import { FaFilePdf, FaRupeeSign, FaEye } from "react-icons/fa6";
import Drawers from "./Drawers";
import { cashbookLedgerPdf, ledgerPreview } from "../../../utlis/CashbookLedger";
import {
  deleteCashbookEntryById,
  getCashbookEntries,
  transferToNoorani,
} from "../../../api/cashBookAPI";
import { formatDateString } from "../../../utlis/helper";
import Loading from "../../../components/Loading/Loading";
import { branchId, branchName, role } from "../../../api/constants";
import { getPaymentMethods } from "../../../api/paymentModeAPI";
import { getSettings } from "../../../api/settingsApi";
import { getBranches } from "../../../api/branchAPI";

const CashbookList = () => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  // const [selectedCategory, setSelectedCategory] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDrawerType, setSelectedDrawerType] = useState("");
  const [selectedItemData, setSelectedItemData] = useState(null);
  const bgColor = useColorModeValue("white", "gray.700");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBranchForCashTransfer, setSelectedBranchForCashTransfer] = useState("");

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setSelectedType(type);
  };

  const handleBranchChange = (event) => {
    const branch = event.target.value;
    setSelectedBranch(branch);
  };

  const handleBranchChangeForCashTransfer = (event) => {
    setSelectedBranchForCashTransfer(event.target.value);
  };

  const handlePaymentMethodChange = (event) => {
    const paymentmode = event.target.value;
    setSelectedPaymentMethod(paymentmode);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (event) => {
    const searchText = event.target.value?.toLowerCase();
    setSearchTerm(searchText);
  };

  const resetPage = (event) => {
    setCurrentPage(1);
  }

  const toast = useToast(); // Initialize useToast

  const [cashbookEntries, setCashbookEntries] = useState([]);
  const [amount, setAmount] = useState("");
  const [cashInHand, setCashInHand] = useState("");
  const [branches, setBranches] = useState([]);
  const [transferBranches, setTransferBranches] = useState([]);
  const [types, setTypes] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Add 'Expense' to the types state as soon as the page loads
    setTypes(["Expense"]);
  }, []);

  const handleTransfer = async () => {
    try {
      setBtnLoading(true);

      // Check if the amount is a valid number
      if (isNaN(amount)) {
        console.error("Invalid amount");
        return;
      }
      setAmount(parseFloat(amount));
      let date = moment().toISOString();

      // Assuming you have an API function to post the amount and date
      const response = await transferToNoorani(amount, date, branchId, selectedBranchForCashTransfer);
      onClose();
      setAmount("")
      toast({
        title: "Transfer Successful",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    } catch (error) {
      console.error("Error transferring amount:", error);
      const errorMessage =
        error?.response?.data?.message || "Please try again later.";
      toast({
        title: "Transfer Failed",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    } finally {
      fetchData();
      setBtnLoading(false);
    }
  };
  // ... (existing code)
  const fetchData = async () => {
    try {
      const entries = await getCashbookEntries();

      // Sort entries by date in descending order
      const sortedEntries = entries.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

      setCashbookEntries(sortedEntries);
      setCashInHand(entries.cashInHand);

      // Extract unique branches and types from sorted entries
      const uniqueBranches = [
        ...new Set(sortedEntries.map((entry) => entry.branchName)),
      ];
      const uniqueTypes = [
        ...new Set(sortedEntries.map((entry) => entry.ledgerTypeName)),
      ];

      const updatedTypes = [...uniqueTypes, "Expense"];
      setBranches(uniqueBranches);
      setTypes(updatedTypes);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cashbook entries:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Error fetching cashbook entries. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        position: "top-right",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const fetchBranches = async () => {
    try {
      const branches = await getBranches();
      setTransferBranches(branches);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching cashbook entries:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Error fetching cashbook entries. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        position: "top-right",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      // Display an error message using useToast
    }
  };
  // Fetch cashbook entries on component mount
  useEffect(() => {
    fetchData();
    fetchBranches();
  }, []);

  const startOfToday = moment().startOf("day").format("YYYY-MM-DD");
  const endOfToday = moment().endOf("day").format("YYYY-MM-DD");

  // Set fromDate as one day from the startOfToday

  const [toDate, setToDate] = useState(
    moment(startOfToday).add(1, "days").format("YYYY-MM-DD")
  );
  const [fromDate, setFromDate] = useState(endOfToday);

  const handleFromDateChange = (event) => {
    const fromDateValue = event.target.value;
    setFromDate(fromDateValue);
  };

  const handleToDateChange = (event) => {
    const toDateValue = event.target.value;
    setToDate(toDateValue);
  };

  const filteredItemsWithoutFromDate = cashbookEntries.filter(
    (item) =>
      // Existing filter conditions
      (String(item.accountName)?.toLowerCase().includes(searchTerm) ||
        String(item.description)?.toLowerCase().includes(searchTerm) ||
        String(item.branchName)?.toLowerCase().includes(searchTerm)) &&
      // New condition for date filtering
      (
        !toDate ||
        (item.date <= toDate)) &&
      // New condition for type filtering
      (selectedBranch === "" || item.branchName === selectedBranch) &&
      (selectedType === "" ||
        (selectedType === "Expense" &&
          item.ledgerTypeName !== "supplier" &&
          item.ledgerTypeName !== "customer" &&
          item.ledgerTypeName !== "purchase" &&
          item.ledgerTypeName !== "product" &&
          item.ledgerTypeName !== "purchaseReturn" &&
          item.ledgerTypeName !== "sales" &&
          item.ledgerTypeName !== "salesReturn") ||
        item.ledgerTypeName === selectedType) &&
      // New condition for paymentMethod filtering
      (selectedPaymentMethod === "" ||
        item.paymentMethod === selectedPaymentMethod)
  );

  const filteredItems = filteredItemsWithoutFromDate.filter(
    (item) =>
    // New condition for date filtering
    (!fromDate ||
      (item.date >= fromDate))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const [btnLoading, setBtnLoading] = useState(false);
  const openDrawer = (drawerType, itemData) => {
    setSelectedDrawerType(drawerType);
    setSelectedItemData(itemData);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDrawerType("");
    setSelectedItemData(null);
  };

  const handleDeleteClick = (item) => {
    setSelectedItemId(item.cashbookId);
    setCustomerName(item.accountName);
    setIsDeleteAlertOpen(true);
  };

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        // Assuming you have an API function to fetch payment modes
        const response = await getPaymentMethods(); // Implement this function
        setPaymentMethod(response?.paymentMethods);
      } catch (error) {
        console.error("Error fetching payment modes:", error);
        // Handle errors (e.g., show an error toast)
      }
    };

    fetchPaymentModes();
  }, []);

  const handleConfirmDelete = async () => {
    try {
      // Implement your deletion logic here
      await deleteCashbookEntryById(selectedItemId);

      // Display a success message using useToast
      toast({
        title: "Record Deleted",
        // description: `All data for ${customerName} has been deleted.`,
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
      fetchData();
      setIsDeleteAlertOpen(false);
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
        console.error("Error deleting Customer:", error);

        // Display an error message using useToast
        toast({
          title: "Error",
          description: "Error deleting Customer",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      }
    }
  };
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
  const handleLedgerDownload = () => {
    cashbookLedgerPdf(
      filteredItemsWithoutFromDate,
      selectedBranch,
      fromDate,
      toDate,
      selectedType,
      settings
    );
  };

  const handleLedgerPreview = () => {
    ledgerPreview(
      filteredItemsWithoutFromDate,
      selectedBranch,
      fromDate,
      toDate,
      selectedType,
      settings
    );
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      mx="auto"
    >
      <Flex justify="end" align="center" gap={4} my={2}>
        <Text fontWeight="semibold" fontSize={{ base: "md", md: "lg" }}>
          Cash in Hand:
        </Text>
        <Badge
          colorScheme="green"
          fontSize={{ base: "md", md: "lg" }}
          px={2}
          borderRadius="lg"
          variant="subtle"
        >
          {cashInHand.cashInHand}
        </Badge>
      </Flex>
      <Flex direction="column" align="center" mb={4} justify="space-between">
        <Flex
          align="center"
          w="100%"
          mb={2}
          gap={4}
          direction={{ base: "column", md: "row" }}
        >
          <InputGroup w="100%" size={"sm"}>
            <InputLeftElement
              pointerEvents="none"
              color="gray.400"
              fontSize="1.2em"
              ml={2}
            >
              <BiSearch />
            </InputLeftElement>
            <Input
              placeholder="Search by branchName, account or description"
              value={searchTerm}
              onChange={(e) => {
                handleSearchChange(e);
                resetPage(e);
              }}
              borderRadius="0.3rem"
              py={2}
              pl={10}
              pr={3}
              fontSize="md"
              _placeholder={{ color: "gray.400" }}
            />

          </InputGroup>
          <Flex
            align="center"
            justify="center"
            gap={2}
            direction={{ base: "column", md: "row" }}
          >
            <Flex gap={2}>
              {branchName !== "WAREHOUSE (Admin)" && (

                <Popover isLazy={true} isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
                  <PopoverTrigger>
                    <Button variant="solid" colorScheme="blue" size="sm">
                      Cash Transfer
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader fontWeight="semibold">
                      Transfer Cash!
                    </PopoverHeader>
                    <PopoverBody>
                      <Box>
                        <Select
                          value={selectedBranchForCashTransfer}
                          placeholder="All branches"
                          onChange={handleBranchChangeForCashTransfer}
                          borderRadius="0.3rem"
                          py={2}
                          fontSize="md"
                        >
                          {transferBranches.map((branch) => (
                            // Add a condition to check if branch.branchName is not equal to selectedBranchForCashTransfer
                            branchName !== branch.branchName && "WAREHOUSE (Admin)" !== branch.branchName && (
                              <option key={branch.branchId} value={branch.branchId}>
                                {branch.branchName}
                              </option>
                            )
                          ))}
                        </Select>
                        <InputGroup>
                          <InputLeftElement>
                            <FaRupeeSign />
                          </InputLeftElement>
                          <Input
                            type="number"
                            value={amount} // Set the value of the input field
                            onChange={(e) => setAmount(e.target.value)} // Update the state on input change
                          />
                        </InputGroup>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          my={2}
                          isLoading={btnLoading}
                          onClick={handleTransfer}
                        >
                          Transfer Amount
                        </Button>
                      </Box>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              )}
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={() => openDrawer("customerToSupplier")}
              >
                Direct Payment
              </Button>
            </Flex>
            <Flex gap={2}>
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={() => openDrawer("revenue")}
              >
                New Revenue
              </Button>
              <Button
                variant="solid"
                colorScheme="blue"
                size="sm"
                onClick={() => openDrawer("payment")}
              >
                New Expense
              </Button>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          direction={{ base: "column", md: "row" }}
          w="100%"
          justify="space-between"
        >
          <Flex justify="center" align="center" mr={2} w="70%">
            <Input
              // w="10rem"
              type="date"
              placeholder="From date"
              value={fromDate}
              onChange={handleFromDateChange} // Add onChange to capture the selected date
            />
            <Text mx={2}>-</Text>
            <Input
              // w="10rem"
              type="date"
              placeholder="To date" // Corrected placeholder
              value={toDate}
              onChange={handleToDateChange} // Add onChange to capture the selected date
            />
          </Flex>
          <Flex align="center" justify="center" w="100%" mr={2} gap={2}>
            {branchName == "WAREHOUSE (Admin)" && (
              <Select
                value={selectedBranch}
                placeholder="All branches"
                onChange={handleBranchChange}
                borderRadius="0.3rem"
                py={2}
                fontSize="md"
              >
                {/* Use a Set to filter out duplicate branch options */}
                {[...new Set(branches.filter((branch) => branch))].map(
                  (branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  )
                )}
              </Select>
            )}


            <Select
              value={selectedType}
              onChange={handleTypeChange}
              borderRadius="0.3rem"
              py={2}
              fontSize="md"
            >
              <option value="">All Ledger Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Select
              value={selectedPaymentMethod}
              onChange={handlePaymentMethodChange}
              borderRadius="0.3rem"
              py={2}
              fontSize="md"
            >
              <option value="">Payment Methods</option>
              {paymentMethod.map((method) => (
                <option
                  key={method?.paymentMethodId}
                  value={method?.paymentMethodName}
                >
                  {method?.paymentMethodName}
                </option>
              ))}
            </Select>
          </Flex>
          <Flex align="center" justify="center">
            <Button
              variant="solid"
              colorScheme="red"
              onClick={handleLedgerDownload}
              leftIcon={<FaFilePdf />}
              isDisabled={filteredItems.length > 0 ? false : true}
              size={"md"}
            >
              Download Ledger
            </Button>

            {/* Add a Box component to create space between the buttons */}
            <Box mx={1} />

            <Button
              variant="solid"
              colorScheme="blue"
              onClick={handleLedgerPreview}
              leftIcon={<FaEye />}
              isDisabled={filteredItems.length > 0 ? false : true}
              size={"md"}
            >
              Preview Ledger
            </Button>
          </Flex>



        </Flex>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>branch</Th>
              <Th>Account</Th>
              {/* <Th>Id</Th> */}
              <Th>Ledger Type</Th>
              <Th>description</Th>
              <Th>receipt</Th>
              <Th>payment</Th>
              <Th>date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems
              .sort((a, b) => new Date(b.date) - new Date(a.date))  // Sort by date in ascending order
              .map((item) => (
                <Tr key={item.customerId}>
                  <Td>{item.branchName}</Td>
                  <Td>{item.accountName !== null ? item.accountName : "N/A"}</Td>
                  <Td>{item.ledgerTypeName}</Td>
                  <Td maxW="450px">{item.description.replace(' - \nDiscount = (0)', '')}</Td>
                  <Td>{item.receipt}</Td>
                  <Td>{item.payment}</Td>
                  <Td>{formatDateString(item.date)}</Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<HiDotsVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<BiShow />}
                          onClick={() => openDrawer("view", item)}
                        >
                          Show
                        </MenuItem>
                        <MenuItem
                          icon={<FiEdit />}
                          onClick={() => openDrawer("edit", item)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          onClick={() => handleDeleteClick(item)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}

          </Tbody>
        </Table>
      </Box>
      <Flex justify="space-between" mt={4} align="center">
        <Box>
          <IconButton
            icon={<BiChevronLeft />}
            isDisabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous Page"
          />
          <IconButton
            icon={<BiChevronRight />}
            isDisabled={indexOfLastItem >= filteredItems.length}
            onClick={() => handlePageChange(currentPage + 1)}
            ml={2}
            aria-label="Next Page"
          />
        </Box>
        <Text fontSize="smaller">
          Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
        </Text>
      </Flex>
      <Drawers
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        drawerType={selectedDrawerType}
        data={selectedItemData}
        handleAddUpdateDeleteItem={fetchData}
      />
      <DeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        HeaderText={"Delete Record"}
        BodyText={`Are you sure you want to delete this record?`}
      />
    </Box>
  );
};

export default CashbookList;
