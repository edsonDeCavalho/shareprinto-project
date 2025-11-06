'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Download, Trash2, Eye, FileText, Image, Video, Music, Archive, File, RefreshCw, BarChart3, Users, User, UserCheck, UserX, Clock, Edit, Save, X, Package, MapPin, Calendar, DollarSign, Send, Bell } from 'lucide-react';

interface FileData {
  id: string;
  orderId?: string;
  userId?: string;
  fileName: string;
  fileAddress?: string;
  uploadTime?: string;
  size?: {
    value: number;
    unit: string;
  };
  extension?: string;
  mimeType: string;
  previews?: Array<{
    previewId: string;
    address: string;
    type: string;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  metadata?: {
    originalName: string;
    checksum: string;
    tags: string[];
  };
  // Old structure fields for backward compatibility
  originalName?: string;
  fileSize?: number;
  fileType?: string;
  address?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  tags?: string[];
  description?: string;
  accessCount?: number;
  isPublic?: boolean;
}

interface FileStats {
  totalFiles: number;
  totalSize: number;
  fileExtensions: Array<{ _id: string; count: number }>;
  topUsers: Array<{ _id: string; count: number }>;
}

interface Farmer {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  userType: string;
  online: boolean;
  score: number;
  available: boolean;
  city: string;
  state: string;
  country: string;
}

interface UserData {
  id?: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'creator' | 'farmer';
  score: number;
  online: boolean;
  activated: boolean;
  available: boolean;
  createdAt: string;
  lastSeenAt: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface UserStats {
  total: number;
  creators: number;
  farmers: number;
  online: number;
  available: number;
}

interface OrderData {
  _id: string;
  orderID: string;
  createdAt: string;
  userCreatorID: string;
  locationData: {
    latitude: number;
    longitude: number;
    city: string;
  };
  multiplePrints: boolean;
  numberOfPrints: number;
  listOfFilesToPrint: Array<{
    id: string;
    orderId: string;
    userId: string;
    fileName: string;
    fileAddress: string;
    uploadTime: string;
    size: {
      value: number;
      unit: string;
    };
    extension: string;
    mimeType: string;
    previews: { url: string; type: string }[];
    metadata: {
      originalName: string;
      checksum: string;
      tags: string[];
    };
  }>;
  status: 'pending' | 'accepted' | 'in_progress' | 'paused' | 'paused_due_to_problem_printing' | 'finished' | 'cancelled';
  progressPercentage: number;
  materialType: string;
  typeOfPrinting: string;
  description: string;
  instructions: string;
  chatID?: string;
  estimatedTime: number;
  finishedTime?: string;
  typeOfDelivery: 'mail' | 'in_person' | 'farmer_delivery';
  deliveryDetails?: {
    pickupLocation: {
      address: string;
      latitude: number;
      longitude: number;
      city: string;
      postalCode: string;
    };
    pickupTime: string;
    contactPerson: string;
    contactNumber: string;
  };
  cost: number;
  recuperationCode: number;
  assignedFarmerID?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

interface OrderStats {
  total: number;
  byStatus: {
    pending: number;
    accepted: number;
    in_progress: number;
    paused: number;
    paused_due_to_problem_printing: number;
    finished: number;
    cancelled: number;
  };
  byCity: Record<string, number>;
  byMaterialType: Record<string, number>;
  averageCost: number;
  averageCompletionTime: number;
}

interface OrderLists {
  pendingAcceptanceOrders: OrderData[];
  acceptedOrders: OrderData[];
  inWorkOrders: OrderData[];
  finishedOrders: OrderData[];
}

const API_BASE_URL = 'http://localhost:3002/api/files';
const ORDERS_API_BASE_URL = 'http://localhost:3005/api/orders';
const DISPATCHER_API_BASE_URL = 'http://localhost:3004/api/order-management';

export default function FileStorageTester() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [orderLists, setOrderLists] = useState<OrderLists | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'users' | 'orders' | 'test-offers'>('files');
  const [orderListTab, setOrderListTab] = useState<'all' | 'pending' | 'accepted' | 'in-work' | 'finished'>('all');
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [isSelectAll, setIsSelectAll] = useState(false);
    
