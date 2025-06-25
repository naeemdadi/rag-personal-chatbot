import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react';

import type { OurFileRouter } from '@/app/api/uploadthing/core';

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: '/api/uploadthing'
});
export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: '/api/uploadthing'
});
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
