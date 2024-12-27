import axios from "axios";
import { BASE_URL, role } from "./constants";


export const fetchSales = async (branchId) => {
  let response;
    try {
      if(role === 'admin')
      {
        response = await axios.get(`${BASE_URL}/sales`);
      }
      else
      {
        response = await axios.get(`${BASE_URL}/sales/branch/${branchId}`);
      }
        return response.data;
    } catch (error) {
        throw error;
    }
};
// Function to add a new sale
export const createNewSale = async (saleData) => {
    try {
        const response = await axios.post(`${BASE_URL}/sales`, saleData);
        return response.data; 
    } catch (error) {
        console.error("Error adding sale:", error);
        throw error;
    }
};
export const updateSaleById = async (saleData,id) => {
  try {
      const response = await axios.put(`${BASE_URL}/sales/${id}`, saleData);
      return response.data; 
  } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
  }
};
export const getSaleDetails = async (invoiceId) => {
    try {
        const response = await axios.get(`${BASE_URL}/sales/${invoiceId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const recordSalePayment = async (paymentData) => {
    try {
      const response = await axios.post(`${BASE_URL}/sales/record`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  export const recordReturnSale = async (saleData) => {
    try {
      const response = await axios.post(`${BASE_URL}/salesReturn/`, saleData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  };
  


  export const deleteSale = async (invoiceId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/sales/${invoiceId}`);
      return response.data; // You might want to return additional data based on your API response
    } catch (error) {
      throw error;
    }
  };


  
export const getSaleRecord = async (saleId) => {
  try {
    const response = await axios.get(`${BASE_URL}/sales/record/${saleId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};