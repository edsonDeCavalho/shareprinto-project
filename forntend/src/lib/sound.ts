class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private userInteracted = false;

  constructor() {
    // Initialize audio context on user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
      this.setupUserInteraction();
    }
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private setupUserInteraction() {
    // Mark that user has interacted when they click anywhere
    const enableAudio = () => {
      this.userInteracted = true;
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
  }

  private preloadSound(soundName: string): HTMLAudioElement {
    if (this.sounds.has(soundName)) {
      return this.sounds.get(soundName)!;
    }

    // Try multiple possible paths for the audio file
    const possiblePaths = [
      `/sounds/${soundName}.mp3`,
      `/iconsImages/${soundName}.mp3`,
      `/public/sounds/${soundName}.mp3`,
      `/public/iconsImages/${soundName}.mp3`
    ];

    const audio = new Audio();
    audio.preload = 'auto';
    
    // Try to load the audio file
    let loaded = false;
    for (const path of possiblePaths) {
      try {
        audio.src = path;
        loaded = true;
        break;
      } catch (error) {
        console.warn(`Failed to load audio from ${path}:`, error);
      }
    }

    if (!loaded) {
      // Fallback to a default path
      audio.src = `/sounds/${soundName}.mp3`;
    }

    this.sounds.set(soundName, audio);
    return audio;
  }

  async playSound(soundName: string): Promise<void> {
    try {
      // Check if user has interacted (required for autoplay policies)
      if (!this.userInteracted) {
        console.log('Audio not played: user has not interacted yet');
        return;
      }

      // Resume audio context if it's suspended (required for autoplay policies)
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audio = this.preloadSound(soundName);
      
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Set volume to a reasonable level
      audio.volume = 0.5;
      
      // Play the sound
      await audio.play();
      
      console.log(`Playing sound: ${soundName}`);
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      // Don't re-throw the error, just log it and continue
      // This prevents the error from breaking the UI
    }
  }

  async playOrderAcceptedSound(): Promise<void> {
    try {
      // Try to play the file first
      await this.playSound('orderAcceptedByFarmer');
    } catch (error) {
      console.log('Audio file not found, generating beep sound instead');
      // Fallback to generated beep sound
      await this.generateBeepSound();
    }
  }

  async playNotificationSound(): Promise<void> {
    try {
      // Try to play the file first - use the correct filename
      await this.playSound('newOffrerProposition');
    } catch (error) {
      console.log('Notification audio file not found, generating beep sound instead');
      // Fallback to generated beep sound
      await this.generateBeepSound();
    }
  }

  async playOfferSound(): Promise<void> {
    try {
      // Try to play the offer sound with correct path
      await this.playSound('newOffrerProposition');
    } catch (error) {
      console.log('Offer audio file not found, generating beep sound instead');
      // Fallback to generated beep sound
      await this.generateBeepSound();
    }
  }

  // Play an arbitrary audio file by URL/path under public/
  async playFileByUrl(fileUrl: string, volume: number = 0.6): Promise<void> {
    try {
      if (!this.userInteracted) {
        console.log('Audio not played: user has not interacted yet');
        return;
      }

      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const audio = new Audio(fileUrl);
      audio.preload = 'auto';
      audio.currentTime = 0;
      audio.volume = Math.min(Math.max(volume, 0), 1);
      await audio.play();
    } catch (error) {
      console.error('Error playing custom audio file:', error);
    }
  }

  // Specific helper for bell accept offer file
  async playBellAcceptOffer(): Promise<void> {
    // Prefer the provided path in public/
    await this.playFileByUrl('/iconsImages/bell-accepte-offer.mp3', 0.8);
  }

  // Play notification sound when farmer changes availability
  async playAvailabilityNotificationSound(): Promise<void> {
    try {
      // Play the notification bell sound for availability changes
      await this.playFileByUrl('/sounds/notification-bell-sound-376888.mp3', 0.7);
    } catch (error) {
      console.log('Availability notification audio file not found, generating beep sound instead');
      // Fallback to generated beep sound
      await this.generateBeepSound();
    }
  }

  private async generateBeepSound(): Promise<void> {
    try {
      if (!this.audioContext) {
        this.initializeAudioContext();
      }

      if (!this.audioContext) {
        throw new Error('AudioContext not available');
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create oscillator for beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure sound
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime); // 800Hz beep
      oscillator.type = 'sine';

      // Configure volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      // Start and stop the sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);

      console.log('Generated beep sound');
    } catch (error) {
      console.error('Error generating beep sound:', error);
    }
  }

  // Method to enable audio context on user interaction
  enableAudio(): void {
    this.userInteracted = true;
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Check if audio is enabled
  isAudioEnabled(): boolean {
    return this.userInteracted;
  }

  // Cleanup method
  dispose(): void {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.sounds.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();

// Export individual functions for convenience
export const playOrderAcceptedSound = () => soundManager.playOrderAcceptedSound();
export const playNotificationSound = () => soundManager.playNotificationSound();
export const playOfferSound = () => soundManager.playOfferSound();
export const playAvailabilityNotificationSound = () => soundManager.playAvailabilityNotificationSound();
export const enableAudio = () => soundManager.enableAudio();
export const isAudioEnabled = () => soundManager.isAudioEnabled();
