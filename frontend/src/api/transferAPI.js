
import axios from 'axios';

import { BASE_URL } from "./constants";


export const getAllTransfers = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/transfers/`);
        return response.data;
    } catch (error) {
        // Handle error, e.g., log the error or show a notification
        console.error('Error fetching transfer requests:', error);
        throw error;
    }
};
export const getBranchesForProduct = async (productId, quantity) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/transfers/${productId}/${quantity}`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching branches for product ${productId}:`, error);
        throw error;
    }
};

export const createNewTransfer = async (transferData) => {
    try {
        const response = await axios.post(`${BASE_URL}/transfers`, transferData);
        return response.data;
    } catch (error) {
        console.error('Error creating new transfer:', error);
        throw error;
    }
};

export const deleteTransfer = async (transferId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/transfers/${transferId}`);
      return response.data; // You may handle the response data as needed
    } catch (error) {
      // Handle error, e.g., log the error or throw it
      console.error("Error deleting transfer:", error);
      throw error;
    }
  };


  export const approveTransfer = async (transferId,payload) => {
    try {
      const response = await axios.put(`${BASE_URL}/transfers/${transferId}`, payload);
  
      return response.data;
    } catch (error) {
      // Handle error, e.g., log the error or throw a custom error
      throw error;
    }
  };

  export const transferInventory = async (formdata) => {
    try {
      const response = await axios.put(`${BASE_URL}/transfers/`,formdata );
      return response.data;
    } catch (error) {
      throw error;
    }
  };