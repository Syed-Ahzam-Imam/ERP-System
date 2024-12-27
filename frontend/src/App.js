import React, { useState, useEffect } from "react";
import { Center, ChakraProvider, Spinner } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import theme from "./styles/theme";
import SignIn from "./pages/signIn.js";
import Footer from "./pages/navigation/footer";
import Products from "./pages/products/Products";
import Branches from "./pages/branches/Branches";
import Purchasing from "./pages/purchasings/Purchasing";
import Inventory from "./pages/inventory/Inventory";
import Customers from "./pages/customers/Customers";
import Suppliers from "./pages/supplier/Suppliers";
import Sales from "./pages/sales/Sales.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Cashbook from "./pages/cashbook/Cashbook.jsx";
import Reports from "./pages/reports/Reports.jsx";
import PaymentOptions from "./pages/settings/component/Admin/PaymentOptions/PaymentOptions.jsx";
import SideBar from "./pages/navigation/SidebarHeader.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Investors from "./pages/investors/Investors.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import Quote from "./pages/quote/Quote.jsx";


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // Use null as initial state
  const location = useLocation();

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "isUserLoggedIn") {
        setIsLoggedIn(event.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    const userIsLoggedIn = localStorage.getItem("isUserLoggedIn");
    setIsLoggedIn(userIsLoggedIn === "true");
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const allowedPaths = [
    "/dashboard",
    "/purchasing",
    "/products",
    "/branches",
    "/inventory",
    "/customers",
    "/suppliers",
    "/sales",
    "/quote",
    "/cashbook",
    "/reports",
    "/settings",
    "/settings/paymentoptions",
    "/investors",
    "/*",
    // Add more allowed paths as needed
  ];

  const showHeaderFooter = allowedPaths.includes(location.pathname);
  const [sideBarWidth, setSideBarWidth] = useState("large");

  const handleSidebarWidth = () => {
    setSideBarWidth(prevWidth => (prevWidth === "small" ? "large" : "small"));
  }

  if (isLoggedIn === null) {
    // Still checking the login status, show a loading spinner or any loading indicator
    return (
      <Center>
        <Spinner

          thickness='4px'
          speed='0.65s'

          emptyColor='gray.200'
          color='blue.500'
          size='xl'
        />
      </Center>
    );
  }

  // Check if user is not logged in and redirect to the login page
  if (!isLoggedIn) {
    return (
      <ChakraProvider theme={theme}>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/*" element={<SignIn />} />
        </Routes>
      </ChakraProvider>
    );
  }

  // User is logged in, render the authenticated content
  return (
    <ChakraProvider theme={theme}>
      {/* {showHeaderFooter && <SidebarWithHeader />} */}
      {showHeaderFooter && <SideBar sideBarWidth={sideBarWidth} handleSidebarWidth={handleSidebarWidth} />}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard sideBarWidth={sideBarWidth} />} />
        <Route path="/purchasing" element={<Purchasing sideBarWidth={sideBarWidth} />} />
        <Route path="/products" element={<Products sideBarWidth={sideBarWidth} />} />
        <Route path="/branches" element={<Branches sideBarWidth={sideBarWidth} />} />
        <Route path="/inventory" element={<Inventory sideBarWidth={sideBarWidth} />} />
        <Route path="/customers" element={<Customers sideBarWidth={sideBarWidth} />} />
        <Route path="/suppliers" element={<Suppliers sideBarWidth={sideBarWidth} />} />
        <Route path="/sales" element={<Sales sideBarWidth={sideBarWidth} />} />
        <Route path="/quote" element={<Quote sideBarWidth={sideBarWidth} />} />
        <Route path="/cashbook" element={<Cashbook sideBarWidth={sideBarWidth} />} />
        <Route path="/reports" element={<Reports sideBarWidth={sideBarWidth} />} />
        <Route path="/settings" element={<Settings sideBarWidth={sideBarWidth} />} />
        <Route path="/settings/paymentoptions" element={<PaymentOptions sideBarWidth={sideBarWidth} />} />
        <Route path="/investors" element={<Investors sideBarWidth={sideBarWidth} />} />
        {/* Add more routes for authenticated content as needed */}
        <Route path="/*" element={<NotFound sideBarWidth={sideBarWidth} />} />
      </Routes>
      {showHeaderFooter && <Footer />}
    </ChakraProvider>
  );
}
