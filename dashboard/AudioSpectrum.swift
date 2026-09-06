// Spotify-only, audio-only analysis. No microphone, screen output, audio file,
// network socket, or raw PCM output. Requires macOS Screen Recording permission.
import Foundation
import ScreenCaptureKit
import CoreMedia
import CoreGraphics
import Accelerate

func emit(_ value: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) else { return }
    FileHandle.standardOutput.write(data + Data([10]))
}

final class Analyzer {
    let size = 1024
    let setup = vDSP_DFT_zop_CreateSetup(nil, 1024, .FORWARD)!
    deinit { vDSP_DFT_DestroySetup(setup) }
    func analyze(_ input: [Float]) -> (bands: [Float], wave: [Float], rms: Float) {
        precondition(input.count == size)
        let clean = input.map { $0.isFinite ? min(1, max(-1, $0)) : 0 }
        let rms = sqrt(clean.reduce(Float(0)) { $0 + $1 * $1 } / Float(size))
        let windowed = clean.enumerated().map { i, x in x * (0.5 - 0.5 * cos(2 * Float.pi * Float(i) / Float(size - 1))) }
        let zero = [Float](repeating: 0, count: size)
        var real = zero, imag = zero
        vDSP_DFT_Execute(setup, windowed, zero, &real, &imag)
        // Log-spaced bands, 46.875Hz–24kHz at 48kHz. Fixed dB scale, no automatic
        // gain that could turn silence/noise into fabricated musical activity.
        let bands: [Float] = (0..<32).map { band in
            let lo = max(1, Int(pow(512.0, Double(band) / 32)))
            let hi = min(512, max(lo + 1, Int(pow(512.0, Double(band + 1) / 32))))
            var peak: Float = 0
            for k in lo..<hi { peak = max(peak, hypot(real[k], imag[k]) * 4 / Float(size)) }
            return min(1, max(0, (20 * log10(max(0.000001, peak)) + 60) / 60))
        }
        // 64 quantized points are a visualization envelope, not a PCM transport.
        let wave: [Float] = (0..<64).map { i in
            let start = i * size / 64
            let value = clean[start..<start + size / 64].reduce(Float(0), +) / Float(size / 64)
            return (value * 1000).rounded() / 1000
        }
        return (bands.map { ($0 * 1000).rounded() / 1000 }, wave, rms)
    }
}

final class AudioOutput: NSObject, SCStreamOutput, SCStreamDelegate {
    let analyzer = Analyzer()
    var samples: [Float] = []
    var lastFrame = 0.0
    var sequence = 0
    func stream(_ stream: SCStream, didStopWithError error: Error) {
        emit(["state": "error", "message": "Spotify audio capture stopped. Check macOS recording permission and retry."])
        exit(1)
    }
    func stream(_ stream: SCStream, didOutputSampleBuffer buffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .audio, buffer.isValid,
              let format = CMSampleBufferGetFormatDescription(buffer),
              let description = CMAudioFormatDescriptionGetStreamBasicDescription(format) else { return }
        let asbd = description.pointee
        guard asbd.mFormatID == kAudioFormatLinearPCM,
              asbd.mFormatFlags & kAudioFormatFlagIsFloat != 0,
              asbd.mBitsPerChannel == 32, asbd.mChannelsPerFrame == 1 else { return }
        var list = AudioBufferList()
        var block: CMBlockBuffer?
        let result = CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(buffer, bufferListSizeNeededOut: nil, bufferListOut: &list, bufferListSize: MemoryLayout<AudioBufferList>.size, blockBufferAllocator: nil, blockBufferMemoryAllocator: nil, flags: 0, blockBufferOut: &block)
        guard result == noErr, list.mNumberBuffers == 1, let data = list.mBuffers.mData else { return }
        let count = Int(list.mBuffers.mDataByteSize) / MemoryLayout<Float>.size
        guard count > 0, count <= 48000 else { return }
        samples.append(contentsOf: UnsafeBufferPointer(start: data.assumingMemoryBound(to: Float.self), count: count))
        if samples.count > analyzer.size { samples.removeFirst(samples.count - analyzer.size) }
        let now = ProcessInfo.processInfo.systemUptime
        guard samples.count == analyzer.size, now - lastFrame >= 1.0 / 12 else { return }
        lastFrame = now
        let frame = analyzer.analyze(samples)
        sequence += 1
        emit(["state": frame.rms > 0.0001 ? "streaming" : "silent", "sequence": sequence,
              "bands": frame.bands, "wave": frame.wave, "rms": frame.rms,
              "sampleRate": asbd.mSampleRate, "source": "spotify-application-audio"])
    }
}

