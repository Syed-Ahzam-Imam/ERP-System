import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Textarea,
  VStack,
  useColorModeValue,
  InputGroup,
  InputRightAddon,
  IconButton,
  InputRightElement,
  Tooltip,
} from "@chakra-ui/react";
import { addProduct } from "../../../api/productAPI";
import { createCategory, deleteCategoryById, getAllCategories } from "../../../api/categoryAPI";
import { MdDeleteOutline } from "react-icons/md";


const AddNewProduct = ({ onClose, handleAddUpdateDeleteProduct }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const [availableCategories, setAvailableCategories] = useState([]); // State for categories
  const [allCategories, setAllCategories] = useState([]); // State for categories
  const [btnLoading, setBtnLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    itemCategory: 0,
    brand: '',
    // itemPrice: 0,
  });

  const [newCategory, setNewCategory] = useState("");
  const [isExistingCategory, setIsExistingCategory] = useState(true);
  // Fetch categories when the component mounts
  const fetchData = async () => {
    try {
      const response = await getAllCategories();
      setAvailableCategories(response.categories);
      setAllCategories(response.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    // Fetch categories when the component mounts
    fetchData();
  }, []);

  const handleCategoryInputChange = (input) => {
    setAvailableCategories(allCategories);
    const categoryExists = availableCategories.some(
      (category) => category.categoryName.toLowerCase() === input.toLowerCase()
    );

    setIsExistingCategory(categoryExists);
    setNewCategory(input);
  };

  const handleCategoryClick = (selectedCategory) => {
    setIsExistingCategory(true);
    setNewCategory(selectedCategory.categoryName);
    setFormData({ ...formData, itemCategory: selectedCategory.categoryId });
    setAvailableCategories([]);
    // Handle other actions if needed upon selecting the category
  };

  const handleAddCategory = () => {
    if (newCategory && !isExistingCategory) {
      createCategory(newCategory) // Create a new category
        .then((response) => {
          setAvailableCategories([...availableCategories, response.category]);
          setFormData({
            ...formData,
            itemCategory: response.category.categoryName,
          });
          setNewCategory("");
          fetchData();
          setAvailableCategories([]);
          // handleAddUpdateDeleteProduct();
          // Display a success toast message
          toast({
            title: "Category Added",
            description: "Category added successfully!",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        })
        .catch((error) => {
          console.error("Error creating category:", error);
          // Display an error toast message
          toast({
            title: "Error",
            description: "Error creating category. Please try again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        });
    }
  };
  const handleDeleteCategory = async () => {
    try {
      if (formData.itemCategory) {
        // Confirm deletion
        const shouldDelete = window.confirm('Are you sure you want to delete this category?');

        if (shouldDelete) {
          // Delete the category
          await deleteCategoryById(formData.itemCategory);
          toast({
            title: 'Category Deleted',
            description: 'Category deleted successfully!',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Update available categories
          fetchData();
          setAvailableCategories([]);

          // Trigger a refresh in the parent component if needed
          // handleAddUpdateDeleteProduct();
        }
      } else {
        toast({
          title: 'Error',
          description: 'Please select a category to delete.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Error deleting category. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const handleAddProduct = () => {
    // Use the addProduct API function to add a new product
    setBtnLoading(true);
    addProduct(
      formData.itemName,
      formData.itemDescription,
      // formData.itemPrice,
      formData.itemCategory,
      formData.brand
    )
      .then((response) => {
        toast({
          title: "Product Added",
          description: "Product added successfully!",
          status: "success",
          position: "top-right",
          duration: 5000,
          isClosable: true,
        });
        handleAddUpdateDeleteProduct();
        setBtnLoading(false);
        onClose();
        // Handle success, e.g., show a success message or redirect
      })
      .catch((error) => {
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
        setBtnLoading(false);
      });
  };

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
      <FormControl >
        <VStack spacing={4} align="start">
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Name
            </FormLabel>
            <Input
              placeholder="Enter Product Name"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Description
            </FormLabel>
            <Textarea
              placeholder="Enter Product Description"
              h="25vh"
              value={formData.itemDescription}
              onChange={(e) =>
                setFormData({ ...formData, itemDescription: e.target.value })
              }
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Category
            </FormLabel>
            <InputGroup>
              <Input
                placeholder="Search or Add Category"
                type="text"
                value={newCategory}
                onChange={(e) => handleCategoryInputChange(e.target.value)}

              />
              <InputRightElement>
                <Tooltip label="Delete Category" hasArrow bg="red">
                  <IconButton
                    icon={<MdDeleteOutline />}
                    colorScheme="red"
                    display={newCategory ? "flex" : "none"}
                    onClick={handleDeleteCategory}
                  />
                </Tooltip>
              </InputRightElement>
            </InputGroup>
            {!isExistingCategory && newCategory && (
              <Flex justify="end">
                <Button
                  variant="outline"
                  colorScheme="blue"
                  mt={2}
                  size={{ base: "xs", md: "sm" }}
                  onClick={handleAddCategory}
                >
                  Add New Category
                </Button>
              </Flex>
            )}

            {newCategory && (
              <Box
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
                maxH="150px"
                overflowY="auto"
              >
                {availableCategories
                  .filter((category) =>
                    category.categoryName
                      .toLowerCase()
                      .includes(newCategory.toLowerCase())
                  )
                  .map((category, index) => (
                    <Button
                      key={index}
                      justifyContent="start"
                      width="100%"
                      variant="ghost"
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category.categoryName}
                    </Button>
                  ))}
              </Box>
            )}
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Brand
            </FormLabel>
            <Input
              placeholder="Enter brand name"
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
            />
          </Box>

          <Button
            variant="solid"
            colorScheme="blue"
            onClick={handleAddProduct}
            isLoading={btnLoading}
          >
            Add Product
          </Button>
        </VStack>
      </FormControl>
    </Box>
  );
};

export default AddNewProduct;
