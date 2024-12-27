import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Textarea,
  VStack,
  useColorModeValue,
  InputGroup,
  InputRightAddon,
  IconButton,
  InputRightElement,
  Tooltip,
  Select,
} from "@chakra-ui/react";
import { getAllProducts } from "../../../api/productAPI";
import { getBranches } from "../../../api/branchAPI";
import { addOpeningStock } from "../../../api/inventoryAPI";
import { transferInventory } from "../../../api/transferAPI";
import { useBgColorChild } from "../../../utlis/colors";


const TransferInventory = ({ onClose, handleAddUpdateDeleteItem }) => {
  const [branches, setBranches] = useState([]);
  const [productItems, setProductItems] = useState([]);
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();
  const [btnLoading, setBtnLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: 0,
    requestFromBranchId: 0,
    quantity: 0,
    addToBranchId: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const productSearchResults = productItems?.filter((product) =>
    product.productName.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  );

  useEffect(() => {
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProductItems(productsData.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleProductChange = (e) => {
    // Set productId in formData when product is selected from dropdown
    setFormData({ ...formData, productId: e.target.value });
  };

  const handlerequestFromBranch = (e) => {
    setFormData({ ...formData, requestFromBranchId: e.target.value });
  };
  const handleaddToBranch = (e) => {
    setFormData({ ...formData, addToBranchId: e.target.value });
  };



  const handleAddOpeningStock = async () => {
    setBtnLoading(true);
    try {
      // Parse all formData values to integers
      const parsedFormData = {
        productId: parseInt(formData.productId),
        requestFromBranchId: parseInt(formData.requestFromBranchId, 10),
        quantity: parseInt(formData.quantity, 10),
        addToBranchId: parseInt(formData.addToBranchId, 10),
      };
      const response = await transferInventory(parsedFormData);

      toast({
        title: "The inventory has been transfered sucessfully.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      onClose();
    } catch (error) {
      console.error("Error adding opening stock:", error);

      toast({
        title: "There is an error transfering inventory.",
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
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      <FormControl >
        <VStack spacing={4} align="start">
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Product Name
            </FormLabel>
            <Input
              type="text"
              value={selectedProduct?.productName}
              placeholder="Search for item to transfer."
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedProduct(null);
              }}
            />
            {searchTerm && productSearchResults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {productSearchResults.map((result, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg={useBgColorChild}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        productId: result?.productId,
                      });
                      setSelectedProduct(result);
                      setSearchTerm("");
                    }}
                  >
                    {result?.productName}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Quantity
            </FormLabel>
            <Input
              placeholder="Enter Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
            />
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Branch Name
            </FormLabel>
            <Select
              placeholder="Select Branch from where you want to transfer from."
              onChange={handlerequestFromBranch}
              value={formData.branchId}
            >
              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </Select>
          </Box>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Branch Name
            </FormLabel>
            <Select
              placeholder="Select Branch from where you want to transfer to."
              onChange={handleaddToBranch}
              value={formData.branchId}
            >
              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </Select>
          </Box>

          <Button
            variant="solid"
            colorScheme="blue"
            onClick={handleAddOpeningStock}
            isLoading={btnLoading}
          >
            Transfer Inventory
          </Button>
        </VStack>
      </FormControl>
    </Box>
  );
};

export default TransferInventory;
