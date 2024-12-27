import { Box, Button, Flex, FormControl, FormLabel, HStack, Radio, RadioGroup, SimpleGrid, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useState } from 'react'
import { FiEdit } from 'react-icons/fi';
import EditSupplier from './EditSupplier';

const ShowSupplier = ({ selectedItem, handleAddUpdateDeleteItem, branches, onClose }) => {
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
    const handleEditOpen = () => {
        setEditOpen(true);
    }

    return (
        <Box>
            {isEditOpen ? (
                <EditSupplier
                    selectedItem={selectedItem}
                    onClose={onClose}
                    handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
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

                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Name</Text>
                            <Text style={textStyles}>{selectedItem.firstName}</Text>
                        </Box>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Shop Name</Text>
                            <Text style={textStyles}>{selectedItem.shopName}</Text>
                        </Box>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Address</Text>
                            <Text style={textStyles}>{selectedItem.shopLocation}</Text>
                        </Box>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>City</Text>
                            <Text style={textStyles}>{selectedItem.city}</Text>
                        </Box>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Contact Number</Text>
                            <Text style={textStyles}>{selectedItem.phoneNumber}</Text>
                        </Box>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Email</Text>
                            <Text style={textStyles}>{selectedItem.email}</Text>
                        </Box>
                        {/* <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Balance</Text>
                            <Text style={textStyles}>Rs. {selectedItem.amountDue}</Text>
                        </Box> */}
                        <Box mb={2}>
                            <Flex>
                                <Box flex={4}>

                                    <Text fontWeight="semibold" mb={2}>Balance</Text>
                                    <Text style={textStyles}>Rs. {selectedItem.amountDue}</Text>
                                </Box>
                                <Box
                                    flex={1}
                                    mt={10}
                                    ml={2}
                                >
                                    <RadioGroup
                                        value={selectedItem.amountDue > 0 ? "dr" : "cr"}
                                    >
                                        <HStack>
                                            <Radio value="cr">CR</Radio>
                                            <Radio value="dr">DR</Radio>
                                        </HStack>
                                    </RadioGroup>
                                </Box>
                            </Flex>
                        </Box>

                    </SimpleGrid>
                    <Button
                        variant="solid"
                        colorScheme='yellow'
                        rightIcon={<FiEdit />}
                        onClick={handleEditOpen}
                        mt={2}
                    >
                        Edit
                    </Button>
                </Box>
            )}
        </Box>
    )
}

export default ShowSupplier