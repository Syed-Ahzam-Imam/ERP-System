import React from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

import ShowItem from "./ShowItem";
import EditItem from "./EditItem";
import AddOpeningStock from "./Openingstock";
import RequestInventory from "./RequestInventory";
import TransferInventory from "./TransferInventory";

const Drawers = ({
  isOpen,
  onClose,
  drawerType,
  data,
  handleAddUpdateDeleteItem, // Renamed function
}) => {
  const renderDrawer = () => {
    switch (drawerType) {
      case "show":
        return <ShowItem selectedItemId={data.productId} onClose={onClose} />;
      case "edit":
        return (
          <EditItem
            selectedItem={data}
            onClose={onClose}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
          />
        );
      case "openingStock":
        return (
          <AddOpeningStock
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
            onClose={onClose}
          />
        );
      case "request":
        return (
          <RequestInventory
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
            onClose={onClose}
          />
        );
        case "transfer":
          return (
            <TransferInventory
              handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
              onClose={onClose}
            />
          );
      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" size={drawerType === 'openingStock' ? 'md' : 'full'} onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={onClose}
            variant="ghost"
            alignItems="center"
            justifyContent="center"
          />
          {drawerType === "request" && "Request Inventory"} {/* Updated text */}
          {drawerType === "openingStock" && "Add Opening Stock"} {/* Updated text */}
          {drawerType === "transfer" && "Transfer Inventory to branch"} {/* Updated text */}
          {drawerType === "show" && "Show Item Details"} {/* Updated text */}
          {drawerType === "edit" && "Edit Item Details"} {/* Updated text */}
        </DrawerHeader>
        <DrawerBody>{renderDrawer()}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Drawers;
