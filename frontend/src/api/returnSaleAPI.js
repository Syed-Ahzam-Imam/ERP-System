import axios from "axios";
import { BASE_URL, role, branchId } from "./constants";

export const fetchReturnSales = async () => {
  let response;
    try {
      if(role === 'admin')
      {
        response = await axios.get(`${BASE_URL}/salesReturn`);
      }
      else
      {
        response = await axios.get(`${BASE_URL}/salesReturn/branch/${branchId}`);
      }
        return response.data.sales || [];
    } catch (error) {
        console.error('Error fetching sales data:', error);
        throw error;
    }
};

export const deleteReturnSale = async (invoiceId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/salesReturn/${invoiceId}`);
      return response.data; // You might want to return additional data based on your API response
    } catch (error) {
      throw error;
    }
  };


  export const getSalesReturnById = async (salesReturnId) => {
    try {
      const response = await axios.get(`${BASE_URL}/salesReturn/${salesReturnId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales return details:', error);
      throw error;
    }
  };


  export const updateReturnSaleById = async (saleData,id) => {
    try {
        const response = await axios.put(`${BASE_URL}/salesReturn/${id}`, saleData);
        return response.data; 
    } catch (error) {
        console.error("Error adding sale:", error);
        throw error;
    }
  };