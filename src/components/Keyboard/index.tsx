import React, { Component } from 'react';
import CenterBoard from './CenterBoard';
// import MultilingualKeySet from './key-sets/MultilingualKeySet';
import backspaceIcon from './assets/backspace-icon.svg';
import returnIcon from './assets/return-icon.svg';
import dismissKeyboardIcon from './assets/noun-dismiss-keyboard.svg';
import Key from './Key';
import NumPad from './NumPad';
import RightPad from './RightPad';
import MessageType from '../../models/MessageType';
import SimpleKeyDefinition from '../../models/SimpleKeyDefinition';
import sendKeyboardInput from '../../utils/sendKeyboardInput';
import VoiceButton from './VoiceButton';
import './styles.scss';
import EnglishKeySet from "./key-sets/EnglishKeySet";

export default class Keyboard extends Component {

  private _keySet = new EnglishKeySet();


  state = {
    language: this._keySet.language,
    layout: this._keySet.layout,
    voiceRecognitionEnabled: true,
    voiceRecognitionActive: false
  };
  private _backspaceKeyDefinition = new SimpleKeyDefinition('Backspace', sendKeyboardInput);
  private _returnKeyDefinition = new SimpleKeyDefinition('Enter', sendKeyboardInput);
  private _dismissKeyDefinition = new SimpleKeyDefinition('Dismiss', () => {
    window.vuplex.postMessage({ type: MessageType.KEYBOARD_DISMISS });
    console.log('dismiss')
  });

  constructor(props) {
    super(props);
    this._keySet.on('layoutChanged', this._handleLayoutChange);
  }

  componentDidMount() {

    if (window.vuplex) {
      this._initMessages();
    } else {
      window.addEventListener('vuplexready', this._initMessages);
    }
  }

  render() {
    return (
      <div className="keyboard">
        <div className="num-pad-container">
          <NumPad/>
        </div>
        <div className="board-margin"/>
        <div className="center-board-container">
          <CenterBoard rows={this._keySet.getRows()} spacebarText={'_'/*this._keySet.language*/}/>
        </div>

        <div className="enter-key-area">
          <Key className="backspace-icon" definition={this._backspaceKeyDefinition}>
            <img src={backspaceIcon} alt="backspace"/>
          </Key>

          <div className="return-key-container">
            <Key definition={this._returnKeyDefinition} className="return-key-component" preventRepeat>
              <div className="return-key">
                <div className="return-key-text">
                  <img src={returnIcon} alt="return"/>
                </div>
              </div>
            </Key>
          </div>

          <Key className="dismiss-key" definition={this._dismissKeyDefinition} preventRepeat>
            <img src={dismissKeyboardIcon} alt="dismiss"/>
          </Key>

        </div>
        <div className="right-pad-container">
          <RightPad>
            {this._renderVoiceButton()}
          </RightPad>
        </div>
      </div>
    );
  }

  private _handleReceivedMessage = (message) => {

    const data = JSON.parse(message.data);

    // eslint-disable-next-line
    switch (data.type) {
      case MessageType.SET_LANGUAGE:
        // this._keySet.setLanguage(data.value);
        break;
      case MessageType.VOICE_RECOGNITION_DISABLED:
        this.setState({ voiceRecognitionEnabled: false });
        break;
      case MessageType.VOICE_RECOGNITION_ENABLED:
        this.setState({ voiceRecognitionEnabled: true });
        break;
      case MessageType.VOICE_RECOGNITION_FINISHED:
        this.setState({ voiceRecognitionActive: false });
        break;
      case MessageType.VOICE_RECOGNITION_STARTED:
        this.setState({ voiceRecognitionActive: true });
        break;
    }
  }

  private _handleLayoutChange = (keySet) => this.setState({ language: keySet.language, layout: keySet.layout });

  private _handleVoiceButtonMouseDown = (event) => {

    event.preventDefault();
    window.vuplex.postMessage({
      type: !this.state.voiceRecognitionActive ? MessageType.VOICE_RECOGNITION_START_REQUESTED : MessageType.VOICE_RECOGNITION_FINISH_REQUESTED
    });
  }

  private _initMessages = () => {

    window.vuplex.addEventListener('message', this._handleReceivedMessage);
    window.vuplex.postMessage({ type: MessageType.KEYBOARD_INITIALIZED });
  }

  private _renderVoiceButton() {

    if (this.state.voiceRecognitionEnabled) {
      return (
        <div className="voice-button-container">
          <VoiceButton onMouseDown={this._handleVoiceButtonMouseDown} active={this.state.voiceRecognitionActive}/>
        </div>
      );
    }
  }
}
