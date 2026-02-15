import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    AlertCircle,
    Plus
} from 'lucide-react';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import CustomerManagement from './CustomerManagement';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        products: { total: 0, lowStock: 0, outOfStock: 0 },
        orders: { total: 0, pending: 0 },
        revenue: 0,
        customers: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/api/admin/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Products",
            value: stats.products?.total || 0,
            icon: <Package className="w-6 h-6" />,
            description: `${stats.products?.lowStock || 0} low stock`,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Total Orders",
            value: stats.orders?.total || 0,
            icon: <ShoppingCart className="w-6 h-6" />,
            description: `${stats.orders?.pending || 0} pending`,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Total Revenue",
            value: `$${(stats.revenue || 0).toLocaleString()}`,
            icon: <DollarSign className="w-6 h-6" />,
            description: "All time",
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        },
        {
            title: "Total Customers",
            value: stats.customers || 0,
            icon: <Users className="w-6 h-6" />,
            description: "Active users",
            color: "text-orange-600",
            bgColor: "bg-orange-100"
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 p-6">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage your store inventory, orders, and customers</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                                    {stat.icon}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Alerts */}
                {(stats.products?.lowStock > 0 || stats.products?.outOfStock > 0) && (
                    <Card className="mb-8 border-orange-200 bg-orange-50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                <CardTitle className="text-orange-900">Inventory Alerts</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                {stats.products?.lowStock > 0 && (
                                    <p className="text-orange-800">
                                        ⚠️ {stats.products.lowStock} product(s) are running low on stock
                                    </p>
                                )}
                                {stats.products?.outOfStock > 0 && (
                                    <p className="text-orange-800">
                                        🚫 {stats.products.outOfStock} product(s) are out of stock
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Management Tabs */}
                <Card>
                    <Tabs defaultValue="inventory" className="w-full">
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="inventory" className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    Inventory
                                </TabsTrigger>
                                <TabsTrigger value="orders" className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    Orders
                                </TabsTrigger>
                                <TabsTrigger value="customers" className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Customers
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent>
                            <TabsContent value="inventory" className="mt-0">
                                <InventoryManagement onUpdate={fetchDashboardStats} />
                            </TabsContent>

                            <TabsContent value="orders" className="mt-0">
                                <OrderManagement onUpdate={fetchDashboardStats} />
                            </TabsContent>

                            <TabsContent value="customers" className="mt-0">
                                <CustomerManagement />
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
