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
import AddNewBranche from "./AddNewBranche";
import ViewBranch from "./ShowBranch";
import EditBranch from "./EditBranch";
const Drawers = ({
  isOpen,
  onClose,
  drawerType,
  data,
  handleAddUpdateDeleteBranch, // Renamed function
}) => {
  const drawerSize = drawerType === "show" ? "full" : "lg";
  const renderDrawer = () => {
    switch (drawerType) {
      case "addNew":
        return (
          <AddNewBranche
            handleAddUpdateDeleteBranch={handleAddUpdateDeleteBranch} // Renamed function
            onClose={onClose}
          />
        );
      case "show":
        return <ViewBranch selectedItem={data} onClose={onClose} />;
      case "edit":
        return (
          <EditBranch
            selectedItem={data}
            onClose={onClose}
            handleAddUpdateDeleteBranch={handleAddUpdateDeleteBranch} // Renamed function
          />
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      size={drawerSize}
      onClose={onClose}
    >
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
          {drawerType === "addNew" && "Add New Branch"} {/* Updated text */}
          {drawerType === "show" && "Show Branch Details"} {/* Updated text */}
          {drawerType === "edit" && "Edit Branch Details"} {/* Updated text */}
        </DrawerHeader>
        <DrawerBody>{renderDrawer()}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Drawers;
