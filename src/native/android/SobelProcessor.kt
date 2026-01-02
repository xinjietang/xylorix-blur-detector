package com.xylorixblurdetector

import android.graphics.Bitmap
import android.graphics.Color
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Sobel Processor for edge-based blur detection
 * Uses 3x3 Sobel kernels to detect edges and measure sharpness
 */
class SobelProcessor {
    
    // Sobel kernels for horizontal and vertical edge detection
    private val sobelX = arrayOf(
        intArrayOf(-1, 0, 1),
        intArrayOf(-2, 0, 2),
        intArrayOf(-1, 0, 1)
    )
    
    private val sobelY = arrayOf(
        intArrayOf(-1, -2, -1),
        intArrayOf(0, 0, 0),
        intArrayOf(1, 2, 1)
    )
    
    /**
     * Analyze blur using Sobel operator
     * @param bitmap: Input image bitmap
     * @return: Score between 0-1 where lower = more blur
     */
    fun analyzeBlur(bitmap: Bitmap): Double {
        val grayscale = convertToGrayscale(bitmap)
        val width = grayscale.size
        if (width == 0) return 0.0
        val height = grayscale[0].size
        
        // Apply Sobel operator
        val edgeMagnitudes = applySobel(grayscale, width, height)
        
        // Calculate average edge strength
        return calculateEdgeStrength(edgeMagnitudes)
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
                grayscale[x][y] = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            }
        }
        
        return grayscale
    }
    
    /**
     * Apply Sobel operator using 3x3 convolution
     */
    private fun applySobel(grayscale: Array<DoubleArray>, width: Int, height: Int): Array<DoubleArray> {
        val result = Array(width) { DoubleArray(height) }
        
        for (x in 1 until width - 1) {
            for (y in 1 until height - 1) {
                var gx = 0.0
                var gy = 0.0
                
                // Apply Sobel kernels
                for (i in -1..1) {
                    for (j in -1..1) {
                        val pixel = grayscale[x + i][y + j]
                        gx += pixel * sobelX[i + 1][j + 1]
                        gy += pixel * sobelY[i + 1][j + 1]
                    }
                }
                
                // Calculate gradient magnitude
                result[x][y] = sqrt(gx * gx + gy * gy)
            }
        }
        
        return result
    }
    
    /**
     * Calculate average edge strength as blur score
     */
    private fun calculateEdgeStrength(edgeMagnitudes: Array<DoubleArray>): Double {
        var sum = 0.0
        var count = 0
        
        for (row in edgeMagnitudes) {
            for (value in row) {
                sum += value
                count++
            }
        }
        
        val average = if (count > 0) sum / count else 0.0
        
        // Normalize to 0-1 range (empirically determined scaling)
        // Higher edge strength = sharper image
        return (average * 2.0).coerceIn(0.0, 1.0)
    }
}

/**
 * Laplacian Processor for variance-based blur detection
 * Uses Laplacian operator to measure focus quality
 */
class LaplacianProcessor {
    
    // Laplacian kernel
    private val laplacianKernel = arrayOf(
        intArrayOf(0, -1, 0),
        intArrayOf(-1, 4, -1),
        intArrayOf(0, -1, 0)
    )
    
    /**
     * Analyze blur using Laplacian operator
     * @param bitmap: Input image bitmap
     * @return: Score between 0-1 where lower = more blur
     */
    fun analyzeBlur(bitmap: Bitmap): Double {
        val grayscale = convertToGrayscale(bitmap)
        val width = grayscale.size
        if (width == 0) return 0.0
        val height = grayscale[0].size
        
        // Apply Laplacian operator
        val laplacianResult = applyLaplacian(grayscale, width, height)
        
        // Calculate variance
        return calculateVariance(laplacianResult)
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
                grayscale[x][y] = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            }
        }
        
        return grayscale
    }
    
    /**
     * Apply Laplacian operator using 3x3 convolution
     */
    private fun applyLaplacian(grayscale: Array<DoubleArray>, width: Int, height: Int): Array<DoubleArray> {
        val result = Array(width) { DoubleArray(height) }
        
        for (x in 1 until width - 1) {
            for (y in 1 until height - 1) {
                var value = 0.0
                
                // Apply Laplacian kernel
                for (i in -1..1) {
                    for (j in -1..1) {
                        val pixel = grayscale[x + i][y + j]
                        value += pixel * laplacianKernel[i + 1][j + 1]
                    }
                }
                
                result[x][y] = abs(value)
            }
        }
        
        return result
    }
    
    /**
     * Calculate variance as blur measure
     * Higher variance = sharper image
     */
    private fun calculateVariance(data: Array<DoubleArray>): Double {
        var sum = 0.0
        var count = 0
        
        // Calculate mean
        for (row in data) {
            for (value in row) {
                sum += value
                count++
            }
        }
        
        val mean = if (count > 0) sum / count else 0.0
        
        // Calculate variance
        var varianceSum = 0.0
        for (row in data) {
            for (value in row) {
                val diff = value - mean
                varianceSum += diff * diff
            }
        }
        
        val variance = if (count > 0) varianceSum / count else 0.0
        
        // Normalize to 0-1 range (empirically determined scaling)
        return (variance / 100.0).coerceIn(0.0, 1.0)
    }
}
