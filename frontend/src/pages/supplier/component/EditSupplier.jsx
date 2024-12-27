import React, { useState } from "react";
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
  Switch,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { editCustomer } from "../../../api/customerAPI";
import { editSupplierById } from "../../../api/supplierAPI";

const EditSupplier = ({
  handleAddUpdateDeleteItem,
  selectedItem,
  branches,
  onClose,
}) => {
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
  const [btnLoading, setBtnLoading] = useState(false);

  // Use state to manage editable values
  const [editableCustomer, setEditableCustomer] = useState({ ...selectedItem });
  const [selectedOption, setSelectedOption] = useState(
    editableCustomer.amountDue < 0 ? 'cr' : 'dr'
  );

  // Handler to update editable values
  const handleInputChange = (field, value) => {
    setEditableCustomer({ ...editableCustomer, [field]: value });
  };


  const handleCustomerEdit = async () => {
    setBtnLoading(true);
    try {
      editableCustomer.amountDue = selectedOption === 'cr' ? -Math.abs(editableCustomer.amountDue) : Math.abs(editableCustomer.amountDue);
      
      
      // Call the editCustomer function to update customer details
      await editSupplierById(selectedItem.supplierId, editableCustomer);
      toast({
        title: "Customer Details Updated",
        description: `Details for ${editableCustomer.firstName} updated successfully.`,
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      onClose();
    } catch (error) {
      // Handle error if the API request fails
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
          description: "Error updating customer details. Please try again.",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      setBtnLoading(false);
    }
  };

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
              value={editableCustomer.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)} // Handle name change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Shop Name</FormLabel>
            <Input
              style={textStyles}
              value={editableCustomer.shopName}
              onChange={(e) => handleInputChange("shopName", e.target.value)} // Handle address change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Address</FormLabel>
            <Input
              style={textStyles}
              value={editableCustomer.shopLocation}
              onChange={(e) =>
                handleInputChange("shopLocation", e.target.value)
              } // Handle address change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">City</FormLabel>
            <Input
              style={textStyles}
              value={editableCustomer.city}
              onChange={(e) => handleInputChange("city", e.target.value)} // Handle address change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Contact</FormLabel>
            <Input
              style={textStyles}
              value={editableCustomer.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)} // Handle contact change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Contact</FormLabel>
            <Input
              style={textStyles}
              value={editableCustomer.email}
              onChange={(e) => handleInputChange("email", e.target.value)} // Handle contact change
            />
          </Box>

          {/* <Box mb={2}>
            <FormLabel fontWeight="semibold">Balance</FormLabel>
            <Input
              style={textStyles}
              type="text" // Change type to "text" to allow non-numeric characters
              pattern="[0-9]*" // Use a pattern to accept only numbers
              value={Math.abs(editableCustomer.amountDue)}
              onChange={(e) => handleInputChange("amountDue", e.target.value)} // Handle contact change
            />
          </Box> */}
          <Box mb={2}>
            <Flex>
              <Box flex={4}>

                <FormLabel fontWeight="semibold">Balance</FormLabel>
                <Input
                  style={textStyles}
                  type="text" // Change type to "text" to allow non-numeric characters
                  pattern="[0-9]*" // Use a pattern to accept only numbers
                  value={Math.abs(editableCustomer.amountDue)}
                  onChange={(e) => handleInputChange("amountDue", e.target.value)} // Handle contact change
                />
              </Box>
              <Box flex={1} mt={10} ml={2}>
  <RadioGroup
    value={selectedOption}
    onChange={(value) => setSelectedOption(value)}
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
          Save Changes
        </Button>
      </FormControl>
    </Box>
  );
};

export default EditSupplier;
