import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiGame, BiPrinter, BiRefresh, BiSolidFilePdf } from "react-icons/bi";
import {
  generalLedgerDetailedPdf,
  generatePdf,
  printPdf,
} from "../../../utlis/GeneralLedgerDetailedPdf";
import { getCustomerData, getCustomerLedger } from "../../../api/customerAPI";
import { formatDateString } from "../../../utlis/helper";
import { getSettings } from "../../../api/settingsApi";
import moment from "moment";
import Loading from "../../../components/Loading/Loading";

const GeneralLedger = ({ selectedItem, branches, onClose }) => {
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColorChild = useColorModeValue("gray.300", "gray.600");

  const [customerData, setCustomerData] = useState(null);
  const [entries, setEntried] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (selectedItem && selectedItem.customerId) {
      const fetchCustomerData = async () => {
        try {
          setLoading(true);
          const response = await getCustomerLedger(selectedItem.customerId);
          setCustomerData(response?.customerData);
          setEntried(response?.entries);
          // 
          setLoading(false);
        } catch (error) {
          // Handle error, you may want to show an error message to the user
          setLoading(true);
          console.error("Error fetching customer data:", error);
        }
      };

      fetchCustomerData();
    }
  }, [selectedItem]);

  const ledgerName = `Detailed Ledger Report ${customerData?.customerId}|${customerData?.firstName}`;
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
    generalLedgerDetailedPdf(
      customerData,
      filteredEntries,
      startDate,
      endDate,
      ledgerName,
      settings
    );
  };
  const handlePdfPrint = () => {
    printPdf(customerData, filteredEntries, startDate, endDate, ledgerName, settings);
  };
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };
  const filteredEntries = entries?.filter((entry) => {
    const entryDate = moment(entry.date).format("YYYY-MM-DD");

    return (
      (!startDate || entryDate >= startDate) &&
      (!endDate || entryDate <= endDate)
    );
  });
  const [runningBalance, setRunningBalance] = useState({
    value: 0,
    type: "CR",
  });

  useEffect(() => {
    // Calculate running balance when filteredEntries change
    if (filteredEntries) {
      const updatedBalance = filteredEntries.reduce(
        (balance, item) => {
          const newBalance = balance.value - item.credit + item.debit;
          return {
            value: newBalance,
            type: newBalance <= 0 ? "CR" : "DR",
          };
        },
        { value: 0, type: "CR" }
      );
      setRunningBalance(updatedBalance);
      // 
      // 
    }
  }, [filteredEntries]);
  if (loading)
    return (
      <Center>
        <Loading />
      </Center>
    );

  return (
    <Box
      spacing={10}
      borderWidth="1px"
      bg={bgColor}
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      shadow="md"
      width="100%"
    >
      <Heading>General Ledger</Heading>
      <SimpleGrid
        columns={{ base: 1, md: 2 }}
        justifyContent="space-between"
        mt={4}
      >
        <Box>
          <VStack>
            <Text fontWeight="semibold">Customer Details</Text>
            <Flex direction="column" gap={6}>
              <SimpleGrid columns={2} gap={10} alignItems="center">
                <Text>Customer Code:</Text>
                <Text>{customerData?.customerId}</Text>
              </SimpleGrid>
              <SimpleGrid columns={2} gap={10} alignItems="center">
                <Text>Customer Name:</Text>
                <Text>{customerData?.firstName}</Text>
              </SimpleGrid>
            </Flex>
          </VStack>
        </Box>
        <Box>
          <VStack>
            <Text fontWeight="semibold">Date Range</Text>
            <Flex direction="column" gap={2}>
              <SimpleGrid columns={2} alignItems="center">
                <Text>Start Date:</Text>
                <Input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </SimpleGrid>
              <SimpleGrid columns={2} alignItems="center">
                <Text>End Date:</Text>
                <Input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </SimpleGrid>
              {/* <Button
                variant="ghost"
                colorScheme="blue"
                leftIcon={<BiRefresh />}
              >
                Refresh
              </Button> */}
            </Flex>
          </VStack>
        </Box>
      </SimpleGrid>
      <TableContainer>
        <Table variant="simple" bg={bgColorChild} borderRadius="lg" mt={4}>
          {/* <TableCaption>Customer Payment Details</TableCaption> */}
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Voucher #</Th>
              <Th>Description</Th>
              <Th>Debit</Th>
              <Th>Credit</Th>
              <Th isNumeric>Balance</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredEntries?.map((item, index) => (
              <Tr>
                <Td>{formatDateString(item?.date)}</Td>
                <Td>{item?.vNo || " - "}</Td>
                <Td style={{ whiteSpace: 'pre-line' }}>{item?.description.replace(' - \nDiscount = (0)', '') || " - "}</Td>
                <Td>{item?.debit || " - "}</Td>
                <Td>{item?.credit || " - "}</Td>
                <Td isNumeric>
                  <Badge
                    colorScheme={item?.balance > 0 ? "green" : "red"}
                    variant="subtle"
                    px={2}
                    py={1}
                    borderRadius="lg"
                    fontSize="md"
                  >
                    {item?.balance > 0
                      ? `${item?.balance} DR`
                      : `${Math.abs(item?.balance)} CR`}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Flex justify="space-between" mt={4}>
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <Button
            variant="solid"
            colorScheme="red"
            leftIcon={<BiSolidFilePdf />}
            onClick={handlePdfDownload}
          >
            Download
          </Button>
          <Button
            variant="solid"
            colorScheme="blue"
            leftIcon={<BiPrinter />}
            onClick={handlePdfPrint}
          >
            Print
          </Button>
        </Flex>
        <Box textAlign="end">
          <Heading fontWeight="semibold" justifySelf="end" fontSize="2xl">
            Last Balance:{" "}
            <Badge
              colorScheme={runningBalance.type === "CR" ? "red" : "green"}
              variant="subtle"
              px={2}
              py={1}
              borderRadius="lg"
              fontSize="md"
            >
              {runningBalance.value < 0
                ? `${Math.abs(runningBalance.value)} CR`
                : `${Math.abs(runningBalance.value)} DR`}
            </Badge>
          </Heading>
        </Box>
      </Flex>
    </Box>
  );
};

export default GeneralLedger;
