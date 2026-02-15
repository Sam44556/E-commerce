import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
const Contextp = createContext();

function Provider({ children }) {

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]); // Renamecdd for consistency
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
 
  // 🔑 Run this on load to check JWT and decode it
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("JWT Payload:", payload);
        setUser(payload); // Set user context from token
      } catch (err) {
        console.error("Invalid JWT:", err);
      }
    }
  }, []);
    useEffect(() => {
    // Fetch products from backend API
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);
  function addItemToCart(item) {
    if (user) {
      setCartItems([...cartItems, item]);
    } else {
      alert("Please log in to add items to your cart.");
    }
  }

  function deleteItem(id) {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  function login(username) {
    setUser({ name: username }); // Set user object with name
  }

 

  useEffect(() => {
    // Function to filter products based on the query
    const filterProducts = () => {
      if (!query) {
        setProducts(Products); // If no query, show all products
        return;
      }

      const lowerCaseQuery = query.toLowerCase();
      const filtered = Products.filter((product) =>
        product.name.toLowerCase().includes(lowerCaseQuery)
      );
      setProducts(filtered);
    };

    filterProducts();
  }, [query]);

  return (
    <Contextp.Provider
      value={{
        products,
        cartItems,
        setCartItems,
        addItemToCart,
        deleteItem,
        query,
        setQuery,
        user,
        login,
        setUser,
      }}
    >
      {children}
    </Contextp.Provider>
  );
}

function useProvider() {
  const context = useContext(Contextp);
  if (context === undefined) {
    throw new Error("useProvider must be used within a Provider");
  }
  return context;
}

export { Contextp, Provider, useProvider };
