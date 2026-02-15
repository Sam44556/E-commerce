import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from './ui/use-toast';
import {
  ShoppingCart,
  Star,
  Package,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Heart
} from 'lucide-react';
import axios from 'axios';

export default function SingleProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Please login",
          description: "You need to be logged in to add items to cart",
          variant: "destructive"
        });
        navigate('/account');
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/cart`,
        { productId: product._id, quantity },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast({
        title: "Success!",
        description: `${product.name} added to cart`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add to cart",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <Button onClick={() => navigate('/product')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/product')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-2">
              {product.images && product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-[500px] object-cover"
                />
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100">
                  <Package className="w-32 h-32 text-purple-300" />
                </div>
              )}
            </Card>

            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img, idx) => (
                  <Card key={idx} className="overflow-hidden cursor-pointer hover:border-primary transition-colors">
                    <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-24 object-cover" />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {product.featured && (
                    <Badge className="mb-2 bg-yellow-500">
                      <Star className="w-3 h-3 mr-1" />
                      Featured Product
                    </Badge>
                  )}
                  <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-base">
                      {product.category}
                    </Badge>
                    {product.brand && (
                      <span className="text-muted-foreground">by {product.brand}</span>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="outline" className="shrink-0">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>

              {product.rating?.average > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(product.rating.average)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{product.rating.average.toFixed(1)}</span>
                  <span className="text-muted-foreground">({product.rating.count} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-bold text-primary">${product.price}</span>
                  {product.stock > 0 ? (
                    <Badge className="bg-green-500 text-lg px-4 py-1">
                      In Stock ({product.stock} available)
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-lg px-4 py-1">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="quantity" className="text-base mb-2 block">
                        Quantity
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                            className="w-20 text-center border-0 focus-visible:ring-0"
                            min="1"
                            max={product.stock}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            disabled={quantity >= product.stock}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="text-muted-foreground">
                          Max: {product.stock}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full text-lg h-14"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart - ${(product.price * quantity).toFixed(2)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold">Fast Delivery</p>
                <p className="text-xs text-muted-foreground">2-3 business days</p>
              </Card>
              <Card className="text-center p-4">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% protected</p>
              </Card>
              <Card className="text-center p-4">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-semibold">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day guarantee</p>
              </Card>
            </div>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <dt className="font-semibold">SKU:</dt>
                    <dd className="text-muted-foreground">{product.sku}</dd>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <dt className="font-semibold">Category:</dt>
                    <dd className="text-muted-foreground">{product.category}</dd>
                  </div>
                  {product.brand && (
                    <div className="flex justify-between border-b pb-2">
                      <dt className="font-semibold">Brand:</dt>
                      <dd className="text-muted-foreground">{product.brand}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="font-semibold">Availability:</dt>
                    <dd className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
