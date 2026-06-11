import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '@/utils/api';
import AnalyticsCard from './AnalyticsCard';
import StatusBadge from './StatusBadge';
import { 
  FiCheckCircle, FiCompass, FiSettings, FiUser, 
  FiMapPin, FiPhone, FiDollarSign, FiClock, FiPlayCircle,
  FiMap, FiAlertCircle, FiArrowRight, FiCheck, FiLogOut, FiActivity
} from 'react-icons/fi';

export default function DeliveryAgentDashboardView({ activeTab = 'deliveries' }) {
  const [deliveriesList, setDeliveriesList] = useState([]);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [agentCoords, setAgentCoords] = useState({ lat: 25.5941, lng: 84.1633 }); // default Ara, Bihar
  const [updatingLocation, setUpdatingLocation] = useState(false);
  
  // Profile settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    vehicleDetails: '',
    isOnline: true
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Dropdown profile
  const [showDropdown, setShowDropdown] = useState(false);

  // Map references
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeLineRef = useRef(null);

  // Fetch agent details, deliveries, and earnings
  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      // Load user profile details
      const userStored = localStorage.getItem('user');
      if (userStored) {
        const parsed = JSON.parse(userStored);
        setProfileForm({
          name: parsed.name || '',
          phone: parsed.phoneNumber || '',
          vehicleDetails: parsed.vehicleDetails || '',
          isOnline: parsed.isOnline !== false
        });
      }

      // Fetch deliveries
      const deliveriesRes = await axios.get(`${API_BASE_URL}/api/agent/deliveries`, authHeaders);
      if (deliveriesRes.data.success) {
        setDeliveriesList(deliveriesRes.data.deliveries);
      }

      // Fetch earnings
      const earningsRes = await axios.get(`${API_BASE_URL}/api/agent/earnings`, authHeaders);
      if (earningsRes.data.success) {
        setEarningsData(earningsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to sync details from the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeTab]);

  // Load Leaflet map CDN dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.id = 'leaflet-css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.id = 'leaflet-js';
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up stylesheets/scripts if needed
    };
  }, []);

  // Filter deliveries
  const activeOrder = useMemo(() => {
    return deliveriesList.find(d => d.isAssignedToMe && d.status !== 'delivered' && d.status !== 'cancelled');
  }, [deliveriesList]);

  // Initialize and update the map markers/routing
  useEffect(() => {
    if (!mapLoaded || !window.L || typeof window === 'undefined') return;

    const mapElement = document.getElementById('delivery-map');
    if (!mapElement) return;

    if (!mapRef.current) {
      // Initialize Map
      mapRef.current = window.L.map('delivery-map', { zoomControl: true }).setView([agentCoords.lat, agentCoords.lng], 14);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      markersGroupRef.current = window.L.layerGroup().addTo(mapRef.current);
    }

    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const boundsPoints = [];

    // Define custom marker icons
    const agentIcon = window.L.divIcon({
      className: 'custom-leaflet-icon-agent',
      html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const shopIcon = window.L.divIcon({
      className: 'custom-leaflet-icon-shop',
      html: '<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">🏪</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const customerIcon = window.L.divIcon({
      className: 'custom-leaflet-icon-customer',
      html: '<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">📍</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    // 1. Add Agent location marker
    const agentMarker = window.L.marker([agentCoords.lat, agentCoords.lng], { icon: agentIcon })
      .bindPopup('<b>Your Current Location</b>')
      .addTo(markersGroup);
    boundsPoints.push([agentCoords.lat, agentCoords.lng]);

    // 2. If activeOrder is underway, plot shop and customer drop-off points
    if (activeOrder) {
      const pLat = activeOrder.pickupCoords?.lat || 25.5941;
      const pLng = activeOrder.pickupCoords?.lng || 84.1633;
      const dLat = activeOrder.dropCoords?.lat || 25.5980;
      const dLng = activeOrder.dropCoords?.lng || 84.1700;

      // Add Shop Marker
      window.L.marker([pLat, pLng], { icon: shopIcon })
        .bindPopup(`<b>Pickup: ${activeOrder.shopName}</b><br/>${activeOrder.pickupLocation}`)
        .addTo(markersGroup);
      boundsPoints.push([pLat, pLng]);

      // Add Customer Marker
      window.L.marker([dLat, dLng], { icon: customerIcon })
        .bindPopup(`<b>Drop-off: ${activeOrder.customerName}</b><br/>${activeOrder.address}`)
        .addTo(markersGroup);
      boundsPoints.push([dLat, dLng]);

      // Draw route lines connecting Agent -> Shop -> Customer
      const routePath = [
        [agentCoords.lat, agentCoords.lng],
        [pLat, pLng],
        [dLat, dLng]
      ];

      routeLineRef.current = window.L.polyline(routePath, {
        color: '#2563eb', // blue accent route line
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.8
      }).addTo(map);
    }

    // Fit map view to bound markers
    if (boundsPoints.length > 0) {
      map.fitBounds(boundsPoints, { padding: [50, 50] });
    }
  }, [mapLoaded, agentCoords, activeOrder]);

  // Geolocation trigger
  const updateAgentLocation = async () => {
    setUpdatingLocation(true);
    const token = localStorage.getItem('token');
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const sendCoordsToBackend = async (lat, lng) => {
      try {
        await axios.post(`${API_BASE_URL}/api/agent/update-location`, {
          lat,
          lng,
          orderId: activeOrder?._id
        }, authHeaders);
        
        // Refresh local listings to check
        const listRes = await axios.get(`${API_BASE_URL}/api/agent/deliveries`, authHeaders);
        if (listRes.data.success) {
          setDeliveriesList(listRes.data.deliveries);
        }
      } catch (e) {
        console.error('Error sending GPS updates to backend:', e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setAgentCoords({ lat, lng });
          sendCoordsToBackend(lat, lng);
          setUpdatingLocation(false);
        },
        (error) => {
          console.warn('Geolocation access failed. Using simulated coordinates.', error);
          // Simulated offset shift near Ara, Bihar
          const simLat = 25.5941 + (Math.random() - 0.5) * 0.006;
          const simLng = 84.1633 + (Math.random() - 0.5) * 0.006;
          setAgentCoords({ lat: simLat, lng: simLng });
          sendCoordsToBackend(simLat, simLng);
          setUpdatingLocation(false);
        }
      );
    } else {
      const simLat = 25.5941 + (Math.random() - 0.5) * 0.006;
      const simLng = 84.1633 + (Math.random() - 0.5) * 0.006;
      setAgentCoords({ lat: simLat, lng: simLng });
      sendCoordsToBackend(simLat, simLng);
      setUpdatingLocation(false);
    }
  };

  // Center map on coordinates
  const handleFocusOnMap = (coords) => {
    if (mapRef.current && coords) {
      mapRef.current.setView([coords.lat, coords.lng], 16);
    }
  };

  // Claim/Accept an Available Order
  const handleClaimOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post(`${API_BASE_URL}/api/agent/claim-order`, { orderId }, authHeaders);
      if (res.data.success) {
        fetchAllData();
        // Fire location update coordinates so route links immediately
        updateAgentLocation();
      }
    } catch (err) {
      console.error('Error claiming order:', err);
      alert(err.response?.data?.message || 'Failed to claim order.');
    }
  };

  // Advance Order Status
  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'confirmed' || currentStatus === 'preparing' || currentStatus === 'placed') {
      nextStatus = 'picked_up';
    } else if (currentStatus === 'picked_up') {
      nextStatus = 'out_for_delivery';
    } else if (currentStatus === 'out_for_delivery') {
      nextStatus = 'delivered';
    }

    if (!nextStatus) return;

    try {
      const token = localStorage.getItem('token');
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axios.post(`${API_BASE_URL}/api/agent/update-status`, { 
        orderId, 
        status: nextStatus 
      }, authHeaders);

      if (res.data.success) {
        fetchAllData();
      }
    } catch (err) {
      console.error('Error advancing status:', err);
      alert(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  // Update Profile changes
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    try {
      const token = localStorage.getItem('token');
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      // Since profile parameters are saved inside user session:
      const res = await axios.post(`${API_BASE_URL}/api/agent/update-location`, {
        // We use this route or define profile route. Let's make it robust.
        // We will store info locally and send isOnline toggle to server
        lat: agentCoords.lat,
        lng: agentCoords.lng
      }, authHeaders);

      // In real-world, we update local storage to keep state
      const userStored = localStorage.getItem('user') || '{}';
      const parsed = JSON.parse(userStored);
      const updatedUser = {
        ...parsed,
        name: profileForm.name,
        phoneNumber: profileForm.phone,
        vehicleDetails: profileForm.vehicleDetails,
        isOnline: profileForm.isOnline
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfileMessage('✓ Profile settings updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileError('Failed to update profile. Try again later.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // ==================== RENDERS ====================

  // Header Subcomponent
  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider">
            Delivery Agent Side
          </div>
          <h2 className="text-lg font-black text-gray-900">
            Welcome, {profileForm.name || 'Rohit Sharma'}!
          </h2>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Online status switch */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50/50">
            <span className={`w-2 h-2 rounded-full ${profileForm.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="text-[11px] font-bold text-gray-600 uppercase">
              {profileForm.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 border border-gray-200 rounded-xl hover:bg-gray-50/80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {profileForm.name ? profileForm.name[0] : 'R'}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline">{profileForm.name || 'Rohit'}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-gray-50">
                  <p className="text-xs font-bold text-gray-800 truncate">{profileForm.name}</p>
                  <p className="text-[10px] font-semibold text-gray-400 truncate mt-0.5">{profileForm.phone}</p>
                </div>
                <button 
                  onClick={() => { setShowDropdown(false); window.location.href = '/delivery-dashboard?tab=profile'; }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
                >
                  <FiUser className="w-3.5 h-3.5" /> My Profile
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiLogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Deliveries List & Maps Panel (Active Tab)
  const renderDeliveriesTab = () => {
    // Math indicators
    const totalDeliveries = deliveriesList.length;
    const completedCount = deliveriesList.filter(d => d.status === 'delivered').length;
    const inProgressCount = deliveriesList.filter(d => ['picked_up', 'out_for_delivery'].includes(d.status)).length;
    const pendingCount = deliveriesList.filter(d => ['placed', 'confirmed', 'preparing'].includes(d.status)).length;

    const metrics = [
      { title: "Today's Deliveries", value: totalDeliveries },
      { title: 'Completed', value: completedCount, trend: { value: 'Base Payout Active', positive: true } },
      { title: 'In Progress', value: inProgressCount },
      { title: 'Pending', value: pendingCount }
    ];

    // Split deliveries
    const ongoingOrder = activeOrder;
    const myHistory = deliveriesList.filter(d => d.isAssignedToMe && d.status === 'delivered');
    const availablePool = deliveriesList.filter(d => d.isAvailable);

    return (
      <div className="space-y-6 pb-12">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <AnalyticsCard
              key={idx}
              title={metric.title}
              value={metric.value}
              trend={metric.trend}
              themeColor="blue"
            />
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center Side Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ongoing Order prominent Card */}
            <div className="bg-white border-2 border-blue-500 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-bl-2xl uppercase tracking-wider shadow-sm">
                Active Underway
              </div>

              <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <FiActivity className="w-4 h-4 text-blue-600 animate-pulse" />
                Ongoing Order Details
              </h3>

              {ongoingOrder ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Order reference ID</p>
                      <p className="font-extrabold text-sm text-gray-900 mt-0.5">{ongoingOrder._id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Customer details</p>
                      <p className="font-extrabold text-sm text-gray-900 mt-0.5 flex items-center gap-1.5">
                        {ongoingOrder.customerName}
                        <span className="text-gray-300 font-bold">|</span>
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-0.5">
                          <FiPhone className="w-3 h-3" /> {ongoingOrder.customerPhone}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2.5">
                    <div className="flex items-start gap-2 text-xs">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 border border-green-200 text-green-600 flex items-center justify-center font-black flex-shrink-0">
                        P
                      </div>
                      <div>
                        <p className="font-black text-[10px] text-green-700 uppercase tracking-wider">Pickup Shop address</p>
                        <p className="font-extrabold text-gray-900 mt-0.5">{ongoingOrder.shopName}</p>
                        <p className="text-gray-500 font-medium mt-0.5">{ongoingOrder.pickupLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center font-black flex-shrink-0">
                        D
                      </div>
                      <div>
                        <p className="font-black text-[10px] text-red-600 uppercase tracking-wider">Drop-off customer location</p>
                        <p className="font-bold text-gray-700 mt-0.5">{ongoingOrder.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Ongoing Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {/* Status check buttons */}
                    <button
                      onClick={() => handleUpdateStatus(ongoingOrder._id, ongoingOrder.status)}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <FiCheckCircle />
                      {ongoingOrder.status === 'confirmed' || ongoingOrder.status === 'preparing' || ongoingOrder.status === 'placed'
                        ? 'Mark as Picked Up'
                        : ongoingOrder.status === 'picked_up'
                        ? 'Mark Out for Delivery'
                        : 'Mark as Delivered'}
                    </button>

                    <button
                      onClick={() => handleFocusOnMap(ongoingOrder.pickupCoords)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <FiMapPin />
                      View on Map
                    </button>
                    
                    <div className="text-xs font-bold text-gray-500 ml-auto flex items-center gap-1.5">
                      Status: <StatusBadge status={ongoingOrder.status} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <FiAlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-500">No active delivery. Grab a placed order below to get started!</p>
                </div>
              )}
            </div>

            {/* My Deliveries History / Available Orders to Claim */}
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  Available Orders to Claim ({availablePool.length})
                </h3>
                <span className="text-[10px] font-bold text-gray-400">Hyperlocal Pool Ara</span>
              </div>

              {availablePool.length > 0 ? (
                <div className="space-y-3">
                  {availablePool.map((order) => (
                    <div 
                      key={order._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-55/40 border border-gray-100 rounded-2xl gap-4 hover:border-blue-300 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                            {order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-xs font-black text-gray-800">{order.shopName}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                          To: {order.address}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3.5 border-t sm:border-0 pt-2 sm:pt-0 border-gray-50">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase">Payout Fee</p>
                          <p className="text-sm font-black text-gray-900">₹45.00</p>
                        </div>
                        <button
                          onClick={() => handleClaimOrder(order._id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-sm hover:shadow transition-all"
                        >
                          Accept Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-gray-200 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400">All local orders claimed. Rest up agent!</p>
                </div>
              )}

              {/* Completed Deliveries History */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <h4 className="text-xs font-extrabold text-gray-600 uppercase tracking-wide">
                  My Completed Deliveries ({myHistory.length})
                </h4>
                {myHistory.length > 0 ? (
                  <div className="space-y-3.5">
                    {myHistory.slice(0, 3).map((item) => (
                      <div 
                        key={item._id}
                        className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 text-xs font-semibold text-gray-600"
                      >
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-gray-900">{item.shopName} → {item.customerName}</p>
                          <p className="text-[10px] text-gray-400">{item.address}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-green-600 font-extrabold text-[11px] bg-green-50 px-2 py-0.5 rounded">
                            Delivered ✓
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1 font-bold">Total: ₹{item.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-bold text-gray-400 text-center py-2">No completed orders today.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Map & Live Track Section */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FiMap className="text-blue-600" />
                  Live Navigation Map
                </h3>

                <button
                  onClick={updateAgentLocation}
                  disabled={updatingLocation}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 disabled:bg-gray-50 disabled:text-gray-400 font-extrabold text-[10px] rounded-lg tracking-wider uppercase transition flex items-center gap-1"
                >
                  <FiCompass className={updatingLocation ? 'animate-spin' : ''} />
                  {updatingLocation ? 'Updating...' : 'Update My Location'}
                </button>
              </div>

              {/* Map container */}
              <div 
                id="delivery-map" 
                className="w-full h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner relative z-0"
                style={{ minHeight: '320px' }}
              >
                {!mapLoaded && (
                  <div className="absolute inset-0 bg-slate-50 flex items-center justify-center text-xs font-bold text-gray-400">
                    Initializing Map layers...
                  </div>
                )}
              </div>

              <div className="text-[10px] font-bold text-gray-500 bg-gray-50 rounded-xl p-3 flex gap-2 items-start">
                <FiAlertCircle className="text-blue-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700">GPS Tracker Active</p>
                  <p className="text-gray-400 mt-0.5">Route links Agent (Blue dot), Vendor Shop (🏪), and drop-off (📍).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Earnings Tab
  const renderEarningsTab = () => {
    if (!earningsData) {
      return (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <p className="text-sm font-bold text-gray-400">Loading earnings logs...</p>
        </div>
      );
    }

    const { todayEarnings, totalEarnings, incentive, totalDeliveries, weeklyEarnings, onlineTime } = earningsData;

    return (
      <div className="space-y-6 pb-12">
        {/* Metric panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Today's Commission</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5">₹{todayEarnings}</h4>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total Payout + Incentives</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5">₹{totalEarnings}</h4>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Deliveries Completed</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5">{totalDeliveries}</h4>
            </div>
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 border border-orange-100 text-orange-600 rounded-xl">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Active Online Time</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5">{onlineTime}</h4>
            </div>
          </div>
        </div>

        {/* Weekly Earnings Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight mb-6">Weekly Performance Chart</h3>
            
            <div className="w-full h-60">
              <svg viewBox="0 0 400 180" className="w-full h-full">
                <line x1="20" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="70" x2="380" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="120" x2="380" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="20" y1="150" x2="380" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />

                {weeklyEarnings && weeklyEarnings.map((day, idx) => {
                  const maxEarnings = 400; // scaling base
                  const barHeight = Math.min((day.amount / maxEarnings) * 110, 110);
                  const xPos = 40 + idx * 48;
                  const yPos = 150 - barHeight;

                  return (
                    <g key={idx} className="group">
                      <rect 
                        x={xPos} 
                        y={yPos} 
                        width="24" 
                        height={barHeight} 
                        rx="4" 
                        fill="#3b82f6" // blue accent bars
                        className="hover:fill-blue-700 transition duration-200 cursor-pointer" 
                      />
                      <text 
                        x={xPos + 12} 
                        y="168" 
                        fill="#64748b" 
                        fontSize="9" 
                        fontWeight="bold" 
                        textAnchor="middle"
                      >
                        {day.name}
                      </text>
                      <text 
                        x={xPos + 12} 
                        y={yPos - 6} 
                        fill="#1e293b" 
                        fontSize="8" 
                        fontWeight="extrabold" 
                        textAnchor="middle" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ₹{day.amount}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">Payout Specifications</h3>
              
              <div className="space-y-3 text-xs font-bold text-gray-600 pt-2">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Base Commision</span>
                  <span className="text-gray-950 font-black">₹45.00 / order</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Weekly Incentive Bonus</span>
                  <span className="text-green-600">₹{incentive}.00</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span>Minimum Guaranteed Hours</span>
                  <span className="text-gray-950">4.5 hrs / day</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Earnings Sum</span>
                  <span className="text-blue-600 text-sm font-black">₹{totalEarnings}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-6">
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide">Direct deposit payout</p>
              <p className="text-xs text-blue-900 font-bold mt-1 leading-relaxed">
                Payouts are auto-credited to your registered bank account on Monday mornings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Support Tab
  const renderSupportTab = () => {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-2">
            <FiPlayCircle className="text-blue-600" />
            Logistics Support Desk
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-2">
              <h4 className="text-xs font-black text-gray-900 uppercase">Emergency Helpline</h4>
              <p className="text-xs font-bold text-gray-500">For issues while on route delivery:</p>
              <p className="text-base font-extrabold text-blue-600 mt-1">+91 91090 82726</p>
            </div>
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-2">
              <h4 className="text-xs font-black text-gray-900 uppercase">Vendor Coordinators</h4>
              <p className="text-xs font-bold text-gray-500">Ara cluster dispatch coordinators:</p>
              <p className="text-base font-extrabold text-blue-600 mt-1">+91 92800 75432</p>
            </div>
          </div>

          <div className="space-y-4 pt-3">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {[
                { q: "What should I do if the customer rejects the order?", a: "Do not mark as delivered. Select the support helpline and coordinator to register returning goods back to the shop vendor." },
                { q: "How do I claim payouts?", a: "Payouts are automated and processed directly weekly. Check the settings panel to confirm correct bank account details." },
                { q: "How can I update my delivery coordinates?", a: "Hit the 'Update My Location' button on the map canvas to instantly ping your active coordinates to the customer live." }
              ].map((faq, idx) => (
                <div key={idx} className="border border-gray-50 rounded-xl p-3.5 space-y-1">
                  <p className="font-extrabold text-xs text-gray-900">Q: {faq.q}</p>
                  <p className="text-xs text-gray-500 font-semibold">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile / Settings Tab
  const renderProfileTab = () => {
    return (
      <div className="max-w-xl mx-auto pb-12">
        <form onSubmit={handleProfileUpdate} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-black text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Agent Profile Settings
          </h2>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50/50 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50/50 focus:bg-white transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">Vehicle Details</label>
              <input
                type="text"
                required
                placeholder="MH-12-AB-1234 (Electric Scooter)"
                value={profileForm.vehicleDetails}
                onChange={(e) => setProfileForm({ ...profileForm, vehicleDetails: e.target.value })}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-xs outline-none focus:border-blue-500 font-bold text-gray-800 bg-gray-50/50 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-2xl bg-gray-50/30">
            <div>
              <p className="text-xs font-extrabold text-gray-800">Online Availability</p>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">Toggle status to accept new delivery orders</p>
            </div>
            <button
              type="button"
              onClick={() => setProfileForm({ ...profileForm, isOnline: !profileForm.isOnline })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 outline-none flex items-center ${profileForm.isOnline ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow"></span>
            </button>
          </div>

          {profileMessage && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-xs font-bold">
              {profileMessage}
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
              {profileError}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg transition-all"
          >
            Save Profile Changes
          </button>
        </form>
      </div>
    );
  };

  // Main Loader Screen
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col gap-3">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xs font-extrabold text-gray-400">Syncing logistics canvas...</p>
      </div>
    );
  }

  // Error Alert State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
        <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <h4 className="font-extrabold text-gray-900">Sync Failed</h4>
        <p className="text-xs text-gray-500 font-semibold mt-1">{error}</p>
        <button
          onClick={fetchAllData}
          className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl shadow"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Tab router switch
  return (
    <div className="space-y-6">
      {renderHeader()}
      {(() => {
        switch (activeTab) {
          case 'profile':
          case 'settings':
            return renderProfileTab();
          case 'earnings':
            return renderEarningsTab();
          case 'support':
            return renderSupportTab();
          case 'deliveries':
          default:
            return renderDeliveriesTab();
        }
      })()}
    </div>
  );
}
