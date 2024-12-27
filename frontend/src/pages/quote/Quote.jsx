import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
// import { getAllProducts } from "../../api/productAPI";
// import { getBranches } from "../../api/branchAPI";
// import { createPurchase } from "../../api/purchasingAPI";
// import { getAllcustomers } from "../../api/customerAPI";
import { createNewSale } from "../../api/saleAPI";
import {
  getAllCustomers,
  getAllCustomersByBranchId,
} from "../../api/customerAPI";
// import { Quote } from "../../api/saleAPI";
import { FaExclamation, FaFilePdf } from "react-icons/fa";
import { getInventoryByBranch } from "../../api/inventoryAPI";
import { createNewTransfer } from "../../api/transferAPI";
import { branchId, branchName, role } from "../../api/constants";
import { Reorder } from "framer-motion";
import { fetchAccountsByBranchId } from "../../api/cashBookAPI";
import { useBgColorChild } from "../../utlis/colors";
import moment from "moment";
import { newPdf } from "../../utlis/NewPdf";
import { getSettings } from "../../api/settingsApi";

function Quote({ sideBarWidth, handleAddUpdateDeleteItem, onClose }) {
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
    date: moment().format("YYYY-MM-DD"), // Set current date in YYYY-MM-DD format

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
        const productsData = await getInventoryByBranch(branchId); // view set hoga whn se id ayegi
        setProductItems(productsData.inventoryItems);
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
      if (!selectedItem) {
     
        updatedRows[index][field] = value;
      }
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

  let [accountOne, setAccountOne] = useState("");
  let [accountOneSearchTerm, setAccountOneSearchTerm] = useState("");
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
        ...(Customers || []).map((customer) => ({
          ...customer,
          type: "CUSTOMER",
          id: customer.customerId,
        })),
        ...(Suppliers || []).map((supplier) => ({
          ...supplier,
          type: "SUPPLIER",
          id: supplier.supplierId,
        })),
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
  const [settings, setSettings] = useState({}); // Initialize as an empty object
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const result = await getSettings();
      
        setSettings(result.settings);
      } catch (error) {
        // Handle the error, e.g., show an error message
        console.error("Error fetching data:", error);
      }
    };

    fetchSettings();
  }, []);

  const handlePdfDownload = () => {
   
    newPdf(
      tableRows,
      accountOne.firstName,
      branchName,
      formData.date,
      formData.description,
      settings
    );
  };
  const handleClear = () => {
    setTableRows([]);
    accountOne = null;
    setAccountOneSearchTerm("");
    formData.date = "";
    formData.description = "";
  };
  return (
    <Box bg={bgColor} py={8} w="auto" minH="100vh">
      <Container maxW="container.xxl" justifySelf="center">
        <Box
          ml={{ base: 0, lg: sideBarWidth === "small" ? 14 : 60 }}
          transition="margin 0.3s ease-in-out"
        >
          <Heading pb={2}>Quick Quote</Heading>
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
                      setAccountOneSearchTerm(e.target.value);
                      setAccountOne({
                        ...accountOne, // Keep all existing properties of accountOne
                        firstName: e.target.value, // Update firstName property
                      });
                    }}
                  />
                  {accountOneSearchTerm &&
                    accountOneSearchResults.length > 0 && (
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
              </HStack>

              <TableContainer my={4}>
                <Table size="sm" variant="striped">
                  <Thead>
                    <Tr>
                      <Th>Item Name</Th>
                      <Th>Available Quantity</Th>
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
                          <Box
                            borderWidth="1px"
                            p={2}
                            borderRadius="md"
                            width="100%"
                          >
                            <Input
                              type="text"
                              placeholder="Search for an item"
                              value={row.searchTerm}
                              style={textStyles}
                              onChange={(e) => {
                                handleSearch(index, e.target.value);
                                handleInputChange(
                                  index,
                                  "productName",
                                  e.target.value
                                );
                              }}
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
                                {row.searchResults.map(
                                  (result, resultIndex) => (
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
                                  )
                                )}
                              </VStack>
                            )}
                          </Box>
                        </Td>
                        <Td>
                          <Input
                            type="number"
                            placeholder="Available Quantity"
                            value={row.itemAvailableQuantity}
                            style={textStyles}
                            readOnly
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
              <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                <FormLabel fontWeight="bold" mb={2}>
                  Terms & Conditions
                </FormLabel>
                <Textarea
                  type="text"
                  placeholder="Enter terms and conditions"
                  value={formData.description}
                  style={textStyles}
                  minH="15vw"
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Box>
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
                colorScheme="red"
                onClick={handlePdfDownload}
                leftIcon={<FaFilePdf />}
                mr={2}
                isDisabled={
                  tableRows.length > 0 && formData.date ? false : true
                }
                size="sm"
              >
                Download PDF
              </Button>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={handleClear}
                size="sm"
              >
                Clear All
              </Button>
            </FormControl>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Quote;
