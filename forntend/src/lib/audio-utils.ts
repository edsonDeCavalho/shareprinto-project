export class AudioUtils {
  private static audioContext: AudioContext | null = null;
  private static userInteracted = false;

  static init() {
    // Listen for user interaction to enable audio
    const enableAudio = () => {
      this.userInteracted = true;
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
  }

  static async playSound(audioPath: string, volume: number = 0.7): Promise<boolean> {
    try {
      // Check if user has interacted with the page
      if (!this.userInteracted) {
        console.warn('Audio playback blocked: user has not interacted with the page yet');
        // Try to enable audio anyway
        this.userInteracted = true;
      }

      console.log(`Attempting to play audio from: ${audioPath}`);
      
      const audio = new Audio(audioPath);
      audio.volume = volume;
      audio.preload = 'auto';

      // Wait for audio to be loaded
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio load timeout'));
        }, 5000); // 5 second timeout

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
        
        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(new Error(`Audio load failed for ${audioPath}: ${e}`));
        }, { once: true });
        
        audio.load();
      });

      await audio.play();
      console.log(`Successfully played audio from: ${audioPath}`);
      return true;
    } catch (error) {
      console.error(`Audio playback failed for ${audioPath}:`, error);
      return false;
    }
  }

  static async playSoundWithFallback(
    primaryPath: string, 
    fallbackPaths: string[] = [], 
    volume: number = 0.7
  ): Promise<boolean> {
    const allPaths = [primaryPath, ...fallbackPaths];
    console.log(`🎵 Attempting to play audio with fallbacks:`, allPaths);
    
    for (const path of allPaths) {
      try {
        console.log(`🎵 Trying path: ${path}`);
        const success = await this.playSound(path, volume);
        if (success) {
          console.log(`✅ Successfully played audio from: ${path}`);
          return true;
        }
      } catch (error) {
        console.warn(`❌ Failed to play audio from ${path}:`, error);
        continue;
      }
    }
    
    console.error('❌ All audio paths failed:', allPaths);
    return false;
  }

  // Test function to check if audio files are accessible
  static async testAudioFiles(): Promise<void> {
    const testPaths = [
      '/iconsImages/declineOffee.mp3',
      '/iconsImages/newOffrerProposition.mp3',
      '/sounds/orderAcceptedByFarmer.mp3'
    ];

    console.log('🔊 Testing audio file accessibility...');
    
    for (const path of testPaths) {
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (response.ok) {
          console.log(`✅ Audio file accessible: ${path}`);
        } else {
          console.log(`❌ Audio file not found: ${path} (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ Audio file error: ${path}`, error);
      }
    }
  }
}

// Initialize audio utils when the module is loaded
if (typeof window !== 'undefined') {
  AudioUtils.init();
  
  // Test audio files after a short delay
  setTimeout(() => {
    AudioUtils.testAudioFiles();
  }, 1000);
}
