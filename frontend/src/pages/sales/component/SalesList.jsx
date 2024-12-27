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
  TabPanel,
  TabPanels, // Add this import
} from "@chakra-ui/react";

import SalesReturn from "./return/AllSalesReturn";
import NewSale from "./new/AllNewSale";

const SalesList = (
  {
    /*inventoryItems, handleAddUpdateDeleteItem*/
  }
) => { 
  return (
    <Tabs
      variant="soft-rounded"
      isFitted
    >
      <TabList>
        <Tab>All Sales</Tab>
        <Tab>Sales Return</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <NewSale />
        </TabPanel>
        <TabPanel>
          <SalesReturn />
        </TabPanel>
      </TabPanels>
    </Tabs>

  );
};

export default SalesList;
