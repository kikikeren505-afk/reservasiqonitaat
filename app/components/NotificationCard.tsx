// Lokasi: app/components/NotificationCard.tsx
// ✅ FIX: Sesuaikan dengan response API yang baru

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'reservation' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  customerName?: string;
  amount?: number;
  link?: string;
}

export default function NotificationCard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch notifikasi dari API
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('📬 Notifications fetched:', result);
        
        // Handle response format baru
        if (result.success && result.data) {
          setNotifications(result.data);
        } else if (Array.isArray(result)) {
          // Backward compatibility
          setNotifications(result);
        }
      } else {
        console.error('Failed to fetch notifications:', response.status);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh setiap 30 detik
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing notifications...');
      fetchNotifications();
    }, 30000); // 30 detik
    
    return () => clearInterval(interval);
  }, []);

  // Hitung notifikasi yang belum dibaca
  const unreadCount = notifications.length;

  // Handle klik notifikasi - redirect ke halaman terkait
  const handleNotificationClick = (notif: Notification) => {
    if (notif.link) {
      setShowDropdown(false);
      router.push(notif.link);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        >
          <span style={{ fontSize: '2.5rem' }}>🔔</span>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
              Notifikasi
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              {loading
                ? 'Memuat...'
                : unreadCount > 0
                ? `${unreadCount} notifikasi baru`
                : 'Tidak ada notifikasi baru'}
            </p>
          </div>
          {unreadCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              minWidth: '24px',
              textAlign: 'center',
            }}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Notifikasi */}
      {showDropdown && (
        <>
          {/* Overlay untuk close dropdown */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
            }}
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            width: '400px',
            maxWidth: '90vw',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            border: '1px solid #e5e7eb',
            zIndex: 50,
            maxHeight: '500px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <h4 style={{ fontWeight: 'bold', color: '#333', margin: 0 }}>
                  Notifikasi Terbaru
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchNotifications(); // Refresh
                    }}
                    style={{
                      fontSize: '0.75rem',
                      color: '#2563eb',
                      background: 'none',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '0.25rem 0.5rem',
                    }}
                  >
                    🔄 Refresh
                  </button>
                )}
              </div>
            </div>
            
            {/* Body - Scrollable */}
            <div style={{
              overflowY: 'auto',
              flex: 1,
            }}>
              {loading ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#666',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #2563eb',
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    animation: 'spin 1s linear infinite',
                  }}></div>
                  <p>Memuat notifikasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#666',
                }}>
                  <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>
                    ✅
                  </span>
                  <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                    Tidak ada notifikasi baru
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#999' }}>
                    Anda sudah menyelesaikan semua tugas
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        cursor: notif.link ? 'pointer' : 'default',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (notif.link) {
                          e.currentTarget.style.background = '#f0f9ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ fontSize: '2rem', flexShrink: 0 }}>
                          {notif.type === 'reservation' ? '📋' : '💰'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#333',
                            marginBottom: '0.25rem',
                          }}>
                            {notif.title}
                          </p>
                          <p style={{
                            fontSize: '0.85rem',
                            color: '#555',
                            marginBottom: '0.5rem',
                            lineHeight: 1.4,
                          }}>
                            {notif.message}
                          </p>
                          {notif.customerName && (
                            <p style={{
                              fontSize: '0.75rem',
                              color: '#666',
                              marginBottom: '0.25rem',
                            }}>
                              👤 {notif.customerName}
                            </p>
                          )}
                          {notif.amount && (
                            <p style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: '#059669',
                              marginBottom: '0.25rem',
                            }}>
                              💵 Rp {notif.amount.toLocaleString('id-ID')}
                            </p>
                          )}
                          <p style={{
                            fontSize: '0.7rem',
                            color: '#999',
                            marginTop: '0.5rem',
                          }}>
                            🕐 {new Date(notif.timestamp).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '0.75rem',
                borderTop: '1px solid #e5e7eb',
                background: '#f9fafb',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/admin/reservasi');
                  }}
                  style={{
                    fontSize: '0.85rem',
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                >
                  Lihat Semua →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}