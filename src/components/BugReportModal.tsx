import React, { useState, useEffect, useRef } from 'react';
import { invoke } from "@tauri-apps/api/core";
import styles from './BugReportModal.module.css';

const safeInvoke = async <T,>(cmd: string, args?: any): Promise<T> => {
  if (typeof window !== "undefined" && (window as any).__E2E_MOCK_INVOKE__) {
    return (window as any).__E2E_MOCK_INVOKE__(cmd, args);
  }
  if (args !== undefined) {
    return invoke<T>(cmd, args);
  }
  return invoke<T>(cmd);
};

export function BugReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key and submit on Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
      
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        // Find the form and submit it if it exists and we're not already loading
        const form = modalRef.current?.querySelector('form');
        if (form && !loading && !success) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, loading, success]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      let logs = 'No logs available';
      try {
        if (typeof window !== 'undefined' && ((window as any).__TAURI_INTERNALS__ || (window as any).__E2E_MOCK_INVOKE__)) {
          logs = await safeInvoke<string>('get_app_logs');
        }
      } catch (err) {
        console.error('Failed to retrieve system logs:', err);
      }
      
      const res = await fetch('https://sias-api-893975406407.us-central1.run.app/issues', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-SIAAS-App-Token': 'siaas_app_secure_token_2026_xyz'
        },
        body: JSON.stringify({ title, body, logs })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          // Reset form after success
          setTitle('');
          setBody('');
        }, 2000);
      } else {
        setError('Gagal mengirim laporan bug. Silakan coba lagi nanti.');
      }
    } catch (err) {
      console.error('Failed to submit bug report:', err);
      setError('Terjadi kesalahan koneksi. Pastikan Anda terhubung ke internet.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={styles.overlay}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={styles.modal}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Laporkan Bug / Kendala</h2>
          <button 
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Tutup"
            data-testid="close-modal-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {error && (
          <div className={styles.error} data-testid="bug-report-error">
            {error}
          </div>
        )}

        {success ? (
          <div className={styles.success} data-testid="bug-report-success">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Laporan berhasil dikirim! Terima kasih atas bantuan Anda.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} data-testid="bug-report-form">
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Judul Masalah</label>
              <input 
                type="text" 
                required 
                autoFocus
                className={styles.input}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Misal: Tombol Ekspor Excel tidak merespon"
                data-testid="bug-title-input"
              />
            </div>
            
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Deskripsi Lengkap</label>
              <textarea 
                required 
                className={`${styles.input} ${styles.textarea}`}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Ceritakan langkah-langkah yang Anda lakukan sebelum error terjadi... (Tekan Ctrl+Enter untuk kirim)"
                data-testid="bug-body-input"
              />
            </div>

            <div className={styles.diagnostics}>
              <p className={styles.diagnosticsTitle}>Catatan Diagnostik:</p>
              Sistem akan secara otomatis melampirkan log teknis untuk membantu tim mendiagnosis masalah. 
              <span className={styles.diagnosticsSub}>
                Hanya data teknis aplikasi yang dikirim, tidak ada data pribadi siswa yang disertakan.
              </span>
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                onClick={onClose}
                className={`${styles.button} ${styles.buttonSecondary}`}
                data-testid="cancel-bug-report-button"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading || !title.trim() || !body.trim()}
                className={`${styles.button} ${styles.buttonPrimary}`}
                data-testid="submit-bug-report-button"
              >
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
