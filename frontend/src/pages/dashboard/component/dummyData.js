import { BiPurchaseTag } from "react-icons/bi";
import { FaRegUser } from "react-icons/fa";
import { FcBullish, FcConferenceCall, FcLineChart, FcPackage, FcRules, FcSalesPerformance, FcShipped } from "react-icons/fc";

export const purchaseData = {
    color: "#8884d8",
    icon: FcShipped,
    title: "Purchases",
    number: "343",
    dataKey: "purchases",
    percentage: 45,
    link: "/purchasing",
    chartData: [
        { name: "Jan", purchases: 10 },
        { name: "Feb", purchases: 40 },
        { name: "Mar", purchases: 20 },
        { name: "Apr", purchases: 34 },
        { name: "May", purchases: 55 },
        { name: "June", purchases: 0 },
        { name: "July", purchases: 30 },
        { name: "Aug", purchases: 102 },
        { name: "Sep", purchases: 12 },
        { name: "Oct", purchases: 112 },
        { name: "Nov", purchases: 10 },
        { name: "Dec", purchases: 0 },
    ]
}

export const salesData = {
    color: "#337AFF",
    icon: FcBullish,
    title: "Total Sales",
    number: "343",
    dataKey: "sales",
    percentage: 45,
    link: "/sales",
    chartData: [
        { name: "Jan", sales: 10 },
        { name: "Feb", sales: 40 },
        { name: "Mar", sales: 20 },
        { name: "Apr", sales: 34 },
        { name: "May", sales: 55 },
        { name: "June", sales: 0 },
        { name: "July", sales: 30 },
        { name: "Aug", sales: 102 },
        { name: "Sep", sales: 12 },
        { name: "Oct", sales: 112 },
        { name: "Nov", sales: 10 },
        { name: "Dec", sales: 0 },
    ]
}
export const customerData = {
    color: "#33FFAD",
    icon: FcConferenceCall,
    title: "Customers",
    number: "343",
    dataKey: "customers",
    percentage: 45,
    link: "/customers",
    chartData: [
        { name: "Jan", customers: 10 },
        { name: "Feb", customers: 40 },
        { name: "Mar", customers: 20 },
        { name: "Apr", customers: 34 },
        { name: "May", customers: 55 },
        { name: "June", customers: 0 },
        { name: "July", customers: 30 },
        { name: "Aug", customers: 102 },
        { name: "Sep", customers: 12 },
        { name: "Oct", customers: 112 },
        { name: "Nov", customers: 10 },
        { name: "Dec", customers: 0 },
    ]
}
export const productsData = {
    color: "#FF8433",
    icon: FcPackage,
    title: "Products",
    number: "343",
    dataKey: "products",
    percentage: 45,
    link: "/products",
    chartData: [
        { name: "Jan", products: 10 },
        { name: "Feb", products: 40 },
        { name: "Mar", products: 20 },
        { name: "Apr", products: 34 },
        { name: "May", products: 55 },
        { name: "June", products: 0 },
        { name: "July", products: 30 },
        { name: "Aug", products: 102 },
        { name: "Sep", products: 12 },
        { name: "Oct", products: 112 },
        { name: "Nov", products: 10 },
        { name: "Dec", products: 0 },
    ]
}

export const inventoryData = {
    icon: FcRules,
    title: "Items in Inventory",
    number: "25",
    dataKey: "value",
    percentage: "15",
    link: "/inventory",
    chartData: [
        { name: "Monocrystalline Panels", value: 20 },
        { name: "Polycrystalline Panels", value: 15 },
        { name: "Thin-Film Panels", value: 18 },
        { name: "Solar Inverters", value: 25 },
        { name: "Solar Batteries", value: 12 },
        { name: "Solar Charge Controllers", value: 17 },
        { name: "Mounting Structures", value: 14 },
        { name: "Solar Water Pumps", value: 8 },
        { name: "Solar Lights", value: 22 },
        { name: "Solar Fans", value: 11 },
        { name: "Solar Heating Systems", value: 16 },
        { name: "Solar Ventilation Fans", value: 9 },
        { name: "Solar Air Conditioners", value: 7 },
        { name: "Solar Refrigerators", value: 13 },
        { name: "Solar Power Stations", value: 19 },
    ]

}

export const revenueData = {
    icon: FcLineChart,
    title: "Income Statement",
    percentage: "25",
    link: "/grosssummary",
    dataKey: "month",
    dataKey1: "profit",
    dataKey2: "expense",
    chartData: [
        { month: "Jan", expense: 1200, profit: 2400 },
        { month: "Feb", expense: 1800, profit: 2900 },
        { month: "Mar", expense: 900, profit: 2000 },
        { month: "Apr", expense: 1400, profit: 2500 },
        { month: "May", expense: 1100, profit: 2100 },
        { month: "June", expense: 2000, profit: 3000 },
        { month: "July", expense: 1600, profit: 2700 },
        { month: "Aug", expense: 1300, profit: 2200 },
        { month: "Sep", expense: 900, profit: 1800 },
        { month: "Oct", expense: 1700, profit: 2800 },
        { month: "Nov", expense: 1500, profit: 2600 },
        { month: "Dec", expense: 1900, profit: 3100 },
    ]
}