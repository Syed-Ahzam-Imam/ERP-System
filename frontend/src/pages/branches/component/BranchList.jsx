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
  useToast, // Add this import
} from "@chakra-ui/react";
import {
  BiSearch,
  BiChevronLeft,
  BiChevronRight,
  BiShow,
} from "react-icons/bi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import DeleteAlert from "../../../components/DeleteAlert";
import Drawers from "./Drawers";
import { Link } from "react-router-dom";
import { deleteBranchById, getBranches } from "../../../api/branchAPI";
import Loading from "../../../components/Loading/Loading";

// You can add more branches as needed, following the same format.

const BranchList = () => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedBranchName, setSelectedBranchName] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Define isDrawerOpen state
  const [selectedDrawerType, setSelectedDrawerType] = useState(""); // Define selectedDrawerType state
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [branches, setBranches] = useState([]);
  // ... (other state variables and functions)

  useEffect(() => {
    // Fetch branches when the component mounts
    const fetchBranches = async () => {
      try {
        const fetchedBranches = await getBranches();
        setBranches(fetchedBranches);
        setIsLoading(false);
      } catch (error) {
        // Handle error (show an error message, etc.)
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches(); // Call the fetchBranches function
  }, []); // Empty dependency array ensures the effect runs once after the initial render
  const handleAddUpdateDeleteBranch = async () => {
    try {
      const fetchedBranches = await getBranches();
      setBranches(fetchedBranches);
    } catch (error) {
      // Handle error (show an error message, etc.)
      console.error("Error fetching branches:", error);
    }
  };
  const handleSearchChange = (event) => {
    const searchText = event.target.value.toLowerCase();
    setSearchTerm(searchText);
  };
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const filteredItems =
    branches?.filter(
      (item) =>
        (item?.branchName.toLowerCase().includes(searchTerm) ||
          item?.branchLocation.toLowerCase().includes(searchTerm)) &&
        (selectedCategory === "" || item?.branchName === selectedCategory)
    ) ?? [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredProductItems = filteredItems.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleDeleteClick = (itemId, branchName) => {
    setSelectedItemId(itemId);
    setSelectedBranchName(branchName);
    setIsDeleteAlertOpen(true);
  };
  const toast = useToast();
  // const handleConfirmDelete = async () => {};
  const handleConfirmDelete = async () => {
    try {
      await deleteBranchById(selectedItemId); // Call the API function to delete the branch
      setIsDeleteAlertOpen(false); // Close the delete alert after successful deletion
      handleAddUpdateDeleteBranch(); // Fetch branches again after deletion to update the UI
      toast({
        title: "Sucess",
        description: "Item deleted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
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
          description: "Error adding items",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        console.error("Error creating items:", error);
      }
    }
  };

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
  if (isLoading) {
    return (
      <Loading />
    )
  }
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

      <Flex align="center" mb={4} justify="space-between">
        <Flex align="center" w="50%">
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
              placeholder="Search by branch name or location"
              value={searchTerm}
              onChange={handleSearchChange}
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
          {/* <Select
            placeholder="All Branches"
            value={selectedCategory}
            onChange={handleCategoryChange}
            borderRadius="0.3rem"
            py={2}
            fontSize="md"
            mr={4}
          >
            <option value="Branch A">Branch A</option>
            <option value="Branch B">Branch B</option>
            <option value="Branch C">Branch C</option>
          </Select> */}
          <Button
            colorScheme="blue"
            borderRadius="0.3rem"
            px={8}
            py={3}
            fontSize="md"
            onClick={() => openDrawer("addNew")}
            size={"sm"}
          >
            New Branch
          </Button>
        </Flex>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Location</Th>
              <Th>Email</Th>
              <Th>Contact Person</Th>
              <Th>Contact Number</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredProductItems.map((item) => (
              <Tr key={item.branchId}>
                <Td>{item.branchName}</Td>
                <Td>{item.branchLocation}</Td>
                <Td>{item.email}</Td>
                <Td>{item.contactPerson}</Td>
                {/* <Td>{item.itemCategory}</Td> */}
                <Td>{item.branchPhoneNumber}</Td>
                {/* <Td>{item.sellerName}</Td> */}
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<HiOutlineDotsVertical />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<BiShow />}
                        onClick={() => openDrawer("show", item)}
                      // as={Link}
                      // to="/branches/details"
                      // state={{ selectedItem: item }}
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
                        onClick={() =>
                          handleDeleteClick(item.branchId, item.branchName)
                        }
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
        handleAddUpdateDeleteBranch={handleAddUpdateDeleteBranch}
      />
      <DeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        HeaderText={"Delete Product"}
        BodyText={`Are you sure you want to delete ${selectedBranchName} ?`}
      />
    </Box>
  );
};

export default BranchList;
