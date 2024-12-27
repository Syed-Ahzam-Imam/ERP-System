import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { createNewBranch } from "../../../api/branchAPI";
const AddNewBranch = ({ onClose, handleAddUpdateDeleteBranch }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [btnLoading, setBtnLoading] = useState(false);
  const [formData, setFormData] = useState({
    branchName: "",
    branchLocation: "",
    branchPhoneNumber: "",
    contactPerson: "",
    email: "",
    password: "",
    role: "branchHead"
  });
  const toast = useToast();
  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setBtnLoading(true);
    try {
      await createNewBranch(formData);
      toast({
        title: "Branch Created",
        description: `${formData.branchName} has been created successfully.`,
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      handleAddUpdateDeleteBranch();
      setBtnLoading(false);
      onClose();
      // Additional actions after successful branch creation can be performed here
    } catch (error) {
      console.error("Error creating branch:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Error creating branch. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        position: "top-right",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setBtnLoading(false);
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
              placeholder="Enter Branch Name"
              value={formData.branchName}
              onChange={(e) => handleInputChange("branchName", e.target.value)}
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Location
            </FormLabel>
            <Input
              placeholder="Enter Branch Location"
              value={formData.branchLocation}
              onChange={(e) =>
                handleInputChange("branchLocation", e.target.value)
              }
            />
          </Box>

          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Quantity
                        </FormLabel>
                        <Input
                            placeholder="10"
                            type="number"
                            value={formData.itemQuantity}
                        // onChange={(e) => handleInputChange("itemQuantity", parseInt(e.target.value))}
                        />
                    </Box> */}

          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Category
                        </FormLabel>
                        <Input
                            placeholder="Enter Product Category"
                            value={formData.itemCategory}
                        // onChange={(e) => handleInputChange("itemCategory", e.target.value)}
                        />
                    </Box> */}

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Contact Person
            </FormLabel>
            <Input
              placeholder="Enter Branch Contact Person"
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange("contactPerson", (e.target.value))}
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Contact Number
            </FormLabel>
            <Input
              placeholder="Enter Branch Contect Number"
              type="number"
              value={formData.branchPhoneNumber}
              onChange={(e) =>
                handleInputChange("branchPhoneNumber", e.target.value)
              }
            />
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Email
            </FormLabel>
            <Input
              placeholder="Enter Branch Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                handleInputChange("email", e.target.value)
              }
            />
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Password
            </FormLabel>
            <Input
              placeholder="Enter Branch Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                handleInputChange("password", e.target.value)
              }
            />
          </Box>
          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Purchased From
                        </FormLabel>
                        <Input
                            placeholder="Purchased From"
                            value={formData.sellerName}
                        // onChange={(e) => handleInputChange("sellerName", e.target.value)}
                        />
                    </Box> */}

          <Button
            variant="solid"
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={btnLoading}
          >
            Add New Branch
          </Button>
        </VStack>
      </FormControl>
    </Box>
  );
};

export default AddNewBranch;
