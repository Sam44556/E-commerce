import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  // Removed unused useEffect, useState, and sessionId

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

            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <p className="text-green-900 font-semibold mb-2">
                ✅ Order Created Successfully
              </p>
              <p className="text-green-800 text-sm">
                Your cart has been cleared and your order is now being processed by our team.
              </p>
            </div>

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
