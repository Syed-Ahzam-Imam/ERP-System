import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react'

const SettingsPanelBranch = () => {
    const bgColor = useColorModeValue("gray.100", "gray.700");
    const bgColorChild = useColorModeValue("gray.300", "gray.600");
    const textColor = useColorModeValue("black", "white");
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
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={4}
            shadow="md"
            width="100%"
            maxW="1500px"
            mx="auto"
        >
            
            <Flex
                shadow="lg"
                bg={bgColorChild}
                p={4}
            >
                <Text
                    fontWeight="semibold"
                    fontSize="lg"
                >
                    Branch Settings
                </Text>
            </Flex>
        </Box>
    )
}

export default SettingsPanelBranch