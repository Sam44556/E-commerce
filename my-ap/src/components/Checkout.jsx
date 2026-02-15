import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import { CreditCard, MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/account');
          return;
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCartTotal(response.data.total);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to fetch cart total.' });
      }
    })();
  }, [navigate, toast]);

  const fetchCartTotal = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/account');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const cart = response.data.cart || [];
      const total = cart.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
      setCartTotal(total);

      if (cart.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Call backend to create Stripe checkout session
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/payment/create-checkout-session`,
        { shippingAddress },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Redirect to Stripe checkout page
      window.location.href = response.data.url;
      
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create checkout session",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="text-3xl flex items-center gap-2">
              <CreditCard className="w-8 h-8" />
              Checkout
            </CardTitle>
            <CardDescription className="text-lg">
              Enter your shipping details to complete your order
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-semibold mb-4">
                  <MapPin className="w-6 h-6" />
                  Shipping Address
                </div>

                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="New York"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="NY"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      required
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      placeholder="10001"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="mt-1"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span className="font-semibold">${(cartTotal * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-primary">${(cartTotal * 1.1).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                  🔒 You will be redirected to Stripe's secure payment page to complete your purchase
                </p>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg h-14"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay with Stripe
                  </>
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/cart')}
                disabled={loading}
              >
                Back to Cart
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