    // Test offer states
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [selectedFarmer, setSelectedFarmer] = useState<string>('');
    const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string; userType: string }[]>([]);
    const [testOfferData, setTestOfferData] = useState({
        orderId: 'TEST_' + Date.now(),
        description: 'Test 3D Print Order',
        materialType: 'PLA',
        typeOfPrinting: 'FDM',
        estimatedTime: 120,
        cost: 25,
        city: 'Paris',
        numberOfPrints: 1,
        instructions: 'This is a test order from admin dashboard',
        creatorName: 'Admin Test'
    });
  const [uploadForm, setUploadForm] = useState({
    userId: 'test-user',
    orderId: '',
    tags: 'test,frontend'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?limit=50`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data.files);
      } else {
        showMessage('Failed to fetch files', true);
      }
    } catch (err) {
      showMessage('Error fetching files', true);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/overview`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setUserStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    console.log('Fetching orders from:', `${ORDERS_API_BASE_URL}?limit=100`);
    try {
      const response = await fetch(`${ORDERS_API_BASE_URL}?limit=100`);
      const data = await response.json();
      console.log('Orders API response:', data);
      if (data.success) {
        setOrders(data.data);
        console.log('Orders set:', data.data);
      } else {
        showMessage('Failed to fetch orders', true);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      showMessage('Error fetching orders', true);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    console.log('Fetching order stats from:', `${ORDERS_API_BASE_URL}/statistics`);
    try {
      const response = await fetch(`${ORDERS_API_BASE_URL}/statistics`);
      const data = await response.json();
      console.log('Order stats API response:', data);
      if (data.success) {
        setOrderStats(data.data);
        console.log('Order stats set:', data.data);
      }
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  };

  const fetchOrderLists = async () => {
    console.log('Fetching order lists from:', `${DISPATCHER_API_BASE_URL}/lists`);
    try {
      const response = await fetch(`${DISPATCHER_API_BASE_URL}/lists`);
      const data = await response.json();
      console.log('Order lists API response:', data);
      if (data.success) {
        setOrderLists(data.data.orderLists);
        console.log('Order lists set:', data.data.orderLists);
      }
    } catch (err) {
      console.error('Error fetching order lists:', err);
    }
  };

  // Multi-select helper functions
  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setIsSelectAll(false);
  };

  const handleSelectAll = () => {
    const currentOrders = orderListTab === 'all' ? orders :
      orderListTab === 'pending' ? (orderLists?.pendingAcceptanceOrders || []) :
      orderListTab === 'accepted' ? (orderLists?.acceptedOrders || []) :
      orderListTab === 'in-work' ? (orderLists?.inWorkOrders || []) :
      orderListTab === 'finished' ? (orderLists?.finishedOrders || []) : [];

    if (isSelectAll) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(currentOrders.map(order => order.orderID)));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) {
      showMessage('Please select at least one order to delete.', true);
      return;
    }

    const orderCount = selectedOrders.size;
    if (!confirm(`Are you sure you want to delete ${orderCount} order(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = Array.from(selectedOrders).map(orderId => 
        fetch(`${DISPATCHER_API_BASE_URL}/${orderId}`, {
          method: 'DELETE',
        }).then(response => response.json())
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(result => result.success).length;
      const failureCount = results.length - successCount;

      if (successCount > 0) {
        showMessage(`Successfully deleted ${successCount} order(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}!`);
        setSelectedOrders(new Set());
        setIsSelectAll(false);
        // Refresh the orders list
        fetchOrders();
        fetchOrderLists();
      } else {
        showMessage('Failed to delete orders. Please try again.', true);
      }
    } catch (error) {
      console.error('Error deleting orders:', error);
      showMessage('Error deleting orders. Please try again.', true);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: UserData) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/auth/update-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id || userData.userId,
          userData: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            userType: userData.userType,
            score: userData.score,
            online: userData.online,
            available: userData.available,
            activated: userData.activated
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        showMessage('User updated successfully!');
        setEditingUser(null);
        fetchUsers(); // Refresh the users list
      } else {
        showMessage(data.error || 'Failed to update user', true);
      }
    } catch (err) {
      showMessage('Error updating user', true);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userType: 'creator' | 'farmer';
    digitalCode?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.success) {
        showMessage('User created successfully!');
        setShowCreateUserForm(false);
        fetchUsers(); // Refresh the users list
      } else {
        showMessage(data.message || 'Failed to create user', true);
      }
    } catch (err) {
      showMessage('Error creating user', true);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, field: 'online' | 'available', currentValue: boolean) => {
    setLoading(true);
    try {
      const endpoint = field === 'online' ? 'update-user-online-status' : 'update-user-available-status';
      const response = await fetch(`http://localhost:3000/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          [field]: !currentValue
        }),
      });

