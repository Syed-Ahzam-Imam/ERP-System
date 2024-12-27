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
import AddNewDrawer from "./new/AddNewItemDrawer";
import EditItemDrawer from "./new/EditItemDrawer";
import ShowItemDrawer from "./new/ShowItemDrawer";
import ReturnPurchase from "./return/NewReturnPurchase";
import RecordPayment from "./new/RecordPayment";
import ReturnEdit from "./return/ReturnEdit";
import ReturnShow from "./return/ReturnShow";
import ReturnPdf from "./return/ReturnPdf";
import InvoicePdf from "./new/InvoicePdf";

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
          <AddNewDrawer
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
            onClose={onClose}
          />
        );
      case "return":
        return (
          <ReturnPurchase
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
            onClose={onClose}
          />
        );
      case "show":
        return <ShowItemDrawer selectedItemID={data.invoiceId} onClose={onClose} />;
      case "returnshow":
        return <ReturnShow selectedItemID={data.invoiceId} onClose={onClose} />;
      case "record":
        return <RecordPayment selectedItemID={data.invoiceId} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} onClose={onClose} />;
      case "pdf":
        return <InvoicePdf invoiceId={data.invoiceId} onClose={onClose} />;
      case "returnPDF":
        return <ReturnPdf invoiceId={data.invoiceId} onClose={onClose} />;
      case "edit":
        return (
          <EditItemDrawer
            purchaseId={data.invoiceId}
            onClose={onClose}
            handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
          />
        );
      case "returnedit":
        return (
          <ReturnEdit
            purchaseId={data.invoiceId}
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
          {drawerType === "addNew" && "Add New Purchase"} {/* Updated text */}
          {drawerType === "return" && "Return Purchase"} {/* Updated text */}
          {drawerType === "show" && "Show Purchase Details"} {/* Updated text */}
          {drawerType === "pdf" && "Purchase Invoice"} {/* Updated text */}
          {drawerType === "returnPDF" && "Return Purchase Invoice"} {/* Updated text */}
          {drawerType === "edit" && "Edit Purchase Details"} {/* Updated text */}
          {drawerType === "record" && "Record Payment"} {/* Updated text */}
          {drawerType === "returnedit" && "Edit Purchase Return"} {/* Updated text */}
          {drawerType === "returnshow" && "Show Purchase Return"} {/* Updated text */}
        </DrawerHeader>
        <DrawerBody>{renderDrawer()}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Drawers;
