import React from 'react';
import { Send, Camera, ShieldCheck, HardDrive } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';

interface HomeProps {
  onSelectSend: () => void;
  onSelectReceive: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectSend, onSelectReceive }) => {
  return (
    <div className="app-container">
      <div style={{ marginTop: '32px', marginBottom: '40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '16px',
          backgroundColor: '#F0F0F0',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '16px'
        }}>
          <ShieldCheck size={14} />
          <span>AIR-GAPPED OPTICAL TRANSFER</span>
        </div>
        
        <h1 className="title-large" style={{ fontSize: '36px', marginBottom: '8px' }}>Mooshak</h1>
        <h2 className="title-medium" style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '18px' }}>
          Emergency Offline File Transfer
        </h2>
        
        <p className="subtitle" style={{ marginTop: '12px', maxWidth: '340px', marginInline: 'auto' }}>
          Transfer files using only a screen and a camera. No pairing or network required.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '40px' }}>
        <PrimaryButton
          variant="primary"
          icon={<Send size={20} />}
          onClick={onSelectSend}
          style={{ padding: '16px', fontSize: '18px' }}
        >
          Send File
        </PrimaryButton>

        <PrimaryButton
          variant="dark"
          icon={<Camera size={20} />}
          onClick={onSelectReceive}
          style={{ padding: '16px', fontSize: '18px' }}
        >
          Receive File
        </PrimaryButton>
      </div>

      <div className="mt-auto pt-24 text-center">
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.5px',
          marginBottom: '8px'
        }}>
          No Internet • No Wi-Fi • No Bluetooth • No Pairing
        </div>
        <div style={{ fontSize: '12px', color: '#999999', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <HardDrive size={12} />
          <span>Maximum file size: 50 MB</span>
        </div>
      </div>
    </div>
  );
};
