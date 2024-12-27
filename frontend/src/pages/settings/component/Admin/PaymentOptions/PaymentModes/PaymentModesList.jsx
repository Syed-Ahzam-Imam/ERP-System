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
  MenuList,
  Switch,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiShow } from "react-icons/bi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";
import Drawers from "./Drawers";
import DeleteAlert from "../../../../../../components/DeleteAlert";
import {
  deletePaymentMethodById,
  getPaymentMethods,
} from "../../../../../../api/paymentModeAPI";

function PaymentModesList() {
  const bgColorParent = useColorModeValue("gray.100", "gray.700");
  const bgColor = useColorModeValue("white", "gray.700");
  const [isLoading, setIsLoading] = useState(true);

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [paymentData, setPaymentData] = useState([]);
  // Fetch payment methods using the API function
  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const result = await getPaymentMethods();
      
      setPaymentData(result.paymentMethods);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const [selectedDrawerType, setSelectedDrawerType] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  // ... (other code)
  const handleDeleteClick = (itemId) => {
    setSelectedPaymentMode(itemId);
    setIsDeleteAlertOpen(true);
  };
  const handleOptionClick = (drawerType, paymentMode) => {
    setSelectedDrawerType(drawerType);
    setSelectedPaymentMode(paymentMode);
  };
  const toast = useToast();
  // Function to handle delete operation
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await deletePaymentMethodById(selectedPaymentMode.paymentMethodId);
      setIsDeleteAlertOpen(false);
      fetchPaymentMethods();
      toast({
        title: "Payment Mode Deleted",
        status: "success",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ?? "Error deleting items";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      if (!error.response?.data?.error) {
        console.error("Error deleting items:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) return <Text>Loading</Text>;
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      <Flex direction="row" justify="space-between" mb={6}>
        <Link to="/settings">
          <IconButton icon={<ArrowBackIcon />} />
        </Link>
        <HStack justify="end">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            onClick={() => handleOptionClick("addNew", null)}
          >
            {" "}
            {/* Pass null for addNew */}
            Add New Payment Mode
          </Button>
        </HStack>
      </Flex>
      <TableContainer>
        <Table variant="simple" size="lg">
          <Thead>
            <Tr>
              <Th>Payment Mode</Th>
              <Th>Description</Th>
              {/* <Th>Is Default</Th>
                            <Th>Enabled</Th> */}
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paymentData.map((payment, index) => (
              <Tr key={index}>
                <Td>
                  <Text>{payment.paymentMethodName}</Text>
                </Td>
                <Td>
                  <Text>{payment.description}</Text>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<HiDotsVertical />}
                      variant="ghost"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<BiShow />}
                        onClick={() => handleOptionClick("show", payment)}
                      >
                        Show
                      </MenuItem>
                      <MenuItem
                        icon={<FiEdit />}
                        onClick={() => handleOptionClick("edit", payment)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteClick(payment)}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Drawers
        isOpen={selectedDrawerType !== null}
        onClose={() => setSelectedDrawerType(null)}
        drawerType={selectedDrawerType}
        data={selectedPaymentMode}
        handleOptionClick={handleOptionClick}
        selectedDrawerType={selectedDrawerType}
        handleAddOrUpdatepaymentMode={fetchPaymentMethods}
      />
      <DeleteAlert
        isOpen={isDeleteAlertOpen}
        onClose={() => setIsDeleteAlertOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        HeaderText={"Delete Item"}
        BodyText={`Are you sure you want to delete "${selectedPaymentMode?.paymentMethodName}" mode?`}
      />
    </Box>
  );
}

export default PaymentModesList;
