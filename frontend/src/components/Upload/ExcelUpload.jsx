import React, { useState, useRef } from 'react';
import { HiOutlineCloudUpload, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

export default function ExcelUpload({ onUpload, loading }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls',
    ];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setResult({ success: false, message: 'Please upload an Excel file (.xlsx, .xls) or CSV file.' });
      return;
    }
    setFile(selectedFile);
    setResult(null);
    setProgress(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file || !onUpload) return;
    setResult(null);
    try {
      const res = await onUpload(file, (p) => setProgress(p));
      setResult({
        success: true,
        message: `Successfully imported ${res.imported || res.count || 'all'} units.`,
        details: res,
      });
      setFile(null);
      setProgress(100);
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Upload failed. Please check the file format and try again.',
      });
      setProgress(0);
    }
  };

  return (
    <div>
      <div
        className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        id="excel-upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ display: 'none' }}
          id="excel-file-input"
        />
        <div className="upload-icon">
          <HiOutlineCloudUpload />
        </div>
        <div className="upload-title">
          {file ? file.name : 'Drop your Excel file here'}
        </div>
        <div className="upload-subtitle">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB — Click "Upload & Process" to import`
            : 'Supports .xlsx, .xls, and .csv files'}
        </div>
      </div>

      {file && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleUpload}
            disabled={loading}
            id="upload-process-btn"
          >
            {loading ? (
              <>
                <span className="spinner-inline"></span>
                Processing...
              </>
            ) : (
              <>
                <HiOutlineCloudUpload />
                Upload & Process
              </>
            )}
          </button>
        </div>
      )}

      {loading && progress > 0 && (
        <div className="upload-progress">
          <div className="upload-progress-bar">
            <div className="upload-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="upload-status">
            <span className="spinner-inline"></span>
            {progress < 100 ? `Uploading... ${progress}%` : 'Processing data...'}
          </div>
        </div>
      )}

      {result && (
        <div className="upload-results animate-fade-in">
          <div className={`upload-result-item`}>
            {result.success ? (
              <HiCheckCircle className="success-icon" style={{ fontSize: '1.5rem' }} />
            ) : (
              <HiExclamationCircle className="error-icon" style={{ fontSize: '1.5rem' }} />
            )}
            <div>
              <div style={{ fontWeight: 600 }}>{result.success ? 'Success!' : 'Error'}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{result.message}</div>
              {result.details?.errors && result.details.errors.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {result.details.errors.slice(0, 5).map((e, i) => (
                    <div key={i}>• {e}</div>
                  ))}
                  {result.details.errors.length > 5 && (
                    <div>...and {result.details.errors.length - 5} more errors</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
