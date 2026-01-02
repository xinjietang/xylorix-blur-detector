//
//  BlurDetector.swift
//  xylorix-blur-detector
//
//  Main blur detector implementation using FFT, Sobel, and Laplacian operators
//

import Foundation
import CoreImage
import UIKit

/**
 * Blur detection using multiple algorithms
 * Combines FFT, Sobel, and Laplacian methods for comprehensive blur analysis
 */
@objc(BlurDetector)
class BlurDetector: NSObject {
    
    private let fftProcessor = FFTProcessor()
    private let ciContext = CIContext(options: [.useSoftwareRenderer: false])
    
    // Cache filters for reuse
    private lazy var sobelFilter: CIFilter? = {
        return CIFilter(name: "CIEdges")
    }()
    
    private lazy var laplacianKernel: CIKernel? = {
        let kernelString = """
        kernel vec4 laplacian(sampler image) {
            vec2 dc = destCoord();
            vec4 center = sample(image, dc);
            vec4 top = sample(image, dc + vec2(0, 1));
            vec4 bottom = sample(image, dc + vec2(0, -1));
            vec4 left = sample(image, dc + vec2(-1, 0));
            vec4 right = sample(image, dc + vec2(1, 0));
            
            vec4 laplacian = 4.0 * center - top - bottom - left - right;
            return vec4(laplacian.rgb, 1.0);
        }
        """
        return CIKernel(source: kernelString)
    }()
    
    /**
     * Detect blur in a frame from Vision Camera
     * This is called from the frame processor worklet
     */
    @objc
    func detectBlur(_ frame: [String: Any]) -> [String: Any] {
        autoreleasepool {
            let startTime = Date()
            
            // Extract image from frame
            guard let image = extractImageFromFrame(frame) else {
                return createErrorResult()
            }
            
            // Resize for performance (480p)
            let resizedImage = resizeImage(image, targetWidth: 640)
            
            // Run all three algorithms
            let fftScore = fftProcessor.analyzeBlur(image: resizedImage)
            let sobelScore = analyzeSobel(image: resizedImage)
            let laplacianScore = analyzeLaplacian(image: resizedImage)
            
            // Calculate overall score (equal weights)
            let overallScore = (fftScore + sobelScore + laplacianScore) / 3.0
            
            let processingTime = Date().timeIntervalSince(startTime) * 1000.0 // Convert to ms
            
            return [
                "fftScore": fftScore,
                "sobelScore": sobelScore,
                "laplacianScore": laplacianScore,
                "overallScore": overallScore,
                "processingTimeMs": processingTime
            ]
        }
    }
    
    /**
     * Analyze blur using image buffer (for direct API calls)
     */
    @objc
    func analyzeBlur(_ imageBuffer: Data, width: Int, height: Int, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        autoreleasepool {
            let startTime = Date()
            
            guard let image = createCIImageFromBuffer(imageBuffer, width: width, height: height) else {
                rejecter("IMAGE_ERROR", "Failed to create image from buffer", nil)
                return
            }
            
            let resizedImage = resizeImage(image, targetWidth: 640)
            
            let fftScore = fftProcessor.analyzeBlur(image: resizedImage)
            let sobelScore = analyzeSobel(image: resizedImage)
            let laplacianScore = analyzeLaplacian(image: resizedImage)
            
            let overallScore = (fftScore + sobelScore + laplacianScore) / 3.0
            let processingTime = Date().timeIntervalSince(startTime) * 1000.0
            
            resolver([
                "fftScore": fftScore,
                "sobelScore": sobelScore,
                "laplacianScore": laplacianScore,
                "overallScore": overallScore,
                "processingTimeMs": processingTime
            ])
        }
    }
    
    // MARK: - Sobel Edge Detection
    
    /**
     * Analyze blur using Sobel operator (gradient-based edge detection)
     * Higher edge intensity = sharper image
     */
    private func analyzeSobel(image: CIImage) -> Double {
        guard let filter = sobelFilter else { return 0.0 }
        
        filter.setValue(image, forKey: kCIInputImageKey)
        filter.setValue(1.0, forKey: kCIInputIntensityKey)
        
        guard let outputImage = filter.outputImage else { return 0.0 }
        
        // Calculate average intensity of edges
        let extent = outputImage.extent
        let inputExtent = CIVector(x: extent.origin.x, y: extent.origin.y, z: extent.size.width, w: extent.size.height)
        
        guard let averageFilter = CIFilter(name: "CIAreaAverage") else { return 0.0 }
        averageFilter.setValue(outputImage, forKey: kCIInputImageKey)
        averageFilter.setValue(inputExtent, forKey: kCIInputExtentKey)
        
        guard let resultImage = averageFilter.outputImage,
              let bitmap = ciContext.createCGImage(resultImage, from: resultImage.extent) else {
            return 0.0
        }
        
        // Extract pixel value
        let data = bitmap.dataProvider?.data
        let bytes = CFDataGetBytePtr(data)
        
        if let bytes = bytes {
            // Average RGB to get intensity (normalized 0-1)
            let intensity = (Double(bytes[0]) + Double(bytes[1]) + Double(bytes[2])) / (3.0 * 255.0)
            return min(intensity * 2.0, 1.0) // Scale up for better sensitivity
        }
        
        return 0.0
    }
    
