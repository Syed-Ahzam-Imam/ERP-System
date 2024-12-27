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
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { getBranches } from "../../../api/branchAPI";
import { createSupplier } from "../../../api/supplierAPI";
import { branchId } from "../../../api/constants";

const AddSupplier = ({ handleAddUpdateDeleteItem, selectedItem, onClose }) => {
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
  const [selectedOption, setSelectedOption] = useState('cr');
  const [btnLoading, setBtnLoading] = useState(false);
  // const [selectedBranchId, setSelectedBranchId] = useState("");

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

  // const handleBranchSelect = (branchId) => {
  //   setSelectedBranchId(branchId);
  // };

  const handleCustomerEdit = async () => {
    setBtnLoading(true);
    try {
      // Create supplier object with input values
      const supplierData = {
        firstName: editableCustomer.fname,
        lastName: editableCustomer.lname,
        email: editableCustomer.email,
        phoneNumber: editableCustomer.contact,
        shopName: editableCustomer.shopName,
        shopLocation: editableCustomer.shopLocation,
        amountDue: parseFloat(editableCustomer.amountDue),
        city: editableCustomer.city,
        branchId: parseInt(branchId)
      };
      supplierData.amountDue = selectedOption === 'cr' ? -parseInt(supplierData.amountDue) : parseInt(supplierData.amountDue);
      // Call the createSupplier function
      await createSupplier(supplierData); // This will send a POST request to the API

      // Show success message and close the form
      toast({
        title: "New Supplier Added",
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
      } else
        toast({
          title: "Error",
          description: "Failed to add supplier. Please try again later.",
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
  const [radioValue, setRadioValue] = useState('cr');


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
            <FormLabel fontWeight="semibold">Shop Name</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) => handleInputChange("shopName", e.target.value)} // Handle address change
              type="text"
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Address</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) =>
                handleInputChange("shopLocation", e.target.value)
              } // Handle address change
              type="text"
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">City</FormLabel>
            <Input
              style={textStyles}
              onChange={(e) =>
                handleInputChange("city", e.target.value)
              } // Handle address change
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
                  onChange={(e) => handleInputChange("amountDue", e.target.value)}
                  type="number"
                />
              </Box>
              <Box
                flex={1}
                mt={10}
                ml={2}
              >
                <RadioGroup
                  onChange={setRadioValue}
                  value={radioValue}
                >
                  <HStack>
                    <Radio value="cr">CR</Radio>
                    <Radio value="dr">DR</Radio>
                  </HStack>
                </RadioGroup>
              </Box>
            </Flex>
          </Box>
          {/* <Box mb={4}>
            <FormLabel fontWeight="semibold">Select Balance Type</FormLabel>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <option value="dr">DR</option>
              <option value="cr">CR</option>
            </Select>
          </Box> */}
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
          onClick={handleCustomerEdit}
          isLoading={btnLoading}
        >
          Add Supplier
        </Button>
      </FormControl>
    </Box>
  );
};

export default AddSupplier;
