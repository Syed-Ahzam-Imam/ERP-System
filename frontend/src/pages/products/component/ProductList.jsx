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
import { deleteProductById, getAllProducts } from "../../../api/productAPI";
import { getAllCategories } from "../../../api/categoryAPI";
import { role } from "../../../api/constants";
import Loading from "../../../components/Loading/Loading";
import { FaFilePdf } from "react-icons/fa6";
import { productsPdf } from "../../../utlis/ProductsPdf";

const ProductList = ({ branchName }) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedproductName, setSelectedproductName] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Define isDrawerOpen state
  const [selectedDrawerType, setSelectedDrawerType] = useState("");
  const [drawerSize, setDrawerSize] = useState("lg"); // Define selectedDrawerType state
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [productItems, setProductItems] = useState(null);
  const [availableCategories, setAvailableCategories] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast(); // Initialize useToast

  const handleConfirmDelete = async () => {
    try {
      await deleteProductById(selectedItemId);
      setIsDeleteAlertOpen(false);
      toast({
        title: "Product Deleted",
        description: `${selectedproductName} has been deleted successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchProducts() // Call a function to refresh the product list after deletion
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

  // Inside the fetchCategoryData function
  // Fetch Categories function
  const fetchCategories = async () => {
    try {
      const categoriesResponse = await getAllCategories();
      // Check if categoriesResponse is not null or undefined and categories array is not null or undefined
      if (categoriesResponse && categoriesResponse.categories) {
        // Extract category names from the response
        const categoryNames = categoriesResponse.categories.map(
          (category) => category.categoryName
        );

        // Set the available categories state with the extracted names
        setAvailableCategories(categoryNames);
        setIsLoading(false);
      } else {
        // Handle the case when categoriesResponse or categories array is null or undefined
        console.error("Categories response or categories array is null or undefined");
        // You can set a default value or handle it according to your use case
      }
    } catch (error) {
      console.error("Error fetching categories data:", error);
    }
  };

  // Fetch Products function
  const fetchProducts = async () => {
    try {
      const productsResponse = await getAllProducts();
      if (productsResponse) {
        // Set the product items state with the fetched products
        setProductItems(productsResponse.products);
      } else {
        // Handle the case when productsResponse is null or undefined
        console.error("Products response is null or undefined");
        // You can set a default value or handle it according to your use case
      }
    } catch (error) {
      console.error("Error fetching products data:", error);
    }
  };

  // useEffect to fetch data on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);


  //   const availableCategories = [
  //     "Solar Panels",
  //     "Inverters",
  //     "Mounting Accessories",
  //     // Add more categories as needed
  //   ];

  const handleSearchChange = (event) => {
    const searchText = event.target.value.toLowerCase();
    setSearchTerm(searchText);
  };
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);
  };

  const resetPage = (event) => {
    setCurrentPage(1);
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const filteredItems = productItems
    ? productItems.filter(
      (item) =>
        (item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productDescription
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())) &&
        (selectedCategory === "" ||
          item.categoryName?.toLowerCase() === selectedCategory?.toLowerCase())//yhn categori aliyan n sahi krna h
    )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  let filteredProductItems = filteredItems
    ? filteredItems.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const handleDeleteClick = (itemId, productName) => {
    setSelectedItemId(itemId);
    setSelectedproductName(productName);
    setIsDeleteAlertOpen(true);
  };

  const openDrawer = (drawerType, itemData, size="lg") => {
    setSelectedDrawerType(drawerType);
    setSelectedItemData(itemData);
    setIsDrawerOpen(true);
    setDrawerSize(size);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDrawerType("");
    setSelectedItemData(null);
  };

  const handlePdfDownload = () => {
    productsPdf(
      filteredItems,
      selectedCategory,
    );
  }
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

      <Flex align="center" mb={4} justify="space-between" direction={{ base: "column", md: "row" }}>
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
              placeholder="Search by name or description"
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
          <Select
            placeholder="All Categories"
            value={selectedCategory}
            onChange={handleCategoryChange}
            borderRadius="0.3rem"
            py={2}
            fontSize="md"
            mr={4}
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Flex>
        <Flex gap={2}>
          <Button
            variant="solid"
            colorScheme="red"
            onClick={handlePdfDownload}
            leftIcon={<FaFilePdf />}
            isDisabled={filteredItems.length > 0 ? false : true}
            size={'sm'}
          >
            Download PDF
          </Button>
          {role === 'admin' && (
            <Button
              colorScheme="blue"
              borderRadius="0.3rem"
              px={8}
              py={3}
              fontSize="md"
              onClick={() => openDrawer("addNew")}
              size={"sm"}
            >
              Add Product
            </Button>
          )}
        </Flex>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Description</Th>
              {/* <Th>Quantity</Th> */}
              <Th>Category</Th>
              <Th>brand</Th>
              {/* <Th>Price</Th> */}
              {/* <Th>Purchased From</Th> */}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredProductItems.map((item) => (
              <Tr key={item.productId}>
                <Td
                  onClick={() => openDrawer("ledger", item, "full")}
                  cursor="pointer"
                  _hover={{
                    fontWeight: "bold"
                  }}
                >
                  {item.productName}
                </Td>
                <Td>{item.productDescription}</Td>
                {/* <Td>{item.itemQuantity}</Td> */}
                {/* //yhn categori aliyan n sahi krna h */}
                <Td>{item.categoryName}</Td>
                <Td>{item.brandName}</Td>
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
                          handleDeleteClick(item.productId, item.productName)
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
          Page {currentPage} of{" "}
          {Math.ceil(filteredItems.length / itemsPerPage)}
        </Text>
      </Flex>
      <Drawers
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        size={drawerSize}
        drawerType={selectedDrawerType}
        data={selectedItemData}
        handleAddUpdateDeleteProduct={fetchProducts}
      />
      <DeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        HeaderText={"Delete Product"}
        BodyText={`Are you sure you want to delete "${selectedproductName}"?`}
      />
    </Box>
  );
};

export default ProductList;
