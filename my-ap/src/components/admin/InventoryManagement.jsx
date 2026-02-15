import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, Edit, Trash2, Search, Package, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import axios from 'axios';

export default function InventoryManagement({ onUpdate }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        stock: '',
        sku: '',
        brand: '',
        featured: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(response.data.products || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch products",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + selectedFiles.length > 5) {
            toast({
                title: "Too many images",
                description: "Maximum 5 images allowed",
                variant: "destructive"
            });
            return;
        }

        // Check file sizes
        const oversized = files.filter(file => file.size > 5 * 1024 * 1024);
        if (oversized.length > 0) {
            toast({
                title: "File too large",
                description: "Each image must be under 5MB",
                variant: "destructive"
            });
            return;
        }

        // Add new files
        setSelectedFiles([...selectedFiles, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('stock', formData.stock);
            formDataToSend.append('sku', formData.sku);
            formDataToSend.append('brand', formData.brand);
            formDataToSend.append('featured', formData.featured);

            // Add image files
            selectedFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/products`, formDataToSend, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast({
                title: "Success",
                description: "Product added successfully with images"
            });

            // Reset form
            setShowAddForm(false);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Electronics',
                stock: '',
                sku: '',
                brand: '',
                featured: false
            });
            setSelectedFiles([]);
            setImagePreviews([]);
            fetchProducts();
            onUpdate?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to add product",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast({
                title: "Success",
                description: "Product deleted successfully"
            });

            fetchProducts();
            onUpdate?.();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete product",
                variant: "destructive"
            });
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            sku: product.sku,
            brand: product.brand || '',
            featured: product.featured || false
        });
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Create FormData for multipart upload
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('stock', formData.stock);
            formDataToSend.append('sku', formData.sku);
            formDataToSend.append('brand', formData.brand);
            formDataToSend.append('featured', formData.featured);

            // Add new image files
            selectedFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            // Add images to delete
            if (imagesToDelete.length > 0) {
                formDataToSend.append('deleteImages', JSON.stringify(imagesToDelete));
            }

            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/admin/products/${editingProduct._id}`, 
                formDataToSend, 
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast({
                title: "Success",
                description: "Product updated successfully"
            });

            // Reset form
            setShowEditForm(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Electronics',
                stock: '',
                sku: '',
                brand: '',
                featured: false
            });
            setSelectedFiles([]);
            setImagePreviews([]);
            setImagesToDelete([]);
            fetchProducts();
            onUpdate?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update product",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const removeExistingImage = (imageUrl) => {
        setImagesToDelete([...imagesToDelete, imageUrl]);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Product</CardTitle>
                        <CardDescription>Fill in the details to add a new product to your inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU *</Label>
                                    <Input
                                        id="sku"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock *</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <select
                                        id="category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                    >
                                        <option>Electronics</option>
                                        <option>Clothing</option>
                                        <option>Home & Garden</option>
                                        <option>Sports</option>
                                        <option>Books</option>
                                        <option>Toys</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <Input
                                        id="brand"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <Label>Product Images (Max 5)</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    <input
                                        type="file"
                                        id="images"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <label htmlFor="images" className="cursor-pointer">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Click to upload images or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF up to 5MB each
                                        </p>
                                    </label>
                                </div>

                                {/* Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-4 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="featured" className="cursor-pointer">Featured Product</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={uploading}>
                                    {uploading ? (
                                        <>
                                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Add Product'
                                    )}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setSelectedFiles([]);
                                        setImagePreviews([]);
                                    }}
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Edit Product Form */}
            {showEditForm && editingProduct && (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Product</CardTitle>
                        <CardDescription>Update product details and manage images</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name">Product Name *</Label>
                                    <Input
                                        id="edit-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-sku">SKU *</Label>
                                    <Input
                                        id="edit-sku"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        required
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-price">Price *</Label>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-stock">Stock *</Label>
                                    <Input
                                        id="edit-stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">Category *</Label>
                                    <select
                                        id="edit-category"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                    >
                                        <option>Electronics</option>
                                        <option>Clothing</option>
                                        <option>Home & Garden</option>
                                        <option>Sports</option>
                                        <option>Books</option>
                                        <option>Toys</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-brand">Brand</Label>
                                    <Input
                                        id="edit-brand"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description *</Label>
                                <textarea
                                    id="edit-description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    required
                                />
                            </div>

                            {/* Existing Images */}
                            {editingProduct.images && editingProduct.images.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Current Images</Label>
                                    <div className="grid grid-cols-5 gap-4">
                                        {editingProduct.images
                                            .filter(img => !imagesToDelete.includes(img))
                                            .map((imageUrl, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(imageUrl)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Images */}
                            <div className="space-y-2">
                                <Label>Add New Images (Max 5 total)</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                                    <input
                                        type="file"
                                        id="edit-images"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    <label htmlFor="edit-images" className="cursor-pointer">
                                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Click to upload new images
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF up to 5MB each
                                        </p>
                                    </label>
                                </div>

                                {/* New Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-4 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`New ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border border-green-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="edit-featured"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <Label htmlFor="edit-featured" className="cursor-pointer">Featured Product</Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={uploading}>
                                    {uploading ? (
                                        <>
                                            <Upload className="w-4 h-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Product'
                                    )}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditingProduct(null);
                                        setSelectedFiles([]);
                                        setImagePreviews([]);
                                        setImagesToDelete([]);
                                    }}
                                    disabled={uploading}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Products List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No products found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredProducts.map((product) => (
                        <Card key={product._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 flex-1">
                                        {product.images && product.images.length > 0 ? (
                                            <div className="relative">
                                                <img
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                {product.images.length > 1 && (
                                                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                        +{product.images.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{product.sku}</p>
                                            <div className="flex flex-wrap gap-4 text-sm">
                                                <span className="font-medium">${product.price}</span>
                                                <span className={`${product.stock <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    Stock: {product.stock}
                                                </span>
                                                <span className="text-muted-foreground">{product.category}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {product.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => handleDelete(product._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
