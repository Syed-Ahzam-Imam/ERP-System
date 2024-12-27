import {
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay, InputGroup, SimpleGrid
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import AddNew from "./AddNew";
import View from "./View";
import Edit from "./Edit";

function Drawers({
    isOpen,
    onClose,
    drawerType,
    data,

    handleAddOrUpdatepaymentMode,
    handleOptionClick, // Include this prop
    selectedDrawerType, // Include this prop
}) {
    const [activeDrawerType, setActiveDrawerType] = useState(null); // Add this state

    const renderDrawer = (type) => {
        switch (
        type // Use the provided type parameter
        ) {
            case "addNew":
                return (
                    <AddNew
                        handleAddOrUpdatepaymentMode={handleAddOrUpdatepaymentMode}
                        onClose={onClose}
                    />
                );
            case "show":
                return <View data={data} onClose={onClose} />;
            case "edit":
                return (
                    <Edit
                        data={data}
                        onClose={onClose}
                        handleAddOrUpdatepaymentMode={handleAddOrUpdatepaymentMode}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Drawer isOpen={isOpen} placement="right" size="md" onClose={onClose}>
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
                    {drawerType === "addNew" && "Add New Payment Mode"}
                    {drawerType === "show" && "Show Payment Mode"}
                    {drawerType === "edit" && "Edit Payment Mode"}
                </DrawerHeader>
                <DrawerBody>
                    {selectedDrawerType !== null && renderDrawer(selectedDrawerType)}
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
}

export default Drawers;
