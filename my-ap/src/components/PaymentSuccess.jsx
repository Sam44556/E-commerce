import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Package, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmOrder = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No payment session found.');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setStatus('error');
          setErrorMessage('Please log in to confirm your order.');
          return;
        }

        // Call backend to confirm payment, create order, and clear cart
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/payment/confirm-payment`,
          { sessionId },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        setOrder(response.data.order);
        setStatus('success');
        console.log('Order confirmed:', response.data.message);
      } catch (error) {
        console.error('Error confirming payment:', error);
        setStatus('error');
        setErrorMessage(
          error.response?.data?.message || 'Failed to confirm your order. Please contact support.'
        );
      }
    };

    confirmOrder();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center p-12">
            <CardContent className="space-y-6">
              <Loader2 className="w-20 h-20 text-primary mx-auto animate-spin" />
              <h2 className="text-2xl font-bold">Confirming your payment...</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your payment and create your order.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center p-8">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-24 h-24 text-red-500" />
              </div>
              <CardTitle className="text-4xl mb-2">Something Went Wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl text-muted-foreground">{errorMessage}</p>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">
                  If your payment was charged, please contact our support team with your payment details.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/product">
                  <Button size="lg" className="w-full sm:w-auto">
                    Continue Shopping
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="text-center p-8">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-24 h-24 text-green-500" />
            </div>
            <CardTitle className="text-4xl mb-2">Payment Successful!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed!
            </p>

            {order && (
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <p className="text-green-900 font-semibold mb-2">
                  ✅ Order Created Successfully
                </p>
                <p className="text-green-800 text-sm mb-1">
                  Order Number: <span className="font-mono font-bold">{order.orderNumber}</span>
                </p>
                <p className="text-green-800 text-sm">
                  Total: <span className="font-bold">${(order.totalAmount || 0).toFixed(2)}</span>
                </p>
                <p className="text-green-800 text-sm mt-2">
                  Your cart has been cleared and your order is now being processed by our team.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <Package className="w-6 h-6 text-blue-600 mt-1" />
                <div className="text-left">
                  <p className="font-semibold text-blue-900 mb-1">What happens next?</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You'll receive an email confirmation shortly</li>
                    <li>• Our admin team will review and process your order</li>
                    <li>• You'll be notified when your order ships</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/product">
                <Button size="lg" className="w-full sm:w-auto">
                  Continue Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
