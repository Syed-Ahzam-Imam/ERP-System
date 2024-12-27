import React from 'react'
import {
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    Button,
} from "@chakra-ui/react";
import AddNewProduct from './AddNewProduct';
import ShowProduct from './ShowProduct';
import EditProduct from './EditProduct';
import { ArrowBackIcon } from '@chakra-ui/icons';
import GeneralLedger from './GeneralLedger';
const Drawers = ({
    isOpen,
    onClose,
    drawerType,
    data,
    handleAddUpdateDeleteProduct, // Renamed function
    size,
}) => {
    const renderDrawer = () => {
        switch (drawerType) {
            case "addNew":
                return (
                    <AddNewProduct
                        handleAddUpdateDeleteProduct={handleAddUpdateDeleteProduct} // Renamed function
                        onClose={onClose}
                    />
                );
            case "show":
                return <ShowProduct selectedItem={data} onClose={onClose} />;
            case "ledger":
                return <GeneralLedger selectedItem={data} onClose={onClose} />;
            case "edit":
                return (
                    <EditProduct
                        selectedItem={data}
                        onClose={onClose}
                        handleAddUpdateDeleteProduct={handleAddUpdateDeleteProduct} // Renamed function
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Drawer isOpen={isOpen} size={size} placement="right" onClose={onClose}>
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
                    {drawerType === "addNew" && "Add New Product"} {/* Updated text */}
                    {drawerType === "show" && "Show Product Details"} {/* Updated text */}
                    {drawerType === "edit" && "Edit Product Details"} {/* Updated text */}
                </DrawerHeader>
                <DrawerBody>{renderDrawer()}</DrawerBody>
            </DrawerContent>
        </Drawer>
    )
}

export default Drawers