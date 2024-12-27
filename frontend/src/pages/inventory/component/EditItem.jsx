import React, { useState } from "react";
import {
    // ... (other imports)
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Heading,
    IconButton,
    Input,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { updateInventoryItem } from "../../../api/inventoryAPI";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";


function EditItem({ selectedItem, handleAddUpdateDeleteItem, onClose }) {
    const bgColor = useColorModeValue("gray.100", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textStyles = {
        border: "1px solid grey",
        backgroundColor: "transparent",
        width: "100%",
        padding: "0.5rem",
        borderRadius: "0.5rem",
    };

    const [editedItem, setEditedItem] = useState(selectedItem);
    const [errors, setErrors] = useState({});
    const [editedItems, setEditedItems] = useState(Array.isArray(editedItem.items) ? [...editedItem.items] : []);
    const toast = useToast();
    const [editedBranches, setEditedBranches] = useState(selectedItem.itemBranch || []);

    const handleAddBranch = () => {
        // Create a new branch object with initial values
        const newBranch = {
            branchName: "",
            branchItemQuantity: 0,
        };

        // Add the new branch to the editedBranches state
        setEditedBranches((prevBranches) => [...prevBranches, newBranch]);
    };

    const handleRemoveItem = (index) => {
        setEditedItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems.splice(index, 1);
            return updatedItems;
        });
    };

    const handleRemoveBranch = (index) => {
        setEditedBranches((prevBranches) => {
            const updatedBranches = [...prevBranches];
            updatedBranches.splice(index, 1);
            return updatedBranches;
        });
    };

    const handleSaveChanges = async () => {
        try {
            // Set the items and branches within the edited item
            setEditedItem((prevItem) => ({
                ...prevItem,
                items: editedItems,
                branches: editedBranches,
            }));

            // Call the API function to update the item
            await updateInventoryItem(selectedItem.itemId, editedItem);

            // Display success message or perform other actions
            toast({
                title: "Item Updated",
                description: "The item has been updated successfully.",
                status: "success",
                duration: 3000,
                position: "top-right",
                isClosable: true,
            });

            handleAddUpdateDeleteItem();
            onClose();
        } catch (error) {
            // Handle API error (display an error message or perform other actions)
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
                    description: "Error updating item",
                    status: "error",
                    duration: 3000,
                    position: "top-right",
                    isClosable: true,
                });
                console.error("Error updating item:", error);
            }
        }
    };
    const handleItemChange = (index, field, value) => {
        // Update the item data in the editedItems array
        const updatedItems = [...editedItems];
        updatedItems[index][field] = value;
        setEditedItems(updatedItems);
    };

    const handleBranchChange = (index, field, value) => {
        // Update the branch data in the editedBranches array
        const updatedBranches = [...editedBranches];
        updatedBranches[index][field] = value;
        setEditedBranches(updatedBranches);
    };


    return (
        <Box spacing={10} bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="md" p={4} shadow="md" width="100%">
            <FormControl isRequired>
                <HStack>
                    <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Item Name
                        </FormLabel>
                        <Text style={textStyles} fontWeight="bold">
                            {selectedItem.itemName}
                        </Text>
                    </Box>
                    <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Category
                        </FormLabel>
                        <Text style={textStyles} fontWeight="bold">
                            {selectedItem.itemCategory}
                        </Text>
                    </Box>
                    <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Total Quantity
                        </FormLabel>
                        <Text style={textStyles} fontWeight="bold">
                            {selectedItem.itemQuantity}
                        </Text>
                    </Box>
                </HStack>



                <Text fontWeight="bold" mt={4}>
                    Edit Branches
                </Text>
                <Table>
                    <Thead>
                        <Tr>
                            <Th>Branch Name</Th>
                            {/* <Th>Assigned Item</Th> */}
                            <Th>Quantity</Th>
                            <Th>Action</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {editedBranches.map((branch, index) => (
                            <Tr key={index}>
                                <Td>
                                    <Input
                                        value={branch.branchName}
                                        onChange={(e) => handleBranchChange(index, "branchName", e.target.value)}
                                    />
                                </Td>
                                <Td>
                                    <Input
                                        value={branch.branchItemQuantity}
                                        onChange={(e) => handleBranchChange(index, "branchItemQuantity", parseInt(e.target.value))}
                                    />
                                </Td>
                                <Td>
                                    <IconButton
                                        icon={<DeleteIcon />}
                                        variant="ghost"
                                        colorScheme="red"
                                        size="sm"
                                        onClick={() => handleRemoveBranch(index)}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>

                </Table>
                <Flex justify="center" align="center">
                    <Button variant="outline" colorScheme="teal" fontWeight="light" onClick={handleAddBranch} size="sm">
                        <AddIcon mr={2} />
                        Add Branch
                    </Button>
                </Flex>

                <Button variant="outline" colorScheme="red" onClick={onClose} mt={4} mr={2}>
                    Cancel
                </Button>
                <Button variant="solid" colorScheme="blue" onClick={handleSaveChanges} mt={4}>
                    Save Changes
                </Button>

            </FormControl>
        </Box>
    );
}

export default EditItem;
