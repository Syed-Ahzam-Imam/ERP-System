import axios from "axios";
import { BASE_URL } from "./constants";


export const createPurchase = async (purchaseData) => {
  try {
    const response = await axios.post(`${BASE_URL}/purchase/`, purchaseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const editPurchase = async (purchaseData,purchaseId) => {
  try {
    const response = await axios.put(`${BASE_URL}/purchase/${purchaseId}`, purchaseData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchPurchasePDFDetails = async (invoiceId) => {
  try {
    const response = await axios.get(`${BASE_URL}/purchase/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    throw error;
  }
};
export const fetchReturnPurchasePDFDetails = async (invoiceId) => {
  try {
    const response = await axios.get(`${BASE_URL}/purchaseReturn/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase details:', error);
    throw error;
  }
};
export const fetchPurchases = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/purchase/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchPurchaseDetailsById = async (purchaseId) => {
  try {
    const response = await axios.get(`${BASE_URL}/purchase/details-by-id/${purchaseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recordPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${BASE_URL}/purchase/record`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response.data; // Handle error appropriately
  }
};

export const getPurchaseRecord = async (purchaseId) => {
  try {
    const response = await axios.get(`${BASE_URL}/purchase/record/${purchaseId}`);
    return response.data;
  } catch (error) {
    throw error.response.data; // Handle error appropriately
  }
};



export const deletePurchaseById = async (purchaseId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/purchase/${purchaseId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

