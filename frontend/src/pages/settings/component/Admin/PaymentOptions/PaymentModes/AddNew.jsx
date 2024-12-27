// AddNew.js
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    useToast
  } from "@chakra-ui/react";
  import React, { useState } from "react";
import { addNewPaymentMethod } from "../../../../../../api/paymentModeAPI";
  
  function AddNew({ onClose, handleAddOrUpdatepaymentMode }) {
    const [paymentModeData, setPaymentModeData] = useState({
      paymentMethodName: "",
      description: "",
    });
  
    const toast = useToast();
    const [btnLoading,setBtnLoading]=useState(false);
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
        await addNewPaymentMethod(paymentModeData);
        toast({
          title: "Payment Mode Added",
          status: "success",
        });
        handleAddOrUpdatepaymentMode(); // Refresh the payment methods list or update the state as needed
        setBtnLoading(false);
        onClose(); // Close the modal or perform other actions
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ?? "Error adding new payment method";
  
        toast({
          title: "Error",
          description: errorMessage,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
  
        if (!error.response?.data?.error) {
          console.error("Error adding new payment method:", error);
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
            name="paymentMethodName"
            value={paymentModeData.paymentMethodName}
            onChange={handleInputChange}
          />
          <FormLabel mt={5}>Description:</FormLabel>
          <Input
            type="text"
            name="description"
            value={paymentModeData.description}
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
  