import React from 'react';
import { AppStep } from '../types';

export const Header: React.FC<{ isDarkMode: boolean; toggleDarkMode: () => void }> = ({ isDarkMode, toggleDarkMode }) => (
  <header className="bg-white dark:bg-slate-800 shadow-md">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <CameraIcon />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 ml-2">AI Passport Photo Pro</h1>
        </div>
        <button
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}
          title={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
      </div>
    </div>
  </header>
);

export const Footer: React.FC = () => (
  <footer className="bg-white dark:bg-slate-800 mt-auto">
    <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} AI Passport Photo Pro. All rights reserved.
      </p>
    </div>
  </footer>
);

export const Spinner: React.FC<{ text?: string }> = ({ text = "Processing..." }) => (
  <div className="flex flex-col items-center justify-center space-y-2">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <span className="text-slate-600 dark:text-slate-400 font-medium">{text}</span>
  </div>
);

export const ProgressIndicator: React.FC<{ currentStep: AppStep }> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.CAPTURE, name: 'Capture Photo' },
    { id: AppStep.SELECT, name: 'Select Type' },
    { id: AppStep.EDIT, name: 'Edit & Check' },
    { id: AppStep.DOWNLOAD, name: 'Download' },
  ];
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8 mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="md:flex-1">
            {stepIdx <= currentStepIndex ? (
              <div className="group flex flex-col border-l-4 border-indigo-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                <span className="text-sm font-medium text-indigo-600">{`Step ${stepIdx + 1}`}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            ) : (
              <div className="group flex flex-col border-l-4 border-gray-200 dark:border-slate-700 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0">
                <span className="text-sm font-medium text-gray-500 dark:text-slate-400">{`Step ${stepIdx + 1}`}</span>
                <span className="text-sm font-medium">{step.name}</span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};


export const CameraIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8 text-indigo-600" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-green-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5 text-red-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className="h-6 w-6 text-green-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
);

export const XIcon: React.FC<{ className?: string }> = ({ className="h-6 w-6 text-red-500" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className = "h-12 w-12 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const CrownIcon: React.FC<{ className?: string }> = ({ className="h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M11.996 2.003a.75.75 0 00-1.992 0l-1.24 2.125-2.486.22-1.72 2.052.013 2.592-1.944 1.488 1.152 2.34.025 2.603 2.138 1.182 2.348-.775.758 2.535 2.29-.93 1.935-1.579.52-2.52-1.35-2.098.86-2.43-1.24-2.125zM9.999 4.31a.75.75 0 01.996 0l.496.848a.75.75 0 00.83.43l.99-.088a.75.75 0 01.765.918l-.348 1.03a.75.75 0 00.323.86l.89.54a.75.75 0 01.272.98l-.458.928a.75.75 0 00.01.878l.685.83a.75.75 0 01-.482.95l-1.01.23a.75.75 0 00-.63.673l-.11 1.025a.75.75 0 01-.93.638l-.99-.22a.75.75 0 00-.78.11l-.81.65a.75.75 0 01-.972-.03L6.01 14.5a.75.75 0 00-.79-.08l-1.002.32a.75.75 0 01-.8-1.06l.33-.98a.75.75 0 00-.23-.84l-.8-.64a.75.75 0 01-.06-1.02l.62-.83a.75.75 0 00.06-.85l-.54-.9a.75.75 0 01.6-1.07l.98-.12a.75.75 0 00.67-.5l.23-1.01a.75.75 0 01.86-.64l1.01.12a.75.75 0 00.7-.24l.496-.848z" />
    </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8 text-indigo-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8 text-indigo-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8 text-indigo-600" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
