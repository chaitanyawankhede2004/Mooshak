import React, { useState } from 'react';
import { Home } from './ui/Home';
import { SendFile } from './ui/SendFile';
import { Preparing } from './ui/Preparing';
import { SenderTransfer } from './ui/SenderTransfer';
import { ReceiverScanner } from './ui/ReceiverScanner';
import { Success } from './ui/Success';
import { ErrorView } from './ui/ErrorView';

import { prepareFileForTransfer } from './core/Chunker';
import type { PreparedTransfer } from './core/Chunker';
import type { FileMetadata } from './core/TransferTypes';
import './styles/main.css';

type ScreenState = 
  | 'HOME'
  | 'SEND_SELECT'
  | 'SEND_PREPARING'
  | 'SEND_TRANSFERRING'
  | 'RECEIVE_SCANNING'
  | 'SUCCESS'
  | 'ERROR';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('HOME');

  // Sender State
  const [preparedData, setPreparedData] = useState<PreparedTransfer | null>(null);
  const [prepProgress, setPrepProgress] = useState<{ stage: string; percent: number }>({
    stage: 'Reading file...',
    percent: 0,
  });

  // Receiver Success State
  const [receivedResult, setReceivedResult] = useState<{
    blob: Blob;
    metadata: FileMetadata;
    sha256: string;
  } | null>(null);

  // Error State
  const [errorDetails, setErrorDetails] = useState<{ title?: string; message: string }>({
    title: 'Transfer Interrupted',
    message: 'An unexpected error occurred during transfer.',
  });

  // Handler: User clicks "Send File" on Home
  const handleStartSend = () => {
    setScreen('SEND_SELECT');
  };

  // Handler: User clicks "Receive File" on Home
  const handleStartReceive = () => {
    setScreen('RECEIVE_SCANNING');
  };

  // Handler: User chooses file in SendFile screen
  const handleFileSelected = async (file: File) => {
    setScreen('SEND_PREPARING');
    setPrepProgress({ stage: 'Reading file data...', percent: 10 });

    try {
      const prepared = await prepareFileForTransfer(file, 280, (stage, percent) => {
        const stageLabel =
          stage === 'READING'
            ? 'Reading file contents...'
            : stage === 'HASHING'
            ? 'Calculating SHA-256 integrity hash...'
            : 'Generating optical payloads...';
        setPrepProgress({ stage: stageLabel, percent });
      });

      setPreparedData(prepared);
      setScreen('SEND_TRANSFERRING');
    } catch (err: any) {
      console.error('Preparation error:', err);
      setErrorDetails({
        title: 'File Preparation Failed',
        message: err.message || 'Unable to prepare file for transmission.',
      });
      setScreen('ERROR');
    }
  };

  // Handler: Receiver completes transfer & verification
  const handleReceiverSuccess = (blob: Blob, metadata: FileMetadata, sha256: string) => {
    setReceivedResult({ blob, metadata, sha256 });
    setScreen('SUCCESS');
  };

  // Handler: Receiver encounters integrity / decode error
  const handleReceiverError = (errorMsg: string) => {
    setErrorDetails({
      title: 'File Verification Failed',
      message: errorMsg,
    });
    setScreen('ERROR');
  };

  const handleReturnHome = () => {
    setPreparedData(null);
    setReceivedResult(null);
    setScreen('HOME');
  };

  return (
    <>
      {screen === 'HOME' && (
        <Home onSelectSend={handleStartSend} onSelectReceive={handleStartReceive} />
      )}

      {screen === 'SEND_SELECT' && (
        <SendFile onBack={handleReturnHome} onFileSelected={handleFileSelected} />
      )}

      {screen === 'SEND_PREPARING' && (
        <Preparing stageText={prepProgress.stage} percent={prepProgress.percent} />
      )}

      {screen === 'SEND_TRANSFERRING' && preparedData && (
        <SenderTransfer
          metadata={preparedData.metadata}
          chunks={preparedData.chunks}
          onCancel={handleReturnHome}
        />
      )}

      {screen === 'RECEIVE_SCANNING' && (
        <ReceiverScanner
          onBack={handleReturnHome}
          onSuccess={handleReceiverSuccess}
          onError={handleReceiverError}
        />
      )}

      {screen === 'SUCCESS' && receivedResult && (
        <Success
          blob={receivedResult.blob}
          metadata={receivedResult.metadata}
          sha256={receivedResult.sha256}
          onSendAnother={() => setScreen('SEND_SELECT')}
          onHome={handleReturnHome}
        />
      )}

      {screen === 'ERROR' && (
        <ErrorView
          title={errorDetails.title}
          errorMessage={errorDetails.message}
          onRetry={() => {
            if (preparedData) {
              setScreen('SEND_TRANSFERRING');
            } else {
              setScreen('RECEIVE_SCANNING');
            }
          }}
          onHome={handleReturnHome}
        />
      )}
    </>
  );
};

export default App;
