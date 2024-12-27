import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  FormControl,
  ChakraProvider,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Badge,
  Button,
} from "@chakra-ui/react";
import EditItem from "./EditItem";
import { FiEdit } from "react-icons/fi";
import { getProductById } from "../../../api/inventoryAPI";

function ShowItem({ selectedItemId, onClose }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // New state variable for loading status
  const [isEditOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProductById(selectedItemId);
        setSelectedItem(response.inventoryItem);
        setIsLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        // Handle error, e.g., display an error message
        console.error("Error fetching product:", error);
        setIsLoading(false); // Set loading to false in case of error
      }
    };

    fetchData();
  }, [selectedItemId]);

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };

  const handleEditOpen = () => {
    setEditOpen(true);
  };
  return (
    <Box>
      {isLoading ? ( // Show loading message when data is being fetched
        <Text>Loading...</Text>
      ) : isEditOpen ? (
        <EditItem
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
          <FormControl>
            <HStack>
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Item Name
                </Text>
                <Text style={textStyles}>{selectedItem.productName}</Text>
              </Box>

              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Category
                </Text>
                <Text style={textStyles}>{selectedItem.categoryName}</Text>
              </Box>
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Total Quantity
                </Text>
                <Text style={textStyles} fontWeight="bold">
                  {selectedItem.totalQuantity}
                </Text>
              </Box>
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Average Price
                </Text>
                <Text style={textStyles} fontWeight="bold">
                  {selectedItem?.averagePrice !== null
                    ? selectedItem?.averagePrice.toFixed(2)
                    : "N/A"}
                </Text>
              </Box>
            </HStack>
            <VStack spacing={4} align="start">
              {/* Branches Section */}
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <Text fontWeight="bold" mb={2}>
                  Item Stock
                </Text>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Branch Name</Th>
                      <Th>Item</Th>
                      <Th>Quantity</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {selectedItem.distribution.map((branch) => (
                      <Tr key={branch.branchName}>
                        <Td>{branch.branchName}</Td>
                        <Td>{selectedItem.productName}</Td>
                        <Td>{branch.itemQuantity}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </FormControl>
          {/* <Button
            variant="solid"
            colorScheme="yellow"
            mt={4}
            rightIcon={<FiEdit />}
            onClick={handleEditOpen}
          >
            Edit
          </Button> */}
        </Box>
      )}
    </Box>
  );
}

export default ShowItem;
