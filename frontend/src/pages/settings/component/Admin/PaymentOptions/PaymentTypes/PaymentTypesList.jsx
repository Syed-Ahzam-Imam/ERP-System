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
  deleteLedgerType,
  getAllLedgerTypes,
} from "../../../../../../api/ledgerAPI";

function PaymentTypesList() {
  const bgColorParent = useColorModeValue("gray.100", "gray.700");
  const bgColor = useColorModeValue("white", "gray.700");
  const [isLoading, setIsLoading] = useState(true);

  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedDrawerType, setSelectedDrawerType] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  // ... (other code)
  const handleDeleteClick = (payment) => {
    setSelectedPaymentMode(payment);
    setIsDeleteAlertOpen(true);
  };
  const handleOptionClick = (drawerType, paymentMode) => {
    setSelectedDrawerType(drawerType);
    setSelectedPaymentMode(paymentMode);
  };
  const toast = useToast();

  const [paymentData, setPaymentData] = useState([]);
  // ... (other state variables)
  const fetchData = async () => {
    try {
      setIsLoading(true); // Set loading to true when starting to fetch data

      const ledgerTypes = await getAllLedgerTypes();
      
      setPaymentData(ledgerTypes);
      // ... (other state updates)
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []); // Run once on component mount
  const handleConfirmDelete = async () => {
    try {
      //   setIsLoading(true); // Set loading to true when starting to fetch data

      // Call the API function to delete the ledger type
      await deleteLedgerType(selectedPaymentMode.ledgerTypeId);

      // Display a success message using useToast
      toast({
        title: "Success",
        description: `Ledger type "${selectedPaymentMode.ledgerTypeName}" deleted successfully`,
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      // Optionally, you can perform additional actions after deleting

      // Close the modal or perform other actions
      setIsDeleteAlertOpen(false);

      // Refetch data to update the table
      fetchData();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // If the server returns a specific error message, use that
        const errorMessage = error.response.data.message;

        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      } else {
        // Handle error
        console.error("Error deleting ledger type:", error);

        // Display an error message using useToast
        toast({
          title: "Error",
          description: "Error deleting ledger type",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      }
    }
    // finally {
    //   setIsLoading(false); // Set loading to false when data fetching is complete
    // }
  };
  if (isLoading)
    return (
      <>
        <Center>
          <Text>Loading</Text>
        </Center>
      </>
    );
  else
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
              Add New Ledger Type
            </Button>
          </HStack>
        </Flex>
        <TableContainer>
          <Table variant="simple" size="lg">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Ledger Type</Th>
                {/* <Th>Description</Th> */}
                {/* <Th>Is Default</Th>
                            <Th>Enabled</Th> */}
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>

              {paymentData?.map((payment, index) => (
                <Tr key={index}>
                  <Td>
                    <Text>{payment.ledgerTypeId}</Text>
                  </Td>
                  <Td>
                    <Text>{payment.ledgerTypeName}</Text>
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
          handleAddOrUpdatepaymentMode={fetchData}
        />
        <DeleteAlert
          isOpen={isDeleteAlertOpen}
          onClose={() => setIsDeleteAlertOpen(false)}
          onConfirmDelete={handleConfirmDelete}
          HeaderText={"Delete Item"}
          BodyText={`Are you sure you want to delete "${selectedPaymentMode?.ledgerTypeName}" type?`}
        />
      </Box>
    );
}

export default PaymentTypesList;
