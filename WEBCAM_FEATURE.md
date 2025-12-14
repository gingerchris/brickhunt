# Webcam Support for OCR Scanner

## Overview
The OCR Scanner now supports live webcam capture in addition to photo upload, making it easier to scan part numbers from LEGO instruction manuals in real-time.

## Features Added

### User Flow
1. User clicks "Photo of Manual" in Add Brick Modal
2. OCR Scanner presents two options:
   - **Use Webcam** - Opens live camera feed
   - **Take/Upload Photo** - Traditional file picker

### Webcam Mode
- Requests camera permission using `navigator.mediaDevices.getUserMedia()`
- Displays live video preview
- Uses rear camera on mobile devices (`facingMode: 'environment'`)
- Capture button takes snapshot from video feed
- Cancel button stops webcam and returns to options

### Technical Implementation

#### Component: `OCRScanner.tsx`
- Added state for webcam: `useWebcam`, `stream`
- Added refs: `videoRef`, `canvasRef`
- New functions:
  - `startWebcam()` - Initializes camera stream
  - `stopWebcam()` - Cleans up camera resources
  - `captureFromWebcam()` - Captures frame from video to canvas
- Cleanup on unmount to prevent memory leaks

#### Styling: `App.css`
New CSS classes:
- `.input-method-selection` - Method picker UI
- `.method-btn` - Webcam/Photo buttons
- `.method-divider` - "or" separator
- `.webcam-container` - Webcam view wrapper
- `.webcam-preview` - Video element styling
- `.webcam-controls` - Capture/Cancel buttons
- `.capture-btn` - Primary capture button
- `.back-btn` - Return to options button

## User Experience

### Desktop
- Webcam opens in modal
- Large preview area
- Easy capture with mouse click

### Mobile
- Automatically uses rear camera
- Full-screen preview
- Touch-friendly controls

### Error Handling
- Permission denied → Alert with helpful message
- Camera not available → Fallback to photo upload
- OCR fails → Option to try again

## Code Quality
- TypeScript strict mode compliance
- All ESLint errors resolved
- Proper cleanup of media streams
- Type-safe button elements
- No memory leaks

## Testing Checklist
- [ ] Webcam opens on desktop
- [ ] Rear camera used on mobile
- [ ] Capture creates clear image
- [ ] OCR processes captured image
- [ ] Cancel stops camera properly
- [ ] Permission denial handled gracefully
- [ ] Stream cleaned up on unmount
- [ ] Multiple captures work correctly
- [ ] Photo upload still works
- [ ] Try again button resets state

## Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11+)
- Requires HTTPS in production (browser security requirement)

## Security Notes
- Camera permission required
- Works only over HTTPS (except localhost)
- Camera stream stopped when modal closes
- No video recording, only single frame capture
- All processing happens client-side

## Future Enhancements (Optional)
- Zoom controls for manual focus
- Flash/torch toggle on mobile
- Multiple capture modes (burst, timer)
- Image enhancement before OCR
- Manual crop/rotate before processing
