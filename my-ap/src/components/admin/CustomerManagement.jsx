import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Search, User } from 'lucide-react';
import axios from 'axios';

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/customers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCustomers(response.data.customers || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {filteredCustomers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No customers found</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCustomers.map((customer) => (
                        <Card key={customer._id}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        {customer.picture ? (
                                            <img src={customer.picture} alt={customer.name} className="w-12 h-12 rounded-full" />
                                        ) : (
                                            <User className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{customer.name}</h3>
                                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                                        {customer.phone && (
                                            <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                        )}
                                        <div className="mt-2 flex gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Orders: {customer.orders?.length || 0}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Joined: {new Date(customer.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
