import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Users,
  Award,
  Heart,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Shield
} from 'lucide-react';

export default function About() {
  const stats = [
    { icon: <Users className="w-8 h-8" />, value: "10,000+", label: "Happy Customers" },
    { icon: <ShoppingBag className="w-8 h-8" />, value: "50,000+", label: "Products Sold" },
    { icon: <Award className="w-8 h-8" />, value: "4.9/5", label: "Customer Rating" },
    { icon: <TrendingUp className="w-8 h-8" />, value: "5 Years", label: "In Business" }
  ];

  const values = [
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Customer First",
      description: "We put our customers at the heart of everything we do, ensuring satisfaction with every purchase."
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Quality Guaranteed",
      description: "Every product is carefully selected and verified to meet our high standards of quality."
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: "Best Prices",
      description: "We offer competitive prices without compromising on quality, giving you the best value."
    }
  ];

  const team = [
    { name: "Sarah Johnson", role: "CEO & Founder", image: "👩‍💼" },
    { name: "Michael Chen", role: "Head of Operations", image: "👨‍💼" },
    { name: "Emily Davis", role: "Customer Success", image: "👩‍💻" },
    { name: "David Wilson", role: "Product Manager", image: "👨‍💻" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white text-base px-4 py-2">
              About Us
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Trusted Shopping Partner
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              We're dedicated to bringing you the best products at the best prices,
              with exceptional customer service every step of the way.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-primary mb-3 flex justify-center">{stat.icon}</div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <Badge className="mb-4">Our Story</Badge>
            <h2 className="text-4xl font-bold mb-6">Building Trust Since 2019</h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                What started as a small online store has grown into a thriving e-commerce platform
                serving thousands of satisfied customers worldwide.
              </p>
              <p>
                Our journey began with a simple mission: to make quality products accessible to
                everyone at fair prices. Today, we continue to uphold that mission while expanding
                our product range and improving our services.
              </p>
              <p>
                We believe in building lasting relationships with our customers through transparency,
                reliability, and exceptional service.
              </p>
            </div>
            <Link to="/product">
              <Button size="lg" className="mt-6 text-lg px-8 py-6 h-auto">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
              </Button>
            </Link>
          </div>
          <Card className="overflow-hidden border-2">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 h-96 flex items-center justify-center">
              <ShoppingBag className="w-32 h-32 text-purple-300" />
            </div>
          </Card>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our Values</Badge>
            <h2 className="text-4xl font-bold mb-4">What We Stand For</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our core values guide everything we do and shape the experience we deliver
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="text-primary mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4">Our Team</Badge>
            <h2 className="text-4xl font-bold mb-4">Meet the People Behind the Magic</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Passionate individuals working together to bring you the best shopping experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all hover:-translate-y-2">
                <CardHeader>
                  <div className="text-7xl mb-4">{member.image}</div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-base">{member.role}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-primary/20">
          <CardHeader className="text-center">
            <Badge className="mb-4 mx-auto">Get in Touch</Badge>
            <CardTitle className="text-3xl">We'd Love to Hear From You</CardTitle>
            <CardDescription className="text-lg">
              Have questions? Our team is here to help!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Mail className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground">support@store.com</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Phone className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </Card>
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <p className="text-muted-foreground">Mon-Fri: 9AM-6PM</p>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-white">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Visit Our Office</h3>
                  <p className="text-muted-foreground">
                    123 Commerce Street, Suite 100<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </div>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers and discover amazing products today!
          </p>
          <Link to="/product">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
