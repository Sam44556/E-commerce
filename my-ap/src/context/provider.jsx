import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import axios from "axios";

const Contextp = createContext();

function Provider({ children }) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);       // filtered products
  const [allProducts, setAllProducts] = useState([]); // original products
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // 🔑 Check JWT on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("JWT Payload:", payload);
        setUser(payload);
      } catch (err) {
        console.error("Invalid JWT:", err);
      }
    }
  }, []);

  // 📦 Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products`
        );
        setProducts(res.data);
        setAllProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, []);

  // 🔎 Filter products when query changes
  useEffect(() => {
    if (!query) {
      setProducts(allProducts);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();

    const filtered = allProducts.filter((product) =>
      product.name.toLowerCase().includes(lowerCaseQuery)
    );

    setProducts(filtered);
  }, [query, allProducts]);

  // 🛒 Add to cart
  function addItemToCart(item) {
    if (user) {
      setCartItems((prev) => [...prev, item]);
    } else {
      alert("Please log in to add items to your cart.");
    }
  }

  // ❌ Delete from cart
  function deleteItem(id) {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== id)
    );
  }

  // 🔐 Simple login setter
  function login(username) {
    setUser({ name: username });
  }

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
  if (!context) {
    throw new Error("useProvider must be used within a Provider");
  }
  return context;
}

export { Contextp, Provider, useProvider };
