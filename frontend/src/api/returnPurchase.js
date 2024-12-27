import axios from "axios";
import { BASE_URL } from "./constants";

// Function to create a purchase return
export const createPurchaseReturn = async (purchaseReturnData) => {
    try {
      const response = await axios.post(`${BASE_URL}/purchaseReturn/`, purchaseReturnData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  

  export const fetchReturnPurchases = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/purchaseReturn/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const fetchReturnPurchaseDetailsById = async (purchaseId) => {
    try {
      const response = await axios.get(`${BASE_URL}/purchaseReturn/details-by-id/${purchaseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const editReturnPurchase = async (purchaseData,purchaseId) => {
    try {
      const response = await axios.put(`${BASE_URL}/purchaseReturn/${purchaseId}`, purchaseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const deleteReturnPurchaseById = async (purchaseId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/purchaseReturn/${purchaseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
