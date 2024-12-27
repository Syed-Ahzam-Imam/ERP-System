import React from 'react'
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    SimpleGrid,
    Text,
    useColorModeValue,
    useToast,
} from "@chakra-ui/react";
import { FaRupeeSign } from "react-icons/fa6";
import { formatDateString } from '../../../utlis/helper';
import { useBorderColor } from '../../../utlis/colors';

const ViewRecord = ({ selectedItem }) => {
    const bgColor = useColorModeValue("gray.100", "gray.700");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const textStyles = {
        border: "1px solid grey",
        backgroundColor: "transparent",
        width: "100%",
        padding: "0.5rem",
        borderRadius: "0.5rem",
    };
    return (
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
            <FormControl isRequired>
                <Box my={2}>
                    <SimpleGrid columns={2} spacing={2}>
                        <Box>
                            <FormLabel fontWeight="semibold">Ledger Type</FormLabel>
                            <Text style={textStyles}>{selectedItem.ledgerTypeName}</Text>
                        </Box>
                        <Box>
                            <FormLabel fontWeight="semibold">Payment Mode</FormLabel>
                            <Text style={textStyles}>{selectedItem.paymentMethod}</Text>
                        </Box>
                    </SimpleGrid>
                </Box>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    <Box>
                        <FormLabel fontWeight="semibold">Date</FormLabel>
                        <Text style={textStyles}>{formatDateString(selectedItem.date)}</Text>
                    </Box>
                    {/* <Box>
                        <FormLabel fontWeight="semibold">Account</FormLabel>
                        <Text style={textStyles}>{selectedItem.accountId}</Text>
                    </Box> */}

                </SimpleGrid>
                <Flex gap={2} mt={2} direction="column">
                    {/* <Box>
                        <FormLabel fontWeight="semibold">Name</FormLabel>
                        <Text style={textStyles}>{selectedItem.ledgerTypeName}</Text>

                    </Box> */}
                    <Box>
                        <FormLabel fontWeight="semibold">Customer/Supplier</FormLabel>
                        <Text style={textStyles}>{selectedItem.accountName}</Text>

                    </Box>
                    <Box>
                        <FormLabel fontWeight="semibold">Description</FormLabel>
                        <Text style={textStyles}>{selectedItem.description}</Text>

                    </Box>
                    <Box>
                        <Box>
                            <FormLabel fontWeight="semibold">Received Amount</FormLabel>
                            <Text style={textStyles}>{selectedItem.receipt > 0 ? selectedItem.receipt : selectedItem.payment}</Text>
                        </Box>

                    </Box>
                </Flex>
            </FormControl>

        </Box>
    )
}

export default ViewRecord