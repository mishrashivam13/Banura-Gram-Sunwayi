'use client';

import { useState, useRef } from 'react';
import styles from './page.module.css';

const CATEGORIES = [
  { id: 'पानी', icon: '💧', label: 'पानी' },
  { id: 'बिजली', icon: '⚡', label: 'बिजली' },
  { id: 'सड़क', icon: '🛣️', label: 'सड़क' },
  { id: 'स्वास्थ्य', icon: '🏥', label: 'स्वास्थ्य' },
  { id: 'सफाई', icon: '🗑️', label: 'सफाई' },
  { id: 'अन्य', icon: '📝', label: 'अन्य' }
];

export default function CitizenPortal() {
  const [problem, setProblem] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioUrl(null);
      setAudioBlob(null);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert('माइक्रोफ़ोन तक पहुँचने में त्रुटि। कृपया अपने ब्राउज़र में ऑडियो रिकॉर्ड करने की अनुमति दें।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem && !audioBlob) return;
    if (!category) {
      alert("कृपया समस्या की श्रेणी (Category) चुनें।");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    if (problem) formData.append('problem', problem);
    formData.append('category', category);
    
    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.webm');
    }

    if (fileInputRef.current && fileInputRef.current.files) {
      Array.from(fileInputRef.current.files).forEach((file) => {
        formData.append('media', file);
      });
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccessModal(true);
        setProblem('');
        setCategory('');
        setAudioUrl(null);
        setAudioBlob(null);
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert('समस्या दर्ज करने में त्रुटि हुई।');
      }
    } catch (err) {
      console.error(err);
      alert('सर्वर से कनेक्ट करने में त्रुटि।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.appBar}>
        <div className={styles.iconWrapper}>
          🏛️
        </div>
        <div>
          <h1>जन-संवाद</h1>
        </div>
      </header>

      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <span className={styles.announcementIcon}>🔔</span>
        <div className={styles.marqueeContent}>निवेदन: ग्राम पंचायत बनूड़ा के सर्वांगीण विकास के लिए आने वाले चुनाव में श्री नरेश कुमार शर्मा को अपना कीमती वोट देकर भारी मतों से विजयी बनाएँ। आपका एक वोट, गाँव का सुनहरा भविष्य!</div>
      </div>

      <div className={styles.content}>
        
        {/* Sarpanch Hero Profile */}
        <div className={styles.heroSection}>
          <img 
            src="/image.png" 
            alt="Sarpanch" 
            className={styles.heroImage} 
          />
          <h2 className={styles.heroName}>श्री नरेश कुमार शर्मा</h2>
          <p className={styles.heroTitle}>सरपंच प्रत्याशी, ग्राम पंचायत बनूड़ा</p>
          <p className={styles.heroMessage}>
            "गाँव का विकास, हम सबकी ज़िम्मेदारी! आपकी हर समस्या का समाधान करने के लिए मैं हमेशा आपके साथ हूँ।"
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          
          <p className={styles.helpText}>
            अपनी समस्या यहाँ रिकॉर्ड करें या लिखकर बताएं। आपकी पहचान पूरी तरह गुप्त रखी जाएगी।
          </p>

          <div className={styles.formGroup}>
            <label className={styles.label}>किस प्रकार की समस्या है?</label>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`${styles.categoryCard} ${category === cat.id ? styles.active : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <span className={styles.catLabel}>{cat.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>समस्या बोलकर बताएं</label>
            <div className={styles.audioCard}>
              {!isRecording && !audioUrl && (
                <button 
                  type="button" 
                  onClick={startRecording} 
                  className={styles.recordBtn}
                >
                  <span className={styles.micIcon}>🎙️</span> रिकॉर्ड करें
                </button>
              )}
              
              {isRecording && (
                <div className={styles.recordingActive}>
                  <div className={styles.pulseContainer}>
                    <div className={styles.pulse}></div>
                    <span className={styles.micIcon}>🔴</span>
                  </div>
                  <span className={styles.recordingText}>रिकॉर्ड हो रहा है...</span>
                  <button 
                    type="button" 
                    onClick={stopRecording} 
                    className={styles.stopBtn}
                  >
                    रोकें (Stop)
                  </button>
                </div>
              )}

              {audioUrl && (
                <div className={styles.audioPreview}>
                  <audio controls src={audioUrl} className={styles.audioElement} />
                  <button type="button" onClick={deleteRecording} className={styles.deleteBtn}>
                    🗑️ हटाएं
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.divider}>
            <span>या लिखकर बताएं</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>समस्या का विवरण (लिखें)</label>
            <textarea 
              className={styles.textarea} 
              placeholder="अपनी समस्या यहाँ विस्तार से लिखें..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            ></textarea>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>फोटो / वीडियो (वैकल्पिक)</label>
            <label className={styles.fileArea}>
              <div className={styles.uploadIcon}>📷</div>
              <div className={styles.helpText} style={{marginBottom: 0}}>यहाँ टैप करके फोटो चुनें</div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className={styles.fileInput} 
                accept="image/*,video/*" 
                multiple 
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(Array.from(e.target.files));
                  }
                }}
              />
            </label>
            
            {/* Show Selected Files Feedback */}
            {selectedFiles.length > 0 && (
              <div style={{marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0'}}>
                <span style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem'}}>चुनी गई फाइलें ({selectedFiles.length}):</span>
                <ul style={{margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#334155'}}>
                  {selectedFiles.map((file, index) => (
                    <li key={index} style={{marginBottom: '0.25rem'}}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={styles.bottomBar}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={(!problem && !audioBlob) || isSubmitting}
            >
              {isSubmitting ? 'भेजा जा रहा है...' : 'शिकायत दर्ज करें (Submit)'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.checkIcon}>✓</div>
            <h2 className={styles.modalTitle}>धन्यवाद!</h2>
            <p className={styles.modalText} style={{marginBottom: '1rem'}}>
              आपकी समस्या सरपंच जी तक सफलतापूर्वक पहुँचा दी गई है। जल्द ही इस पर काम स्टार्ट होगा।
            </p>
            <button onClick={closeSuccessModal} className={styles.modalBtn}>
              ठीक है (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
