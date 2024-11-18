import React, { Component } from 'react';
import KeyDefinition from '../../../models/KeyDefinition';
import './styles.scss';
import MessageType from '../../../models/MessageType';

enum KeyState {
  DOWN,
  DOWN_CONTINUOUSLY,
  UP,
  NORMAL
};

export default class Key extends Component<{ className?: string, definition: KeyDefinition, preventRepeat?: boolean }> {
  state = {
    keyState: KeyState.NORMAL,
    hoverPointers: {},
    isHover: false,
  };

  rect = {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
  };

  constructor(props) {
      super(props);
      this._handleRef = this._handleRef.bind(this);
  }

  private _keyUpTimeoutId: any;
  private _keyDownTimeoutId: any;
  private _keyDownContinuouslyIntervalId: any;
  // private _keyHoverTimeoutId: any;

  componentDidMount() {
    if (window.vuplex) {
      this._initMessages();
    } else {
      window.addEventListener('vuplexready', this._initMessages);
    }
  }

  private _initMessages = () => {
    window.vuplex.addEventListener('message', this._handleReceivedMessage);
  }

  private _handleReceivedMessage = (message) => {
    const data = JSON.parse(message.data);
    const hoverPointers = this.state.hoverPointers;

    const pointerUp = (handedness: string) => {
      if (hoverPointers[handedness]) {
        delete hoverPointers[handedness];
        // console.log(pointerId, 'OFF')
        window.vuplex.postMessage({
          Type: MessageType.POINTER_LEAVE,
          Value: handedness,
        });

        if (!Object.keys(hoverPointers).length) {
          this.setState({
            isHover: false,
          });

          // Handle the case where mousedown occurs in one key but mouseup occurs in a different key.
          const {keyState} = this.state;
          if (keyState === KeyState.DOWN || keyState === KeyState.DOWN_CONTINUOUSLY) {
            this._clearTimers();
            this.setState({keyState: KeyState.NORMAL});
          }

        }
      }
    };

    if (data.type === MessageType.KEYBOARD_CLOSED) {
      console.log('close', hoverPointers);
      ['Left', 'Right'].forEach(pointerUp);
    }

    if (data.type === MessageType.POINTER_MOVE) {
      const {handedness, x, y /*pointerId*/} = data.data;
      const {top, left, bottom, right} = this.rect;


      if (top < y && bottom > y && left < x && right > x) {
        if (!hoverPointers[handedness]) {
          // console.log(pointerId, 'ON')
          window.vuplex.postMessage({
            type: MessageType.POINTER_ENTER,
            value: handedness,
          });

          this.setState({
            hoverPointers: {...hoverPointers, [handedness]: handedness},
            isHover: true,
          });
        }
      } else {
        pointerUp(handedness);
      }

    }

  };

  private _handleRef(el) {
      this.rect = el && el.getBoundingClientRect();
  }

  componentWillUnmount() {
    this._clearTimers();
    window.vuplex.removeEventListener('message', this._handleReceivedMessage);
  }

  render() {

    const classNames = [ 'key-component' ];
    if (this.props.className) {
      classNames.push(this.props.className);
    }
    // eslint-disable-next-line default-case
    switch (this.state.keyState) {
      case KeyState.DOWN:
      case KeyState.DOWN_CONTINUOUSLY:
        classNames.push('key-down');
        break;
      case KeyState.UP:
        classNames.push('key-up');
        break;
    }

    if (this.state.isHover) classNames.push('hover');

    return (
      <div
          className={classNames.join(' ')}
          onMouseDown={this._handleMouseDown}
          onMouseUp={this._handleMouseUp}
          ref={this._handleRef}
      >
        {this.props.children || this.props.definition.value}
      </div>
    );
  }

  private _clearTimers = () => {

    clearTimeout(this._keyUpTimeoutId);
    clearTimeout(this._keyDownTimeoutId);
    clearInterval(this._keyDownContinuouslyIntervalId);
  }

  private _handleMouseDown = () => {

    this._clearTimers();
    this.setState({ keyState: KeyState.DOWN });
    this.props.definition.onClick();

    window.vuplex.postMessage({
      type: MessageType.KEY_DOWN,
      value: Object.keys(this.state.hoverPointers)[0], // This may be incorrect if both pointers are hovering
    })

    if (!this.props.preventRepeat){
      // After the key is continously held down for a second, start triggering the key every 50 ms.
      this._keyDownTimeoutId = setTimeout(() => {
        this.setState({ keyState: KeyState.DOWN_CONTINUOUSLY });
        this._keyDownContinuouslyIntervalId = setInterval(this.props.definition.onClick, 50);
      }, 1000);
    }

  }

  private _handleMouseUp = () => {

      this._clearTimers();
    this.setState({ keyState: KeyState.UP });
    this._keyUpTimeoutId = setTimeout(() => this.setState({ keyState: KeyState.NORMAL }), 1000);
  }
}
