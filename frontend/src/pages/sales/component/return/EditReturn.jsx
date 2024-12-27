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
import { getAllCustomers } from "../../../../api/customerAPI";
import {
  getSalesReturnById,
  updateReturnSaleById,
} from "../../../../api/returnSaleAPI";
import { branchId } from "../../../../api/constants";
import { getAllSuppliers } from "../../../../api/supplierAPI";

function EditReturn({ invoiceId, handleAddUpdateDeleteItem, onClose }) {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
  const textColor = useColorModeValue("black", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [selectedUser, setSelectedUser] = useState("");

  const [accounts, setAccounts] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const textStyles = {
    border: "1px solid grey",
    backgroundColor: "transparent",
    width: "100%",
    padding: "0.5rem",
    borderRadius: "0.5rem",
  };
  const [btnLoading, setBtnLoading] = useState(false);
  const [customerSearchTerm, setcustomerSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const customerSearchResults = customers.filter((customer) =>
    customer.firstName.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    sellerName: "",
    date: "",
    paymentStatus: "paid",
    paymentMethod: "cash",
    description: "",
    location: "",
    isSupplier: "",
  });
  const [tableRows, setTableRows] = useState([
    {
      productName: "",
      itemQuantity: 0,
      productId: 0,
      itemCategory: "",
      productPrice: 0, // Add productPrice
      productDiscount: 0, // Add productPrice
      searchTerm: "",
      searchResults: [],
    },
  ]);

  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        // Replace '5' with the actual purchase ID you want to fetch
        let purchaseData;
        purchaseData = await getSalesReturnById(invoiceId);

        // Set the state or perform other actions with the purchase data
        const { sale, items } = purchaseData;

    

        setSelectedUser({
          firstName: sale.customerName,
          type: sale.isSupplier ? "SUPPLIER" : "CUSTOMER",
          ...(sale.isSupplier
            ? { supplierId: sale.supplierId }
            : { customerId: sale.customerId }),
        });

        // Set purchase form data
        const formattedDate = new Date(sale.salesReturnDate)
          .toISOString()
          .split("T")[0];
        setFormData({
          sellerName: sale.supplierName,
          date: formattedDate,
          paymentStatus: sale.paymentStatus, // Corrected field name
          description: sale.salesReturnDescription,
          paymentMethod: sale.paymentMethod,
          location: sale.salesReturnLocation,
        });

        // Set item rows
        const tableRowsData = items.map((item) => ({
          productName: item.productName,
          itemQuantity: item.quantity,
          itemCategory: item.categoryName,
          productPrice: item.unitPrice,
          productDiscount: item.discount,
          searchTerm: item.productName,
          productId: item.productId,
          searchResults: [],
        }));
        setTableRows(tableRowsData);
      } catch (error) {
        console.error("Error fetching purchase data:", error.message);
      }
    };

    // Call the fetchPurchaseData function when the component mounts
    fetchSaleData();
  }, [invoiceId]);
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
      const selectedItem = productItems.find(
        (item) => item.productName === value
      );
      if (selectedItem) {
        updatedRows[index].itemCategory = selectedItem.categoryName;
        updatedRows[index].productPrice = selectedItem.productPrice;
        updatedRows[index].productId = selectedItem.productId;
        updatedRows[index].searchTerm = value;
        updatedRows[index].productName = value; // Update the productName field
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
  const [amountPaid, setAmountPaid] = useState(0); // Initialize discount state with 0

  const handleDiscountChange = (event) => {
    const enteredDiscount = parseFloat(event.target.value); // Parse the entered value as a float
    setDiscount(enteredDiscount); // Update the discount state with the entered value
  };
  const handleAmountChange = (event) => {
    const enteredAmount = parseFloat(event.target.value); // Parse the entered value as a float
    setAmountPaid(enteredAmount); // Update the discount state with the entered value
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

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // const response = await fetchAccountsByBranchId(branchId);
        // const { Customers, Suppliers } = response;
        const Customers = await getAllCustomers();
        const Suppliers = await getAllSuppliers();
        // Combine both Customers and Suppliers into one array
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
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);
  const userSearchresults = accounts?.filter((user) =>
    user.firstName
      .toLocaleLowerCase()
      .includes(userSearchTerm.toLocaleLowerCase())
  );
  const toast = useToast();
  const handleSubmit = async () => {
    setBtnLoading(true);
    // Prepare the payload based on your API structure

    const salePayload = {
      salesReturnDate: formData.date,
      salesReturnDescription: formData.description,
      salesReturnLocation: formData.location,
      totalAmount: parseFloat(calculateTotalAmount(discount).total),
      paymentStatus: formData.paymentStatus,
      paymentMethod: formData.paymentMethod,
      isSupplier: formData.isSupplier,
      supplierId: formData.isSupplier ? formData.supplierId : null,
      customerId: formData.isSupplier ? null : formData.customerId,
      branchId: branchId, // Replace with the actual branchId
      discount: discount,
      items: tableRows.map((row) => ({
        productId: row.productId, // Assuming you have an id property in your product object
        quantity: row.itemQuantity,
        productPrice: row.productPrice,
        totalAmount: row.productPrice * row.itemQuantity,
        discount: row.productDiscount,
      })),
      // amountPaid:
    };

    try {
      // Call the API function to add a new sale
      await updateReturnSaleById(salePayload, invoiceId);
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
              Search name
            </FormLabel>

            <Input
              type="text"
              placeholder={`Search for a ${
                formData.isSupplier ? "supplier" : "customer"
              }`}
              value={
                selectedUser
                  ? `${selectedUser.firstName} (${selectedUser.type})`
                  : userSearchTerm
              }
              // disabled='true'
              style={textStyles}
              onChange={(e) => {
                setUserSearchTerm(e.target.value);
                setSelectedUser(null);
               
              }}
            />

            {userSearchTerm && userSearchresults.length > 0 && (
              <VStack
                align="start"
                spacing={2}
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="md"
                mt={1}
              >
                {userSearchresults.map((result, resultIndex) => (
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
                      setSelectedUser(result); // Step 4: Set the selected customer object
                      setUserSearchTerm("");
                    }}
                  >
                    {/* {result.firstName + result.type} */}
                    {result.firstName} ({result.type})`
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
              value={
                formData.date ? moment(formData.date).format("YYYY-MM-DD") : ""
              }
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
              <option value="partially">Partially paid</option>
              <option value="unpaid">Unpaid</option>
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
        <Flex direction={{ base: "column", md: "row" }}>
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
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <FormLabel fontWeight="bold" mb={2}>
              Return Location
            </FormLabel>
            <Input
              type="text"
              placeholder="Enter return location."
              value={formData.location}
              style={textStyles}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </Box>
        </Flex>
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
                      value={row.productPrice * row.itemQuantity}
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
            {/* <Text fontWeight="semibold">Less Discount:</Text> */}
            <Text fontWeight="semibold">Total Amount:</Text>
            <Text fontWeight="semibold">Paid Amount:</Text>
          </VStack>
          <VStack align="start" justify="center">
            {/* <Input
              type="number"
              w="5rem"
              value={discount} // Set the value of the input field to the discount state
              onChange={handleDiscountChange} // Handle changes in the input field
            /> */}
            <Text fontWeight="semibold">
              {calculateTotalAmount(discount).total}
            </Text>
            <Input
              type="number"
              w="5rem"
              value={amountPaid} // Set the value of the input field to the discount state
              onChange={handleAmountChange} // Handle changes in the input field
            />
          </VStack>
        </Flex>

        <Button
          variant="solid"
          colorScheme="blue"
          onClick={handleSubmit}
          mt={4}
          isLoading={btnLoading}
        >
          Edit Sale
        </Button>
      </FormControl>
    </Box>
  );
}

export default EditReturn;
