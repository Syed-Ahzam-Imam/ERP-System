import React from 'react'
import { Box, Container, Heading, useColorModeValue, Spinner, Center } from '@chakra-ui/react';
import SupplierList from './component/SupplierList';

const Suppliers = ({sideBarWidth}) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box bg={bgColor} py={8} w="auto" minH="100vh">
            <Container maxW="container.xxl" justifySelf="center">
                <Box
                    ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
                    transition="margin 0.3s ease-in-out"
                >
                    <Heading pb={2}>Suppliers</Heading>
                    {/* Render the Purchasing component with fetched data */}
                    <SupplierList /*inventoryItems={inventoryItems} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}*/ />
                </Box>
            </Container>
        </Box>)
}

export default Suppliers