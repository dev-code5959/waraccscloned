// File: resources/js/Pages/Admin/Orders/Show.jsx

import React, { useState } from 'react';
import { Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    User,
    Package,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    DollarSign,
    Download,
    MessageCircle,
    History,
    Eye,
    EyeOff,
    Copy,
    Settings,
    Plus,
    Minus,
    Upload,
    Truck,
    FileText,
    Paperclip,
    X
} from 'lucide-react';

export default function Show({
    order,
    timeline,
    canProcess,
    canCancel,
    canRefund,
    canAssignCodes,
    canUploadFiles
}) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [showAssignCodesModal, setShowAssignCodesModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);
    const [selectedCodes, setSelectedCodes] = useState([]);
    const [availableCodes, setAvailableCodes] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const { data: cancelData, setData: setCancelData, post: postCancel, processing: cancelProcessing, errors: cancelErrors } = useForm({
        reason: ''
    });

    const { data: refundData, setData: setRefundData, post: postRefund, processing: refundProcessing, errors: refundErrors } = useForm({
        amount: order.net_amount,
        reason: '',
        type: 'full'
    });

    const { data: assignData, setData: setAssignData, post: postAssign, processing: assignProcessing } = useForm({
        access_code_ids: []
    });

    const { data: uploadData, setData: setUploadData, post: postUpload, processing: uploadProcessing, errors: uploadErrors } = useForm({
        files: [],
        delivery_notes: ''
    });

    const handleProcess = () => {
        router.post(route('admin.orders.process', order.id), {}, {
            preserveScroll: true
        });
    };

    const handleCancel = (e) => {
        e.preventDefault();
        postCancel(route('admin.orders.cancel', order.id), {
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelData('reason', '');
            }
        });
    };

    const handleRefund = (e) => {
        e.preventDefault();
        postRefund(route('admin.orders.refund', order.id), {
            onSuccess: () => {
                setShowRefundModal(false);
                setRefundData({ amount: order.net_amount, reason: '', type: 'full' });
            }
        });
    };

    const handleAssignCodes = (e) => {
        e.preventDefault();
        setAssignData('access_code_ids', selectedCodes);
        postAssign(route('admin.orders.assign-codes', order.id), {
            onSuccess: () => {
                setShowAssignCodesModal(false);
                setSelectedCodes([]);
                setAvailableCodes([]);
            }
        });
    };

    const handleFileUpload = (e) => {
        e.preventDefault();

        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        formData.append('delivery_notes', uploadData.delivery_notes);
        formData.append('_method', 'POST');

        router.post(route('admin.orders.upload-files', order.id), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setShowUploadModal(false);
                setSelectedFiles([]);
                setUploadData({ files: [], delivery_notes: '' });
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
            }
        });
    };

    const handleFileSelection = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 10) {
            alert('Maximum 10 files allowed');
            return;
        }
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const loadAvailableCodes = async () => {
        try {
            const response = await fetch(`/api/products/${order.product.id}/available-codes`);
            const data = await response.json();
            setAvailableCodes(data.codes || []);
        } catch (error) {
            console.error('Failed to load available codes:', error);
            setAvailableCodes([]);
        }
    };

    const toggleCodeSelection = (codeId) => {
        setSelectedCodes(prev =>
            prev.includes(codeId)
                ? prev.filter(id => id !== codeId)
                : [...prev, codeId]
        );
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
            processing: { class: 'bg-blue-100 text-blue-800', icon: RefreshCw, text: 'Processing' },
            pending_delivery: { class: 'bg-blue-100 text-blue-800', icon: Truck, text: 'Pending Delivery' },
            completed: { class: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
            cancelled: { class: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
            refunded: { class: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Refunded' }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                <Icon className="w-4 h-4 mr-2" />
                {badge.text}
            </span>
        );
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            pending: { class: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
            paid: { class: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Paid' },
            failed: { class: 'bg-red-100 text-red-800', icon: XCircle, text: 'Failed' },
            refunded: { class: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Refunded' }
        };

        const badge = badges[status] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.class}`}>
                <Icon className="w-4 h-4 mr-2" />
                {badge.text}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Copied to clipboard:', text);
        });
    };

    const getTimelineIcon = (event) => {
        const icons = {
            created: Plus,
            payment: CreditCard,
            processing: RefreshCw,
            pending_delivery: Truck,
            completed: CheckCircle,
            cancelled: XCircle,
            transaction: DollarSign
        };
        return icons[event.type] || CheckCircle;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.orders.index')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Orders
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order #{order.order_number}
                            </h1>
                            <p className="text-gray-600">
                                Order details and management
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        {canUploadFiles && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload & Deliver
                            </button>
                        )}
                        {canProcess && (
                            <button
                                onClick={handleProcess}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Process Order
                            </button>
                        )}
                        {canCancel && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Order
                            </button>
                        )}
                        {canRefund && (
                            <button
                                onClick={() => setShowRefundModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <DollarSign className="w-4 h-4 mr-2" />
                                Process Refund
                            </button>
                        )}
                    </div>
                </div>

                {/* Manual Delivery Status Banner */}
                {order.product.manual_delivery && order.status === 'pending_delivery' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <Truck className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">Manual Delivery Required</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    This order is awaiting manual delivery. Upload the digital products to complete the order and notify the customer.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Total Amount
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Package className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Quantity
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {order.quantity}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    {order.product.manual_delivery ? (
                                        <Truck className="h-6 w-6 text-purple-400" />
                                    ) : (
                                        <CheckCircle className="h-6 w-6 text-purple-400" />
                                    )}
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Delivery Type
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {order.product.manual_delivery ? 'Manual' : 'Auto'}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <MessageCircle className="h-6 w-6 text-orange-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Support Tickets
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {order.support_tickets?.length || 0}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>

                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Order Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 font-mono">
                                        {order.order_number}
                                        <button
                                            onClick={() => copyToClipboard(order.order_number)}
                                            className="ml-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <Copy className="w-4 h-4 inline" />
                                        </button>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1">
                                        {getStatusBadge(order.status)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                                    <dd className="mt-1">
                                        {getPaymentStatusBadge(order.payment_status)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {order.payment_method || 'Not specified'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatCurrency(order.unit_price)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {order.quantity}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatCurrency(order.unit_price * order.quantity)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Discount</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {order.discount_amount > 0 ?
                                            `-${formatCurrency(order.discount_amount)}` :
                                            'None'
                                        }
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                                        {formatCurrency(order.total_amount)}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(order.created_at).toLocaleString()}
                                    </dd>
                                </div>
                                {order.completed_at && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Completed</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(order.completed_at).toLocaleString()}
                                        </dd>
                                    </div>
                                )}
                                {order.promo_code && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Promo Code</dt>
                                        <dd className="mt-1 text-sm text-gray-900 font-mono">
                                            {order.promo_code}
                                        </dd>
                                    </div>
                                )}
                                {order.notes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                        <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                                            {order.notes}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>

                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-medium text-gray-900">
                                        {order.user.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.user.email}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Balance: {formatCurrency(order.user.balance || 0)}
                                    </p>
                                </div>
                                <div>
                                    <Link
                                        href={`/admin/users/${order.user.id}`}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <User className="w-4 h-4 mr-2" />
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Product Information */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>

                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {order.product.thumbnail ? (
                                        <img
                                            className="h-12 w-12 rounded object-cover"
                                            src={order.product.thumbnail}
                                            alt={order.product.name}
                                        />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                            <Package className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-medium text-gray-900">
                                        {order.product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {order.product.category?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Delivery: {order.product.manual_delivery ? 'Manual' : 'Automatic'}
                                    </p>
                                </div>
                                <div>
                                    <Link
                                        href={route('admin.products.show', order.product.id)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Package className="w-4 h-4 mr-2" />
                                        View Product
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Access Codes - Only show for automatic delivery OR completed manual delivery orders */}
                        {(!order.product.manual_delivery || (order.product.manual_delivery && order.status === 'completed')) && order.access_codes && order.access_codes.length > 0 && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Access Codes</h3>
                                    <button
                                        onClick={() => setShowCredentials(!showCredentials)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        {showCredentials ? (
                                            <>
                                                <EyeOff className="w-4 h-4 mr-2" />
                                                Hide Credentials
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="w-4 h-4 mr-2" />
                                                Show Credentials
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email/Username
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Password
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Delivered
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.access_codes.map((code) => (
                                                <tr key={code.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <span className="font-mono">
                                                                {showCredentials ?
                                                                    (code.email || code.username || code.additional_info) :
                                                                    '••••••••••'
                                                                }
                                                            </span>
                                                            {showCredentials && (
                                                                <button
                                                                    onClick={() => copyToClipboard(code.email || code.username || code.additional_info)}
                                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        <div className="flex items-center">
                                                            <span className="font-mono">
                                                                {showCredentials ?
                                                                    (code.password || 'N/A') :
                                                                    '••••••••••'
                                                                }
                                                            </span>
                                                            {showCredentials && code.password && (
                                                                <button
                                                                    onClick={() => copyToClipboard(code.password)}
                                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    <Copy className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${code.status === 'sold' ? 'bg-green-100 text-green-800' :
                                                                code.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {code.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {code.delivered_at ?
                                                            new Date(code.delivered_at).toLocaleString() :
                                                            'Not delivered'
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => copyToClipboard(`${code.email || code.username}:${code.password || ''}`)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Manual Delivery Files Section */}
                        {order.product.manual_delivery && order.status === 'completed' && order.delivery_files && order.delivery_files.length > 0 && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivered Files</h3>

                                <div className="space-y-3">
                                    {order.delivery_files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => window.open(file.download_url, '_blank')}
                                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <Download className="w-3 h-3 mr-1" />
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Assign Additional Codes */}
                        {canAssignCodes && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Assign Additional Access Codes</h3>
                                    <button
                                        onClick={() => {
                                            setShowAssignCodesModal(true);
                                            loadAvailableCodes();
                                        }}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Assign Codes
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    This order needs {order.quantity - (order.access_codes?.length || 0)} more access codes.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Timeline */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>

                            <div className="flow-root">
                                <ul className="-mb-8">
                                    {timeline.map((event, eventIdx) => {
                                        const IconComponent = getTimelineIcon(event);
                                        return (
                                            <li key={eventIdx}>
                                                <div className="relative pb-8">
                                                    {eventIdx !== timeline.length - 1 ? (
                                                        <span
                                                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                            aria-hidden="true"
                                                        />
                                                    ) : null}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.color === 'green' ? 'bg-green-500' :
                                                                    event.color === 'blue' ? 'bg-blue-500' :
                                                                        event.color === 'yellow' ? 'bg-yellow-500' :
                                                                            event.color === 'red' ? 'bg-red-500' :
                                                                                'bg-gray-500'
                                                                }`}>
                                                                <IconComponent className="h-5 w-5 text-white" />
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-900">
                                                                    {event.title}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {event.description}
                                                                </p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                <time dateTime={event.timestamp}>
                                                                    {new Date(event.timestamp).toLocaleString()}
                                                                </time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>

                        {/* Transactions */}
                        {order.transactions && order.transactions.length > 0 && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Transactions</h3>

                                <div className="space-y-3">
                                    {order.transactions.map((transaction) => (
                                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {transaction.description}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${transaction.type === 'refund' ? 'text-red-600' : 'text-green-600'
                                                    }`}>
                                                    {transaction.type === 'refund' ? '-' : '+'}
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(transaction.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Files Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Upload & Deliver Files</h3>
                                    <button
                                        onClick={() => setShowUploadModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <Truck className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-blue-800">Manual Delivery Process</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Upload the digital files for this order. Files will be delivered to the customer via email and the order will be marked as completed.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Files (Max 10 files, 10MB each)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileSelection}
                                            accept=".txt,.pdf,.zip,.rar,.doc,.docx,.jpg,.jpeg,.png"
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                                Click to upload files
                                            </span>
                                            <span className="mt-1 block text-sm text-gray-500">
                                                or drag and drop
                                            </span>
                                            <span className="mt-1 block text-xs text-gray-500">
                                                TXT, PDF, ZIP, RAR, DOC, DOCX, JPG, PNG up to 10MB each
                                            </span>
                                        </label>
                                    </div>
                                    {uploadErrors.files && (
                                        <p className="mt-1 text-sm text-red-600">{uploadErrors.files}</p>
                                    )}
                                </div>

                                {/* Selected Files Preview */}
                                {selectedFiles.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Files ({selectedFiles.length}/10)</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-400 hover:text-red-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Delivery Notes (Optional)
                                    </label>
                                    <textarea
                                        value={uploadData.delivery_notes}
                                        onChange={(e) => setUploadData(prev => ({ ...prev, delivery_notes: e.target.value }))}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add any delivery instructions or notes for the customer..."
                                    />
                                    {uploadErrors.delivery_notes && (
                                        <p className="mt-1 text-sm text-red-600">{uploadErrors.delivery_notes}</p>
                                    )}
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Once files are uploaded and delivered, the order will be automatically marked as completed and the customer will receive an email with the files attached.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setSelectedFiles([]);
                                            setUploadData({ files: [], delivery_notes: '' });
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleFileUpload}
                                        disabled={uploadProcessing || selectedFiles.length === 0}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                                    >
                                        {uploadProcessing ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload & Deliver ({selectedFiles.length} files)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancel Modal */}
                {showCancelModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Order</h3>
                                <form onSubmit={handleCancel}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cancellation Reason
                                        </label>
                                        <textarea
                                            value={cancelData.reason}
                                            onChange={(e) => setCancelData('reason', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter reason for cancellation..."
                                            required
                                        />
                                        {cancelErrors.reason && (
                                            <p className="mt-1 text-sm text-red-600">{cancelErrors.reason}</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowCancelModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={cancelProcessing}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {cancelProcessing ? 'Cancelling...' : 'Cancel Order'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Refund Modal */}
                {showRefundModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Process Refund</h3>
                                <form onSubmit={handleRefund}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Refund Type
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="full"
                                                    checked={refundData.type === 'full'}
                                                    onChange={(e) => {
                                                        setRefundData('type', e.target.value);
                                                        setRefundData('amount', order.net_amount);
                                                    }}
                                                    className="mr-2"
                                                />
                                                Full Refund ({formatCurrency(order.net_amount)})
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    value="partial"
                                                    checked={refundData.type === 'partial'}
                                                    onChange={(e) => setRefundData('type', e.target.value)}
                                                    className="mr-2"
                                                />
                                                Partial Refund
                                            </label>
                                        </div>
                                    </div>

                                    {refundData.type === 'partial' && (
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Refund Amount
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={order.net_amount}
                                                value={refundData.amount}
                                                onChange={(e) => setRefundData('amount', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            {refundErrors.amount && (
                                                <p className="mt-1 text-sm text-red-600">{refundErrors.amount}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason
                                        </label>
                                        <textarea
                                            value={refundData.reason}
                                            onChange={(e) => setRefundData('reason', e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter reason for refund..."
                                            required
                                        />
                                        {refundErrors.reason && (
                                            <p className="mt-1 text-sm text-red-600">{refundErrors.reason}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowRefundModal(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={refundProcessing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {refundProcessing ? 'Processing...' : 'Process Refund'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Codes Modal */}
                {showAssignCodesModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Access Codes</h3>
                                <form onSubmit={handleAssignCodes}>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Select {order.quantity - (order.access_codes?.length || 0)} access codes to assign to this order.
                                        </p>

                                        {availableCodes.length > 0 ? (
                                            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                                                {availableCodes.map((code) => (
                                                    <label
                                                        key={code.id}
                                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCodes.includes(code.id)}
                                                            onChange={() => toggleCodeSelection(code.id)}
                                                            disabled={selectedCodes.length >= (order.quantity - (order.access_codes?.length || 0)) && !selectedCodes.includes(code.id)}
                                                            className="mr-3"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {code.email || code.username || code.additional_info}
                                                            </p>
                                                            {code.password && (
                                                                <p className="text-sm text-gray-500">
                                                                    Password: ••••••••
                                                                </p>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <Package className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No available codes</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    There are no available access codes for this product.
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-500 mt-2">
                                            Selected: {selectedCodes.length} / {order.quantity - (order.access_codes?.length || 0)}
                                        </p>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAssignCodesModal(false);
                                                setSelectedCodes([]);
                                                setAvailableCodes([]);
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={assignProcessing || selectedCodes.length === 0}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {assignProcessing ? 'Assigning...' : `Assign ${selectedCodes.length} Codes`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
