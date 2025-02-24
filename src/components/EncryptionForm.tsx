import React, { useState } from 'react';
import { Lock, Unlock, Copy, RefreshCw } from 'lucide-react';
import { generateAESKey, encryptAES, decryptAES, exportKey, importAESKey } from '../utils/crypto';
import type { EncryptionResult } from '../types/crypto';

export default function EncryptionForm() {
  const [text, setText] = useState('');
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [exportedKey, setExportedKey] = useState('');
  const [result, setResult] = useState<EncryptionResult | null>(null);
  const [decryptedText, setDecryptedText] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  const generateNewKey = async () => {
    const newKey = await generateAESKey();
    const exported = await exportKey(newKey);
    setKey(newKey);
    setExportedKey(exported);
  };

  const handleEncrypt = async () => {
    if (!key || !text) return;
    
    try {
      const { ciphertext, iv } = await encryptAES(text, key);
      setResult({ ciphertext, iv });
      setDecryptedText('');
    } catch (error) {
      console.error('Encryption failed:', error);
    }
  };

  const handleDecrypt = async () => {
    if (!key || !result) return;
    
    try {
      const plaintext = await decryptAES(result.ciphertext, result.iv, key);
      setDecryptedText(plaintext);
    } catch (error) {
      console.error('Decryption failed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const importKeyFromString = async (keyString: string) => {
    try {
      const importedKey = await importAESKey(keyString);
      setKey(importedKey);
      setExportedKey(keyString);
    } catch (error) {
      console.error('Key import failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Secure Encryption Tool</h1>
        
        <div className="space-y-6">
          {/* Key Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={generateNewKey}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={18} />
                Generate New Key
              </button>
            </div>
            
            {exportedKey && (
              <div className="bg-gray-50 p-4 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={exportedKey}
                    onChange={(e) => importKeyFromString(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                    placeholder="Enter encryption key..."
                  />
                  <button
                    onClick={() => copyToClipboard(exportedKey)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-md shadow-sm" role="group">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                mode === 'encrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border`}
              onClick={() => setMode('encrypt')}
            >
              Encrypt
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                mode === 'decrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border`}
              onClick={() => setMode('decrypt')}
            >
              Decrypt
            </button>
          </div>

          {/* Input/Output Area */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'encrypt' ? 'Text to Encrypt' : 'Ciphertext'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-32 p-3 border rounded-md"
                placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter ciphertext...'}
              />
            </div>

            {mode === 'decrypt' && result && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IV</label>
                <input
                  type="text"
                  value={result.iv}
                  onChange={(e) => setResult({ ...result, iv: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter IV..."
                />
              </div>
            )}

            <button
              onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
              disabled={!key || !text}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {mode === 'encrypt' ? <Lock size={18} /> : <Unlock size={18} />}
              {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>

            {/* Results */}
            {mode === 'encrypt' && result && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciphertext</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={result.ciphertext}
                      readOnly
                      className="flex-1 p-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(result.ciphertext)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IV</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={result.iv}
                      readOnly
                      className="flex-1 p-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(result.iv)}
                      className="p-2 text-gray-600 hover:text-gray-800"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'decrypt' && decryptedText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decrypted Text</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={decryptedText}
                    readOnly
                    className="flex-1 p-2 border rounded-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(decryptedText)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}