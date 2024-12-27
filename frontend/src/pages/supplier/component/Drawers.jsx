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

import AddSupplier from "./AddSupplier";
import ShowSupplier from "./ShowSupplier";
import EditSupplier from "./EditSupplier";
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
                    <AddSupplier onClose={onClose} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} />
                )
            case "show":
                return <ShowSupplier selectedItem={data} onClose={onClose} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} />;
            case "ledger":
                return <GeneralLedger selectedItem={data} onClose={onClose} />;
            case "edit":
                return (
                    <EditSupplier
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
                    {drawerType === "addNew" && "Add New Supplier"} {/* Updated text */}
                    {drawerType === "show" && "Show Supplier Details"} {/* Updated text */}
                    {drawerType === "edit" && "Edit Supplier Details"} {/* Updated text */}
                </DrawerHeader>
                <DrawerBody>{renderDrawer()}</DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default Drawers;
