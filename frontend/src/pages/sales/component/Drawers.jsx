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
// import InvoicePdf from "./InvoicePdf";
import AddNewSale from "./new/AddNewSale";
import ShowSale from "./new/ShowSale";
import EditSale from "./new/EditSale";
import RecordPayment from "./new/RecordPayment";
import ReturnSale from "./return/NewReturnSale";
import EditReturn from "./return/EditReturn";
import ShowReturn from "./return/ShowReturn";
import ReturnPdf from "./return/ReturnPdf";
import SalesPdf from "./new/SalesPdf";

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
          <AddNewSale
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
            onClose={onClose}
          />
        );
      case "return":
        return (
          <ReturnSale
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
            onClose={onClose}
          />
        );
      case "show":
        return (
          <ShowSale
            selectedItemID={data.invoiceId}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}
            onClose={onClose}
          />
        );
      case "returnshow":
        return (
          <ShowReturn
            selectedItemID={data.invoiceId}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem}
            onClose={onClose}
          />
        );
      case "record":
        return (
          <RecordPayment selectedItemID={data.invoiceId} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} onClose={onClose} />
        );
      case "pdf":
        return <SalesPdf selectedItemID={data.invoiceId} onClose={onClose} />;
      case "returnPDF":
        return <ReturnPdf selectedItemID={data.invoiceId} onClose={onClose} />;
      // case "newPDF":
      //   return <SalesPdf selectedItemID={data.invoiceId} onClose={onClose} />;
      case "edit":
        return (
          <EditSale
            invoiceId={data.invoiceId}
            onClose={onClose}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
          />
        );
      case "returnedit":
        return (
          <EditReturn
            invoiceId={data.invoiceId}
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
          {drawerType === "addNew" && "Add New Sale"} {/* Updated text */}
          {drawerType === "return" && "Return Sale"} {/* Updated text */}
          {drawerType === "show" && "Show Sale Details"} {/* Updated text */}
          {drawerType === "returnPDF" && "Return Invoice"} {/* Updated text */}
          {drawerType === "pdf" && "Sale Invoice"} {/* Updated text */}
          {drawerType === "edit" && "Edit Sale Details"} {/* Updated text */}
          {drawerType === "record" && "Record Payment"} {/* Updated text */}
        </DrawerHeader>
        <DrawerBody>{renderDrawer()}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Drawers;
