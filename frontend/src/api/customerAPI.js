import axios from 'axios';
import { BASE_URL, branchId } from './constants';


export const createCustomer = async (customerData) => {
    try {
        const response = await axios.post(`${BASE_URL}/customer/`, customerData);
        return response.data;
    } catch (error) {
        console.error("Error creating customer:", error);
        throw error;
    }
};

export const editCustomer = async (customerId, customerData) => {
    try {
      const response = await axios.put(`${BASE_URL}/customer/${customerId}`, customerData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const getAllCustomers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/customer/`);
      return response.data.customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };
  export const getAllCustomersByBranchId = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/customer/branch/${branchId}`);
      return response.data.customers;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  };

export const deleteCustomerById = async (customerId) => {
  try {
      await axios.delete(`${BASE_URL}/customer/${customerId}`);
  } catch (error) {
      throw error; // Handle errors in the component where this function is called
  }
};


export const getCustomerLedger= async (customerId) => {
  try {
    const response = await axios.get(`${BASE_URL}/ledger/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer data:', error);
    throw error;
  }
};
