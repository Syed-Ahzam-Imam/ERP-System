// Edit.js

import React, { useState } from "react";
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
import { updateLedgerType } from "../../../../../../api/ledgerAPI";

function Edit({ data, handleAddOrUpdatepaymentMode, onClose }) {
  const [mode, setMode] = useState(data.ledgerTypeName);
  const [description, setDescription] = useState(data.description);
  const [isEnabled, setIsEnabled] = useState(data.is_enabled);
  const [isDefault, setIsDefault] = useState(data.is_default);
  const [btnLoading,setBtnLoading]=useState(false);
  const toast = useToast();

  const handleUpdateClick = async () => {
    setBtnLoading(true);
    try {
      const updatedLedgerTypeData = {
        ledgerTypeName: mode,
        // Include other fields you want to update
      };

      // Call the API function to update the ledger type
      await updateLedgerType(data.ledgerTypeId, updatedLedgerTypeData);

      // Display a success message using useToast
      toast({
        title: "Success",
        description: "Ledger type updated successfully",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      // Optionally, you can perform additional actions after updating
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
        console.error("Error updating ledger type:", error);

        // Display an error message using useToast
        toast({
          title: "Error",
          description: "Error updating ledger type",
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
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        />
        {/* <FormLabel mt={5}>Description:</FormLabel>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        /> */}
      </FormControl>
      <Button
        variant="solid"
        colorScheme="blue"
        mt={8}
        onClick={handleUpdateClick}
        isLoading={btnLoading}
      >
        Update
      </Button>
    </Flex>
  );
}

export default Edit;
