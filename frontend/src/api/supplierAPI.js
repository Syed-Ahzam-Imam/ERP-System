import axios from "axios";
import { BASE_URL } from "./constants";


export const getSupplierLedger = async (supplierrId) => {
  try {
    const response = await axios.get(`${BASE_URL}/ledger/supplier/${supplierrId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching supplier data:', error);
    throw error;
  }
};
// Function to create a new supplier
export const createSupplier = async (supplierData) => {
    try {
        const response = await axios.post(`${BASE_URL}/supplier`, supplierData);
        return response.data;
    } catch (error) {
        throw error; // Throw the error to be handled by the caller
    }
};

// Function to fetch all suppliers
export const getAllSuppliers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/supplier`);
      return response.data.suppliers;
    } catch (error) {
      throw error; // Throw the error to be handled by the caller
    }
  };
  
  // Function to delete a supplier by ID
  export const deleteSupplierById = async (supplierId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/supplier/${supplierId}`);
      return response.data; // Assuming the API response contains success status
    } catch (error) {
      throw error; // Throw the error to be handled by the caller
    }
  };


  export const editSupplierById = async (supplierId, updatedSupplierData) => {
    try {
      const response = await axios.put(`${BASE_URL}/supplier/${supplierId}`, updatedSupplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };