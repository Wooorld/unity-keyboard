
enum MessageType {
  /**
  * Incoming messages
  */
  POINTER_MOVE = 'pointerMove',
  KEY_DOWN = 'keyboard.keyDown',
  POINTER_ENTER = 'pointerEnter',
  POINTER_LEAVE = 'pointerLeave',
  SET_LANGUAGE = 'keyboard.setLanguage',
  VOICE_RECOGNITION_DISABLED = 'keyboard.voiceRecognitionDisabled',
  VOICE_RECOGNITION_ENABLED = 'keyboard.voiceRecognitionEnabled',
  VOICE_RECOGNITION_FINISHED = 'keyboard.voiceRecognitionFinished',
  VOICE_RECOGNITION_STARTED = 'keyboard.voiceRecognitionStarted',

  /**
  * Outgoing messages
  */
  INPUT_RECEIVED = 'keyboard.inputReceived',
  KEYBOARD_DISMISS = 'keyboard.dismiss',
  KEYBOARD_INITIALIZED = 'keyboard.initialized',
  VOICE_RECOGNITION_FINISH_REQUESTED = 'keyboard.voiceRecognitionFinishRequested',
  VOICE_RECOGNITION_START_REQUESTED = 'keyboard.voiceRecognitionStartRequested',
};

export default MessageType;
