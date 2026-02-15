import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import axios from 'axios';

export default function OrderManagement({ onUpdate }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:4000/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:4000/api/admin/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            toast({
                title: "Success",
                description: "Order status updated"
            });

            fetchOrders();
            onUpdate?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update order status",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-4">
            {orders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
                orders.map((order) => (
                    <Card key={order._id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Customer: {order.customer?.name || 'N/A'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${order.totalAmount}</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Items: {order.items?.length || 0}</p>
                                <div className="space-y-1">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <p key={idx} className="text-sm text-muted-foreground">
                                            {item.name} x {item.quantity}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                                {order.status === 'pending' && (
                                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'processing')}>
                                        Process
                                    </Button>
                                )}
                                {order.status === 'processing' && (
                                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'shipped')}>
                                        Ship
                                    </Button>
                                )}
                                {order.status === 'shipped' && (
                                    <Button size="sm" onClick={() => updateOrderStatus(order._id, 'delivered')}>
                                        Mark Delivered
                                    </Button>
                                )}
                                {['pending', 'processing'].includes(order.status) && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}
