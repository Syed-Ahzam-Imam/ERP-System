import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList, Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiShow } from "react-icons/bi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";
import PaymentModesList from "./PaymentModes/PaymentModesList";
import PaymentTypesList from "./PaymentTypes/PaymentTypesList";

function PaymentOptions({sideBarWidth}) {
  const bgColorParent = useColorModeValue("gray.100", "gray.700");
  const bgColor = useColorModeValue("white", "gray.700");
  const [isLoading, setIsLoading] = useState(true);

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);



  const [selectedDrawerType, setSelectedDrawerType] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  // ... (other code)

  const handleOptionClick = (drawerType, paymentMode) => {
    setSelectedDrawerType(drawerType);
    setSelectedPaymentMode(paymentMode);
  };
  const toast = useToast();


  const paymentData = () => {

  }
  return (
    <Box
      bg={bgColor} py={8} w="auto" minH="100vh"
    >
      <Container maxW="container.xxl" justifySelf="center">
        <Box
          ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
          transition="margin 0.3s ease-in-out"
        >
          <Heading as="h1" size="xl" mb={4}>
            Payment & Ledger Options
          </Heading>
          <Tabs isFitted variant="soft-rounded">
            <TabList>
              <Tab>Ledger Types</Tab>
              <Tab >Payment Modes</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <PaymentTypesList />
              </TabPanel>
              <TabPanel >
                <PaymentModesList />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
}

export default PaymentOptions;
