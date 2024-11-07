import React, { useEffect, useRef } from 'react';
import { Info, X, BookOpen } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="modal-overlay overflow-y-auto overflow-x-hidden"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div 
        ref={modalRef}
        className="modal-content my-4 sm:my-8 mx-auto max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-2 text-blue-600">
              <BookOpen className="w-5 h-5 flex-shrink-0" />
              <h2 id="welcome-title" className="text-xl font-semibold">
                Election Data Explorer
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 
                         hover:bg-gray-100 rounded-full -mr-1"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 text-gray-600">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800">
                Educational Purpose Only
              </p>
              <p className="text-sm text-amber-700 mt-1">
                This tool is designed strictly for educational and research purposes. 
                All data is sourced directly from the Federal Election Commission (FEC) API.
              </p>
            </div>

            <p className="text-lg italic leading-relaxed">
              "Numbers don't lie, but stories can be told in many ways. We're committed 
              to showing you the complete picture, not just parts of it. Explore the data, 
              ask questions, and draw your own conclusions."
            </p>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">About This Tool:</h3>
              <ul className="list-disc list-inside space-y-2 marker:text-blue-500">
                <li>Official Data Source: Federal Election Commission (FEC) API</li>
                <li>Purpose: Educational and research use only</li>
                <li>Goal: Understanding historical election trends and patterns</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Important Notice:</p>
                  <p className="leading-relaxed">
                    While we strive for accuracy in presenting FEC data, this tool 
                    should not be used as an official source. Always verify critical 
                    information through the official FEC website and other authoritative sources.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg 
                         hover:bg-blue-700 transition-colors font-medium
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:ring-offset-2 active:bg-blue-800 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-base sm:text-lg"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}