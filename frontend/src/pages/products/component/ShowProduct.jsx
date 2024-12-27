import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  FormControl,
  ChakraProvider,
  useColorModeValue,
  Button,
  HStack,
} from "@chakra-ui/react";
import EditProduct from "./EditProduct";

const ShowProduct = ({ selectedItem, onClose }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };
  const [isEditOpen, setEditOpen] = useState(false);

  const openEditProduct = () => {
    setEditOpen(true);
  };
  return (
    <Box>
      {isEditOpen ? (
        <EditProduct
          selectedItem={selectedItem}
          onClose={onClose}
          // handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
        />
      ) : (
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
          <FormControl >
            <VStack spacing={4} align="start">
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Product ID
                </Text>
                <Text style={textStyles}>{selectedItem.productId}</Text>
              </Box>
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  NAME
                </Text>
                <Text style={textStyles}>{selectedItem.productName}</Text>
              </Box>

              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Description
                </Text>
                <Text style={textStyles}>
                  {selectedItem.productDescription}
                </Text>
              </Box>

              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Cateogry
                </Text>
                <Text style={textStyles}>{selectedItem.categoryName}</Text>
              </Box>
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Brand
                </Text>
                <Text style={textStyles}>{selectedItem.brandName}</Text>
              </Box>

              {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Price
                </Text>
                <Text style={textStyles}>{selectedItem.productPrice}</Text>
              </Box> */}
            </VStack>
          </FormControl>
          <HStack mt={4}>
            <Button
              variant="outline"
              colorScheme="yellow"
              onClick={openEditProduct}
            >
              Edit
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default ShowProduct;
