'use client'
import { useState, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5,
    aspect: 1
  });
  
  const imgRef = useRef<HTMLImageElement>(null);

  function getCroppedImage(sourceImage: HTMLImageElement, cropConfig: PixelCrop): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = sourceImage.naturalWidth / sourceImage.width;
    const scaleY = sourceImage.naturalHeight / sourceImage.height;

    // Set canvas size to match the crop size
    canvas.width = cropConfig.width;
    canvas.height = cropConfig.height;

    // Draw the cropped image
    ctx.drawImage(
      sourceImage,
      cropConfig.x * scaleX,
      cropConfig.y * scaleY,
      cropConfig.width * scaleX,
      cropConfig.height * scaleY,
      0,
      0,
      cropConfig.width,
      cropConfig.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
      }, 'image/jpeg', 1);
    });
  }

  const handleSaveCrop = async () => {
    if (!imgRef.current || !crop) return;

    try {
      const croppedImageUrl = await getCroppedImage(
        imgRef.current,
        crop as PixelCrop
      );
      onCropComplete(croppedImageUrl);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Adjust Profile Picture</h3>
        </div>
        
        <div className="p-6 flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto">
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-[60vh] flex items-center justify-center"
            >
              <img 
                ref={imgRef}
                src={image} 
                alt="Crop preview" 
                className="max-h-[60vh] w-auto"
              />
            </ReactCrop>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-700 border-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 