      const data = await response.json();
      if (data.success) {
        showMessage(`User ${field} status updated successfully!`);
        fetchUsers(); // Refresh the users list
      } else {
        showMessage(data.error || `Failed to update ${field} status`, true);
      }
    } catch (err) {
      showMessage(`Error updating ${field} status`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      showMessage('Please select a file to upload', true);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('userId', uploadForm.userId);
    if (uploadForm.orderId) {
      formData.append('orderId', uploadForm.orderId);
    }
    formData.append('tags', uploadForm.tags);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showMessage('File uploaded successfully!');
        setUploadForm({ ...uploadForm, orderId: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFiles();
        fetchStats();
      } else {
        showMessage(data.error || 'Upload failed', true);
      }
    } catch (err) {
      showMessage('Upload error', true);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (file: FileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${file.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName || file.metadata?.originalName || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('File downloaded successfully!');
        fetchFiles(); // Refresh to update access count
      } else {
        showMessage('Download failed', true);
      }
    } catch (err) {
      showMessage('Download error', true);
    }
  };

  const viewFile = async (file: FileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${file.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Open file in new tab/window
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${file.originalName}</title>
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: Arial, sans-serif;
                    background: #f5f5f5;
                  }
                  .header {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                  }
                  .file-info {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 15px;
                  }
                  .file-icon {
                    width: 48px;
                    height: 48px;
                    background: #3b82f6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                  }
                  .file-details h1 {
                    margin: 0;
                    font-size: 24px;
                    color: #1f2937;
                  }
                  .file-meta {
                    color: #6b7280;
                    font-size: 14px;
                    margin-top: 5px;
                  }
                  .content {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    min-height: 400px;
                  }
                  .preview-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    text-align: center;
                  }
                  .preview-image {
                    max-width: 100%;
                    max-height: 500px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                  }
                  .preview-text {
                    max-width: 100%;
                    white-space: pre-wrap;
                    font-family: monospace;
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    text-align: left;
                    overflow-x: auto;
                  }
                  .unsupported {
                    color: #6b7280;
                    font-size: 18px;
                  }
                  .download-btn {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 15px;
                  }
                  .download-btn:hover {
                    background: #2563eb;
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <div class="file-info">
                    <div class="file-icon">📄</div>
                    <div class="file-details">
                      <h1>${file.originalName}</h1>
                      <div class="file-meta">
                        ${file.mimeType} • ${file.fileSize ? formatFileSize(file.fileSize) : 'Unknown size'} • Uploaded ${file.uploadedAt ? formatDate(file.uploadedAt) : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="content">
                  <div class="preview-container">
                    ${getFilePreviewContent(file, url)}
                  </div>
                  <div style="text-align: center; margin-top: 20px;">
                    <button class="download-btn" onclick="window.open('${url}', '_blank')">
                      Download File
                    </button>
                  </div>
                </div>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
        
        showMessage('File opened in new tab!');
        fetchFiles(); // Refresh to update access count
      } else {
        showMessage('Failed to load file for preview', true);
      }
    } catch (err) {
      showMessage('Error loading file preview', true);
    }
  };

  const getFilePreviewContent = (file: FileData, url: string) => {
    const fileType = file.mimeType.split('/')[0];
    
    switch (fileType) {
      case 'image':
        return `<img src="${url}" alt="${file.originalName}" class="preview-image" />`;
      
      case 'text':
        return `<div class="preview-text" id="text-content">Loading...</div>
                <script>
                  fetch('${url}')
                    .then(response => response.text())
                    .then(text => {
                      document.getElementById('text-content').textContent = text;
                    })
                    .catch(() => {
                      document.getElementById('text-content').textContent = 'Unable to load text content';
                    });
                </script>`;
      
      case 'application':
        if (file.mimeType.includes('pdf')) {
          return `<iframe src="${url}" width="100%" height="600px" style="border: none; border-radius: 8px;"></iframe>`;
        }
        return `<div class="unsupported">📄 This file type cannot be previewed in the browser.<br>Click "Download File" to open it with an external application.</div>`;
      
      case 'video':
        return `<video controls class="preview-image">
                  <source src="${url}" type="${file.mimeType}">
                  Your browser does not support the video tag.
                </video>`;
      
      case 'audio':
        return `<audio controls style="width: 100%;">
                  <source src="${url}" type="${file.mimeType}">
                  Your browser does not support the audio element.
                </audio>`;
      
      default:
        return `<div class="unsupported">📄 This file type cannot be previewed in the browser.<br>Click "Download File" to open it with an external application.</div>`;
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${fileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        showMessage('File deleted successfully!');
        fetchFiles();
        fetchStats();
      } else {
        showMessage(data.error || 'Delete failed', true);
      }
    } catch (err) {
      showMessage('Delete error', true);
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user &quot;${userName}&quot;? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        showMessage(`User "${userName}" deleted successfully!`);
        fetchUsers();
      } else {
        showMessage(data.error || 'Delete failed', true);
      }
    } catch (err) {
      showMessage('Delete error', true);
    }
  };

  const deleteOrder = async (orderId: string, orderDescription: string) => {
    if (!confirm(`Are you sure you want to delete order &quot;${orderDescription}&quot;? This action cannot be undone.`)) return;

    try {
      const response = await fetch(`http://localhost:3004/api/order-management/${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        showMessage(`Order "${orderDescription}" deleted successfully!`);
        fetchOrders();
        fetchOrderStats();
      } else {
        showMessage(data.error || 'Delete failed', true);
      }
    } catch (err) {
      showMessage('Delete error', true);
    }
  };

  const getFileIcon = (mimeType: string) => {
    const fileType = mimeType.split('/')[0];
    switch (fileType) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      case 'application': return <Archive className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (size: { value: number; unit: string } | number) => {
    const bytes = typeof size === 'number' ? size : size.value;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Fetch farmers for test offers
  const fetchFarmers = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/users/farmers');
      const data = await response.json();
      if (data.success) {
        // Normalize farmers to ensure an `id` exists (fallback to `userId`)
        setFarmers((data.farmers || []).map((f: any) => ({ ...f, id: f.id || f.userId })));
      }
      
      // Also fetch online users to show which farmers are actually online
      try {
        const onlineResponse = await fetch('http://localhost:3004/api/user-status/online');
        const onlineData = await onlineResponse.json();
        if (onlineData.success) {
          console.log('Online users:', onlineData.data.onlineUsers);
          setOnlineUsers(onlineData.data.onlineUsers || []);
        }
      } catch (onlineError) {
        console.error('Error fetching online users:', onlineError);
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    }
  };

  // Send test offer to farmer
  const sendTestOffer = async () => {
    if (!selectedFarmer) {
      alert('Please select a farmer');
      return;
    }

    try {
      const farmer = farmers.find(f => f.id === selectedFarmer);
      if (farmer) {
        console.log('Sending test offer to farmer:', farmer.firstName, farmer.lastName);
        console.log('Offer data:', testOfferData);
        
        // Send offer via backend endpoint
        const response = await fetch('http://localhost:3004/api/user-status/send-test-offer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            farmerId: farmer.id, // Use the farmer's MongoDB _id for the backend
            offerData: {
              orderId: testOfferData.orderId,
              description: testOfferData.description,
              materialType: testOfferData.materialType,
              typeOfPrinting: testOfferData.typeOfPrinting,
              estimatedTime: testOfferData.estimatedTime,
              cost: testOfferData.cost,
              city: testOfferData.city,
              numberOfPrints: testOfferData.numberOfPrints,
              instructions: testOfferData.instructions,
              creatorName: testOfferData.creatorName
            }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Show success message
          alert(`✅ Test offer sent to ${farmer.firstName} ${farmer.lastName}! 
          
📱 The farmer will receive the popup if they are:
- Online and connected to the system
- Have the farmer dashboard open

🔔 The popup will:
- Appear for 20 seconds
- Play a sound when accepting
- Show accept/decline options`);
        } else {
          alert(`❌ Failed to send offer: ${result.error || 'Unknown error'}`);
        }
        
        // Reset form
        setSelectedFarmer('');
        setTestOfferData({
          orderId: 'TEST_' + Date.now(),
          description: 'Test 3D Print Order',
          materialType: 'PLA',
          typeOfPrinting: 'FDM',
          estimatedTime: 120,
          cost: 25,
          city: 'Paris',
          numberOfPrints: 1,
          instructions: 'This is a test order from admin dashboard',
          creatorName: 'Admin Test'
        });
      }
    } catch (error) {
      console.error('Error sending test offer:', error);
      alert('Error sending test offer: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Load farmers when component mounts
  useEffect(() => {
    fetchFarmers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage files and monitor the file storage service</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'files'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Files Management
            </button>
            <button
              onClick={() => {
                setActiveTab('users');
                if (users.length === 0) {
                  fetchUsers();
                }
              }}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Users Management
            </button>
            <button
              onClick={() => {
                console.log('Orders tab clicked, current orders length:', orders.length);
                setActiveTab('orders');
                if (orders.length === 0) {
                  console.log('Fetching orders and stats...');
                  fetchOrders();
                  fetchOrderStats();
                  fetchOrderLists();
                } else {
                  console.log('Orders already loaded, not fetching again');
                }
              }}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'orders'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Orders Management
            </button>
            <button
              onClick={() => setActiveTab('test-offers')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'test-offers'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Bell className="w-4 h-4 inline mr-2" />
              Test Offers
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Stats Overview */}
        {/* Files Tab Content */}
        {activeTab === 'files' && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">File Statistics</h2>
                <button
                  onClick={fetchStats}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalFiles}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Size</p>
                    <p className="text-2xl font-bold text-green-600">{formatFileSize(stats.totalSize)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Archive className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">File Extensions</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.fileExtensions.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <File className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Users</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.topUsers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
              <input
                ref={fileInputRef}
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                <input
                  type="text"
                  value={uploadForm.userId}
                  onChange={(e) => setUploadForm({ ...uploadForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID (Optional)</label>
                <input
                  type="text"
                  value={uploadForm.orderId}
                  onChange={(e) => setUploadForm({ ...uploadForm, orderId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional order ID"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload File
            </button>
          </form>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Files</h2>
            <button
              onClick={fetchFiles}
              className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No files uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extension</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(file.mimeType)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {file.metadata?.originalName || file.originalName || file.fileName}
                            </div>
                            <div className="text-sm text-gray-500">{file.mimeType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(file.size || file.fileSize) ? formatFileSize(file.size || file.fileSize!) : 'Unknown size'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.userId || file.address || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(file.uploadTime || file.uploadedAt) ? formatDate(file.uploadTime || file.uploadedAt!) : 'Unknown date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {file.extension || file.fileType || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewFile(file)}
                            className="text-purple-600 hover:text-purple-900"
                            title="View File"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadFile(file)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedFile(file)}
                            className="text-green-600 hover:text-green-900"
                            title="View Details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* File Details Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">File Details</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => viewFile(selectedFile)}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  >
                    View File
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Original Name</label>
                  <p className="text-sm text-gray-900">
                    {selectedFile.metadata?.originalName || selectedFile.originalName || selectedFile.fileName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File ID</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedFile.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">MIME Type</label>
                  <p className="text-sm text-gray-900">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File Size</label>
                  <p className="text-sm text-gray-900">{(selectedFile.size || selectedFile.fileSize) ? formatFileSize(selectedFile.size || selectedFile.fileSize!) : 'Unknown size'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">File Address</label>
                  <p className="text-sm text-gray-900 break-all">
                    {selectedFile.fileAddress || selectedFile.address || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID</label>
                  <p className="text-sm text-gray-900">{selectedFile.userId || selectedFile.address || 'Unknown'}</p>
                </div>
                {selectedFile.orderId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <p className="text-sm text-gray-900">{selectedFile.orderId}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Uploaded At</label>
                  <p className="text-sm text-gray-900">{(selectedFile.uploadTime || selectedFile.uploadedAt) ? formatDate(selectedFile.uploadTime || selectedFile.uploadedAt!) : 'Unknown date'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Extension</label>
                  <p className="text-sm text-gray-900">{selectedFile.extension || selectedFile.fileType || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Checksum</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {selectedFile.metadata?.checksum || 'N/A'}
                  </p>
                </div>
                {((selectedFile.metadata?.tags && selectedFile.metadata.tags.length > 0) || (selectedFile.tags && selectedFile.tags.length > 0)) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(selectedFile.metadata?.tags || selectedFile.tags || []).map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedFile.previews && selectedFile.previews.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Previews</label>
                    <div className="space-y-2">
                      {selectedFile.previews.map((preview, index) => (
                        <div key={index} className="bg-gray-100 p-2 rounded">
                          <p className="text-sm"><strong>Type:</strong> {preview.type}</p>
                          <p className="text-sm"><strong>Address:</strong> {preview.address}</p>
                          {preview.width && preview.height && (
                            <p className="text-sm"><strong>Dimensions:</strong> {preview.width}x{preview.height}</p>
                          )}
                          {preview.duration && (
                            <p className="text-sm"><strong>Duration:</strong> {preview.duration}s</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <>
            {/* User Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">User Statistics</h2>
                <button
                  onClick={fetchUsers}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
              {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-blue-600">{userStats.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <User className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Creators</p>
                        <p className="text-2xl font-bold text-green-600">{userStats.creators}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <UserCheck className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Farmers</p>
                        <p className="text-2xl font-bold text-purple-600">{userStats.farmers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Online</p>
                        <p className="text-2xl font-bold text-orange-600">{userStats.online}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <UserX className="w-8 h-8 text-teal-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Available</p>
                        <p className="text-2xl font-bold text-teal-600">{userStats.available}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCreateUserForm(true)}
                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Create User
                  </button>
                  <button
                    onClick={fetchUsers}
                    className="flex items-center px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.userType === 'creator' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.userType === 'creator' ? 'Creator' : 'Farmer'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">{user.city || 'N/A'}</span>
                              <span className="text-gray-500">{user.country || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.score > 0 ? user.score.toFixed(1) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.online 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.online ? 'Online' : 'Offline'}
                              </span>
                              {user.userType === 'farmer' && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.available 
                                    ? 'bg-teal-100 text-teal-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.available ? 'Available' : 'Busy'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.lastSeenAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user.id || user.userId, 'online', user.online)}
                                className={`${user.online ? 'text-green-600 hover:text-green-900' : 'text-gray-400 hover:text-gray-600'}`}
                                title={`${user.online ? 'Set Offline' : 'Set Online'}`}
                              >
                                <User className="w-4 h-4" />
                              </button>
                              {user.userType === 'farmer' && (
                                <button
                                  onClick={() => toggleUserStatus(user.id || user.userId, 'available', user.available)}
                                  className={`${user.available ? 'text-teal-600 hover:text-teal-900' : 'text-red-400 hover:text-red-600'}`}
                                  title={`${user.available ? 'Set Busy' : 'Set Available'}`}
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteUser(user.id || user.userId, `${user.firstName} ${user.lastName}`)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* User Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                updateUser(editingUser);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={editingUser.firstName ?? ''}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={editingUser.lastName ?? ''}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email ?? ''}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editingUser.phone ?? ''}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                    <select
                      value={editingUser.userType ?? 'creator'}
                      onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value as 'creator' | 'farmer' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="creator">Creator</option>
                      <option value="farmer">Farmer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingUser.score ?? 0}
                      onChange={(e) => setEditingUser({ ...editingUser, score: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="online"
                      checked={editingUser.online ?? false}
                      onChange={(e) => setEditingUser({ ...editingUser, online: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="online" className="ml-2 block text-sm text-gray-900">
                      Online
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={editingUser.available ?? false}
                      onChange={(e) => setEditingUser({ ...editingUser, available: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                      Available
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="activated"
                      checked={editingUser.activated ?? false}
                      onChange={(e) => setEditingUser({ ...editingUser, activated: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activated" className="ml-2 block text-sm text-gray-900">
                      Activated
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                <button
                  onClick={() => setShowCreateUserForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const userData = {
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  userType: formData.get('userType') as 'creator' | 'farmer',
                  digitalCode: formData.get('digitalCode') as string || undefined,
                  address: formData.get('address') as string || undefined,
                  city: formData.get('city') as string || undefined,
                  state: formData.get('state') as string || undefined,
                  zipCode: formData.get('zipCode') as string || undefined,
                  country: formData.get('country') as string || undefined,
                };
                createUser(userData);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type *</label>
                  <select
                    name="userType"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select user type</option>
                    <option value="creator">Creator</option>
                    <option value="farmer">Farmer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Digital Code (Optional)</label>
                  <input
                    type="text"
                    name="digitalCode"
                    placeholder="6-digit code for login"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City (Optional)</label>
                    <input
                      type="text"
                      name="city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State (Optional)</label>
                    <input
                      type="text"
                      name="state"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code (Optional)</label>
                    <input
                      type="text"
                      name="zipCode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country (Optional)</label>
                  <input
                    type="text"
                    name="country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Orders Tab Content */}
        {activeTab === 'orders' && (
          <>
            {/* Order Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Order Statistics</h2>
                <button
                  onClick={() => {
                    fetchOrders();
                    fetchOrderStats();
                  }}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
              {orderStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Package className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-600">{orderStats.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Avg Cost</p>
                        <p className="text-2xl font-bold text-green-600">€{orderStats.averageCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Avg Time</p>
                        <p className="text-2xl font-bold text-purple-600">{orderStats.averageCompletionTime.toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <MapPin className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Cities</p>
                        <p className="text-2xl font-bold text-orange-600">{Object.keys(orderStats.byCity).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Breakdown */}
              {orderStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-xl font-bold text-yellow-600">{orderStats.byStatus.pending}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Accepted</p>
                    <p className="text-xl font-bold text-blue-600">{orderStats.byStatus.accepted}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-xl font-bold text-purple-600">{orderStats.byStatus.in_progress}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Finished</p>
                    <p className="text-xl font-bold text-green-600">{orderStats.byStatus.finished}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order List Tabs */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => setOrderListTab('all')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    orderListTab === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  onClick={() => setOrderListTab('pending')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    orderListTab === 'pending'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pending Acceptance ({orderLists?.pendingAcceptanceOrders.length || 0})
                </button>
                <button
                  onClick={() => setOrderListTab('accepted')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    orderListTab === 'accepted'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Accepted ({orderLists?.acceptedOrders.length || 0})
                </button>
                <button
                  onClick={() => setOrderListTab('in-work')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    orderListTab === 'in-work'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  In Work ({orderLists?.inWorkOrders.length || 0})
                </button>
                <button
                  onClick={() => setOrderListTab('finished')}
                  className={`px-4 py-2 rounded-md font-medium ${
                    orderListTab === 'finished'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Finished ({orderLists?.finishedOrders.length || 0})
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {orderListTab === 'all' && 'All Orders'}
                  {orderListTab === 'pending' && 'Pending Acceptance Orders'}
                  {orderListTab === 'accepted' && 'Accepted Orders'}
                  {orderListTab === 'in-work' && 'In Work Orders'}
                  {orderListTab === 'finished' && 'Finished Orders'}
                </h2>
                <div className="text-sm text-gray-500">
                  {orderListTab === 'all' && `${orders.length} orders found`}
                  {orderListTab === 'pending' && `${orderLists?.pendingAcceptanceOrders.length || 0} orders found`}
                  {orderListTab === 'accepted' && `${orderLists?.acceptedOrders.length || 0} orders found`}
                  {orderListTab === 'in-work' && `${orderLists?.inWorkOrders.length || 0} orders found`}
                  {orderListTab === 'finished' && `${orderLists?.finishedOrders.length || 0} orders found`}
                </div>
              </div>

              {/* Bulk Actions */}
              {(() => {
                const currentOrders = orderListTab === 'all' ? orders :
                  orderListTab === 'pending' ? (orderLists?.pendingAcceptanceOrders || []) :
                  orderListTab === 'accepted' ? (orderLists?.acceptedOrders || []) :
                  orderListTab === 'in-work' ? (orderLists?.inWorkOrders || []) :
                  orderListTab === 'finished' ? (orderLists?.finishedOrders || []) : [];
                
                return currentOrders.length > 0 && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelectAll}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            Select All ({currentOrders.length})
                          </span>
                        </label>
                        {selectedOrders.size > 0 && (
                          <span className="text-sm text-gray-600">
                            {selectedOrders.size} order(s) selected
                          </span>
                        )}
                      </div>
                      {selectedOrders.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          disabled={loading}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Selected ({selectedOrders.size})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Loading orders...</span>
                </div>
              ) : (() => {
                const currentOrders = orderListTab === 'all' ? orders :
                  orderListTab === 'pending' ? (orderLists?.pendingAcceptanceOrders || []) :
                  orderListTab === 'accepted' ? (orderLists?.acceptedOrders || []) :
                  orderListTab === 'in-work' ? (orderLists?.inWorkOrders || []) :
                  orderListTab === 'finished' ? (orderLists?.finishedOrders || []) : [];
                
                return currentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No orders found in this category</p>
                    <p className="text-sm text-gray-400 mt-2">Debug: currentOrders.length = {currentOrders.length}</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={isSelectAll}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(order.orderID)}
                              onChange={() => handleSelectOrder(order.orderID)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.orderID}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {order.description || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.userCreatorID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                              order.status === 'paused_due_to_problem_printing' ? 'bg-red-100 text-red-800' :
                              order.status === 'finished' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {order.progressPercentage > 0 && (
                              <div className="mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${order.progressPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500">{order.progressPercentage}%</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {order.locationData.city}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.materialType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            €{order.cost.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteOrder(order.orderID, order.description)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                );
              })()}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Order ID</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.orderID}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            selectedOrder.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                            selectedOrder.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                            selectedOrder.status === 'paused' ? 'bg-orange-100 text-orange-800' :
                            selectedOrder.status === 'paused_due_to_problem_printing' ? 'bg-red-100 text-red-800' :
                            selectedOrder.status === 'finished' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedOrder.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">User Creator</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.userCreatorID}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Assigned Farmer</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.assignedFarmerID || 'Not assigned'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Progress</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.progressPercentage}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Location</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedOrder.locationData.city} ({selectedOrder.locationData.latitude}, {selectedOrder.locationData.longitude})
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Delivery Type</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.typeOfDelivery.replace('_', ' ')}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Material</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.materialType}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Printing Type</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.typeOfPrinting}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Cost</label>
                          <p className="mt-1 text-sm text-gray-900">€{selectedOrder.cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Estimated Time</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.estimatedTime} minutes</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrder.description}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Instructions</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedOrder.instructions}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Files to Print</label>
                        <div className="mt-1 space-y-2">
                          {selectedOrder.listOfFilesToPrint.map((file, index) => (
                            <div key={file.id} className="bg-gray-50 p-3 rounded">
                              <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {file.size.value} {file.size.unit} • {file.extension.toUpperCase()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Created</label>
                          <p className="mt-1 text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Recuperation Code</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedOrder.recuperationCode}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Test Offers Tab Content */}
        {activeTab === 'test-offers' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Test Offer Popup</h2>
                <p className="text-sm text-gray-600">Send test offers to specific farmers to test the popup functionality</p>
              </div>
              <button
                onClick={fetchFarmers}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Farmer Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Select Farmer</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose a farmer to send test offer to:
                  </label>
                  <select
                    value={selectedFarmer}
                    onChange={(e) => setSelectedFarmer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a farmer...</option>
                {farmers.map((farmer) => {
                  const isOnline = onlineUsers.some(onlineUser => onlineUser.userId === (farmer.id || farmer.userId));
                      return (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.firstName} {farmer.lastName} - {farmer.city} {isOnline ? '🟢 (Online)' : '🔴 (Offline)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedFarmer && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Selected Farmer:</h4>
                    {(() => {
                      const farmer = farmers.find(f => f.id === selectedFarmer);
                const isOnline = onlineUsers.some(onlineUser => onlineUser.userId === (farmer?.id || farmer?.userId));
                      return farmer ? (
                        <div className="text-sm text-blue-800">
                          <p><strong>Name:</strong> {farmer.firstName} {farmer.lastName}</p>
                          <p><strong>Email:</strong> {farmer.email}</p>
                          <p><strong>Phone:</strong> {farmer.phone}</p>
                          <p><strong>Location:</strong> {farmer.city}, {farmer.state}, {farmer.country}</p>
                          <p><strong>Status:</strong> {isOnline ? '🟢 Online (Connected)' : '🔴 Offline (Not Connected)'}</p>
                          <p><strong>Available:</strong> {farmer.available ? 'Yes' : 'No'}</p>
                          <p><strong>Score:</strong> {farmer.score}</p>
                          {isOnline && (
                            <p className="text-green-600 font-medium">✅ This farmer can receive offers!</p>
                          )}
                          {!isOnline && (
                            <p className="text-red-600 font-medium">❌ This farmer is not connected and cannot receive offers.</p>
                          )}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Offer Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Offer Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <input
                      type="text"
                      value={testOfferData.orderId}
                      onChange={(e) => setTestOfferData({...testOfferData, orderId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <input
                      type="text"
                      value={testOfferData.description}
                      onChange={(e) => setTestOfferData({...testOfferData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Material Type</label>
                      <select
                        value={testOfferData.materialType}
                        onChange={(e) => setTestOfferData({...testOfferData, materialType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PLA">PLA</option>
                        <option value="ABS">ABS</option>
                        <option value="PETG">PETG</option>
                        <option value="TPU">TPU</option>
                        <option value="Wood">Wood</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Printing Type</label>
                      <select
                        value={testOfferData.typeOfPrinting}
                        onChange={(e) => setTestOfferData({...testOfferData, typeOfPrinting: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="FDM">FDM</option>
                        <option value="SLA">SLA</option>
                        <option value="SLS">SLS</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated Time (min)</label>
                      <input
                        type="number"
                        value={testOfferData.estimatedTime}
                        onChange={(e) => setTestOfferData({...testOfferData, estimatedTime: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cost (€)</label>
                      <input
                        type="number"
                        value={testOfferData.cost}
                        onChange={(e) => setTestOfferData({...testOfferData, cost: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={testOfferData.city}
                      onChange={(e) => setTestOfferData({...testOfferData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                      value={testOfferData.instructions}
                      onChange={(e) => setTestOfferData({...testOfferData, instructions: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={sendTestOffer}
                disabled={!selectedFarmer}
                className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                  selectedFarmer
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 mr-2" />
                Send Test Offer
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">How to test:</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Make sure the farmer is online and available (check their status in the dropdown)</li>
                <li>2. Select a farmer from the dropdown</li>
                <li>3. Customize the offer details if needed</li>
                <li>4. Click &quot;Send Test Offer&quot;</li>
                <li>5. The farmer will receive the popup via Socket.IO if they are online</li>
                <li>6. The popup appears for 20 seconds with accept/decline options</li>
                <li>7. Accepting plays the bell sound and shows success message</li>
                <li>8. Declining or timeout closes the popup</li>
              </ol>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The farmer must be online and have the farmer dashboard open to receive the offer popup. 
                  The system uses Socket.IO for real-time communication.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
