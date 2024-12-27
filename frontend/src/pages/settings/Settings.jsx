import React from 'react'
import { Box, Container, Heading, useColorModeValue, Spinner, Center } from '@chakra-ui/react';
import SettingsPanelBranch from './component/Branch/SettingsPanelBranch';
import SettingsPanelAdmin from './component/Admin/SettingsPanelAdmin';
import { role } from '../../api/constants';

const Settings = ({sideBarWidth}) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box bg={bgColor} py={8} w="auto" minH="100vh" >
            <Container maxW="container.xxl" justifySelf="center">
                <Box
                    ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
                    transition="margin 0.3s ease-in-out"
                >
                    {/* <Container > */}
                    <Heading pb={2}>{role === "admin" ? "Settings" : " Settings"}</Heading>
                    <SettingsPanelAdmin /> 
                </Box>
            </Container>
        </Box>)
}

export default Settings