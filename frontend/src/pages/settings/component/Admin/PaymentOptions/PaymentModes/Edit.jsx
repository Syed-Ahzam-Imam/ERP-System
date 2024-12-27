// Edit.js
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
import { updatePaymentMethodById } from "../../../../../../api/paymentModeAPI";

function Edit({ data, handleAddOrUpdatepaymentMode, onClose }) {
  const [mode, setMode] = useState(data.paymentMethodName);
  const [description, setDescription] = useState(data.description);
  const [isEnabled, setIsEnabled] = useState(data.is_enabled);
  const [isDefault, setIsDefault] = useState(data.is_default);
  const [btnLoading,setBtnLoading]=useState(false);
  const toast = useToast();

  const handleUpdateClick = async () => {
    setBtnLoading(true);
    try {
      const updatedData = {
        paymentMethodName: mode,
        description:description,
        is_enabled: isEnabled,
        is_default: isDefault,
      };

      await updatePaymentMethodById(data.paymentMethodId, updatedData);
      toast({
        title: "Payment Mode Updated",
        status: "success",
      });
      handleAddOrUpdatepaymentMode(); // Refresh the payment methods list or update the state as needed
      setBtnLoading(false);
      onClose(); // Close the modal or perform other actions
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ?? "Error updating payment method";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      if (!error.response?.data?.error) {
        console.error("Error updating payment method:", error);
      }
      setBtnLoading(false);
    }
  };

  return (
    <Flex direction="column">
      <FormControl isRequired>
        <FormLabel mt={5}>Payment Mode Name:</FormLabel>
        <Input
          type="text"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        />
        <FormLabel mt={5}>Description:</FormLabel>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
