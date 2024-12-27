import { Box, Button, FormControl, FormLabel, Input, Select, VStack, useToast } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useBgColor, useBgColorChild, useBorderColor } from '../../../utlis/colors';
import { getBranches } from '../../../api/branchAPI';
import { getAllProducts } from '../../../api/productAPI';
import moment from 'moment';
import { requestInventory } from '../../../api/inventoryAPI';

const RequestInventory = ({onClose}) => {
    const [branches, setBranches] = useState([]);
    const [productItems, setProductItems] = useState([]);
    const toast = useToast();
    const [btnLoading,setBtnLoading]=useState(false);
    const [formData, setFormData] = useState({
        productId: 0,
        branchId: 0,
        itemQuantity: 0,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);

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

    useEffect(() => {
        const results = productItems.filter((product) =>
            `${product.productName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, productItems]);

    const handleProductChange = (selectedProduct) => {
        // Set productId in formData when product is selected from dropdown
        setFormData({ ...formData, productId: selectedProduct.productId });
        setSelectedProduct(selectedProduct); // Set the selected product
    };


    const handleBranchChange = (e) => {
        // Set productId in formData when product is selected from dropdown
        setFormData({ ...formData, branchId: e.target.value });
    };

    const handleTransferProduct = async () => {
        setBtnLoading(true);
        try {
            // Parse all formData values to integers
            const parsedFormData = {
                productId: parseInt(formData.productId),
                branchId: parseInt(formData.branchId),
                quantity: parseInt(formData.itemQuantity),
                date: moment().toDate()
            };

            const response = await requestInventory(parsedFormData);

            toast({
                title: "Request generated Successfully",
                status: "success",
                duration: 3000,
                position: "top-right",
                isClosable: true,
            });
            setBtnLoading(false);
            onClose();
        } catch (error) {
            console.error("Error Reqeusting:", error);

            toast({
                title: "Error Reqeusting Inventory",
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
            bg={useBgColor}
            borderWidth="1px"
            borderColor={useBorderColor}
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
                            placeholder="Search product..."
                            value={selectedProduct ? selectedProduct.productName : searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedProduct(null);
                            }}
                        />
                        {searchTerm && filteredProducts.length > 0 && (
                            <VStack
                                align="start"
                                spacing={2}
                                borderWidth="1px"
                                borderColor="gray.200"
                                borderRadius="md"
                                mt={1}
                            >
                                {filteredProducts.map((product, index) => (
                                    <Box
                                        key={index}
                                        p={2}
                                        bg={useBgColorChild}
                                        borderWidth="1px"
                                        borderColor="gray.200"
                                        borderRadius="md"
                                        cursor="pointer"
                                        onClick={(e) => {
                                            handleProductChange(product)
                                            setSearchTerm("")
                                        }}
                                    >
                                        {product.productName}
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
                            value={formData.itemQuantity}
                            onChange={(e) =>
                                setFormData({ ...formData, itemQuantity: e.target.value })
                            }
                        />
                    </Box>
                    <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
                        <FormLabel fontWeight="bold" mb={2}>
                            Branch Name
                        </FormLabel>
                        <Select
                            placeholder="Select Branch"
                            onChange={handleBranchChange}
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
                        onClick={handleTransferProduct}
                        isLoading={btnLoading}
                    >
                        Request Inventory
                    </Button>
                </VStack>
            </FormControl>
        </Box>
    )
}

export default RequestInventory