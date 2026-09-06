import React, { useRef, useState } from 'react';
import { ArrowLeft, Upload, FileUp, ArrowRight } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { FileCard } from '../components/FileCard';
import { StatusMessage } from '../components/StatusMessage';
import { MAX_FILE_SIZE_BYTES } from '../core/Chunker';

interface SendFileProps {
  onBack: () => void;
  onFileSelected: (file: File) => void;
}

export const SendFile: React.FC<SendFileProps> = ({ onBack, onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setSelectedFile(file);
        setErrorMsg(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds maximum supported limit of 50 MB.`);
      } else if (file.size === 0) {
        setSelectedFile(file);
        setErrorMsg('Selected file is empty (0 bytes). Please choose a valid file.');
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleContinue = () => {
    if (selectedFile && !errorMsg) {
      onFileSelected(selectedFile);
    }
  };

  return (
    <div className="app-container">
      <div className="header-nav">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>
        <span className="brand-badge">Sender</span>
      </div>

      <h1 className="title-large">Send a file</h1>
      <p className="subtitle">Choose a file to transfer through your screen.</p>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#FAFAFA',
            marginBottom: '24px',
            transition: 'border-color 0.2s ease',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFEFEF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Upload size={24} style={{ color: 'var(--text-main)' }} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Select file from device</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Supports any file type up to 50 MB</div>
        </div>
      ) : (
        <>
          <FileCard fileName={selectedFile.name} fileSize={selectedFile.size} fileType={selectedFile.type} />

          {errorMsg ? (
            <StatusMessage
              type="error"
              title="File too large"
              message={`${errorMsg} Mooshak MVP supports files up to 50 MB.`}
            />
          ) : (
            <StatusMessage
              type="info"
              message="File is ready for frame generation. Click continue to prepare optical frames."
            />
          )}

          <div style={{ marginTop: '16px', marginBottom: '24px' }}>
            <PrimaryButton
              variant="secondary"
              icon={<FileUp size={16} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Different File
            </PrimaryButton>
          </div>
        </>
      )}

      <div className="mt-auto">
        <PrimaryButton
          variant="primary"
          icon={<ArrowRight size={18} />}
          disabled={!selectedFile || !!errorMsg}
          onClick={handleContinue}
        >
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
};
