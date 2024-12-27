import axios from "axios";
import { BASE_URL, role,  } from "./constants";


export const getTrialBalance = async (trialBalanceName, branchId) => {
    let response;
  
    try {
        if (trialBalanceName == 'Customers'&& branchId == null) {
            response = await axios.get(`${BASE_URL}/ledger/customer`);
            return response.data.customers;

        }
        if (trialBalanceName == 'Customers' && branchId!=null) {
            response = await axios.get(`${BASE_URL}/ledger/customer/trialBalance/${branchId}`);
            return response.data.customers;

        }
        else {
            
            response = await axios.get(`${BASE_URL}/ledger/supplier`);
            return response.data.suppliers;

        }
    } catch (error) {
        throw error.response ? error.response.data : error.message;
    }
};