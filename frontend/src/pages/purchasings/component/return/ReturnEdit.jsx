import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { getAllProducts } from "../../../../api/productAPI";
import { getBranches } from "../../../../api/branchAPI";
import { getAllSuppliers } from "../../../../api/supplierAPI";
import { createPurchaseReturn, editReturnPurchase, fetchReturnPurchaseDetailsById } from "../../../../api/returnPurchase";

const ReturnEdit = ({ handleAddUpdateDeleteItem, onClose, purchaseId }) => {

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };
  const [btnLoading,setBtnLoading]=useState(false);


  
  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        // Replace '5' with the actual purchase ID you want to fetch
        let purchaseData;
        purchaseData = await fetchReturnPurchaseDetailsById(purchaseId);
        

        // Set the state or perform other actions with the purchase data
        const { purchaseReturn, itemsWithAssignments } = purchaseData;

        // Set supplier data
        const selectedSupplier = {
          supplierId: purchaseReturn.supplierId,
          firstName: purchaseReturn.supplierName,
        };
        setSelectedSupplier(selectedSupplier);

        // Set purchase form data  
        const formattedDate = new Date(purchaseReturn.purchaseReturnDate).toISOString().split('T')[0];
        setFormData({
          sellerName: purchaseReturn.supplierName,
          date: formattedDate,
          paymentMode: purchaseReturn.paymentStatus,
          description: purchaseReturn.purchaseReturnDescription,
          paymentMethod: purchaseReturn.paymentMethod,
        });

        // Set item rows
        const tableRowsData = itemsWithAssignments.map((item) => ({
          productName: item.productDetails.productName,
          itemQuantity: item.productDetails.quantity,
          itemCategory: item.productDetails.categoryName,
          productPrice: item.productDetails.unitPrice,
          productDiscount: item.productDetails.discount,
          productId: item.productId,
          searchTerm: item.productDetails.productName,
          searchResults: [],
        }));
        setTableRows(tableRowsData);

        // Set branch rows
        const branchRowsData = itemsWithAssignments.flatMap((item) =>
          item.itemAssignments.map((assignment) => ({
            branchName: assignment.branchName,
            assignedItem: item.productDetails.productName,
            quantity: assignment.quantity,
            searchTerm: assignment.branchName,
            searchResults: [],
          }))
        );
        setBranchRows(branchRowsData);
        
      } catch (error) {
        console.error("Error fetching purchase data:", error.message);
      }
    };

    // Call the fetchPurchaseData function when the component mounts
    fetchPurchaseData();
  }, [purchaseId]);


  const [suppliers, setSuppliers] = useState([]); // Step 1
  useEffect(() => {
    // Step 2: Fetch suppliers and set them in the state
    const fetchSuppliers = async () => {
      try {
        const suppliersData = await getAllSuppliers();
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(""); // State to store the selected supplier name

  const supplierSearchResults = suppliers.filter((supplier) =>
    supplier.firstName.toLowerCase().includes(supplierSearchTerm.toLowerCase())
  );
  const [finalDiscount, setFinalDiscount] = useState(0);
  const [amountRecieved, setAmountRecieved] = useState(0);
  const [formData, setFormData] = useState({
    sellerName: "",
    date: "",
    paymentMode: "",
    description: "",
  });
  const [tableRows, setTableRows] = useState([
    {
      productName: "",
      itemQuantity: 0,
      itemCategory: "",
      productPrice: 0, // Add productPrice
      productDiscount: 0, // Add productPrice
      searchTerm: "",
      searchResults: [],
    },
  ]);
  const [branchRows, setBranchRows] = useState([
    {
      branchName: "",
      assignedItem: "",
      quantity: 0,
      searchTerm: "",
      searchResults: [],
    },
  ]);
  const [branches, setBranches] = useState([]);
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

  const [productItems, setProductItems] = useState([]);

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
  const addedProductNames = tableRows.map((row) => row.productName);
  const filteredProducts = productItems.filter((product) =>
    addedProductNames.includes(product.productName)
  );
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...tableRows];
    if (field === "productName") {
      // Find the selected item based on the value
      const selectedItem = productItems.find(
        (item) => item.productName === value
      );
      if (selectedItem) {
        updatedRows[index].itemCategory = selectedItem.categoryName;
        updatedRows[index].productPrice = selectedItem.productPrice; // Set the productPrice based on the selected product
        updatedRows[index].searchTerm = value;
        updatedRows[index].productName = selectedItem.productName;
        updatedRows[index].searchResults = [];
      }
    } else {
      updatedRows[index][field] = value;
    }
    setTableRows(updatedRows);
  };

  const handleSearch = (index, value) => {
    const updatedRows = [...tableRows];
    updatedRows[index].searchTerm = value;
    updatedRows[index].searchResults = productItems.filter((item) =>
      item.productName.toLowerCase().includes(value.toLowerCase())
    );
    setTableRows(updatedRows);
  };

  const handleBranchChange = (index, value) => {
    const updatedRows = [...branchRows];
    const filteredBranches = branches?.filter((branch) =>
      branch.branchName.toLowerCase().includes(value.toLowerCase())
    );
    updatedRows[index].searchTerm = value;
    updatedRows[index].searchResults = filteredBranches || [];
    setBranchRows(updatedRows);
  };

  const addRow = () => {
    setTableRows([
      ...tableRows,
      {
        productName: "",
        itemQuantity: 0,
        itemCategory: "",
        productPrice: 0,
        productDiscount: 0,
        searchTerm: "",
        searchResults: [],
      },
    ]);
  };

  const addBranchRow = () => {
    setBranchRows([
      ...branchRows,
      {
        branchName: "",
        assignedItem: "",
        quantity: 0,
        searchTerm: "",
        searchResults: [],
      },
    ]);
  };

  const removeRow = (index) => {
    const updatedRows = [...tableRows];
    updatedRows.splice(index, 1);
    setTableRows(updatedRows);
  };

  const removeBranchRow = (index) => {
    const updatedRows = [...branchRows];
    updatedRows.splice(index, 1);
    setBranchRows(updatedRows);
  };

  const calculateTotalAmount = () => {
    let total = 0;

    tableRows.forEach((row) => {
      const itemTotal =
        row.productPrice * row.itemQuantity
      // - row.productDiscount;
      total += itemTotal;
    });

    return {
      total: total.toFixed(2),
    };
  };

  const toast = useToast();
  const handleSubmit = async () => {
    setBtnLoading(true);
    try {
      // Validate the quantity of assigned items
      const mismatchedItems = tableRows.filter((purchasedItem) => {
        const assignedQuantity = branchRows
          .filter(
            (branchRow) => branchRow.assignedItem === purchasedItem.productName
          )
          .reduce((total, branchRow) => total + branchRow.quantity, 0);
        return purchasedItem.itemQuantity !== assignedQuantity;
      });

      if (mismatchedItems.length > 0) {
        const mismatchedItemDetails = mismatchedItems.map((item) => {
          const assignedQuantity = branchRows
            .filter((branchRow) => branchRow.assignedItem === item.productName)
            .reduce((total, branchRow) => total + branchRow.quantity, 0);
          return `${item.productName}: Purchased Quantity(${item.itemQuantity}) != Assigned Quantity(${assignedQuantity})`;
        });

        toast({
          title: "Error",
          description: `Mismatched quantities found:\n${mismatchedItemDetails.join(
            "\n"
          )}`,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        return;
      }

      // Prepare the data for API request
      const purchaseItems = tableRows.map((purchasedItem) => {
        const itemAssignments = branchRows
          .filter(
            (branchRow) => branchRow.assignedItem === purchasedItem.productName
          )
          .map((branchRow) => ({
            quantity: branchRow.quantity,
            branchId: branches.find(
              (branch) => branch.branchName === branchRow.branchName
            ).branchId,
          }));

        return {
          productId: productItems.find(
            (product) => product.productName === purchasedItem.productName
          )?.productId,
          quantity: purchasedItem.itemQuantity,
          discount: purchasedItem.productDiscount,
          productPrice: purchasedItem.productPrice,
          totalAmount: purchasedItem.itemQuantity * purchasedItem.productPrice,
          itemAssignments: itemAssignments,
        };
      });
      const filteredPurchaseItems = purchaseItems.filter(
        (item) => item.productId !== null && item.itemAssignments.length > 0
      );

      // Prepare the data for API request
      const purchaseReturnData = {
        purchaseReturnDate: formData.date,
        purchaseReturnDescription: formData.description,
        totalAmount: calculateTotalAmount().total,
        amountRecieved: amountRecieved,
        paymentStatus: formData.paymentMode,
        paymentMethod: formData.paymentMethod,
        supplierId: selectedSupplier.supplierId,
        items: filteredPurchaseItems,
      };
      // Call the API function to create new purchase return
      await editReturnPurchase(purchaseReturnData, purchaseId);

      toast({
        title: "Purchase return created",
        description:
          "The purchase return record have been created successfully.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      // Call your handleAddUpdateDeleteItem function with formData if needed
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      // Close the drawer or perform any other necessary actions
      onClose();
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
      } else {
        toast({
          title: "Error",
          description:
            "Error creating return purchase, please try again later!",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        console.error("Error creating items:", error);
      }
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
        <HStack>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Supplier Name
            </FormLabel>
            <Input
              type="text"
              placeholder="Search for a supplier"
              value={
                selectedSupplier
                  ? selectedSupplier.firstName
                  : supplierSearchTerm
              }
              style={textStyles}
              onChange={(e) => {
                setSupplierSearchTerm(e.target.value);
                setSelectedSupplier(null);
              }}
            />

            {supplierSearchTerm && supplierSearchResults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {supplierSearchResults.map((result, resultIndex) => (
                  <Box
                    key={resultIndex}
                    p={2}
                    bg={bgColorChild}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        sellerName: result.firstName,
                      });
                      setSelectedSupplier(result); // Step 4: Set the selected supplier object
                      setSupplierSearchTerm("");
                    }}
                  >
                    {result.firstName}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Date
            </FormLabel>
            <Input
              type="date"
              value={formData.date ? moment(formData.date).format('YYYY-MM-DD') : ''}
              style={textStyles}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </Box>
          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Payment Status
            </FormLabel>
            <Select
              placeholder="Select payment status"
              value={formData.paymentMode}
              style={textStyles}
              onChange={(e) =>
                setFormData({ ...formData, paymentMode: e.target.value })
              }
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partially Paid</option>
              <option value="paid">Paid</option>
            </Select>
          </Box> */}

          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Payment Mode
            </FormLabel>
            <Select
              placeholder="Select payment mode"
              value={formData.paymentMethod}
              style={textStyles}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
            >
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
            </Select>
          </Box> */}
        </HStack>
        <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
          <FormLabel fontWeight="bold" mb={2}>
            Description
          </FormLabel>
          <Input
            type="text"
            placeholder="Enter description"
            value={formData.description}
            style={textStyles}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </Box>
        <TableContainer my={4}>
          <Table size="sm" variant="striped">
            <Thead>
              <Tr>
                <Th>Item Name</Th>
                <Th>Quantity</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                {/* <Th>Dicount</Th> */}
                <Th>Total</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tableRows.map((row, index) => (
                <Tr key={index}>
                  <Td>
                    <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                      <Input
                        type="text"
                        placeholder="Search for an item"
                        value={row.searchTerm}
                        style={textStyles}
                        onChange={(e) => handleSearch(index, e.target.value)}
                      />
                      {row.searchTerm && row.searchResults.length > 0 && (
                        <VStack
                          align="start"
                          spacing={2}
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          mt={1}
                        >
                          {row.searchResults.map((result, resultIndex) => (
                            <Box
                              key={resultIndex}
                              p={2}
                              bg={bgColorChild}
                              borderWidth="1px"
                              borderColor="gray.200"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => {
                                handleInputChange(
                                  index,
                                  "productName",
                                  result.productName
                                );
                              }}
                            >
                              {result.productName}
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={row.itemQuantity}
                      style={textStyles}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "itemQuantity",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </Td>
                  <Td>
                    <Input
                      type="text"
                      placeholder="Category"
                      value={row.itemCategory}
                      style={textStyles}
                      readOnly
                    />
                  </Td>
                  <Td>
                    <Input
                      type="number"
                      placeholder="Price"
                      value={row.productPrice}
                      style={textStyles}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "productPrice",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </Td>
                  {/* <Td>
                    <Input
                      type="number"
                      placeholder="Discount"
                      value={row.productDiscount}
                      style={textStyles}
                      onChange={(e) =>
                        handleInputChange(
                          index,
                          "productDiscount",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </Td> */}
                  <Td>
                    <Input
                      type="number"
                      placeholder="Total"
                      value={
                        row.productPrice * row.itemQuantity
                      }
                      style={textStyles}
                      readOnly
                    />
                  </Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      onClick={() => removeRow(index)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        <Flex justify="center" align="center">
          <Button
            variant="outline"
            colorScheme="teal"
            fontWeight="light"
            onClick={addRow}
            size="sm"
          >
            <AddIcon mr={2} />
            Add Item
          </Button>
        </Flex>

        <Box
          justifySelf="end"
          bg={bgColorChild}
          borderRadius="lg"
          p={4}
          my={2}
          textAlign="end"
          fontSize="lg"
        >
          <Flex gap={5} justify="end">
            <VStack align="start" justify="center">
              {/* <Text fontWeight="semibold">
                Less Discount:
              </Text> */}
              {/* <FormLabel fontWeight="bold">Final Discount:</FormLabel> */}
              <Text fontWeight="semibold">Total Amount:</Text>
              {/* <Text
                fontWeight="semibold"
                mt={2}
                display={formData.paymentMode === "unpaid" ? "none" : "flex"}
              >
                Amount Received:
              </Text> */}
            </VStack>

            <VStack align="end" justify="center">
              <Text fontWeight="semibold">
                {calculateTotalAmount().total}
              </Text>
              {/* <HStack justifyContent="end"> */}
              {/* <Input
                w="5rem"
                type="number"
                value={finalDiscount}
                onChange={(e) => setFinalDiscount(parseFloat(e.target.value))}
              /> */}
              {/* </HStack> */}
              {/* <Text fontWeight="semibold">
                {calculateTotalAmount().total - finalDiscount}
              </Text> */}
              {/* <Input
                w="5rem"
                type="number"
                display={formData.paymentMode === "unpaid" ? "none" : "flex"}
                value={amountRecieved}
                onChange={(e) => setAmountRecieved(parseFloat(e.target.value))}
              /> */}
            </VStack>
          </Flex>
        </Box>
        <Heading fontSize="md" textAlign="center" my={4}>
          Assign to Branch(s)
        </Heading>
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Branch</Th>
                <Th>Item</Th>
                <Th>Quantity</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {branchRows.map((row, index) => (
                <Tr key={index}>
                  <Td>
                    <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                      <Input
                        type="text"
                        placeholder="Search for a branch"
                        value={row.searchTerm}
                        style={textStyles}
                        onChange={(e) =>
                          handleBranchChange(index, e.target.value)
                        }
                      />
                      {row.searchTerm && row.searchResults.length > 0 && (
                        <VStack
                          align="start"
                          spacing={2}
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          mt={1}
                        >
                          {row.searchResults.map((result, resultIndex) => (
                            <Box
                              key={resultIndex}
                              p={2}
                              bg="white"
                              borderWidth="1px"
                              borderColor="gray.200"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => {
                                const updatedRows = [...branchRows];
                                updatedRows[index].branchName =
                                  result.branchName;
                                updatedRows[index].searchTerm =
                                  result.branchName;
                                updatedRows[index].searchResults = [];
                                setBranchRows(updatedRows);
                              }}
                            >
                              {result.branchName}
                            </Box>
                          ))}
                        </VStack>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    <Select
                      placeholder="Select an item"
                      value={row.assignedItem}
                      style={textStyles}
                      onChange={(e) => {
                        const updatedRows = [...branchRows];
                        updatedRows[index].assignedItem = e.target.value;
                        setBranchRows(updatedRows);
                      }}
                    >
                      {filteredProducts.map((product, productIndex) => (
                        <option key={productIndex} value={product.productName}>
                          {product.productName}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={row.quantity}
                      style={textStyles}
                      onChange={(e) => {
                        const updatedRows = [...branchRows];
                        updatedRows[index].quantity = parseInt(e.target.value);
                        setBranchRows(updatedRows);
                      }}
                    />
                  </Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                      onClick={() => removeBranchRow(index)} // Call the removeBranchRow function
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Add a button to add a new branch row */}
        <Flex justify="center" align="center">
          <Button
            variant="outline"
            colorScheme="teal"
            fontWeight="light"
            onClick={addBranchRow}
            size="sm"
          >
            <AddIcon mr={2} />
            Add Branch
          </Button>
        </Flex>
        <Button
          variant="solid"
          colorScheme="blue"
          onClick={handleSubmit}
          mt={4}
          isLoading={btnLoading}
        >
          Edit Purchase
        </Button>
      </FormControl>
    </Box>
  );
};

export default ReturnEdit;
