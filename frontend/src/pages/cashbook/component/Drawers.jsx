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
import RecordRevenue from "./RecordRevenue";
import ViewRecord from "./ViewRecord";
import EditRecord from "./EditRecord";
import RecordExpense from "./RecordExpense";
import CustomerToSupplier from "./CustomerToSupplier";


const Drawers = ({
    isOpen,
    onClose,
    drawerType,
    data,
    handleAddUpdateDeleteItem, // Renamed function
}) => {
    const renderDrawer = () => {
        switch (drawerType) {
            case "revenue":
                return (<RecordRevenue onClose={onClose} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} />)
            case "payment":
                return (<RecordExpense onClose={onClose} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} />)
            case "customerToSupplier":
                return (<CustomerToSupplier onClose={onClose} handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} />)
            case "view":
                return (
                    <ViewRecord
                        selectedItem={data}
                        onClose={onClose}
                        handleAddUpdateDeleteItem={handleAddUpdateDeleteItem} // Renamed function
                    />
                );
            case "edit":
                return (
                    <EditRecord
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
        <Drawer isOpen={isOpen} placement="right" size="lg" onClose={onClose}>
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
                    {drawerType === "customerToSupplier" && "Direct Transfer"} {/* Updated text */}
                    {drawerType === "revenue" && "New Revenue"} {/* Updated text */}
                    {drawerType === "payment" && "New Expense"} {/* Updated text */}
                    {drawerType === "view" && (
                        <span>
                            {data.receipt > 0 ? "Revenue Details" : "Expense Details"}
                        </span>
                    )}
                    {drawerType === "edit" && (
                        <span>
                            {data.receipt > 0 ? "Revenue Details" : "Expense Details"}
                        </span>
                    )}
                </DrawerHeader>
                <DrawerBody>{renderDrawer()}</DrawerBody>
            </DrawerContent>
        </Drawer>
    );
};

export default Drawers;
