import React, { useEffect, useState } from "react";
import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Text,
    useColorModeValue,
    Button,
    InputGroup,
    InputLeftElement,
    Select,
    Flex,
    Input,
    useToast,
    Badge,
    ButtonGroup,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel, // Add this import
} from "@chakra-ui/react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { HiDotsVertical } from "react-icons/hi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { MdOutlinePayment } from "react-icons/md";
import {
    BiSearch,
    BiChevronLeft,
    BiChevronRight,
    BiShow,
} from "react-icons/bi";
import { deletePurchase, deletePurchaseById, fetchPurchases } from "../../../../api/purchasingAPI";
import Loading from "../../../../components/Loading/Loading";
import Drawers from "../Drawers";
import DeleteAlert from "../../../../components/DeleteAlert";
import { FaFilePdf } from "react-icons/fa6";
import { purchasesPdf } from "../../../../utlis/PurchasesPdf";

const AllNewPurchase = () => {
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedDrawerType, setSelectedDrawerType] = useState("");
    const [selectedItemData, setSelectedItemData] = useState(null);
    const bgColor = useColorModeValue("white", "gray.700");
    const itemsPerPage = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [purchases, setPurchases] = useState([]); // State to store API response
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch purchases from the API
    const fetchPurchasesData = async () => {
        try {
            const { purchases } = await fetchPurchases();
            // //
            setPurchases(purchases);
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching purchases:", error);
        }
    };

    useEffect(() => {
        fetchPurchasesData(); // Fetch purchases when the component mounts
    }, []);
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const resetPage = (event) => {
        setCurrentPage(1);
      }

    const handleSearchChange = (event) => {
        const searchText = event.target.value?.toLowerCase();
        setSearchTerm(searchText);
    };

    const handleCategoryChange = (event) => {
        const category = event.target.value;
        setSelectedCategory(category);
    };

    const toast = useToast(); // Initialize useToast

    // Filter items based on search and selected category
    const filteredItems = purchases.filter(
        (item) =>
            // item.purchaseName?.toLowerCase().includes(searchTerm) ||
            item.purchaseDescription?.toLowerCase().includes(searchTerm) ||
            item.supplierName?.toLowerCase().includes(searchTerm) ||
            item.invoiceId.toString().toLowerCase().includes(searchTerm)
    );
    

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const openDrawer = (drawerType, itemData) => {
        setSelectedDrawerType(drawerType);
        setSelectedItemData(itemData);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedDrawerType("");
        setSelectedItemData(null);
    };

    const handleDeleteClick = (itemId) => {
        setSelectedItemId(itemId);
        setIsDeleteAlertOpen(true);
    };

    // Handle confirmation of item deletion
    const handleConfirmDelete = async () => {
        try {
            await deletePurchaseById(selectedItemId);

            fetchPurchasesData();

            toast({
                title: "Item Deleted",
                status: "success",
                position: "top-right",
                duration: 3000,
                isClosable: true,
            });

            // Close the delete confirmation dialog
            setIsDeleteAlertOpen(false);
        } catch (error) {
            // Handle any errors that may occur during deletion
            console.error("Error deleting item:", error);
            let errorMessage = "An error occurred while deleting purchase invoice";

            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                // If the server returns a specific error message, use that
                errorMessage = error.response.data.message;
            }

            // Display an error message using useToast

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                position: "top-right",
                isClosable: true,
            });
            setIsDeleteAlertOpen(false);

        }
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    const handlePdfDownload = () => {
        purchasesPdf(
            filteredItems,
        );
    }
    if (isLoading) {
        return (<Loading />)
    }
    return (
        <Box
            bg={bgColor}
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            p={4}
            shadow="md"
            mx="auto"
        >

            <Flex align="center" mb={4} justify="space-between" direction={{ base: "column", md: "row" }}>
                <Flex align="center" w="50%">
                    <InputGroup w="100%" size={"sm"}>
                        <InputLeftElement
                            pointerEvents="none"
                            color="gray.400"
                            fontSize="1.2em"
                            ml={2}
                        >
                            <BiSearch />
                        </InputLeftElement>
                        <Input
                            placeholder="Search by name, description, or Purchased From"
                            value={searchTerm}
                            onChange={(e) => {
                                handleSearchChange(e);
                                resetPage(e);
                              }}
                            borderRadius="0.3rem"
                            py={2}
                            pl={10}
                            pr={3}
                            fontSize="md"
                            mr={4}
                            _placeholder={{ color: "gray.400" }}
                        />
                    </InputGroup>
                </Flex>
                <Flex
                    align="center"
                    direction={{ base: "column", md: "row" }}
                    gap={2}
                >
                    {/* <Select
                        placeholder="All Categories"
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        borderRadius="0.3rem"
                        py={2}
                        fontSize="md"
                        mr={4}
                    >
                        <option value="solar panel">solar panel</option>
                        <option value="Category2">Category 2</option>
                        <option value="Category3">Category 3</option>
                    </Select> */}
                    {/* <ButtonGroup> */}
                    <Button
                        variant="solid"
                        colorScheme="red"
                        onClick={handlePdfDownload}
                        leftIcon={<FaFilePdf />}
                        isDisabled={filteredItems.length > 0 ? false : true}
                        size='sm'
                    >
                        Download PDF
                    </Button>
                    <Button
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => openDrawer("return")}
                        size={"sm"}
                    >
                        Return Purchase
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={() => openDrawer("addNew")}
                        size={"sm"}
                    >
                        New Purchase
                    </Button>
                    {/* </ButtonGroup> */}
                </Flex>
            </Flex>

            <Box overflowX="auto">
                <Table variant="simple" size={"sm"}>
                    <Thead>
                        <Tr>
                            <Th>Invoice #</Th>
                            <Th>Description</Th>
                            {/* <Th>Quantity</Th> */}
                            {/* <Th>Category</Th> */}
                            <Th>Total amount</Th>
                            <Th>Purchased From</Th>
                            <Th>Date</Th>
                            <Th>Payment Status</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {currentItems.map((item) => (
                            <Tr key={item.invoiceId}>
                                <Td>{item.invoiceId}</Td>
                                <Td maxW="20vw">{item.purchaseDescription.replace(' - \nDiscount = (0)', '')}</Td>
                                {/* <Td>{item.itemQuantity}</Td> */}
                                {/* <Td>{item.itemCategory}</Td> */}
                                <Td>{item.totalAmount.toFixed(2)}</Td>
                                <Td>{item.supplierName}</Td>
                                <Td>{formatDate(item.purchaseDate)}</Td>
                                <Td>
                                    <Badge
                                        variant="outline"
                                        colorScheme={
                                            item.paymentStatus === "paid" ? "green" : "yellow"
                                        }
                                    >
                                        {item.paymentStatus}
                                    </Badge>
                                </Td>
                                <Td>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<HiDotsVertical />}
                                            variant="ghost"
                                            size="sm"
                                        />
                                        <MenuList>
                                            <MenuItem
                                                icon={<BiShow />}
                                                onClick={() => openDrawer("show", item)}
                                            >
                                                Show
                                            </MenuItem>
                                            <MenuItem
                                                icon={<FiEdit />}
                                                onClick={() => openDrawer("edit", item)}
                                            >
                                                Edit
                                            </MenuItem>
                                            {/* <MenuItem
                                                icon={<MdOutlinePayment />}
                                                onClick={() => openDrawer("record", item)}
                                            >
                                                Record Payment
                                            </MenuItem> */}
                                            <MenuItem
                                                icon={<LiaFileInvoiceSolid />}
                                                onClick={() => openDrawer("pdf", item)}
                                            >
                                                Download Invoice
                                            </MenuItem>
                                            <MenuItem
                                                icon={<FiTrash2 />}
                                                onClick={() => handleDeleteClick(item.invoiceId)}
                                            >
                                                Delete
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
            <Flex justify="space-between" mt={4} align="center">
                <Box>
                    <IconButton
                        icon={<BiChevronLeft />}
                        isDisabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Previous Page"
                    />
                    <IconButton
                        icon={<BiChevronRight />}
                        isDisabled={indexOfLastItem >= filteredItems.length}
                        onClick={() => handlePageChange(currentPage + 1)}
                        ml={2}
                        aria-label="Next Page"
                    />
                </Box>
                <Text fontSize="smaller">
                    Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
                </Text>
            </Flex>
            <Drawers
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                drawerType={selectedDrawerType}
                data={selectedItemData}
                handleAddUpdateDeleteItem={fetchPurchasesData}
            />
            <DeleteAlert
                isOpen={isDeleteAlertOpen}
                onClose={() => setIsDeleteAlertOpen(false)}
                onConfirmDelete={handleConfirmDelete}
                HeaderText={"Delete Purchase"}
                BodyText={"Are you sure you want to delete this Purchase?"}
            />
        </Box>
    )
}

export default AllNewPurchase