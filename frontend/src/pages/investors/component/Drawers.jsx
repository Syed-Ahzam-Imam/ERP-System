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
import AddInvestor from "./AddInvestor";
import ShowInvestor from "./ShowInvestor";
import EditInvestor from "./EditInvestor";
import GeneralLedger from "./GeneralLedger";

const Drawers = ({
  isOpen,
  onClose,
  drawerType,
  data,
  handleAddUpdateDeleteItem, // Renamed function
}) => {
  const renderDrawer = () => {
    switch (drawerType) {
      case "addNew":
        return (
          <AddInvestor
            onClose={onClose}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}
          />
        );
      case "show":
        return (
          <ShowInvestor
            selectedItem={data}
            onClose={onClose}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}
          />
        );
      case "ledger":
        return <GeneralLedger selectedItem={data} onClose={onClose} />;

      case "edit":
        return (
          <EditInvestor
            selectedItem={data}
            onClose={onClose}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
          />
        );
      default:
        return null;
    }
  };

  return (
    <Drawer isOpen={isOpen} placement="right" size="full" onClose={onClose}>
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
          {drawerType === "addNew" && "Add New Investor"} {/* Updated text */}
          {drawerType === "show" && "Show Investor Details"}{" "}
          {drawerType === "ledger" && "Customer Ledger Details"}{" "}
          {drawerType === "edit" && "Edit Investor Details"}{" "}
        </DrawerHeader>
        <DrawerBody>{renderDrawer()}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Drawers;
