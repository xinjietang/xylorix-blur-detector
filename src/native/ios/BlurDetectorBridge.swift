//
//  BlurDetectorBridge.swift
//  xylorix-blur-detector
//
//  React Native bridge for BlurDetector module
//

import Foundation
import React

@objc(BlurDetector)
class BlurDetectorBridge: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func detectBlur(_ frame: NSDictionary) -> NSDictionary {
        let detector = BlurDetector()
        let result = detector.detectBlur(frame as! [String: Any])
        return result as NSDictionary
    }
    
    @objc
    func analyzeBlur(_ imageBuffer: Data, width: NSNumber, height: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        let detector = BlurDetector()
        detector.analyzeBlur(imageBuffer, width: width.intValue, height: height.intValue, resolver: resolver, rejecter: rejecter)
    }
}

// Export module to React Native
@objc(BlurDetector)
extension BlurDetectorBridge: RCTBridgeModule {
    static func moduleName() -> String! {
        return "BlurDetector"
    }
}
