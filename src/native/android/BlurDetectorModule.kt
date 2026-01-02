package com.xylorixblurdetector

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.*
import java.nio.ByteBuffer

/**
 * React Native module for blur detection
 * Implements FFT, Sobel, and Laplacian algorithms
 */
@ReactModule(name = BlurDetectorModule.NAME)
class BlurDetectorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        const val NAME = "BlurDetector"
    }
    
    private val fftProcessor = FFTProcessor()
    private val sobelProcessor = SobelProcessor()
    private val laplacianProcessor = LaplacianProcessor()
    
    override fun getName(): String = NAME
    
    /**
     * Detect blur from Vision Camera frame (synchronous for worklet)
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun detectBlur(frame: ReadableMap): WritableMap {
        val startTime = System.currentTimeMillis()
        
        return try {
            // Extract bitmap from frame
            val bitmap = extractBitmapFromFrame(frame)
            
            if (bitmap == null) {
                createErrorResult()
            } else {
                // Resize for performance
                val resizedBitmap = resizeBitmap(bitmap, 640)
                
                // Run all three algorithms
                val fftScore = fftProcessor.analyzeBlur(resizedBitmap)
                val sobelScore = sobelProcessor.analyzeBlur(resizedBitmap)
                val laplacianScore = laplacianProcessor.analyzeBlur(resizedBitmap)
                
                // Calculate overall score (equal weights)
                val overallScore = (fftScore + sobelScore + laplacianScore) / 3.0
                
                val processingTime = (System.currentTimeMillis() - startTime).toDouble()
                
                // Clean up
                resizedBitmap.recycle()
                if (bitmap != resizedBitmap) {
                    bitmap.recycle()
                }
                
                createSuccessResult(fftScore, sobelScore, laplacianScore, overallScore, processingTime)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            createErrorResult()
        }
    }
    
    /**
     * Analyze blur from image buffer (asynchronous)
     */
    @ReactMethod
    fun analyzeBlur(imageBuffer: ReadableArray, width: Int, height: Int, promise: Promise) {
        val startTime = System.currentTimeMillis()
        
        try {
            // Convert ReadableArray to ByteArray
            val byteArray = ByteArray(imageBuffer.size())
            for (i in 0 until imageBuffer.size()) {
                byteArray[i] = imageBuffer.getInt(i).toByte()
            }
            
            // Create bitmap from buffer
            val bitmap = BitmapFactory.decodeByteArray(byteArray, 0, byteArray.size)
            
            if (bitmap == null) {
                promise.reject("IMAGE_ERROR", "Failed to decode image buffer")
                return
            }
            
            // Resize for performance
            val resizedBitmap = resizeBitmap(bitmap, 640)
            
            // Run algorithms asynchronously
            GlobalScope.launch(Dispatchers.Default) {
                try {
                    val fftScore = fftProcessor.analyzeBlur(resizedBitmap)
                    val sobelScore = sobelProcessor.analyzeBlur(resizedBitmap)
                    val laplacianScore = laplacianProcessor.analyzeBlur(resizedBitmap)
                    
                    val overallScore = (fftScore + sobelScore + laplacianScore) / 3.0
                    val processingTime = (System.currentTimeMillis() - startTime).toDouble()
                    
                    // Clean up
                    resizedBitmap.recycle()
                    bitmap.recycle()
                    
                    val result = createSuccessResult(fftScore, sobelScore, laplacianScore, overallScore, processingTime)
                    promise.resolve(result)
                } catch (e: Exception) {
                    promise.reject("PROCESSING_ERROR", e.message)
                }
            }
        } catch (e: Exception) {
            promise.reject("BUFFER_ERROR", e.message)
        }
    }
    
    /**
     * Extract bitmap from Vision Camera frame
     */
    private fun extractBitmapFromFrame(frame: ReadableMap): Bitmap? {
        // Vision Camera provides image data in various formats
        // This is a placeholder - actual implementation depends on Vision Camera's frame structure
        
        // For now, return null and handle in detectBlur
        // In production, this would extract the actual frame data
        return null
    }
    
    /**
     * Resize bitmap for performance
     */
    private fun resizeBitmap(bitmap: Bitmap, targetWidth: Int): Bitmap {
        if (bitmap.width <= targetWidth) {
            return bitmap
        }
        
        val scale = targetWidth.toFloat() / bitmap.width
        val targetHeight = (bitmap.height * scale).toInt()
        
        return Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true)
    }
    
    /**
     * Create success result map
     */
    private fun createSuccessResult(
        fftScore: Double,
        sobelScore: Double,
        laplacianScore: Double,
        overallScore: Double,
        processingTime: Double
    ): WritableMap {
        val result = Arguments.createMap()
        result.putDouble("fftScore", fftScore)
        result.putDouble("sobelScore", sobelScore)
        result.putDouble("laplacianScore", laplacianScore)
        result.putDouble("overallScore", overallScore)
        result.putDouble("processingTimeMs", processingTime)
        return result
    }
    
    /**
     * Create error result map
     */
    private fun createErrorResult(): WritableMap {
        val result = Arguments.createMap()
        result.putDouble("fftScore", 0.0)
        result.putDouble("sobelScore", 0.0)
        result.putDouble("laplacianScore", 0.0)
        result.putDouble("overallScore", 0.0)
        result.putDouble("processingTimeMs", 0.0)
        return result
    }
}
