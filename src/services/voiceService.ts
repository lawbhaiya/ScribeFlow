// Voice service for Native Windows Voice Typing (Win+H) and ElevenLabs Scribe BYOK

export interface VoiceServiceCallbacks {
  onTranscriptChunk: (text: string, isFinal: boolean) => void;
  onAudioLevel?: (level: number) => void;
  onError?: (errorMsg: string) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

class VoiceManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private speechRecognition: any = null;
  private isRecording: boolean = false;
  private currentStream: MediaStream | null = null;

  // Initialize Web Speech API for native browser dictation
  public startWebSpeechRecognition(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void
  ): boolean {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError('Web Speech Recognition not supported in this browser. You can press Win + H on Windows for native dictation.');
      return false;
    }

    try {
      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch (e) {}
      }

      this.speechRecognition = new SpeechRec();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            onResult(transcript, true);
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          onResult(interim, false);
        }
      };

      this.speechRecognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error);
        }
      };

      this.speechRecognition.onend = () => {
        // In Chrome, SpeechRecognition can stop on silence. If still recording, restart it automatically!
        if (this.isRecording) {
          try {
            this.speechRecognition.start();
          } catch (e) {
            // Already started or busy
          }
        }
      };

      this.speechRecognition.start();
      return true;
    } catch (e: any) {
      console.warn('Web speech start error:', e);
      return false;
    }
  }

  public stopWebSpeech() {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.onend = null;
        this.speechRecognition.stop();
      } catch (e) {}
      this.speechRecognition = null;
    }
  }

  // Recording & audio streaming
  public async startAudioCapture(
    callbacks: VoiceServiceCallbacks
  ): Promise<boolean> {
    this.isRecording = true;
    let streamAcquired = false;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.currentStream = stream;
        streamAcquired = true;

        // Audio analysis for live visualizer wave
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          this.audioContext = new AudioCtx();
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
          const source = this.audioContext.createMediaStreamSource(stream);
          this.analyser = this.audioContext.createAnalyser();
          this.analyser.fftSize = 64;
          source.connect(this.analyser);

          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const updateLevel = () => {
            if (!this.analyser || !this.isRecording) return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 128);
            callbacks.onAudioLevel?.(normalized);
            this.animFrameId = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        } catch (e) {
          console.warn('Web Audio visualization error:', e);
        }

        this.audioChunks = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm') 
            ? 'audio/webm' 
            : MediaRecorder.isTypeSupported('audio/mp4') 
              ? 'audio/mp4' 
              : '';

        try {
          this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };
          this.mediaRecorder.start(250); // Collect data every 250ms
        } catch (recErr) {
          console.warn('MediaRecorder init failed, continuing with speech recognition:', recErr);
        }
      }
    } catch (err: any) {
      console.warn('getUserMedia issue, attempting Web Speech recognition fallback:', err);
    }

    // Run speech recognition simultaneously for real-time live preview
    const speechOk = this.startWebSpeechRecognition(
      (chunk, isFinal) => callbacks.onTranscriptChunk(chunk, isFinal),
      (err) => {
        if (!streamAcquired) {
          callbacks.onError?.(err);
        }
      }
    );

    if (streamAcquired || speechOk) {
      callbacks.onRecordingStateChange?.(true);
      return true;
    }

    this.isRecording = false;
    callbacks.onError?.('Microphone access is unavailable. Please check microphone permissions in your browser or use Win+H for Windows dictation.');
    return false;
  }

  public async stopAudioCaptureAndTranscribe(
    elevenLabsApiKey: string,
    modelId: string = 'scribe_v1'
  ): Promise<string> {
    this.isRecording = false;
    this.stopWebSpeech();

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }

    if (this.currentStream) {
      try {
        this.currentStream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      this.currentStream = null;
    }

    return new Promise<string>((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve('');
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        this.mediaRecorder = null;

        // If ElevenLabs API Key is provided, send to ElevenLabs Scribe STT endpoint
        if (elevenLabsApiKey && elevenLabsApiKey.trim() !== '') {
          try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'speech.webm');
            formData.append('model_id', modelId);

            const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
              method: 'POST',
              headers: {
                'xi-api-key': elevenLabsApiKey.trim()
              },
              body: formData
            });

            if (response.ok) {
              const data = await response.json();
              if (data.text) {
                resolve(data.text);
                return;
              }
            } else {
              console.warn('ElevenLabs Scribe error response:', await response.text());
            }
          } catch (err) {
            console.error('ElevenLabs Scribe transcription failed:', err);
          }
        }

        resolve('');
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        resolve('');
      }
    });
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const voiceManager = new VoiceManager();
