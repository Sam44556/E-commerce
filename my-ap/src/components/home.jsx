import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ShoppingBag, TrendingUp, Shield, Truck, Star } from 'lucide-react';
import { useProvider } from '../context/provider';
import { useToast } from './ui/use-toast';

export default function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useProvider();
  const { toast } = useToast();

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const role = searchParams.get('role');

    if (token && userId && email) {
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role || 'customer');
      localStorage.setItem('userId', userId);

      // Update context
      setUser({ userId, email, name, role: role || 'customer' });

      // Show success message
      toast({
        title: "Welcome!",
        description: `Successfully logged in with Google as ${name}`,
      });

      // Clean URL by removing query params
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, setUser, toast]);

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Wide Selection",
      description: "Thousands of products across multiple categories"
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Quick and reliable shipping to your doorstep"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Payment",
      description: "Your transactions are safe and encrypted"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Quality Products",
      description: "Only the best products from trusted brands"
    }
  ];

  const categories = [
    { name: "Electronics", image: "📱", color: "from-blue-500 to-cyan-500" },
    { name: "Clothing", image: "👕", color: "from-purple-500 to-pink-500" },
    { name: "Home & Garden", image: "🏡", color: "from-green-500 to-emerald-500" },
    { name: "Sports", image: "⚽", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4 animate-fade-in">
              <TrendingUp className="w-4 h-4" />
              <span>New Arrivals Every Week</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-slide-in-top">
              Shop the Future of
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                E-Commerce
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto animate-fade-in">
              Discover amazing products at unbeatable prices. Your one-stop shop for everything you need.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-bottom">
              <Link to="/product">
                <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-6 h-auto">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Now
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 h-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-muted-foreground">Experience shopping like never before</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop by Category</h2>
            <p className="text-xl text-muted-foreground">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link to={`/product?category=${category.name}`} key={index}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                  <div className={`h-32 bg-gradient-to-br ${category.color} flex items-center justify-center text-6xl transition-transform group-hover:scale-110`}>
                    {category.image}
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/product">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover amazing deals today!
          </p>
          <Link to="/product">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50 text-lg px-8 py-6 h-auto">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
