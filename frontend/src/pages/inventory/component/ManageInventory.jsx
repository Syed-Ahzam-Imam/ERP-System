import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useTab,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiCheck, BiCross } from "react-icons/bi";
import { MdCheck, MdClose } from "react-icons/md";
import {
  approveTransfer,
  deleteTransfer,
  getAllTransfers,
  getBranchesForProduct,
} from "../../../api/transferAPI";
import { formatDateString } from "../../../utlis/helper";

const ManageInventory = () => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.700");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [modalData, setModalData] = useState([]);
  const [btnLoading,setBtnLoading]=useState(false);
  

  const toast = useToast();

  const handleBranchSelect = (value) => {
    setSelectedBranch(value);
  };

  const handleTransferApprove = async (request) => {
    setBtnLoading(true);
    try {
      const payload = {
        requestedBranchId: parseInt(selectedBranch),
        currentBranchId: request.branchId,
        productId: request.productId,
        quantity: request.quantity,
      };
      // Assuming you have all the dynamic data available
      const response = await approveTransfer(request.transferId, payload);

      setIsApproveOpen(false);
      toast({
        title: "Transfer Approved",
        description: `Item transfered successfully.`,
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      fetchTransferRequests(); // Refresh the transfer requests after approval
      setBtnLoading(false);
    } catch (error) {
      let errorMessage = "An error occurred while approving transfer";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // If the server returns a specific error message, use that
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      console.error("Error approving transfer:", error);
      setBtnLoading(false);
    }
  };

  const handleTransferReject = async (request) => {
    setBtnLoading(true);
    try {
      await deleteTransfer(request.transferId); // Assuming you have a selectedTransferId state or variable
      setIsRejectOpen(false);
      toast({
        title: "Transfer Rejected",
        description: `Transfer request rejected.`,
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      fetchTransferRequests(); // Refresh the transfer requests after deletion
      setBtnLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      console.error("Error rejecting transfer:", error);
      setBtnLoading(false);
    }
  };

  const [transferRequests, setTransferRequests] = useState([]);

  const fetchTransferRequests = async () => {
    try {
      const result = await getAllTransfers();
      setTransferRequests(result.transfers);
    } catch (error) {
      // Handle error, e.g., log the error or show a notification
      console.error("Error fetching transfer requests:", error);
    }
  };

  useEffect(() => {
    fetchTransferRequests();
  }, []);
  const [availableBranches, setAvailableBranches] = useState([]);

  const fetchAvailableBranches = async (productId, quantity) => {
    try {
      const result = await getBranchesForProduct(productId, quantity);
      setAvailableBranches(result.branches);
    } catch (error) {
      console.error("Error fetching available branches:", error);
    }
  };
  const handleTransferSelect = (request) => {
    setModalData(request)
    setIsApproveOpen(true);
    fetchAvailableBranches(request.productId, request.quantity);
    // Additional logic if needed
  };
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      mx="auto"
    >
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Requestor</Th>
              <Th>Item</Th>
              <Th>Quantity</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transferRequests.map((request, index) => (
              <Tr key={index}>
                <Td>{request.branchName}</Td>
                <Td>{request.productName}</Td>
                <Td>{request.quantity}</Td>
                <Td>{formatDateString(request.date)}</Td>
                <Td>
                  <Flex gap={2}>
                    {/* Open Reject Modal */}
                    <IconButton
                      icon={<MdClose />}
                      colorScheme="red"
                      variant="solid"
                      size="sm"
                      onClick={() => setIsRejectOpen(true)}
                    />
                    {/* Open Approve Modal */}
                    <IconButton
                      icon={<MdCheck />}
                      colorScheme="green"
                      variant="solid"
                      size="sm"
                      onClick={() => {
                        handleTransferSelect(
                         request
                        );
                      }}
                    />
                  </Flex>
                  
                </Td>
                <Modal
                  isOpen={isRejectOpen}
                  onClose={() => {
                    setIsRejectOpen(false);
                  }}
                  isCentered
                >
                  
                  <ModalOverlay bg="rgba(0,0,0,0.05)" />
                  <ModalContent>
                    
                    <ModalHeader>Reject Tranfer</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      Are you sure you want to reject this request?
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        colorScheme="red"
                        mr={3}
                        onClick={() => {
                          handleTransferReject(request);
                        }}
                        isLoading={btnLoading}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsRejectOpen(false)}
                      >
                        Cancel
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>

                {/* Approve Modal */}
                <Modal
                  isOpen={isApproveOpen}
                  onClose={() => setIsApproveOpen(false)}
                  isCentered
                >
                  <ModalOverlay bg="rgba(0,0,0,0.05)" />
                  <ModalContent>
                    <ModalHeader>Approve Transfer</ModalHeader>
                    
                    <ModalCloseButton />
                    <ModalBody>
                      <Text fontWeight="semibold">
                        {`Request: ${modalData.productName} | ${modalData.quantity} unit(s)`}
                      </Text>
                      <Select
                        placeholder="Select Branch"
                        my={2}
                        onChange={(event) =>
                          handleBranchSelect(event.target.value)
                        }
                      >
                        {availableBranches
                          .filter(
                            (branch) =>
                              branch.availableQuantity >= modalData.quantity
                          )
                          .map((branch, index) => (
                            <option key={index} value={branch.branchId}>
                              {branch.branchName} | {branch.availableQuantity}
                            </option>
                          ))}
                      </Select>
                      Are you sure you want to approve this request?
                    </ModalBody>
                    <ModalFooter>
                      {/* Add actions buttons for Approve */}
                      <Button
                        colorScheme="green"
                        mr={3}
                        onClick={() => {
                          handleTransferApprove(modalData);
                        }}
                        isLoading={btnLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsApproveOpen(false)}
                      >
                        Cancel
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ManageInventory;
