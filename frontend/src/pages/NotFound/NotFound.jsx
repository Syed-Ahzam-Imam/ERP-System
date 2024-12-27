import { Box, Button, Container, Flex, Heading, Icon, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react'
import { TbFaceIdError } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import { IoHome } from "react-icons/io5";
import { BsArrowReturnLeft } from "react-icons/bs";


const NotFound = ({ sideBarWidth }) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box bg={bgColor} py={8} w="auto" minH="100vh">

            <Flex
                direction="column"
                justify="center"
                align="center"
                mx={4}
                textAlign="center"
                mt="20vh"
                gap={4}
            >
                <Icon 
                as={TbFaceIdError} 
                fontSize="68px"
                color="#20d5ff"
                 />
                <Heading>404: Oops! Page Not Found</Heading>
                <Text
                    maxW="450px"
                    fontWeight="light"
                    color="gray"
                >
                    Looks like you've discovered a black hole in our universe! Our space team is searching for the missing page. While they navigate the cosmos, how about exploring the other stellar parts?
                </Text>
                <Flex wrap="wrap" gap={2} >
                    <Button
                        as={Link}
                        to={-1}
                        variant="solid"
                        colorScheme='blue'
                        leftIcon={<BsArrowReturnLeft/>}
                        // w="100%"
                        // flex={1}
                    >
                        Take Me Back
                    </Button>
                    <Button
                        as={Link}
                        to="/"
                        variant="outline"
                        colorScheme='blue'
                        leftIcon={<IoHome />}
                        // w="100%"
                        // flex={1}
                    >
                        Go To Home
                    </Button>
                </Flex>
            </Flex>
        </Box>)
}

export default NotFound