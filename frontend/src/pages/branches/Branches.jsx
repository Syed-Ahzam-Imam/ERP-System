import React, { useState } from 'react'
import BranchList from './component/BranchList';
import { Box, Container, Heading, useColorModeValue } from '@chakra-ui/react';

const Branches = ({sideBarWidth}) => {
    const [isLoading, setIsLoading] = useState(true); // State to track loading status
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    return (
        <Box bg={bgColor} py={8} w="auto" minH="100vh">
            <Container maxW="container.xxl" justifySelf="center">
                <Box
                    ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
                    transition="margin 0.3s ease-in-out"
                >
                    <Heading pb={2}>Branches</Heading>
                    <BranchList></BranchList>
                    {/* Render the Purchasing component with fetched data */}
                </Box>
            </Container>
        </Box>
    )
}

export default Branches