import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
// import { getAllProducts } from "../../../../api/productAPI";
// import { getBranches } from "../../../../api/branchAPI";
// import { createPurchase } from "../../../../api/purchasingAPI";
// import { getAllcustomers } from "../../../../api/customerAPI";
import { createNewSale } from "../../../../api/saleAPI";
import {
  getAllCustomers,
  getAllCustomersByBranchId,
} from "../../../../api/customerAPI";
// import { addNewSale } from "../../../../api/saleAPI";
import { FaExclamation } from "react-icons/fa";
import { getInventoryByBranch } from "../../../../api/inventoryAPI";
import { createNewTransfer } from "../../../../api/transferAPI";
import { branchId, role } from "../../../../api/constants";
import { Reorder } from "framer-motion";
import { fetchAccountsByBranchId } from "../../../../api/cashBookAPI";
import { useBgColorChild } from "../../../../utlis/colors";
import moment from "moment";
import { getAllProducts } from "../../../../api/productAPI";

function AddNewSale({ handleAddUpdateDeleteItem, onClose }) {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
  // const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };
  const [btnLoading, setBtnLoading] = useState(false);
  const [amountRecieved, setAmountRecieved] = useState(0);
  const [customerSearchTerm, setcustomerSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [quantityConflict, setQuantityConflict] = useState(false);
  const customerSearchResults = customers.filter((customer) =>
    customer.firstName.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    sellerName: "",
    date: moment().format('YYYY-MM-DD'), // Set current date in YYYY-MM-DD format

    paymentStatus: "paid",
    description: "",
    paymentMethod: "",
  });
  const [tableRows, setTableRows] = useState([
    {
      productName: "",
      itemAvailableQuantity: 0,
      itemQuantity: 0,
      productId: 0,
      itemCategory: "",
      productPrice: 0, // Add productPrice
      productDiscount: 0, // Add productPrice
      searchTerm: "",
      searchResults: [],
    },
  ]);

  const [productItems, setProductItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products =  await getAllProducts();
        const productsData = await getInventoryByBranch(branchId);
        
        // view set hoga whn se id ayegi
        setProductItems(products.products);

      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);
  // const addedProductNames = tableRows.map((row) => row.productName);
  // const filteredProducts = productItems.filter((product) =>
  //   addedProductNames.includes(product.productName)
  // );
  const handleInputChange = (index, field, value) => {
    const updatedRows = [...tableRows];
    if (field === "productName") {
      // Find the selected item based on the value
      const selectedItem = productItems.find(
        (item) => item.productName === value
      );
      if (selectedItem) {
        updatedRows[index].itemCategory = selectedItem.categoryName;
        updatedRows[index].itemAvailableQuantity = selectedItem.itemQuantity;
        updatedRows[index].productPrice = selectedItem.productPrice;
        updatedRows[index].productId = selectedItem.productId;
        updatedRows[index].searchTerm = value;
        updatedRows[index].productName = selectedItem.productName;
        updatedRows[index].searchResults = []; // Clear search results when a product is selected
      }
    } else {
      updatedRows[index][field] = value;
    }
    setTableRows(updatedRows);
    if (
      updatedRows[index].itemQuantity > updatedRows[index].itemAvailableQuantity
    ) {
      setQuantityConflict(true);
    } else {
      setQuantityConflict(false);
    }
  };

  const handleSearch = (index, value) => {


    const updatedRows = [...tableRows];
    updatedRows[index].searchTerm = value;
    updatedRows[index].searchResults = productItems.filter((item) =>
      item.productName.toLowerCase().includes(value.toLowerCase())
    );
    setTableRows(updatedRows);
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

  const removeRow = (index) => {
    const updatedRows = [...tableRows];
    updatedRows.splice(index, 1);
    setTableRows(updatedRows);
  };

  const [discount, setDiscount] = useState(0); // Initialize discount state with 0

  const handleDiscountChange = (event) => {
    const enteredDiscount = parseFloat(event.target.value); // Parse the entered value as a float
    setDiscount(enteredDiscount); // Update the discount state with the entered value
  };

  const calculateTotalAmount = (enteredDiscount) => {
    let total = 0;
    let totalDiscount = 0;

    tableRows.forEach((row) => {
      total += row.productPrice * row.itemQuantity;
      totalDiscount += row.productDiscount || 0; // Consider default value if discount is undefined
    });

    // Subtract the entered discount from the total amount
    const lessDiscount = total - enteredDiscount;

    return {
      total: (total - discount).toFixed(2),
      lessDiscount: lessDiscount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
    };
  };

  const [accountOne, setAccountOne] = useState("");
  const [accountOneSearchTerm, setAccountOneSearchTerm] = useState("");
  const [accountTwoSearchTerm, setAccountTwoSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);

  const fetchAccounts = async () => {
    try {
      const response = await fetchAccountsByBranchId(branchId);
      const { Customers, Suppliers } = response;

      // const accounts = [];
      // Customers.forEach((customer) => {
      //   accounts.push({
      //     type: "CUSTOMER",
      //     firstName: customer.firstName,
      //     id: customer.customerId,
      //   });
      // });
      // Suppliers.forEach((supplier) => {
      //   accounts.push({
      //     type: "SUPPLIER",
      //     firstName: supplier.firstName,
      //     id: supplier.supplierId,
      //   });
      // });
      const allAccounts = [
        ...(Customers || []).map(customer => ({ ...customer, type: 'CUSTOMER' , id:customer.customerId})),
        ...(Suppliers || []).map(supplier => ({ ...supplier, type: 'SUPPLIER' ,id: supplier.supplierId}))
    ];
      setAccounts(allAccounts);
      // Combine both Customers and Suppliers into one array
      // const allAccounts = [...(Customers || []), ...(Suppliers || [])];
      // setAccounts(allAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);


  const accountOneSearchResults = accounts?.filter((user) =>
    user.firstName
      .toLocaleLowerCase()
      .includes(accountOneSearchTerm.toLocaleLowerCase())
  );

  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        let customersData;
        if (role === "admin") customersData = await getAllCustomers();
        else customersData = await getAllCustomersByBranchId();

        setCustomers(customersData);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);
  const toast = useToast();
  const handleSubmit = async () => {
    setBtnLoading(true);
    // Prepare the payload based on your API structure
    const isSupplier = accountOne?.type === "CUSTOMER" ? 0 : 1;

    const salePayload = {
      saleDate: formData.date,
      paymentMethod: formData.paymentMethod,
      saleDescription: formData.description,
      totalAmount: parseFloat(calculateTotalAmount(discount).total),
      paymentStatus: formData.paymentStatus,
      // customerId: selectedCustomer.customerId, // Assuming you have an id property in your customer object
      branchId: branchId, // Replace with the actual branchId
      amountRecieved: amountRecieved,
      discount: discount,
      isSupplier: isSupplier,
      supplierId: isSupplier === 1 ? accountOne.id : null,
      customerId: isSupplier !== 1 ? accountOne.id : null,
      items: tableRows.map((row) => ({
        productId: row.productId, // Assuming you have an id property in your product object
        quantity: row.itemQuantity,
        productPrice: row.productPrice,
        totalAmount:
          (row.productPrice - row.productDiscount) * row.itemQuantity,
        discount: row.productDiscount,
      })),
    };
    // console.log("salePayload", salePayload);

    try {
      // Call the API function to add a new sale
      await createNewSale(salePayload);
      toast({
        title: "Sale Added",
        description: "The sale has been added successfully.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      handleAddUpdateDeleteItem();
      setBtnLoading(false);
      onClose();
      // Optionally, you can handle success, close the modal, or navigate to another page
    } catch (error) {
      console.error("Error adding sale:", error);

      let errorMessage = "An error occurred while adding the sale.";

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // If the server returns a specific error message, use that
        errorMessage = error.response.data.message;
      }

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

  const handleQuantityConflict = async (index) => {
    // Assuming productId and branchId are available in your productItems array
    const { productId, itemQuantity } = tableRows[index];


    try {
      // Create a new transfer with the given productId, branchId, and quantity
      await createNewTransfer({
        branchId,
        productId,
        date: new Date().toISOString().split("T")[0], // Set the current date
        quantity: itemQuantity,
      });

      // Remove the conflicting row from the table
      toast({
        title: "Item Requested",
        description: "Admin has been notified for item request.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });

      removeRow(index);
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
        console.error("Error creating transfer:", error);

        toast({
          title: "Error",
          description: "An error occurred while creating the transfer.",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
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
        <HStack>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Account Name
            </FormLabel>
            <Input
              type="text"
              value={accountOne?.firstName}
              placeholder="Search for customer or supplier"
              onChange={(e) => {
                // setId(customer?.customerId);
                // setAccountName(selectedUser?.firstName)
                setAccountOneSearchTerm(e.target.value);
                setAccountOne(null);
              }}
            />
            {accountOneSearchTerm && accountOneSearchResults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {accountOneSearchResults.map((result, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg={useBgColorChild}
                    borderWidth="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      // setFormData({
                      //     ...formData,
                      //     sellerName: result?.firstName,
                      // });
                      setAccountOne(result); // Step 4: Set the selected customer object
                      setAccountOneSearchTerm("");
                    }}
                  >
                    {result.type + " | " + result?.firstName}
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
              value={formData.date}
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
              value={formData.paymentStatus}
              style={textStyles}
              onChange={(e) =>
                setFormData({ ...formData, paymentStatus: e.target.value })
              }
            >
              <option value="paid">Paid</option>
              <option value="partial">Partially paid</option>
              <option value="unpaid">Unpaid</option>
            </Select>
          </Box> */}
          {/* <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Payment Method
            </FormLabel>
            <Select
              placeholder="Select payment Method"
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
                {/* <Th>Available Quantity</Th> */}
                <Th>Category</Th>
                <Th>Quantity</Th>
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
                  {/* <Td>
                    <Input
                      type="number"
                      placeholder="Available Quantity"
                      value={row.itemAvailableQuantity}
                      style={textStyles}
                      readOnly
                    />
                  </Td> */}
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
                      placeholder="Item Quantity"
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
                        (row.productPrice - row.productDiscount) *
                        row.itemQuantity
                      }
                      style={textStyles}
                      readOnly
                    />
                  </Td>
                  <Td>
                    <ButtonGroup>
                      <Tooltip label="Request Item">
                        <IconButton
                          icon={<FaExclamation />}
                          variant="solid"
                          colorScheme="yellow"
                          size="sm"
                          display={quantityConflict ? "flex" : "none"}
                          onClick={() => handleQuantityConflict(index)}
                        />
                      </Tooltip>
                      <IconButton
                        icon={<DeleteIcon />}
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={() => removeRow(index)}
                      />
                    </ButtonGroup>
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
        <Flex
          justify="end"
          bg={bgColorChild}
          borderRadius="lg"
          p={4}
          my={2}
          textAlign="end"
          fontSize="lg"
          gap={5}
        >
          <VStack gap={4} align="start" justify="center">
            <Text fontWeight="semibold">Less Discount:</Text>
            <Text fontWeight="semibold">Total Amount:</Text>
            {/* <Text fontWeight="semibold">Received Amount:</Text> */}
          </VStack>
          <VStack align="start" justify="center">
            <Input
              type="number"
              w="5rem"
              value={discount} // Set the value of the input field to the discount state
              onChange={handleDiscountChange} // Handle changes in the input field
            />
            <Text fontWeight="semibold">
              {calculateTotalAmount(discount).total}
            </Text>
            {/* <Input
              type="number"
              w="5rem"
              value={amountRecieved}
              onChange={(e) => setAmountRecieved(parseFloat(e.target.value))}
            /> */}
          </VStack>
        </Flex>

        <Button
          variant="solid"
          colorScheme="blue"
          onClick={handleSubmit}
          mt={4}
          isLoading={btnLoading}
        >
          Add Sale
        </Button>
      </FormControl>
    </Box>
  );
}

export default AddNewSale;
