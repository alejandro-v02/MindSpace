export interface VoiceHandlers {
  onMouthOpen: () => void;
  onMouthClose: () => void;
  onEnd: () => void;
}

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((voice) => voice.lang.startsWith("es")) ??
    voices.find((voice) => voice.default)
  );
}

export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, handlers: VoiceHandlers): void {
  if (!isVoiceSupported() || !text.trim()) {
    handlers.onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 1.02;
  const voice = pickSpanishVoice();
  if (voice) utterance.voice = voice;

  // Sin boca por capas todavía (eso es trabajo de arte real, fase 9 del doc),
  // así que simulamos el lip-sync alternando la boca en cada límite de palabra.
  let mouthOpen = false;
  utterance.onboundary = () => {
    mouthOpen = !mouthOpen;
    if (mouthOpen) handlers.onMouthOpen();
    else handlers.onMouthClose();
  };
  utterance.onend = () => {
    handlers.onMouthClose();
    handlers.onEnd();
  };
  utterance.onerror = () => {
    handlers.onMouthClose();
    handlers.onEnd();
  };

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isVoiceSupported()) speechSynthesis.cancel();
}
