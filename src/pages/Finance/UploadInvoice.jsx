import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FinanceLayout from '../../components/FinanceLayout';
import { invoiceApi } from '../../utils/invoiceApi';
import { Upload, FileText } from 'lucide-react';

const VALID_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/csv'];

const UploadInvoice = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [poId, setPoId] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const navigate = useNavigate();

  const onFileChange = (e) => {
    setSuccessMsg('');
    setError('');
    const f = e.target.files?.[0] || null;
    if (f && !VALID_TYPES.includes(f.type)) {
      setError('Invalid file type. Allowed: PDF, JPG, PNG, CSV');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    setError('');
    setSuccessMsg('');
  if (!file) return setError('Please select a file first.');
  if (!poId || !poId.trim()) return setError('Please enter the Purchase Order ID.');

    try {
      setUploading(true);
      setProgress(10);

      // invoiceApi.uploadInvoiceFile returns JSON; update progress via simple steps
      const result = await invoiceApi.uploadInvoiceFile(file, {}, poId || undefined);
      setProgress(100);
      setSuccessMsg('Upload successful');
      setMatchResult(result);

      // Try to extract an invoice id from common response shapes returned by backend
      const invoiceId = result?.savedInvoiceId || result?.id || result?._id || result?.invoiceId || result?.invoice?._id || result?.invoice?.id;
      if (invoiceId) {
        // navigate to the invoice details page so the user can view parsed/entered fields
        navigate(`/finance/invoices/${invoiceId}`);
        return;
      }

      // If backend didn't return an id, keep the success message and clear file
      setFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  return (
    <FinanceLayout>
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-6 w-6 text-gray-700" />
          <h1 className="text-xl font-bold">Upload Invoice</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-4">Upload a supplier invoice (PDF, image or CSV). The system will parse the file where possible.</p>

          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order ID (required)</label>
              <input
                type="text"
                value={poId}
                onChange={(e) => setPoId(e.target.value)}
                placeholder="Enter PO ID to match against"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <input type="file" onChange={onFileChange} accept=".pdf,image/*,.csv" />
          </div>

          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
          {successMsg && <div className="text-sm text-green-600 mb-3">{successMsg}</div>}

          {uploading && (
            <div className="mb-3">
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-3" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleUpload} disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button onClick={() => { setFile(null); setError(''); setSuccessMsg(''); setMatchResult(null); }} className="px-4 py-2 border rounded">Clear</button>
          </div>

          {matchResult && (
            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Match Results</h2>
              <div className="text-sm text-gray-700 mb-2">
                <div>PO: <span className="font-mono">{matchResult.poId}</span></div>
                <div>Expected Total: ${Number(matchResult.expectedTotal || 0).toFixed(2)}</div>
                <div>Invoice Total: ${Number(matchResult.invoiceTotal || 0).toFixed(2)}</div>
                <div>Status: {matchResult.match ? <span className="text-green-600 font-medium">Match</span> : <span className="text-red-600 font-medium">Mismatches Found</span>}</div>
              </div>
              {Array.isArray(matchResult.issues) && matchResult.issues.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-800 bg-gray-50 p-3 rounded">
                  {matchResult.issues.map((i, idx) => (
                    <li key={idx}><span className="font-mono">{i.productId}</span>: {i.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </FinanceLayout>
  );
};

export default UploadInvoice;
