import { Box, Button, Flex, FormControl, FormLabel, HStack, Radio, RadioGroup, SimpleGrid, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import React, { useState } from 'react'
import { FiEdit } from 'react-icons/fi';
import EditInvestor from './EditInvestor';

const ShowInvestor = ({ selectedItem, handleAddUpdateDeleteItem, branches, onClose }) => {
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
    const [radioValue, setRadioValue] = useState('cr');

    return (
        <Box>
            {isEditOpen ? (
                <EditInvestor
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
                            <Text fontWeight="semibold" mb={2}>Last Name</Text>
                            <Text style={textStyles}>{selectedItem.lastName}</Text>
                        </Box>

                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Contact</Text>
                            <Text style={textStyles}>{selectedItem.phoneNumber}</Text>
                        </Box>
                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Email</Text>
                            <Text style={textStyles}>{selectedItem.email}</Text>
                        </Box>

                        <Box mb={2}>
                            <Text fontWeight="semibold" mb={2}>Profit Percentage</Text>
                            <Text style={textStyles}>{selectedItem.shares} %</Text>
                        </Box>
                        <Box mb={2}>
                            <Flex>
                                <Box flex={4}>

                                    <Text fontWeight="semibold" mb={2}>Previous Balance</Text>
                                    <Text style={textStyles}>123123</Text>
                                </Box>
                                <Box
                                    flex={1}
                                    mt={10}
                                    ml={2}
                                >
                                    <RadioGroup
                                        value={radioValue}
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

export default ShowInvestor