import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
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
import {
  getSaleDetails,
  updateSaleById,
} from "../../../../api/saleAPI";
import { getAllCustomers } from "../../../../api/customerAPI";
import { FaExclamation } from "react-icons/fa";
import { getInventoryByBranch } from "../../../../api/inventoryAPI";
import { createNewTransfer } from "../../../../api/transferAPI";
import { branchId } from "../../../../api/constants";
import { getAllSuppliers } from "../../../../api/supplierAPI";

function EditSale({ handleAddUpdateDeleteItem, onClose, invoiceId }) {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("gray.400", "gray.600");
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
  const [selectedUser, setSelectedUser] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [quantityConflict, setQuantityConflict] = useState(false);

  const [accounts, setAccounts] = useState([]);
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
  const [saleData, setSaleData] = useState(null);
  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const saleDetails = await getSaleDetails(invoiceId);

        // Set the customer, date, and other form data
        const { sale, items } = saleDetails;

        // setcustomerSearchTerm(sale.customerName)
        setSelectedUser({
          firstName: sale.customerName,
          type: sale.isSupplier ? "SUPPLIER" : "CUSTOMER",
          ...(sale.isSupplier
            ? { supplierId: sale.supplierId }
            : { customerId: sale.customerId }),
        });
         // Step 4: Set the selected customer object
        setUserSearchTerm("");
        setSaleData(sale);
        setFormData({
          sellerName: sale.customerName,
          date: sale.saleDate,
          paymentStatus: sale.paymentStatus,
          description: sale.saleDescription,
          paymentMethod: sale.paymentMethod,
        });

        // Set the table rows based on the fetched items
        const rows = items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          itemQuantity: item.quantity,
          itemCategory: item.categoryName,
          productPrice: item.unitPrice,
          productDiscount: item.discount,
          itemAvailableQuantity: item.availableQuantity,
          searchTerm: item.productName,
          searchResults: [], // Assuming you don't want to show search results for fetched items
        }));
        setTableRows(rows);

        // Set the discount and amount received
        setDiscount(sale.discount || 0);
        setAmountRecieved(sale.amountRecieved || 0);
      } catch (error) {
        console.error("Error fetching sale details:", error);
      }
    };

    if (invoiceId) {
      fetchSaleDetails();
    }
  }, [invoiceId]);

  const [formData, setFormData] = useState({
    sellerName: saleData?.customerName || "",
    date: saleData?.saleDate || "",
    paymentMode: saleData?.paymentStatus || "",
    description: saleData?.saleDescription || "",
    paymentMethod: saleData?.paymentMethod || "",
  });
  const [tableRows, setTableRows] = useState([
    {
      productId: 0,
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
        updatedRows[index].productPrice = selectedItem.productPrice; // Set the productPrice based on the selected product
        updatedRows[index].productId = selectedItem.productId; // Set the productPrice based on the selected product
        updatedRows[index].searchTerm = value;
        updatedRows[index].productName = selectedItem.productName;
        updatedRows[index].searchResults = [];
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

  const toast = useToast();
  const handleSubmit = async () => {
    setBtnLoading(true);
    // Prepare the payload based on your API structure
    const salePayload = {
      saleDate: formData.date,
      // paymentMethod: formData.paymentMethod,
      saleDescription: formData.description,
      totalAmount: parseFloat(calculateTotalAmount(discount).total),
      // paymentStatus: formData.paymentStatus,
      branchId: branchId, // Replace with the actual branchId
      amountRecieved: amountRecieved,
      isSupplier: saleData.isSupplier,
      supplierId: saleData.isSupplier ?  selectedUser.supplierId : null,
      customerId: saleData.isSupplier ? null : selectedUser.customerId,
      discount: discount,
      items: tableRows.map((row) => ({
        productId: row.productId, // Assuming you have an id property in your product object
        quantity: row.itemQuantity,
        productPrice: row.productPrice,
        totalAmount:
          (row.productPrice - row.productDiscount) * row.itemQuantity,
        discount: row.productDiscount,
      })),
    };

 
    try {
      // Call the API function to add a new sale
      await updateSaleById(salePayload, invoiceId);
      toast({
        title: "Sale Updated",
        description: "The sale has been updated successfully.",
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
      console.error("Error updating sale:", error);

      let errorMessage = "An error occurred while updating the sale.";

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
    const branchId = 1; // Replace with the actual branchId

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
    saleData && (
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
                {saleData.isSupplier ? "Supplier Name" : "Customer Name"}
              </FormLabel>

              <Input
                type="text"
                placeholder={`Search for a ${
                  saleData.isSupplier ? "supplier" : "customer"
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
                  formData.date
                    ? moment(formData.date).format("YYYY-MM-DD")
                    : ""
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
            Edit Sale
          </Button>
        </FormControl>
      </Box>
    )
  );
}

export default EditSale;
