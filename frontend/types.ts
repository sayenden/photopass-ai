export enum AppStep {
  CAPTURE = 'CAPTURE',
  SELECT = 'SELECT',
  EDIT = 'EDIT',
  DOWNLOAD = 'DOWNLOAD',
}

export interface PhotoRequirements {
  width_mm: number;
  height_mm: number;
  head_height_percent: { min: number; max: number };
  background_color: string;
  notes: string[];
}

export interface PhotoType {
  name: string;
  requirements: PhotoRequirements;
}

export interface Country {
  code: string;
  name: string;
  photoTypes: PhotoType[];
}

export interface ComplianceResult {
  requirement: string;
  pass: boolean;
  reason: string;
}

export interface ImageFile {
  file: File;
  dataUrl: string;
}

export interface CroppedImage {
  dataUrl: string;
  printSheetUrl: string;
}