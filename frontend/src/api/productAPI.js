import axios from "axios";
import { BASE_URL } from "./constants";

export const addProduct = async (productName, productDescription,  categoryId,brand) => {
  try {
    const response = await axios.post(`${BASE_URL}/product/`, {
      productName: productName,
      productDescription: productDescription,
      categoryId: categoryId,
      brandName:brand
    });
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};


export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/product/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const deleteProductById = async (productId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const editProductById = async (productId, editedProductData) => {
  try {
    const response = await axios.put(`${BASE_URL}/product/${productId}`, editedProductData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getProductLedger = async (productId) => {
  try {
    const response = await axios.get(`${BASE_URL}/ledger/product/${productId}`);    
    return response.data;
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};
