import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Package
} from 'lucide-react';
import axios from 'axios';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4000/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCartItems(response.data.cart || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:4000/api/cart',
        { productId, quantity: newQuantity },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update quantity",
        variant: "destructive"
      });
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4000/api/cart/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast({
        title: "Item removed",
        description: "Product removed from cart"
      });

      fetchCart();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!localStorage.getItem('token')) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-12">
            <div className="text-center">
              <ShoppingCart className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Please Login</h2>
              <p className="text-muted-foreground mb-6">
                You need to be logged in to view your cart
              </p>
              <Link to="/account">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  Go to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto p-12">
            <div className="text-center">
              <ShoppingBag className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added anything to your cart yet
              </p>
              <Link to="/product">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Start Shopping
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-xl text-purple-100">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.product?._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-32 h-32 object-cover rounded-lg border-2"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <Link to={`/product/${item.product?._id}`}>
                            <h3 className="text-xl font-bold hover:text-primary transition-colors line-clamp-1">
                              {item.product?.name}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground line-clamp-2 mt-1">
                            {item.product?.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{item.product?.category}</Badge>
                            {item.product?.brand && (
                              <Badge variant="secondary">{item.product.brand}</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product?._id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product?._id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-0 focus-visible:ring-0"
                            min="1"
                            max={item.product?.stock}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                            disabled={item.quantity >= item.product?.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${item.product?.price} each
                          </p>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.product?.stock <= 10 && (
                        <Badge variant="destructive" className="mt-2">
                          Only {item.product.stock} left in stock!
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-2xl">Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold">${(calculateTotal() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span className="text-primary">${(calculateTotal() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    🎉 You're getting <span className="font-semibold text-foreground">FREE SHIPPING</span> on this order!
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                <Button size="lg" className="w-full text-lg h-14" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to="/product" className="w-full">
                  <Button variant="outline" size="lg" className="w-full text-lg h-12">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Trust Badges */}
            <Card className="mt-4 p-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free shipping on all orders</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
