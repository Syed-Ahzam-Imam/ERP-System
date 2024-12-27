import { BASE_URL } from "./constants";
import axios from 'axios';

export const getPaymentMethods = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/paymentMethod`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  };
  

  export const deletePaymentMethodById = async (paymentMethodId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/paymentMethod/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting payment method with ID ${paymentMethodId}:`, error);
      throw error;
    }
  };


  export const addNewPaymentMethod = async (paymentMethodData) => {
    try {
      const response = await axios.post(`${BASE_URL}/paymentMethod`, paymentMethodData);
      return response.data;
    } catch (error) {
      console.error('Error adding new payment method:', error);
      throw error;
    }
  };


  export const updatePaymentMethodById = async (paymentMethodId, updatedData) => {
    try {
      const response = await axios.put(`${BASE_URL}/paymentMethod/${paymentMethodId}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment method with ID ${paymentMethodId}:`, error);
      throw error;
    }
  };