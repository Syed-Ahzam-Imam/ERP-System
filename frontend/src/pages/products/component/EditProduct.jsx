import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Input,
  useColorModeValue,
  useToast,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { editProductById } from "../../../api/productAPI";

const EditProduct = ({
  selectedItem,
  handleAddUpdateDeleteProduct,
  onClose,
}) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputStyles = {
    border: "1px solid grey",
  };
  const [editedItem, setEditedItem] = useState(selectedItem);
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const [btnLoading, setBtnLoading] = useState(false);
  const handleSaveChanges = async () => {
    setBtnLoading(true);
    if (validateForm()) {
      try {
        const response = await editProductById(
          selectedItem.productId,
          editedItem
        );
        // Close the edit modal
        toast({
          title: "Product Updated",
          description: `${editedItem.productName} has been updated successfully.`,
          status: "success",
          duration: 5000,
          position: "top-right",
          isClosable: true,
        });
        handleAddUpdateDeleteProduct(); // Refresh product list after successful update
        setBtnLoading(false);
        onClose();
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ?? "Error adding items";

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });

        if (!error.response?.data?.error) {
          console.error("Error creating items:", error);
        }
        setBtnLoading(false);
      }
    }
  };
  const validateForm = () => {
    const errors = {};

    if (editedItem.productName.trim() === "") {
      errors.productName = "Name is required";
    }

    if (editedItem.productPrice <= 0) {
      errors.productPrice = "Price must be greater than 0";
    }

    if (editedItem.productQuantity <= 0) {
      errors.productQuantity = "productQuantity must be greater than 0";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setEditedItem((prevItem) => ({
      ...prevItem,
      [field]: value,
    }));
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
      <FormControl>
        <VStack spacing={4} align="start">
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Name
            </FormLabel>
            <Input
              style={{ ...inputStyles, width: "100%" }}
              placeholder="Enter Name"
              value={editedItem.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              isInvalid={errors.productName}
            />
            {errors.productName && (
              <Text color="red.500" fontSize="sm">
                {errors.productName}
              </Text>
            )}
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Description
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Description"
              value={editedItem.productDescription}
              onChange={(e) =>
                handleInputChange("productDescription", e.target.value)
              }
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Category
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="categoryName"
              value={editedItem.categoryName}
            // onChange={(e) =>
            //   handleInputChange("editedItem.Category.CategoryName", e.target.value)
            // }
            />
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Brand
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="brandName"
              value={editedItem.brandName}
              onChange={(e) => handleInputChange("brandName", e.target.value)}
            />
          </Box>

          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Price
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Price"
              type="number"
              value={editedItem.productPrice}
              onChange={(e) =>
                handleInputChange("productPrice", parseFloat(e.target.value))
              }
              isInvalid={errors.productPrice}
            />
            {errors.productPrice && (
              <Text color="red.500" fontSize="sm">
                {errors.productPrice}
              </Text>
            )}
          </Box> */}
        </VStack>
      </FormControl>
      <Button
        variant="solid"
        colorScheme="blue"
        mt={4}
        onClick={handleSaveChanges}
        isLoading={btnLoading}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default EditProduct;