@main struct SpotifySpectrum {
    static func main() async {
        if CommandLine.arguments.contains("--self-test") {
            let analyzer = Analyzer()
            let silence = analyzer.analyze([Float](repeating: 0, count: 1024))
            precondition(silence.bands.allSatisfy { $0 == 0 } && silence.rms == 0)
            let tone = (0..<1024).map { sin(2 * Float.pi * 32 * Float($0) / 1024) * 0.5 }
            let frame = analyzer.analyze(tone)
            precondition(frame.bands.count == 32 && frame.wave.count == 64)
            precondition(abs(frame.rms - 0.35355) < 0.001)
            let peak = frame.bands.enumerated().max(by: { $0.element < $1.element })!.offset
            precondition((16...18).contains(peak), "Wrong FFT band for 1500Hz tone: \(peak)")
            precondition(frame.bands.allSatisfy { $0.isFinite && $0 >= 0 && $0 <= 1 })
            emit(["selfTest": "passed", "silence": true, "toneHz": 1500, "peakBand": peak])
            return
        }
        // Preflight does not show a prompt or start capture. Permission is never
        // requested by opening the player; the user must explicitly enable it.
        guard CGPreflightScreenCaptureAccess() else {
            emit(["state": "permission-required", "message": "Allow the host in macOS System Settings → Privacy & Security → Screen & System Audio Recording, then retry. Spotify only; microphone is never captured."])
            return
        }
        if CommandLine.arguments.contains("--check") {
            emit(["state": "ready", "source": "spotify-application-audio"]); return
        }
        guard CommandLine.arguments.contains("--capture") else { return }
        do {
            let content = try await SCShareableContent.excludingDesktopWindows(true, onScreenWindowsOnly: false)
            guard let spotify = content.applications.first(where: { $0.bundleIdentifier == "com.spotify.client" }), let display = content.displays.first else {
                emit(["state": "unavailable", "message": "Open the Spotify macOS app before enabling audio analysis."]); return
            }
            let config = SCStreamConfiguration()
            config.width = 2; config.height = 2; config.minimumFrameInterval = CMTime(value: 1, timescale: 1)
            config.capturesAudio = true; config.sampleRate = 48000; config.channelCount = 1
            config.excludesCurrentProcessAudio = true
            // Microphone capture defaults off; only .audio output is registered
            // below. Do not reference the macOS 15-only microphone property:
            // doing so requires a newer SDK even inside an availability guard.
            let output = AudioOutput()
            let filter = SCContentFilter(display: display, including: [spotify], exceptingWindows: [])
            let stream = SCStream(filter: filter, configuration: config, delegate: output)
            try stream.addStreamOutput(output, type: .audio, sampleHandlerQueue: DispatchQueue(label: "spotify.audio.analysis"))
            try await stream.startCapture()
            emit(["state": "starting", "source": "spotify-application-audio"])
            let parent = getppid()
            while getppid() == parent && parent != 1 { try await Task.sleep(nanoseconds: 1_000_000_000) }
            try await stream.stopCapture()
        } catch {
            emit(["state": "error", "message": "Audio analysis could not start. Check macOS recording permission and Spotify, then retry."])
        }
    }
}
