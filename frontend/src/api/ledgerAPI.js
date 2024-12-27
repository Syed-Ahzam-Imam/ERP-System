// api.js

import { BASE_URL } from "./constants";
import axios from 'axios';


export const getAllLedgerTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/ledgerType`);

    // Check if response.data is an array
    if (Array.isArray(response.data.ledgerTypes)) {
      // Filter out the "product" type
      const filteredLedgerTypes = response.data.ledgerTypes.filter(ledgerType => ledgerType.ledgerTypeName !== "product");
      return filteredLedgerTypes;
    } else {
      console.error('Error fetching ledger types: Response data is not an array');
      throw new Error('Response data is not an array');
    }
  } catch (error) {
    console.error('Error fetching ledger types:', error);
    throw error;
  }
};



export const addLedgerType = async (ledgerTypeData) => {
  try {
    const response = await axios.post(`${BASE_URL}/ledgerType`, ledgerTypeData);
    return response.data;
  } catch (error) {
    console.error('Error adding ledger type:', error);
    throw error;
  }
};


export const updateLedgerType = async (ledgerTypeId, ledgerTypeData) => {
  try {
    const response = await axios.put(`${BASE_URL}/ledgerType/${ledgerTypeId}`, ledgerTypeData);
    return response.data;
  } catch (error) {
    console.error('Error updating ledger type:', error);
    throw error;
  }
};


export const deleteLedgerType = async (ledgerTypeId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/ledgerType/${ledgerTypeId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting ledger type:', error);
    throw error;
  }
};