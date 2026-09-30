'use client';

import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import adminStyles from '../admin.module.css';
import styles from './qr.module.css';

export default function QRCodeGenerator() {
  const [portalUrl, setPortalUrl] = useState('');
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sarpanch_token');
    if (!token) {
      router.push('/admin/login');
    } else {
      setIsAuth(true);
      setPortalUrl(window.location.origin);
    }
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    localStorage.removeItem('sarpanch_token');
    router.push('/admin/login');
  };

  if (!isAuth) return <div style={{display:'flex', height:'100vh', justifyContent:'center', alignItems:'center'}}>चेक किया जा रहा है...</div>;

  return (
    <div className={styles.container}>
      <header className={adminStyles.header}>
        <div className={adminStyles.logo}>
          <span>🏛️</span> सरपंच
        </div>
        <button 
          onClick={handleLogout} 
          style={{background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer'}}
        >
          लॉगआउट
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.qrCard}>

          <div className={styles.qrWrapper}>
            {portalUrl ? (
              <QRCodeSVG 
                value={portalUrl} 
                style={{ width: "100%", height: "auto" }}
                bgColor={"#ffffff"}
                fgColor={"#111827"}
                level={"H"}
                includeMargin={false}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: '1/1', background: '#f3f4f6' }}></div>
            )}
            
            <p className={styles.printOnlyText}>
              इसे स्कैन करके अपने गाँव की<br/>समस्या इसमें डाल सकते हैं
            </p>
          </div>

          <div>
            <button onClick={handlePrint} className={styles.printBtn}>
              🖨️ प्रिंट करें (Print)
            </button>
          </div>
        </div>
      </main>

      <nav className={adminStyles.bottomNav}>
        <Link href="/admin" className={adminStyles.navItem}>
          <span className={adminStyles.navIcon}>📊</span>
          शिकायतें
        </Link>
        <Link href="/admin/qr" className={`${adminStyles.navItem} ${adminStyles.active}`}>
          <span className={adminStyles.navIcon}>🔲</span>
          QR कोड
        </Link>
      </nav>
    </div>
  );
}
