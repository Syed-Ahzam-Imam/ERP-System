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
  ButtonGroup, // Add this import
} from "@chakra-ui/react";
import Drawers from "./Drawers";
import DeleteAlert from "../../../components/DeleteAlert";

import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import {
  BiSearch,
  BiChevronLeft,
  BiChevronRight,
  BiShow,
} from "react-icons/bi";
import { Link } from "react-router-dom";
import {
  deleteCustomerById,
  getAllCustomers,
  getAllCustomersByBranchId,
} from "../../../api/customerAPI";
import { trialBalancePdf } from "../../../utlis/TrialBalance";
import moment from "moment";
import { BsFiletypePdf } from "react-icons/bs";
import { selectedBranch, role } from "../../../api/constants";
import Loading from "../../../components/Loading/Loading";
import { getSettings } from "../../../api/settingsApi";

const CustomerList = ({ branchNameSearch }) => {
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
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [customerName, setCustomerName] = useState("");

  const handleBranchChange = (event) => {
    const branch = event.target.value;
    setSelectedBranch(branch);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const resetPage = (event) => {
    setCurrentPage(1);
  }

  const handleSearchChange = (event) => {
    const searchText = event.target.value?.toLowerCase();
    setSearchTerm(searchText);
  };

  const toast = useToast(); // Initialize useToast
  const [customers, setCustomers] = useState([]);

  // Filter items based on search and selected category
  const filteredItems = customers.filter(
    (item) =>
      (
        // item.firstName +
        // " " +
        String(item.customerId)?.toLowerCase().includes(searchTerm) ||
        String(item.firstName)?.toLowerCase().includes(searchTerm) ||
        String(item.address)?.toLowerCase().includes(searchTerm) ||
        String(item.phoneNumber)?.toLowerCase().includes(searchTerm)) &&
      (selectedBranch === "" || item.branchName === selectedBranch)
  );
  const fetchCustomers = async () => {
    try {
      let customersData;
      if (role === "admin") {
        customersData = await getAllCustomers();
     
      }
      else {
        customersData = await getAllCustomersByBranchId();
      }

      setCustomers(customersData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      // Handle error if customer fetching fails
    }
  };

  useEffect(() => {
    // Fetch customers when the component mounts

    fetchCustomers();
  }, []); // Empty dependency array ensures that this effect runs once after the initial render

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

  const handleDeleteClick = (item) => {
    setSelectedItemId(item.customerId);
    setCustomerName(item.firstName + " " + item.lastName);
    setIsDeleteAlertOpen(true);
  };

  // Handle confirmation of item deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteCustomerById(selectedItemId);

      // Handle the update or removal of the item in your state or data source
      // Example:
      fetchCustomers(); // Fetch the updated customer data

      // Display a success message using useToast
      toast({
        title: "Customer Deleted",
        description: `All data for ${customerName} has been deleted.`,
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
      // Close the delete confirmation dialog
      setIsDeleteAlertOpen(false);
    } catch (error) {
      // Handle any errors that may occur during deletion
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
  const trialBalanceName = "Customers";
  const downloadDate = moment().format("YYYY-MM-DD");
  const handlePdfDownload = () => {

 
    trialBalancePdf(filteredItems, trialBalanceName, downloadDate, settings, selectedBranch);
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
      <Flex
        align="center"
        mb={4}
        justify="space-between"
        direction={{ base: "column", md: "row" }}
      >
        <Flex
          align="center"
          w="100%"
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
              placeholder="Search by name, description, or Purchased From"
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
        <Flex align="center">
          {role == 'admin' && (
            <Select
              placeholder="All Branches"
              value={selectedBranch}
              onChange={handleBranchChange}
              borderRadius="0.3rem"
              py={2}
              fontSize="md"
              mr={4}
            >
              {console.log(selectedBranch)}
              {[...new Set(customers.map((branch) => branch.branchName))].map(
                (branchName) => (
                  <option key={branchName} value={branchName}>
                    {branchName}
                  </option>
                )
              )}
            </Select>
          )}
        </Flex>

        <Flex>
          <ButtonGroup>
            <Button
              variant="outline"
              colorScheme="blue"
              size="sm"
              leftIcon={<BsFiletypePdf />}
              onClick={() => handlePdfDownload()}
              isDisabled={filteredItems.length > 0 ? false : true}
            >
              Trial Balance
            </Button>
            {/* {role !== 'admin' && ( */}
            <Button
              variant="solid"
              colorScheme="blue"
              size="sm"
              onClick={() => openDrawer("addNew")}
            >
              New Customer
            </Button>
            {/* )} */}
          </ButtonGroup>
        </Flex>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>address</Th>
              <Th>contact</Th>
              <Th>city</Th>
              {/* <Th>balance</Th> */}
              <Th>Added on Branch</Th>
              {/* <Th>Branches</Th> */}
              {/* <Th>Payment Mode</Th> */}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentItems.map((item) => (
              <Tr key={item.customerId}>
                <Td
                  onClick={() => openDrawer("ledger", item)}
                  cursor="pointer"
                  _hover={{ fontWeight: "bold" }}
                >
                  {item.firstName + item.lastName}
                </Td>
                <Td>{item.address}</Td>
                <Td>{item.phoneNumber}</Td>
                <Td>{item.city}</Td>
                {/* <Td>
                  {item.amountDue < 0 ? (
                    <Badge colorScheme="red" variant="outline">
                      {" "}
                      {item.amountDue}{" "}
                    </Badge>
                  ) : (
                    <Badge colorScheme="green" variant="outline">
                      {" "}
                      {item.amountDue}{" "}
                    </Badge>
                  )}
                </Td> */}
                <Td>{item.branchName}</Td>

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
                        onClick={() => openDrawer("show", item)}
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
        handleAddUpdateDeleteItem={fetchCustomers}
      />
      <DeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        HeaderText={"Delete Customer"}
        BodyText={`Are you sure you want to delete this ${customerName}?`}
      />
    </Box>
  );
};

export default CustomerList;
