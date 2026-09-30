'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';

type Complaint = {
  id: number;
  category: string;
  problem_text: string;
  audio_url: string | null;
  media_urls: string[];
  status: 'pending' | 'resolved';
  created_at: string;
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchComplaints = async () => {
    const token = localStorage.getItem('sarpanch_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/complaints`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('sarpanch_token');
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const toggleStatus = async (id: number, currentStatus: string) => {
    const token = localStorage.getItem('sarpanch_token');
    const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("क्या आप वाकई इस शिकायत को हटाना (Delete) चाहते हैं?")) return;
    
    const token = localStorage.getItem('sarpanch_token');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/complaints/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setComplaints(prev => prev.filter(c => c.id !== id));
      } else {
        alert("शिकायत डिलीट करने में त्रुटि हुई।");
      }
    } catch (err) {
      console.error('Failed to delete complaint:', err);
      alert("सर्वर से कनेक्ट नहीं हो पा रहा है।");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sarpanch_token');
    router.push('/admin/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;

  if (loading) {
    return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>लोड हो रहा है...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span>🏛️</span> सरपंच
        </div>
        <button 
          onClick={handleLogout} 
          style={{background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer'}}
        >
          लॉगआउट (Logout)
        </button>
      </header>

      <main className={styles.mainContent}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h1 className={styles.title} style={{marginBottom: 0}}>डैशबोर्ड (Dashboard)</h1>
          <button onClick={fetchComplaints} style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '1.2rem'}} title="रिफ्रेश करें">
            🔄
          </button>
        </div>

        <div className={styles.statsContainer}>
          <div className={`${styles.statBox} ${styles.statTotal}`}>
            <span className={styles.statNumber}>{totalComplaints}</span>
            <span className={styles.statLabel}>कुल शिकायतें</span>
          </div>
          <div className={`${styles.statBox} ${styles.statPending}`}>
            <span className={styles.statNumber}>{pendingComplaints}</span>
            <span className={styles.statLabel}>लंबित (Pending)</span>
          </div>
          <div className={`${styles.statBox} ${styles.statResolved}`}>
            <span className={styles.statNumber}>{resolvedComplaints}</span>
            <span className={styles.statLabel}>सुलझाई गई</span>
          </div>
        </div>

        <h2 className={styles.title} style={{fontSize: '1.1rem', color: '#4b5563'}}>हाल की शिकायतें</h2>

        {complaints.length === 0 ? (
          <p style={{textAlign: 'center', color: '#6b7280', marginTop: '2rem'}}>अभी तक कोई शिकायत नहीं है।</p>
        ) : (
          <div className={styles.grid}>
            {complaints.map((complaint) => (
              <div key={complaint.id} className={styles.card}>
                
                <div className={styles.cardHeader}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <span className={styles.cardId}>शिकायत #{complaint.id}</span>
                    {complaint.category && (
                      <span className={styles.categoryBadge}>
                        {complaint.category}
                      </span>
                    )}
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      onClick={() => toggleStatus(complaint.id, complaint.status)}
                      className={`${styles.status} ${complaint.status === 'pending' ? styles.statusPending : styles.statusResolved}`}
                      style={{cursor: 'pointer', border: 'none'}}
                      title="क्लिक करके स्टेटस बदलें"
                    >
                      {complaint.status === 'pending' ? 'लंबित' : 'सुलझा लिया'}
                    </button>
                    <button 
                      onClick={() => handleDelete(complaint.id)}
                      style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem'}}
                      title="शिकायत डिलीट करें"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className={styles.cardDesc}>
                  {complaint.problem_text || "केवल वॉयस मैसेज भेजा गया है"}
                </p>

                {complaint.audio_url && (
                  <audio controls src={complaint.audio_url} className={styles.audioPlayer} />
                )}

                {complaint.media_urls && complaint.media_urls.length > 0 && (
                  <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto'}}>
                    {complaint.media_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt="Media" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #e5e7eb'}} />
                      </a>
                    ))}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.mediaTags}>
                    {complaint.audio_url && <span className={styles.tag}>🎙️ Audio</span>}
                    {complaint.media_urls && complaint.media_urls.length > 0 && <span className={styles.tag}>📷 Media ({complaint.media_urls.length})</span>}
                  </div>
                  <span>📅 {formatDate(complaint.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className={styles.bottomNav}>
        <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>
          <span className={styles.navIcon}>📊</span>
          शिकायतें
        </Link>
        <Link href="/admin/qr" className={styles.navItem}>
          <span className={styles.navIcon}>🔲</span>
          QR कोड
        </Link>
      </nav>
    </div>
  );
}
