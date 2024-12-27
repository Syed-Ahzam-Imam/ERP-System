import axios from "axios";
import { BASE_URL, role, branchId } from "./constants";


export const getCashbookEntries = async () => {
  let response;
  try {
    if (role === 'admin') {
      response = await axios.get(`${BASE_URL}/cashbook`);
    }
    else {
      response = await axios.get(`${BASE_URL}/cashbook/branch/${branchId}`);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Function to delete a cashbook entry by ID
export const deleteCashbookEntryById = async (entryId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/cashbook/${entryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateCashbookEntry = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/cashbook/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const recordExpenseOrRevenue = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/cashbook`, data);
    return response.data;
  } catch (error) {
    console.error('Error recording expense:', error);
    throw error;
  }
};
// Function to fetch accounts by branch ID
export const getCashbookEntryById = async (branchId) => {
  try {
    const response = await axios.get(`${BASE_URL}/cashbook/${branchId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const transferToNoorani = async (amount, date, branchId, selectedBranchForCashTransfer) => {
  const fromBranchId = branchId;
  const toBranchId = selectedBranchForCashTransfer;
  try {
    const response = await axios.post(`${BASE_URL}/cashbook/transferToNoorani`,
      { amount, date, fromBranchId, toBranchId }
    );

    return response.data;
  } catch (error) {
    console.error('Error transferring to Noorani:', error);
    throw error;
  }
};




export const directTransfer = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/cashbook/transfer/`, data);
    return response.data;
  } catch (error) {
    console.error('Error recording expense:', error);
    throw error;
  }
};



export const fetchAccountsByBranchId = async (branchId) => {
  try {
    const response = await axios.get(`${BASE_URL}/cashbook/accounts/${branchId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};