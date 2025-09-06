import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AppStep, ImageFile, Country, PhotoType, ComplianceResult, CroppedImage } from './types';
import { COUNTRIES } from './constants';
import { fileToDataUrl, base64ToImage } from './utils/imageUtils';
import { changeBackground, checkCompliance } from './services/geminiService';
import { Header, Footer, Spinner, UploadIcon, CheckCircleIcon, XCircleIcon, CheckIcon, XIcon, ProgressIndicator, CrownIcon, CameraIcon, UserIcon, DocumentTextIcon, SparklesIcon, DownloadIcon } from './components/common';
import { useDropzone } from 'react-dropzone';

// STEP 1: UPLOAD COMPONENT
const UploadZone: React.FC<{ onImageSelect: (image: ImageFile) => void; }> = ({ onImageSelect }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG).');
      return;
    }
    
    // Note: A dynamic file size check based on country is not feasible here,
    // as the country is selected in the next step. A generous 5MB limit is used.
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB.');
        return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const image = await base64ToImage(dataUrl);
      
      const MIN_DIMENSION = 600;
      if (image.width < MIN_DIMENSION || image.height < MIN_DIMENSION) {
          setError(`Image is too small. Must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`);
          return;
      }

      onImageSelect({ file, dataUrl });
    } catch (err) {
      setError('Could not read or validate the image file. Please try another photo.');
      console.error(err);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.png', '.jpg'] }, multiple: false });

  return (
    <>
        <div {...getRootProps()} className={`relative block w-full border-2 ${isDragActive ? 'border-indigo-600' : 'border-gray-300 dark:border-slate-600'} border-dashed rounded-lg p-12 text-center hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors`}>
          <input {...getInputProps()} />
          <UploadIcon />
          <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
            {isDragActive ? 'Drop the file here ...' : 'Drag & drop a photo, or click to select'}
          </span>
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 5MB. Min 600x600 pixels.</span>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </>
  );
};

// NEW: CAMERA CAPTURE COMPONENT
const CameraCapture: React.FC<{ onImageSelect: (image: ImageFile) => void; }> = ({ onImageSelect }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let mediaStream: MediaStream;
        const enableCamera = async () => {
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please ensure permissions are granted and try again.");
            }
        };
        enableCamera();

        return () => {
             if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if(!ctx) return;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        canvas.toBlob(b => {
            if (b) {
              const file = new File([b], 'capture.jpg', { type: 'image/jpeg' });
              onImageSelect({ file, dataUrl });
            }
        }, 'image/jpeg', 0.95);
    };

    if (error) return <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg"><p className="text-red-600 dark:text-red-400">{error}</p></div>;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shadow-lg">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto block" />

                {/* AR Overlay Container - uses a clever box-shadow trick for the "cutout" effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                        className="w-[65%] h-[85%] rounded-[50%/60%] border-2 border-dashed border-white/50 relative"
                        style={{ boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }}
                    >
                        {/* Faint User Icon silhouette as a secondary guide */}
                        <UserIcon className="w-full h-full text-white/10" />
                        
                        {/* Eye line guide */}
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white/50" />
                    </div>
                </div>

                {/* Text instruction for eye line */}
                <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 pointer-events-none">
                    <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full w-max mx-auto shadow-lg">
                        Align eyes with this line
                    </p>
                </div>
            </div>
            <button
                onClick={handleCapture}
                className="mt-6 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
                <CameraIcon className="h-6 w-6 mr-2" />
                Capture Photo
            </button>
        </div>
    );
};

