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
  Badge,
  ButtonGroup,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels, // Add this import
} from "@chakra-ui/react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import {
  BiSearch,
  BiChevronLeft,
  BiChevronRight,
  BiShow,
} from "react-icons/bi";
import Drawers from "../Drawers";
import DeleteAlert from "../../../../components/DeleteAlert";
import { deleteSale, fetchSales } from "../../../../api/saleAPI";
import { MdOutlinePayment } from "react-icons/md";
import {
  deleteReturnSale,
  fetchReturnSales,
} from "../../../../api/returnSaleAPI";
import { formatDateString } from "../../../../utlis/helper";
import moment from "moment";
import { role } from "../../../../api/constants";

const SalesReturn = () => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDrawerType, setSelectedDrawerType] = useState("");
  const [selectedItemData, setSelectedItemData] = useState(null);
  const bgColor = useColorModeValue("white", "gray.700");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [purchases, setPurchases] = useState([]); // State to store API response
  const [sales, setSales] = useState([]);

  const startOfToday = moment().startOf("day").format("YYYY-MM-DD");
  const endOfToday = moment().endOf("day").format("YYYY-MM-DD");
  const [toDate, setToDate] = useState(
    moment(startOfToday).add(1, "days").format("YYYY-MM-DD")
  );
  const [fromDate, setFromDate] = useState(endOfToday);
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleFromDateChange = (event) => {
    const fromDateValue = event.target.value;
    setFromDate(fromDateValue);
  };

  const resetPage = (event) => {
    setCurrentPage(1);
  }

  const handleToDateChange = (event) => {
    const toDateValue = event.target.value;
    setToDate(toDateValue);
  };
  const fetchReturnSalesData = async () => {
    try {
      const data = await fetchReturnSales();
    
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast({
        title: "Error",
        description: "Error fetching sales:",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    }
  };
  useEffect(() => {
    fetchReturnSalesData();
  }, []);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (event) => {
    const searchText = event.target.value?.toLowerCase();
    setSearchTerm(searchText);
  };
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
  };

  const toast = useToast(); // Initialize useToast

  // Filter items based on search, invoiceId, and date range
  const filteredItems = sales.filter(
    (item) =>
      (item.customerName?.toLowerCase().includes(searchTerm) ||
        item.invoiceId.toString().toLowerCase().includes(searchTerm)) &&
      (!fromDate ||
        !toDate ||
        (item.salesReturnDate >= fromDate && item.salesReturnDate <= toDate))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleDeleteClick = (itemId) => {
    setSelectedItemId(itemId);

    setIsDeleteAlertOpen(true);
  };

  // Handle confirmation of item deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteReturnSale(selectedItemId);

      // Update state or handle any necessary actions after deletion
      fetchReturnSalesData();

      // Display a success message using useToast
      toast({
        title: "Sale Order Deleted",
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });

      // Close the delete confirmation dialog
      setIsDeleteAlertOpen(false);
    } catch (error) {
      // Handle any errors that may occur during deletion
      console.error("Error deleting sale order:", error);

      // Display an error message using useToast
      toast({
        title: "Error",
        description: "Error deleting sale order",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      setIsDeleteAlertOpen(false);
    }
  };

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      // width="100%"
      // maxW="1500px"
      mx="auto"
    >
      <Flex
        align="center"
        mb={4}
        justify="space-between"
        direction={{ base: "column", md: "row" }}
        gap={2}
      >
        <Flex align="center" w="100%">
          <InputGroup size={"sm"}>
            <InputLeftElement
              pointerEvents="none"
              color="gray.400"
              fontSize="1.2em"
              ml={2}
            >
              <BiSearch />
            </InputLeftElement>
            <Input
              placeholder="Search by Customer Name"
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
              mr={4}
              _placeholder={{ color: "gray.400" }}
            />
          </InputGroup>
        </Flex>
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
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Invoice #</Th>
              <Th>Customer</Th>
              <Th>Description</Th>
              <Th>Total amount</Th>
              <Th>Date</Th>
              <Th>Payment Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((item) => (
              <Tr key={item.invoiceId}>
                <Td>{item.invoiceId}</Td>
                <Td>{item.customerName}</Td>
                <Td>{item.salesReturnDescription.replace(' - \nDiscount = (0)', '')}</Td>
                <Td>{item.totalAmount.toFixed(2)}</Td>
                <Td>{formatDateString(item.salesReturnDate)}</Td>
                <Td>
                  <Badge
                    variant="outline"
                    colorScheme={
                      item.paymentStatus === "paid"
                        ? "green"
                        : item.paymentStatus === "unpaid"
                        ? "red"
                        : "yellow"
                    }
                  >
                    {item.paymentStatus}
                  </Badge>
                </Td>
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
                        onClick={() => openDrawer("returnshow", item)}
                      >
                        Show
                      </MenuItem>
                    
                        <MenuItem
                          icon={<FiEdit />}
                          onClick={() => openDrawer("returnedit", item)}
                        >
                          Edit
                        </MenuItem>
            
                      <MenuItem
                        icon={<LiaFileInvoiceSolid />}
                        onClick={() => openDrawer("returnPDF", item)}
                      >
                        Download Invoice
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteClick(item.invoiceId)}
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
        handleAddUpdateDeleteItem={fetchReturnSalesData}
      />
      <DeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        HeaderText={"Delete Sale Order"}
        BodyText={"Are you sure you want to delete this Sale Order?"}
      />
    </Box>
  );
};

export default SalesReturn;
