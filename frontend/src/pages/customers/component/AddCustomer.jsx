import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { getBranches } from "../../../api/branchAPI";
import { createCustomer } from "../../../api/customerAPI";
import { branchId } from "../../../api/constants";

const AddCustomer = ({ handleAddUpdateDeleteItem, selectedItem, onClose }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };
  const toast = useToast();
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const [btnLoading, setBtnLoading] = useState(false);
  useEffect(() => {
    // Fetch branches when the component mounts
    const fetchBranches = async () => {
      try {
        const branchesData = await getBranches();
        setBranches(branchesData);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, []);

  const handleBranchSelect = (branchId) => {
    setSelectedBranchId(branchId);
  };

  const handleCustomerAdd = async () => {
    setBtnLoading(true);
    try {
      // Create customer object with selected branch ID
      let customerData = {
        firstName: editableCustomer.fname,
        lastName: editableCustomer.lname || "",
        email: editableCustomer.email || "",
        phoneNumber: editableCustomer.contact || "",
        address: editableCustomer.address || "",
        branchId: branchId,
        amountDue: isNaN(editableCustomer.amountDue)
          ? 0
          : parseInt(editableCustomer.amountDue),
        city: editableCustomer.city || "",
      };

      // If "CR" (Credit) is selected, send amount as negative
      if (radioValue === "cr") {
        customerData.amountDue = -Math.abs(customerData.amountDue);
      } else {
        // "DR" (Debit) is selected, send amount as positive
        customerData.amountDue = Math.abs(customerData.amountDue);
      }


      // Call the createCustomer function
      await createCustomer(customerData); // This will send a POST request to the API

      // Show success message and close the form
      toast({
        title: "New Customer Added",
        description: `Details for ${editableCustomer.fname} added successfully.`,
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      onClose(); // Close the form after successful submission
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        toast({
          title: "Error",
          description: error.response.data.error,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        setBtnLoading(false);
      } else
        toast({
          title: "Error",
          description: "Failed to add customer. Please try again later.",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      setBtnLoading(false);
    }
  };

  // Use state to manage editable values
  const [editableCustomer, setEditableCustomer] = useState({ ...selectedItem });

  // Handler to update editable values
  const handleInputChange = (field, value) => {
    setEditableCustomer({ ...editableCustomer, [field]: value });
  };
  const [radioValue, setRadioValue] = useState("cr");

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
      <FormControl>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Name</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) => handleInputChange("fname", e.target.value)} // Handle name change
              type="text"
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Address</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) => handleInputChange("address", e.target.value)} // Handle address change
              type="text"
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">City</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) => handleInputChange("city", e.target.value)} // Handle address change
              type="text"
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Email</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) => handleInputChange("email", e.target.value)} // Handle address change
              type="text"
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Contact</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) => handleInputChange("contact", e.target.value)} // Handle contact change
              type="number"
            />
          </Box>
          <Box mb={2}>
            <Flex>
              <Box flex={4}>
                <FormLabel fontWeight="semibold">Previous Balance</FormLabel>
                <Input
                  style={textStyles}
                  onChange={(e) =>
                    handleInputChange("amountDue", e.target.value)
                  }
                  type="number"
                />
              </Box>
              <Box flex={1} mt={10} ml={2}>
                <RadioGroup onChange={setRadioValue} value={radioValue}>
                  <HStack>
                    <Radio value="cr">CR</Radio>
                    <Radio value="dr">DR</Radio>
                  </HStack>
                </RadioGroup>
              </Box>
            </Flex>
          </Box>

          <Box mb={2}>
            <FormLabel fontWeight="semibold">Registered At Branch</FormLabel>
            <Select
              style={textStyles}
              onChange={(e) => handleBranchSelect(e.target.value)}
              value={selectedBranchId}
            >
              <option value="" disabled>
                Select a branch
              </option>
              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </Select>
          </Box>
        </SimpleGrid>
        <Button
          variant="outline"
          colorScheme="red"
          mt={2}
          mr={2}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="solid"
          colorScheme="blue"
          mt={2}
          onClick={handleCustomerAdd}
          isLoading={btnLoading}
        >
          Add Customer
        </Button>
      </FormControl>
    </Box>
  );
};

export default AddCustomer;
