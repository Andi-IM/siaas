import React, { useState } from 'react';

export function BugReportModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const logs = "System state: OK\nMemory: 45MB"; // Dummy logs for now
      
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
        }, 2000);
      } else {
        alert('Gagal mengirim laporan bug.');
      }
    } catch (err) {
      console.error('Failed to submit bug report:', err);
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Laporkan Bug / Kendala</h2>
        
        {success ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-md border border-green-200">
            Laporan berhasil dikirim! Terima kasih atas bantuan Anda.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Judul Masalah</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Misal: Tombol Ekspor Excel tidak merespon"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Deskripsi Lengkap</label>
              <textarea 
                required 
                className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Ceritakan langkah-langkah yang Anda lakukan sebelum error terjadi..."
              />
            </div>

            <div className="text-xs text-gray-500">
              Sistem akan secara otomatis melampirkan log teknis untuk membantu tim mendiagnosis masalah.
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
