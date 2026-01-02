//
//  FFTProcessor.swift
//  xylorix-blur-detector
//
//  FFT-based blur detection using Accelerate framework
//

import Foundation
import Accelerate
import CoreImage
import UIKit

/**
 * FFT Processor for frequency domain blur analysis
 * Uses Fast Fourier Transform to detect blur by analyzing high-frequency content
 * Lower high-frequency content indicates more blur
 */
class FFTProcessor {
    
    /**
     * Analyze blur using FFT on grayscale image
     * @param image: CIImage to analyze
     * @return: Score between 0-1 where lower = more blur
     */
    func analyzeBlur(image: CIImage) -> Double {
        autoreleasepool {
            // Convert to grayscale and get pixel data
            guard let pixelData = getGrayscalePixelData(from: image) else {
                return 0.0
            }
            
            let width = Int(image.extent.width)
            let height = Int(image.extent.height)
            let pixelCount = width * height
            
            // Perform 2D FFT
            guard let fftResult = perform2DFFT(data: pixelData, width: width, height: height) else {
                return 0.0
            }
            
            // Calculate high-frequency energy ratio
            let score = calculateHighFrequencyRatio(fftData: fftResult, width: width, height: height)
            
            return min(max(score, 0.0), 1.0)
        }
    }
    
    /**
     * Convert image to grayscale pixel data
     */
    private func getGrayscalePixelData(from image: CIImage) -> [Float]? {
        let context = CIContext(options: nil)
        let width = Int(image.extent.width)
        let height = Int(image.extent.height)
        
        // Create grayscale color space
        let colorSpace = CGColorSpaceCreateDeviceGray()
        
        // Create bitmap
        guard let cgImage = context.createCGImage(image, from: image.extent) else {
            return nil
        }
        
        var pixels = [UInt8](repeating: 0, count: width * height)
        guard let bitmapContext = CGContext(
            data: &pixels,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: width,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.none.rawValue
        ) else {
            return nil
        }
        
        bitmapContext.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
        
        // Convert to Float array normalized to 0-1
        return pixels.map { Float($0) / 255.0 }
    }
    
    /**
     * Perform 2D FFT using vDSP
     */
    private func perform2DFFT(data: [Float], width: Int, height: Int) -> [Float]? {
        let log2Width = vDSP_Length(log2(Float(width)))
        let log2Height = vDSP_Length(log2(Float(height)))
        
        guard let fftSetup = vDSP_create_fftsetup(max(log2Width, log2Height), FFTRadix(kFFTRadix2)) else {
            return nil
        }
        defer { vDSP_destroy_fftsetup(fftSetup) }
        
        var realp = [Float](repeating: 0, count: width * height / 2)
        var imagp = [Float](repeating: 0, count: width * height / 2)
        
        // Split complex for FFT
        var splitComplex = DSPSplitComplex(realp: &realp, imagp: &imagp)
        
        // Copy data and prepare for FFT
        data.withUnsafeBytes { dataPtr in
            let floatPtr = dataPtr.bindMemory(to: Float.self)
            floatPtr.baseAddress?.withMemoryRebound(to: DSPComplex.self, capacity: width * height / 2) { complexPtr in
                vDSP_ctoz(complexPtr, 2, &splitComplex, 1, vDSP_Length(width * height / 2))
            }
        }
        
        // Perform 2D FFT (row-wise then column-wise)
        vDSP_fft2d_zip(fftSetup, &splitComplex, 1, 0, log2Width, log2Height, FFTDirection(FFT_FORWARD))
        
        // Calculate magnitude
        var magnitudes = [Float](repeating: 0, count: width * height / 2)
        vDSP_zvabs(&splitComplex, 1, &magnitudes, 1, vDSP_Length(width * height / 2))
        
        return magnitudes
    }
    
    /**
     * Calculate ratio of high-frequency energy to total energy
     * Higher ratio = sharper image (less blur)
     */
    private func calculateHighFrequencyRatio(fftData: [Float], width: Int, height: Int) -> Double {
        let centerX = width / 2
        let centerY = height / 2
        let radius = min(centerX, centerY) / 2
        
        var lowFreqEnergy: Double = 0.0
        var totalEnergy: Double = 0.0
        
        for y in 0..<height/2 {
            for x in 0..<width/2 {
                let index = y * (width / 2) + x
                if index < fftData.count {
                    let magnitude = Double(fftData[index])
                    let energy = magnitude * magnitude
                    totalEnergy += energy
                    
                    // Calculate distance from center (low frequencies are near center)
                    let dx = x - centerX/2
                    let dy = y - centerY/2
                    let distance = sqrt(Double(dx * dx + dy * dy))
                    
                    if distance < Double(radius) {
                        lowFreqEnergy += energy
                    }
                }
            }
        }
        
        // High frequency ratio (inverted - we want high freq to indicate sharpness)
        if totalEnergy > 0 {
            let highFreqEnergy = totalEnergy - lowFreqEnergy
            return highFreqEnergy / totalEnergy
        }
        
        return 0.0
    }
}
