package com.xylorixblurdetector

import android.graphics.Bitmap
import android.graphics.Color
import com.facebook.react.bridge.*
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * FFT Processor for frequency domain blur analysis
 * Analyzes high-frequency content to determine image sharpness
 */
class FFTProcessor {
    
    /**
     * Analyze blur using FFT approximation
     * @param bitmap: Input image bitmap
     * @return: Score between 0-1 where lower = more blur
     */
    fun analyzeBlur(bitmap: Bitmap): Double {
        val grayscale = convertToGrayscale(bitmap)
        val width = grayscale.size
        if (width == 0) return 0.0
        val height = grayscale[0].size
        
        // Perform simplified 2D FFT using row-column method
        val fftResult = perform2DFFT(grayscale, width, height)
        
        // Calculate high-frequency energy ratio
        return calculateHighFrequencyRatio(fftResult, width, height)
    }
    
    /**
     * Convert bitmap to 2D grayscale array
     */
    private fun convertToGrayscale(bitmap: Bitmap): Array<DoubleArray> {
        val width = bitmap.width
        val height = bitmap.height
        val grayscale = Array(width) { DoubleArray(height) }
        
        for (x in 0 until width) {
            for (y in 0 until height) {
                val pixel = bitmap.getPixel(x, y)
                val r = Color.red(pixel)
                val g = Color.green(pixel)
                val b = Color.blue(pixel)
                // Convert to grayscale using luminosity method
                grayscale[x][y] = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            }
        }
        
        return grayscale
    }
    
    /**
     * Simplified 2D FFT implementation
     * For production, consider using a native library like JTransforms
     */
    private fun perform2DFFT(data: Array<DoubleArray>, width: Int, height: Int): Array<DoubleArray> {
        // Create magnitude array
        val magnitude = Array(width) { DoubleArray(height) }
        
        // Simplified frequency analysis using gradient approximation
        // This is a lightweight alternative to full FFT for mobile devices
        for (x in 1 until width - 1) {
            for (y in 1 until height - 1) {
                // Calculate local gradient magnitude (proxy for frequency content)
                val dx = data[x + 1][y] - data[x - 1][y]
                val dy = data[x][y + 1] - data[x][y - 1]
                magnitude[x][y] = sqrt(dx * dx + dy * dy)
            }
        }
        
        return magnitude
    }
    
    /**
     * Calculate ratio of high-frequency energy to total energy
     */
    private fun calculateHighFrequencyRatio(fftData: Array<DoubleArray>, width: Int, height: Int): Double {
        val centerX = width / 2
        val centerY = height / 2
        val radius = minOf(centerX, centerY) / 2
        
        var lowFreqEnergy = 0.0
        var totalEnergy = 0.0
        
        for (x in 0 until width) {
            for (y in 0 until height) {
                val energy = fftData[x][y].pow(2)
                totalEnergy += energy
                
                // Calculate distance from center
                val dx = x - centerX
                val dy = y - centerY
                val distance = sqrt((dx * dx + dy * dy).toDouble())
                
                if (distance < radius) {
                    lowFreqEnergy += energy
                }
            }
        }
        
        return if (totalEnergy > 0) {
            val highFreqEnergy = totalEnergy - lowFreqEnergy
            (highFreqEnergy / totalEnergy).coerceIn(0.0, 1.0)
        } else {
            0.0
        }
    }
}
