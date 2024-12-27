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
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { updateInvestor } from "../../../api/investorAPI";

const EditInvestor = ({
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
  const [editableInvestor, setEditableInvestor] = useState({ ...selectedItem });
  const [radioValue,setRadioValue]=useState('cr');

  // Handler to update editable values
  const handleInputChange = (field, value) => {
    setEditableInvestor({ ...editableInvestor, [field]: value });
  };

  const handleSaveChanges = async () => {
    setBtnLoading(true);
    try {
      // Assuming you have the investorId in your selectedItem
      const investorId = selectedItem.investorId;

      // Make the API call to update the investor
      await updateInvestor(investorId, editableInvestor);

      // Display a success message using useToast
      toast({
        title: "Investor Updated",
        status: "success",
        position: "top-right",
        duration: 3000,
        isClosable: true,
      });

      // Call the callback to fetch updated data
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      // Close the drawer or modal
      onClose();
    } catch (error) {
      // Handle errors
      console.error("Error updating investor:", error);
      const errorMessage =
        error.response?.data?.message || "Error updating investor";
      // Display an error message using useToast or other notification method
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
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
      <FormControl isRequired>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Name</FormLabel>
            <Input
              style={textStyles}
              value={editableInvestor.firstName}
              type="text"
              onChange={(e) => handleInputChange("firstName", e.target.value)} // Handle name change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Last Name</FormLabel>
            <Input
              style={textStyles}
              value={editableInvestor.lastName}
              type="text"
              onChange={(e) => handleInputChange("lastName", e.target.value)} // Handle name change
            />
          </Box>

          <Box mb={2}>
            <FormLabel fontWeight="semibold">Contact</FormLabel>
            <Input
              style={textStyles}
              value={editableInvestor.phoneNumber}
              type="number"
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)} // Handle address change
            />
          </Box>
          <Box mb={2}>
            <FormLabel fontWeight="semibold">Email</FormLabel>
            <Input
              style={textStyles}
              value={editableInvestor.email}
              type="email"
              onChange={(e) => handleInputChange("email", e.target.value)} // Handle contact change
            />
          </Box>

          <Box mb={2}>
            <Text fontWeight="semibold" mb={2}>
              Profit Percentage
            </Text>
            <Input
              style={textStyles}
              value={editableInvestor.shares}
              type="number"
              onChange={(e) => handleInputChange("shares", e.target.value)}
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
          onClick={handleSaveChanges}
          isLoading={btnLoading}
        >
          Save Changes
        </Button>
      </FormControl>
    </Box>
  );
};

export default EditInvestor;