// STEP 1: Redesigned as CaptureStep
const CaptureStep: React.FC<{ onImageSelect: (image: ImageFile) => void; }> = ({ onImageSelect }) => {
    const [captureMode, setCaptureMode] = useState<'upload' | 'camera' | null>(null);
    
    const GuidelineItem: React.FC<{ icon: 'check' | 'cross'; text: string }> = ({ icon, text }) => (
        <li className="flex items-center space-x-3">
            {icon === 'check' ? <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" /> : <XIcon className="h-5 w-5 text-red-500 flex-shrink-0" />}
            <span className="text-slate-700 dark:text-slate-300">{text}</span>
        </li>
    );

    const HowItWorksItem: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
        <div className="text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mx-auto">
                {icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );

    if (captureMode === 'upload') {
        return <UploadZone onImageSelect={onImageSelect} />
    }
    if (captureMode === 'camera') {
        return <CameraCapture onImageSelect={onImageSelect} />
    }

    return (
        <div>
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">Create Your Perfect Passport Photo</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">Get a compliant photo in minutes using our AI-powered tool.</p>
            </div>
            
            <div className="mt-12 mb-16 border-b dark:border-slate-700 pb-12">
                <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <HowItWorksItem icon={<CameraIcon />} title="1. Capture" description="Use your camera or upload a photo." />
                    <HowItWorksItem icon={<DocumentTextIcon />} title="2. Select" description="Choose your country and document type." />
                    <HowItWorksItem icon={<SparklesIcon />} title="3. AI Adjust" description="Our AI checks compliance and replaces the background." />
                    <HowItWorksItem icon={<DownloadIcon />} title="4. Download" description="Get your perfect photo, ready for use." />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Get Started</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">Choose your preferred method to begin.</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => setCaptureMode('camera')} className="w-full py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            Use Camera
                        </button>
                         <button onClick={() => setCaptureMode('upload')} className="w-full py-4 px-4 border border-gray-300 dark:border-slate-600 rounded-md text-lg font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600">
                            Upload File
                        </button>
                    </div>
                </div>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 text-lg">Photo Guidelines</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-green-600 dark:text-green-500 mb-2">✓ Do</h4>
                            <ul className="space-y-2 text-sm">
                               <GuidelineItem icon="check" text="Use a plain, light background" />
                               <GuidelineItem icon="check" text="Face camera directly" />
                               <GuidelineItem icon="check" text="Have a neutral expression" />
                               <GuidelineItem icon="check" text="Ensure your eyes are open" />
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-red-600 dark:text-red-500 mb-2">✗ Don't</h4>
                            <ul className="space-y-2 text-sm">
                                <GuidelineItem icon="cross" text="Wear glasses or sunglasses" />
                                <GuidelineItem icon="cross" text="Wear hats or head coverings*" />
                                <GuidelineItem icon="cross" text="Have shadows on your face" />
                                <GuidelineItem icon="cross" text="Smile or frown" />
                            </ul>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">*Unless for religious or medical reasons.</p>
                  </div>
            </div>
        </div>
    );
};

// STEP 2: PHOTO TYPE SELECT COMPONENT
const PhotoTypeSelectStep: React.FC<{ onPhotoTypeSelect: (country: Country, photoType: PhotoType) => void; }> = ({ onPhotoTypeSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType | null>(null);

    const filteredCountries = useMemo(() =>
        COUNTRIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [searchTerm]
    );

    const handleCountryClick = (country: Country) => {
        setSelectedCountry(country);
        setSelectedPhotoType(country.photoTypes.length === 1 ? country.photoTypes[0] : null);
    };

    const handlePhotoTypeClick = (photoType: PhotoType) => {
        setSelectedPhotoType(photoType);
    };
    
    return (
        <div>
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Select Photo Type</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Choose the country and the type of document photo you need.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <input
                        type="text"
                        placeholder="Search for a country..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md mb-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-96 overflow-y-auto border dark:border-slate-700 rounded-md bg-white dark:bg-slate-800">
                        {filteredCountries.length > 0 ? filteredCountries.map(country => (
                            <div key={country.code}>
                                <button
                                    onClick={() => handleCountryClick(country)}
                                    className={`w-full text-left p-3 font-medium transition-colors ${selectedCountry?.code === country.code ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    {country.name}
                                </button>
                            </div>
                        )) : <p className="p-4 text-slate-500 dark:text-slate-400">No countries found.</p>}
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4">Photo Requirements</h3>
                    {selectedCountry ? (
                         <div className="space-y-4">
                            {selectedCountry.photoTypes.map(pt => (
                                <button 
                                    key={pt.name}
                                    onClick={() => handlePhotoTypeClick(pt)}
                                    className={`w-full text-left p-3 rounded-lg transition-all border-2 ${selectedPhotoType?.name === pt.name ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500' : 'bg-white dark:bg-slate-700 border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
                                >
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{pt.name}</span>
                                </button>
                            ))}
                            {selectedPhotoType && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
                                        <li><strong>Dimensions:</strong> {selectedPhotoType.requirements.width_mm}mm x {selectedPhotoType.requirements.height_mm}mm</li>
                                        <li><strong>Background:</strong> {selectedPhotoType.requirements.background_color}</li>
                                        {selectedPhotoType.requirements.notes.map((note, i) => <li key={i}>{note}</li>)}
                                    </ul>
                                </div>
                            )}
                            <button
                                onClick={() => selectedCountry && selectedPhotoType && onPhotoTypeSelect(selectedCountry, selectedPhotoType)}
                                disabled={!selectedPhotoType}
                                className="w-full mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
                            >
                                Confirm & Continue
                            </button>
                         </div>
                    ) : (
                        <div className="text-center text-slate-500 dark:text-slate-400 pt-10">
                            <p>Select a country to view available photo types.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// STEP 3: EDITOR COMPONENT

// Helper for real-time feedback items
const FeedbackItem: React.FC<{ status: 'pass' | 'warn' | 'fail'; text: string; }> = ({ status, text }) => {
    const colorClasses = {
        pass: 'text-green-600 dark:text-green-500',
        warn: 'text-yellow-600 dark:text-yellow-500',
        fail: 'text-red-600 dark:text-red-500',
    };
    const Icon = {
        pass: () => <CheckCircleIcon className="h-5 w-5 text-green-500" />,
        warn: () => <XCircleIcon className="h-5 w-5 text-yellow-500" />,
        fail: () => <XCircleIcon className="h-5 w-5 text-red-500" />,
    }[status];

    return (
        <div className="flex items-center text-sm">
            <Icon />
            <span className={`ml-2 font-medium ${colorClasses[status]}`}>{text}</span>
        </div>
    );
};


const EditorStep: React.FC<{ originalImage: ImageFile; selectedCountry: Country; selectedPhotoType: PhotoType; onComplete: (image: CroppedImage) => void; onBack: () => void; }> = ({ originalImage, selectedCountry, selectedPhotoType, onComplete, onBack }) => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const aspect = selectedPhotoType.requirements.width_mm / selectedPhotoType.requirements.height_mm;

  // Real-time feedback logic
  const liveFeedback = useMemo(() => {
    // Head Size Check
    const { min, max } = selectedPhotoType.requirements.head_height_percent;
    // This is an estimation. Assumes a standard portrait where head takes up ~35% of height before zoom.
    const BASE_HEAD_PERCENT = 35; 
    const currentHeadPercent = BASE_HEAD_PERCENT * zoom;
    let headSizeStatus: 'pass' | 'warn' | 'fail';
    let headSizeMessage: string;

    if (currentHeadPercent < min) {
      headSizeStatus = 'warn';
      headSizeMessage = 'Head size: Too small';
    } else if (currentHeadPercent > max) {
      headSizeStatus = 'warn';
      headSizeMessage = 'Head size: Too large';
    } else {
      headSizeStatus = 'pass';
      headSizeMessage = 'Head size: Good';
    }
    
    // Position Check (Vertical)
    const VERTICAL_THRESHOLD = 100; // Max pixels to pan vertically off-center
    let positionStatus: 'pass' | 'warn' = Math.abs(position.y) > VERTICAL_THRESHOLD ? 'warn' : 'pass';
    let positionMessage = positionStatus === 'pass' ? 'Position: Centered' : 'Position: Not centered';

    return {
      headSize: { status: headSizeStatus, message: headSizeMessage },
      position: { status: positionStatus, message: positionMessage },
    };
  }, [zoom, position, selectedPhotoType.requirements.head_height_percent]);

  const overallStatus = liveFeedback.headSize.status === 'pass' && liveFeedback.position.status === 'pass' ? 'pass' : 'warn';


  useEffect(() => {
    const processImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bgPromise = changeBackground(originalImage.dataUrl, selectedPhotoType.requirements.background_color);
        const compliancePromise = checkCompliance(originalImage.dataUrl, selectedPhotoType.requirements);

        const [bgResult, complianceRes] = await Promise.all([bgPromise, compliancePromise]);
        
        setProcessedImage(bgResult);
        setComplianceResult(complianceRes);
      } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalImage.dataUrl, selectedPhotoType]);

  const handleGenerate = async () => {
    if (!processedImage || !imageContainerRef.current) return;
    
    const container = imageContainerRef.current;
    const canvas = document.createElement('canvas');
    const image = await base64ToImage(processedImage);
    
    const physicalWidth = 500;
    const physicalHeight = physicalWidth / aspect;

    const reqs = selectedPhotoType.requirements;
    const finalWidthPx = 600; // standard high res width
    const finalHeightPx = finalWidthPx * (reqs.height_mm / reqs.width_mm);

    canvas.width = finalWidthPx;
    canvas.height = finalHeightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.width / (physicalWidth * zoom);
    const scaleY = image.height / (physicalHeight * zoom);

    const sourceX = (physicalWidth / 2 - position.x) * scaleX;
    const sourceY = (physicalHeight / 2 - position.y) * scaleY;
    const sourceWidth = physicalWidth * scaleX;
    const sourceHeight = physicalHeight * scaleY;

    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, finalWidthPx, finalHeightPx);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);

    // Create print sheet
    const printCanvas = document.createElement('canvas');
    const printCtx = printCanvas.getContext('2d');
    if(!printCtx) return;

    // 4x6 inch at 300 DPI = 1200x1800 px
    printCanvas.width = 1800;
    printCanvas.height = 1200;
    printCtx.fillStyle = 'white';
    printCtx.fillRect(0,0,printCanvas.width, printCanvas.height);
    
    const croppedImageForSheet = await base64ToImage(croppedDataUrl);
    const numAcross = Math.floor(printCanvas.width / croppedImageForSheet.width);
    const numDown = Math.floor(printCanvas.height / croppedImageForSheet.height);

    for(let y = 0; y < numDown; y++) {
        for (let x = 0; x < numAcross; x++) {
            printCtx.drawImage(croppedImageForSheet, x * croppedImageForSheet.width, y * croppedImageForSheet.height);
        }
    }

    const printSheetUrl = printCanvas.toDataURL('image/jpeg', 0.95);
    onComplete({ dataUrl: croppedDataUrl, printSheetUrl });
  };
    
  if (isLoading) return <Spinner text="AI is analyzing your photo..." />;
  if (error) return <div className="text-center"><p className="text-red-600 mb-4">{error}</p><button onClick={onBack} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Go Back</button></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">Adjust Your Photo</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Use the controls to fit your photo within the guides.</p>
        
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mb-4 space-y-2">
            <FeedbackItem status={liveFeedback.headSize.status} text={liveFeedback.headSize.message} />
            {liveFeedback.position.status !== 'pass' && (
                <FeedbackItem status={liveFeedback.position.status} text={liveFeedback.position.message} />
            )}
        </div>

        <div ref={imageContainerRef} className="w-full mx-auto bg-gray-200 dark:bg-slate-700 overflow-hidden relative shadow-inner rounded-lg" style={{ aspectRatio: `${aspect}` }}>
          {processedImage && <div className="absolute inset-0 bg-cover bg-no-repeat cursor-move" style={{ backgroundImage: `url(${processedImage})`, backgroundPosition: `${50 + position.x / 5}% ${50 + position.y / 5}%`, backgroundSize: `${zoom * 100}%`, transition: 'background-position 0.1s ease-out' }} 
            onMouseDown={(e) => {
              const startX = e.pageX;
              const startY = e.pageY;
              const startPosX = position.x;
              const startPosY = position.y;
              const handleMouseMove = (moveEvent: MouseEvent) => {
                setPosition({
                  x: startPosX + (moveEvent.pageX - startX),
                  y: startPosY + (moveEvent.pageY - startY)
                });
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />}
          <div className={`absolute inset-0 border-4 border-dashed ${overallStatus === 'pass' ? 'border-green-500/80' : 'border-yellow-500/80'} pointer-events-none rounded-lg transition-colors`} />
           <div className="absolute top-0 w-full h-[25%] bg-black/20 pointer-events-none text-white text-xs text-center pt-1 rounded-t-lg">Head Top</div>
          <div className="absolute bottom-0 w-full h-[25%] bg-black/20 pointer-events-none text-white text-xs text-center pb-1 flex items-end justify-center rounded-b-lg">Chin</div>
        </div>
        <div className="mt-4">
          <label htmlFor="zoom" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Zoom</label>
          <input type="range" id="zoom" min="1" max="3" step="0.01" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">AI Compliance Check</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">{selectedCountry.name} - {selectedPhotoType.name}</p>
        <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow max-h-80 overflow-y-auto">
          {complianceResult?.map((item, index) => (
            <div key={index} className="flex items-start">
              {item.pass ? <CheckCircleIcon className="mt-0.5 flex-shrink-0" /> : <XCircleIcon className="mt-0.5 flex-shrink-0"/>}
              <div className="ml-3">
                <p className={`font-semibold ${item.pass ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>{item.requirement}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex space-x-4">
            <button onClick={onBack} className="w-full py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Back
            </button>
            <button onClick={handleGenerate} className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Generate Photos
            </button>
        </div>
      </div>
    </div>
  );
};

// STEP 4: DOWNLOAD COMPONENT
const DownloadStep: React.FC<{ finalImage: CroppedImage; selectedCountry: Country; onStartOver: () => void }> = ({ finalImage, selectedCountry, onStartOver }) => {
    return (
        <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Your Passport Photo is Ready!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Download your compliant photo, ready for digital submission or printing.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg">
                    <img src={finalImage.dataUrl} alt="Single passport photo" className="w-full rounded-md" />
                    <p className="text-sm font-semibold mt-2">Single Digital Photo</p>
                </div>
                 <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-lg">
                    <img src={finalImage.printSheetUrl} alt="Passport photo print sheet" className="w-full rounded-md" />
                    <p className="text-sm font-semibold mt-2">4x6" Print Sheet</p>
                </div>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                 <a 
                    href={finalImage.dataUrl} 
                    download={`passport_photo_${selectedCountry.code.toLowerCase()}_single.jpg`}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-200 dark:text-indigo-800 dark:hover:bg-indigo-300"
                >
                    Download Single
                </a>
                <a 
                    href={finalImage.printSheetUrl} 
                    download={`passport_photos_${selectedCountry.code.toLowerCase()}_sheet.jpg`}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                    Download Print Sheet
                </a>
                 <button
                    disabled
                    title="Premium feature coming soon!"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-400 dark:bg-slate-600 cursor-not-allowed relative"
                >
                    <CrownIcon className="mr-2 text-yellow-300" />
                    Premium HD Sheet
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">SOON</span>
                </button>
            </div>
            <button onClick={onStartOver} className="mt-8 text-sm text-slate-500 dark:text-slate-400 hover:underline">
                Create another photo
            </button>
        </div>
    );
};

// MAIN APP COMPONENT
const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.CAPTURE);
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType | null>(null);
  const [finalImage, setFinalImage] = useState<CroppedImage | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
  };

  const handleImageSelect = (image: ImageFile) => {
    setOriginalImage(image);
    setStep(AppStep.SELECT);
  };

  const handlePhotoTypeSelect = (country: Country, photoType: PhotoType) => {
    setSelectedCountry(country);
    setSelectedPhotoType(photoType);
    setStep(AppStep.EDIT);
  };

  const handleEditComplete = (image: CroppedImage) => {
    setFinalImage(image);
    setStep(AppStep.DOWNLOAD);
  };
  
  const handleEditorBack = () => {
    setStep(AppStep.SELECT);
  };
  
  const handleStartOver = () => {
      setStep(AppStep.CAPTURE);
      setOriginalImage(null);
      setSelectedCountry(null);
      setSelectedPhotoType(null);
      setFinalImage(null);
  };

  const renderStep = () => {
    switch (step) {
      case AppStep.CAPTURE:
        return <CaptureStep onImageSelect={handleImageSelect} />;
      case AppStep.SELECT:
        return <PhotoTypeSelectStep onPhotoTypeSelect={handlePhotoTypeSelect} />;
      case AppStep.EDIT:
        if (originalImage && selectedCountry && selectedPhotoType) {
          return <EditorStep originalImage={originalImage} selectedCountry={selectedCountry} selectedPhotoType={selectedPhotoType} onComplete={handleEditComplete} onBack={handleEditorBack}/>;
        }
        handleStartOver();
        return null;
      case AppStep.DOWNLOAD:
        if(finalImage && selectedCountry) {
            return <DownloadStep finalImage={finalImage} selectedCountry={selectedCountry} onStartOver={handleStartOver} />;
        }
        handleStartOver();
        return null;
      default:
        return <CaptureStep onImageSelect={handleImageSelect} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg">
            <ProgressIndicator currentStep={step} />
            {renderStep()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
