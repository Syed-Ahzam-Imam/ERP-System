import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Input,
  useColorModeValue,
  useToast,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { updateBranch } from "../../../api/branchAPI";

const EditBranch = ({ selectedItem, handleAddUpdateDeleteBranch, onClose }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputStyles = {
    border: "1px solid grey",
  };
  const [editedItem, setEditedItem] = useState(selectedItem);
  const [errors, setErrors] = useState({});
  const [btnLoading,setBtnLoading]=useState(false);
  const validateForm = () => {
    const errors = {};

    if (editedItem.branchName === "") {
      errors.branchName = "Name is required";
    }

    if (editedItem.branchLocation === "") {
      errors.branchLocation = "Location is required";
    }

    if (editedItem.contactPerson === "") {
      errors.contactPerson = "Contact Person is required";
    }

    if (editedItem.branchPhoneNumber === "") {
      errors.branchPhoneNumber = "Contact Number is required";
    }

    if (editedItem.email === "") {
      errors.email = "Branch Email is required.";
    }

    if (editedItem.password === "") {
      errors.email = "Branch Password is required.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleInputChange = (field, value) => {
    setEditedItem((prevItem) => ({
      ...prevItem,
      [field]: value,
    }));
  };
  const toast = useToast();
  const handleSaveChanges = async () => {
    setBtnLoading(true);
    if (validateForm()) {
      try {
        // Extract only the fields you want to update
        const { branchName, branchLocation, branchPhoneNumber, contactPerson, email, password } = editedItem;
        const updatedFields = {
          branchName,
          branchLocation,
          branchPhoneNumber,
          contactPerson,
          email,
          password,
        };
        await updateBranch(selectedItem.branchId, updatedFields);
        // Handle successful update (maybe show a success toast)
        toast({
          title: "Branch Updated",
          description: "Branch details have been updated successfully.",
          status: "success",
          duration: 5000,
          position: "top-right",
          isClosable: true,
        });

        handleAddUpdateDeleteBranch();
        setBtnLoading(false);
        // Close the modal or perform any other actions after successful update
        onClose();
      } catch (error) {
        // Handle update error (show an error toast or update the state with error message)
        console.error("Error updating branch:", error);
        const errorMessage =
          error.response?.data?.error ||
          "Error updating branch. Please try again.";
        toast({
          title: "Error",
          description: errorMessage,
          position: "top-right",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setBtnLoading(false);
      }
    }
  };
  return (
    <Box
      spacing={10}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      <FormControl isRequired>
        <VStack spacing={4} align="start">
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Name
            </FormLabel>
            <Input
              style={{ ...inputStyles, width: "100%" }}
              placeholder="Enter Branch Name"
              value={editedItem.branchName}
              onChange={(e) => handleInputChange("branchName", e.target.value)}
              isInvalid={errors.branchName}
            />
            {errors.branchName && (
              <Text color="red.500" fontSize="sm">
                {errors.branchName}
              </Text>
            )}
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Location
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Description"
              value={editedItem.branchLocation}
              onChange={(e) =>
                handleInputChange("branchLocation", e.target.value)
              }
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Contact Person
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Enter Branch Contact Person"
              type="text"
              value={(editedItem.contactPerson)}
              onChange={(e) => handleInputChange("contactPerson", e.target.value)}
              isInvalid={errors.contactPerson}
            />
            {errors.contactPerson && (
              <Text color="red.500" fontSize="sm">
                {errors.contactPerson}
              </Text>
            )}
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Contact Number
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Enter Branch Contect Number"
              type="text"
              value={editedItem.branchPhoneNumber}
              onChange={(e) =>
                handleInputChange("branchPhoneNumber", e.target.value)
              }
              isInvalid={errors.branchPhoneNumber}
            />
            {errors.branchPhoneNumber && (
              <Text color="red.500" fontSize="sm">
                {errors.branchPhoneNumber}
              </Text>
            )}
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Email
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Enter Branch Email"
              type="email"
              value={editedItem.email}
              onChange={(e) =>
                handleInputChange("email", e.target.value)
              }
              isInvalid={errors.email}
            />
            {errors.email && (
              <Text color="red.500" fontSize="sm">
                {errors.email}
              </Text>
            )}
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Password
            </FormLabel>
            <Input
              style={inputStyles}
              placeholder="Enter Branch Password"
              type="password"
              value={editedItem.password}
              onChange={(e) =>
                handleInputChange("password", e.target.value)
              }
              isInvalid={errors.password}
            />
            {errors.password && (
              <Text color="red.500" fontSize="sm">
                {errors.password}
              </Text>
            )}
          </Box>
        </VStack>
      </FormControl>
      <Button
        variant="solid"
        colorScheme="blue"
        mt={4}
        onClick={handleSaveChanges}
        isLoading={btnLoading}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default EditBranch;
