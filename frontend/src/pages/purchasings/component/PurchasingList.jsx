import React, { useEffect, useState } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel, // Add this import
} from "@chakra-ui/react";

import AllNewPurchase from "./new/AllNewPurchase";
import PurchaseReturn from "./return/AllPurchaseReturn";

// Sample hardcoded data for items

const PurchasingList = (
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
        <Tab>All Purchases</Tab>
        <Tab>Return Purchases</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <AllNewPurchase/>
        </TabPanel>
        <TabPanel>
          <PurchaseReturn />
        </TabPanel>
      </TabPanels>

    </Tabs>
  );
};

export default PurchasingList;
