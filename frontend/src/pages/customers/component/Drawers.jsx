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


import ShowCustomer from "./ShowCustomer";
import EditCustomer from "./EditCustomer";
import AddCustomer from "./AddCustomer";
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
            return(
                <AddCustomer onClose={onClose} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}/>
            )
      case "show":
        return <ShowCustomer selectedItem={data} onClose={onClose} />;
      case "ledger":
        return <GeneralLedger selectedItem={data} onClose={onClose} />;
      case "edit":
        return (
          <EditCustomer
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
          {drawerType === "addNew" && "Add New Customer"} {/* Updated text */}
          {drawerType === "show" && "Show Customer Details"} {/* Updated text */}
          {drawerType === "edit" && "Edit Customer Details"} {/* Updated text */}
          {drawerType === "ledger" && "Customer Ledger Details"} {/* Updated text */}
        </DrawerHeader>
        <DrawerBody>{renderDrawer()}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Drawers;
