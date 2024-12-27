import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  Switch,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { addLedgerType } from "../../../../../../api/ledgerAPI";

function AddNew({ onClose, handleAddOrUpdatepaymentMode }) {
  const [paymentModeData, setPaymentModeData] = useState({
    name: "",
    description: "",
    is_enabled: true,
    is_default: false,
  });
  const toast = useToast();
  const [btnLoading, setBtnLoading] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentModeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    setBtnLoading(true);
    try {
      // Call the API function to add a new ledger type
      await addLedgerType({ ledgerTypeName: paymentModeData.name });

      // Display a success message using useToast
      toast({
        title: "Success",
        description: "New ledger type added successfully",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      // Optionally, you can perform additional actions after saving
      handleAddOrUpdatepaymentMode()
      setBtnLoading(false);
      // Close the modal or perform other actions
      onClose();
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
        console.error("Error adding ledger type:", error);

        // Display an error message using useToast
        toast({
          title: "Error",
          description: "Error adding ledger type",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      }
      setBtnLoading(false);
    }
  };
  return (
    <Flex direction="column">
      <FormControl isRequired>
        <FormLabel mt={5}>Ledger Type Name:</FormLabel>
        <Input
          type="text"
          name="name"
          value={paymentModeData.name}
          onChange={handleInputChange}
        />
      </FormControl>
      <Button
        variant="solid"
        colorScheme="blue"
        mt={8}
        onClick={handleSave}
        isLoading={btnLoading}
      >
        Save
      </Button>
    </Flex>
  );
}

export default AddNew;
