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
  TableContainer,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tabs,
  ButtonGroup, // Add this import
} from "@chakra-ui/react";
import Drawers from "./Drawers";
import DeleteAlert from "../../../components/DeleteAlert";

import { HiDotsVertical } from "react-icons/hi";
import {
  BiSearch,
  BiChevronLeft,
  BiChevronRight,
  BiShow,
} from "react-icons/bi";
// import { Link } from "react-router-dom";

import { getAllCategories } from "../../../api/categoryAPI";
import ManageInventory from "./ManageInventory";
import { role } from "../../../api/constants";
import Loading from "../../../components/Loading/Loading";
import { fetchInventoryItems } from "../../../api/inventoryAPI";
import { inventoryPdf } from "../../../utlis/InventoryPdf";
import { FaFilePdf } from "react-icons/fa6";

const InventoryList = ({ branchNameSearch }) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  // const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDrawerType, setSelectedDrawerType] = useState("");
  const [selectedItemData, setSelectedItemData] = useState(null);
  const bgColor = useColorModeValue("white", "gray.700");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState("");
  // State to store the inventory items
  const [inventoryItems, setInventoryItems] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  // Function to fetch inventory items
  const fetchInventoryData = async () => {
    try {
      // Initiate both API calls concurrently
      const [categoriesResponse, data] = await Promise.all([
        getAllCategories(),
        fetchInventoryItems()
      ]);
  
      if (categoriesResponse && categoriesResponse.categories) {
        // Extract category names from the response
        const categoryNames = categoriesResponse.categories.map(
          (category) => category.categoryName
        );
        const branchNames = Array.from(
          new Set(
            data?.inventoryItem.flatMap((item) =>
              item.distribution.map((branch) => branch.branchName)
            )
          )
        );
        setAvailableCategories(categoryNames);
        setInventoryItems(data?.inventoryItem);
        setAvailableBranches(branchNames);
        setIsLoading(false);
      } else {
        // Handle the case when categoriesResponse or categories array is null or undefined
        console.error(
          "Categories response or categories array is null or undefined"
        );
      }
    } catch (error) {
      // Handle any errors, e.g., show an error toast
      toast({
        title: "Error",
        description: "Error fetching inventory items",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    }
  };
  

  // Fetch inventory data when the component mounts
  useEffect(() => {
    fetchInventoryData();
  }, []);

  // const handleBranchChange = (event) => {
  //   const branch = event.target.value;
  //   setSelectedBranch(branch);
  // };

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

  const resetPage = (event) => {
    setCurrentPage(1);
  }

  const toast = useToast(); // Initialize useToast

  // Filter items based on search, selected category, and branch
  const filteredItems = (inventoryItems || []).filter((item) => {
    const isNameMatch =
      !searchTerm ||
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const isCategoryMatch =
      !selectedCategory || item.categoryName === selectedCategory;
    const isBranchMatch =
      !selectedBranch ||
      (item.distribution &&
        item.distribution.some(
          (branch) => branch.branchName === selectedBranch
        ));

    return (
      (branchNameSearch && branchNameSearch !== "" && isBranchMatch) ||
      (!branchNameSearch && isNameMatch && isCategoryMatch && isBranchMatch)
    );
  });

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

  // const handleDeleteClick = (itemId) => {
  //   setSelectedItemId(itemId);
  //   setIsDeleteAlertOpen(true);
  // };
  const handleBranchChange = async (event) => {
    const branch = event.target.value;
    setSelectedBranch(branch);
    setCurrentPage(1); // Reset current page when branch changes

    // Filter inventory items based on the selected branch

    // Update the inventory items state with the filtered items
    // setInventoryItems(filteredItemsByBranch);
  };
  // Handle confirmation of item deletion
  const handleConfirmDelete = async () => {
    try {
      // Call the API function to delete the item with selectedItemId
      // Example:
      // await deleteInventoryItem(selectedItemId);

      // Handle the update or removal of the item in your state or data source
      // Example:
      // handleAddUpdateDeleteItem();

      // Display a success message using useToast
      toast({
        title: "Item Deleted",
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });

      // Close the delete confirmation dialog
      setIsDeleteAlertOpen(false);
    } catch (error) {
      // Handle any errors that may occur during deletion
      console.error("Error deleting item:", error);

      // Display an error message using useToast
      toast({
        title: "Error",
        description: "Error deleting item",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    }
  };
  const handlePdfDownload = () => {
    inventoryPdf(
      filteredItems,
      selectedBranch,
      selectedCategory
    );
  }

  if (isLoading) {
    return <Loading />;
  }
  return (
    <Tabs variant="soft-rounded" isFitted>
      {role === "admin" && (
        <TabList>
          <Tab>View Inventory</Tab>
          <Tab>Manage Inventory</Tab>
        </TabList>
      )}
      <TabPanels>
        <TabPanel>
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
                    // placeholder="Search by name, description, or Purchased From"
                    placeholder="Search by name"
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
              <Flex align="center" w="50%">
                <Select
                  placeholder="All Branches"
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  borderRadius="0.3rem"
                  py={2}
                  fontSize="md"
                  mr={4}
                >
                  {availableBranches.map((branchName) => (
                    <option key={branchName} value={branchName}>
                      {branchName}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="All Categories"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  mr={4}
                >
                  {availableCategories?.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Flex>
              <Flex direction={{ base: "column", md: "row" }} gap={2}>
                <Button
                  variant="solid"
                  colorScheme="red"
                  onClick={handlePdfDownload}
                  leftIcon={<FaFilePdf />}
                  isDisabled={filteredItems.length > 0 ? false : true}
                  size='sm'
                >
                  Download PDF
                </Button>
                {role === "admin" && (
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    size='sm'
                    onClick={() => openDrawer("openingStock")}
                  >
                    Opening Stock
                  </Button>
                )}
                {role !== "admin" && (
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    size='sm'
                    onClick={() => openDrawer("request")}
                  >
                    Request Inventory
                  </Button>
                )}
                {role == "admin" && (
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    size='sm'
                    onClick={() => openDrawer("transfer")}
                  >
                    Transfer Inventory
                  </Button>
                )}
              </Flex>
            </Flex>

            <TableContainer>
              <Table variant="simple" size={"sm"}>
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Quantity</Th>
                    <Th>Category</Th>
                    <Th>Average Price</Th>
                    {/* <Th>Price</Th> */}
                    {/* <Th>Branches</Th> */}
                    {/* <Th>Payment Mode</Th> */}
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentItems?.map((item) => (
                    <Tr key={item?.productId}>
                      <Td>{item?.productName}</Td>
                      <Td maxW="20vw">{item?.productDescription}</Td>
                      <Td>
                        {selectedBranch
                          ? // Display branch-specific quantity if a branch is selected in the filter
                          item?.distribution.find(
                            (branch) => branch.branchName === selectedBranch
                          )?.itemQuantity || 0
                          : // Display combined quantity if no branch is selected
                          item?.distribution.reduce(
                            (totalQuantity, branch) =>
                              totalQuantity + branch.itemQuantity,
                            0
                          )}
                      </Td>
                      <Td>{item?.categoryName}</Td>
                      <Td>{parseFloat(item?.averagePrice).toFixed(2)} Pkr</Td>
                      {/* <Td>{item.productPrice}</Td> */}
                      {/* <Td>{item.itemBranch}</Td> */}
                      {/* <Td>{item.itemBranch.map(branch => branch.branchName).join(', ')}</Td> */}
                      {/* <Td>{item.sellerName}</Td>
                                <Td>
                                    <Badge variant="outline" colorScheme={item.paymentMode === "cash" ? "green" : "yellow"}>
                                        {item.paymentMode}
                                    </Badge>
                                </Td> */}
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
                            {/* <MenuItem
                              icon={<FiEdit />}
                              onClick={() => openDrawer("edit", item)}
                            >
                              Manage Item
                            </MenuItem> */}
                            {/* <MenuItem
                              icon={<FiTrash2 />}
                              onClick={() => handleDeleteClick(item.itemId)}
                            >
                              Delete
                            </MenuItem> */}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
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
                Page {currentPage} of{" "}
                {Math.ceil(filteredItems.length / itemsPerPage)}
              </Text>
            </Flex>
            <Drawers
              isOpen={isDrawerOpen}
              onClose={closeDrawer}
              drawerType={selectedDrawerType}
              data={selectedItemData}
              handleAddUpdateDeleteItem={fetchInventoryData}
            />
            <DeleteAlert
              isOpen={isDeleteAlertOpen}
              onClose={() => setIsDeleteAlertOpen(false)}
              onConfirmDelete={handleConfirmDelete}
              HeaderText={"Delete Item"}
              BodyText={`Are you sure you want to delete this Item?`}
            />
          </Box>
        </TabPanel>
        <TabPanel>
          <ManageInventory />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default InventoryList;
