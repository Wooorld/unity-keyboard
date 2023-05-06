import React, { Component } from 'react';
import KeyDefinition from '../../../models/KeyDefinition';
import './styles.scss';

enum KeyState {
  DOWN,
  DOWN_CONTINUOUSLY,
  UP,
  NORMAL
};

export default class Key extends Component<{ className?: string, definition: KeyDefinition }> {

  state = {
    keyState: KeyState.NORMAL,
    isHover: false,
    isHoverOffAnimation: false,
  };
  private _keyUpTimeoutId: any;
  private _keyDownTimeoutId: any;
  private _keyDownContinuouslyIntervalId: any;
  private _keyHoverTimeoutId: any;

  componentWillUnmount() {

    this._clearTimers();
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
    if (this.state.isHoverOffAnimation) classNames.push('hover-off');

    return (
      <div className={classNames.join(' ')} onMouseEnter={this._handleMouseEnter} onMouseDown={this._handleMouseDown} onMouseUp={this._handleMouseUp} onMouseLeave={this._handleMouseLeave}>
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
    // After the key is continously held down for a second, start triggering the key every 100 ms.
    this._keyDownTimeoutId = setTimeout(() => {
      this.setState({ keyState: KeyState.DOWN_CONTINUOUSLY });
      this._keyDownContinuouslyIntervalId = setInterval(this.props.definition.onClick, 50);
    }, 1000);
  }

  private _handleMouseLeave = () => {

    // Handle the case where mousedown occurs in one key but mouseup occurs in a different key.
    const { keyState } = this.state;
    if (keyState === KeyState.DOWN || keyState === KeyState.DOWN_CONTINUOUSLY) {
      this._clearTimers();
      this.setState({ keyState: KeyState.NORMAL });
    }

    this._keyHoverTimeoutId = setTimeout(() => {
      this.setState({isHover: false});
      this.setState({isHoverOffAnimation: true});
    }, 50);
  }

  private _handleMouseEnter = () => {
    clearTimeout(this._keyHoverTimeoutId);
    if (!this.state.isHover) {
      this.setState({isHover: true});
      this.setState({isHoverOffAnimation: false});
    }
  }

  private _handleMouseUp = () => {

    this._clearTimers();
    this.setState({ keyState: KeyState.UP });
    this._keyUpTimeoutId = setTimeout(() => this.setState({ keyState: KeyState.NORMAL }), 1000);
  }
}
