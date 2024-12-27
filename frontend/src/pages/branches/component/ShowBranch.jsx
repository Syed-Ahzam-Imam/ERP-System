import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  VStack,
  useColorModeValue,
  Heading,
  SimpleGrid,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { BiChevronLeft, BiChevronRight, BiSearch } from "react-icons/bi";
import { getInventoryByBranch } from "../../../api/inventoryAPI";

const ShowBranch = ({ selectedItem }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const bgColorChild = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state
  const [items, setItems] = useState([]);
const toast=useToast()
  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);

        const inventoryData = await getInventoryByBranch(selectedItem.branchId);
        setItems(inventoryData.inventoryItems);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        const errorMessage =
        error.response?.data?.error ||
        "Error fetching branch. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        position: "top-right",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
        console.error("Error fetching inventory data:", error);
      }
    };

    fetchInventoryData();
  }, [selectedItem.branchId]);

  const filteredItems = items.filter((item) => {
    const nameMatch = item.branchName.toLowerCase().includes(searchTerm);
    const descriptionMatch = item.productDescription
      .toLowerCase()
      .includes(searchTerm);
    const categoryMatch = item.categoryName.toLowerCase().includes(searchTerm);
    return nameMatch || descriptionMatch || categoryMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (event) => {
    const searchText = event.target.value?.toLowerCase();
    setSearchTerm(searchText);
  };

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
      maxW="1500px"
      mx="auto"
    >
      <Heading fontWeight="light" textAlign="center">
        {selectedItem.branchName + " - " + selectedItem.branchId}
      </Heading>
        <SimpleGrid columns={{ base: 1, md: 4 }} w="100%" my={4} spacing={2}>
          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Location
            </Text>
            {/* <Text style={textStyles}>{selectedItem.branchLocation}</Text> */}
            <Text>{selectedItem.branchLocation}</Text>
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Contact Person
            </Text>
            {/* <Text >{selectedItem.contactPerson}</Text> */}
            <Text>{selectedItem.contactPerson}</Text>
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Contact Number
            </Text>
            {/* <Text >{selectedItem.branchContactPhone}</Text> */}
            <Text>{selectedItem.branchPhoneNumber}</Text>
          </Box>

          <Box borderWidth="1px" p={2} borderRadius="md" width="100%">
            <Text fontWeight="bold" mb={2}>
              Email
            </Text>
            {/* <Text >{selectedItem.branchContactPhone}</Text> */}
            <Text>{selectedItem.email}</Text>
          </Box>
        </SimpleGrid>

      <Box
        bg={bgColorChild}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        p={4}
        shadow="md"
        width="100%"
        maxW="1500px"
        mx="auto"
      >
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
            placeholder="Search by Name, Description, or Category"
            value={searchTerm}
            onChange={handleSearchChange}
            borderRadius="0.3rem"
            py={2}
            pl={10}
            pr={3}
            fontSize="md"
            mr={4}
            _placeholder={{ color: "gray.400" }}
          />
        </InputGroup>
        {loading ? (
          <Text>Loading...</Text> // Show loading text or spinner while data is loading
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Description</Th>
                  <Th>quantity</Th>
                  <Th>Category</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentItems.map((item, index) => (
                  <Tr>
                    <Td>{item.branchName}</Td>
                    <Td>{item.productDescription}</Td>
                    <Td>{item.itemQuantity}</Td>
                    <Td>{item.categoryName}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
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
            Page {currentPage} of{" "}
            {Math.ceil(filteredItems.length / itemsPerPage)}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default ShowBranch;