    // MARK: - Laplacian Edge Detection
    
    /**
     * Analyze blur using Laplacian operator (variance-based detection)
     * Higher variance = sharper image
     */
    private func analyzeLaplacian(image: CIImage) -> Double {
        // Convert to grayscale first
        guard let grayscaleFilter = CIFilter(name: "CIPhotoEffectMono") else { return 0.0 }
        grayscaleFilter.setValue(image, forKey: kCIInputImageKey)
        guard let grayImage = grayscaleFilter.outputImage else { return 0.0 }
        
        // Apply simple Laplacian using convolution
        let kernel: [CGFloat] = [
            0, -1, 0,
            -1, 4, -1,
            0, -1, 0
        ]
        
        guard let convolutionFilter = CIFilter(name: "CIConvolution3X3") else { return 0.0 }
        convolutionFilter.setValue(grayImage, forKey: kCIInputImageKey)
        convolutionFilter.setValue(CIVector(values: kernel, count: 9), forKey: "inputWeights")
        
        guard let outputImage = convolutionFilter.outputImage else { return 0.0 }
        
        // Calculate variance of Laplacian
        let variance = calculateVariance(of: outputImage)
        
        // Normalize to 0-1 range (empirically determined scaling)
        return min(variance / 100.0, 1.0)
    }
    
    // MARK: - Helper Methods
    
    /**
     * Calculate variance of image intensities
     */
    private func calculateVariance(of image: CIImage) -> Double {
        let extent = image.extent
        
        // Sample pixels for variance calculation
        guard let cgImage = ciContext.createCGImage(image, from: extent) else {
            return 0.0
        }
        
        let width = cgImage.width
        let height = cgImage.height
        var pixelData = [UInt8](repeating: 0, count: width * height * 4)
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: &pixelData,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: width * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            return 0.0
        }
        
        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        // Calculate mean
        var sum: Double = 0.0
        let pixelCount = width * height
        for i in stride(from: 0, to: pixelData.count, by: 4) {
            sum += Double(pixelData[i])
        }
        let mean = sum / Double(pixelCount)
        
        // Calculate variance
        var varianceSum: Double = 0.0
        for i in stride(from: 0, to: pixelData.count, by: 4) {
            let diff = Double(pixelData[i]) - mean
            varianceSum += diff * diff
        }
        
        return varianceSum / Double(pixelCount)
    }
    
    /**
     * Resize image for performance optimization
     */
    private func resizeImage(_ image: CIImage, targetWidth: CGFloat) -> CIImage {
        let scale = targetWidth / image.extent.width
        if scale >= 1.0 {
            return image
        }
        
        return image.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
    }
    
    /**
     * Extract CIImage from Vision Camera frame
     */
    private func extractImageFromFrame(_ frame: [String: Any]) -> CIImage? {
        // Vision Camera provides pixel buffer
        // This is a placeholder - actual implementation depends on Vision Camera frame structure
        if let pixelBuffer = frame["pixelBuffer"] as? CVPixelBuffer {
            return CIImage(cvPixelBuffer: pixelBuffer)
        }
        return nil
    }
    
    /**
     * Create CIImage from raw buffer data
     */
    private func createCIImageFromBuffer(_ buffer: Data, width: Int, height: Int) -> CIImage? {
        let bytesPerPixel = 4
        let bytesPerRow = width * bytesPerPixel
        let bitsPerComponent = 8
        
        guard let dataProvider = CGDataProvider(data: buffer as CFData) else { return nil }
        
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let cgImage = CGImage(
            width: width,
            height: height,
            bitsPerComponent: bitsPerComponent,
            bitsPerPixel: bytesPerPixel * 8,
            bytesPerRow: bytesPerRow,
            space: colorSpace,
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
            provider: dataProvider,
            decode: nil,
            shouldInterpolate: true,
            intent: .defaultIntent
        ) else { return nil }
        
        return CIImage(cgImage: cgImage)
    }
    
    /**
     * Create error result
     */
    private func createErrorResult() -> [String: Any] {
        return [
            "fftScore": 0.0,
            "sobelScore": 0.0,
            "laplacianScore": 0.0,
            "overallScore": 0.0,
            "processingTimeMs": 0.0
        ]
    }
}
