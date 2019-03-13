import React, { Component } from 'react';
import AceEditor from 'react-ace';
import {
  Field,
  Label,
  Control,
} from 'bloomer';
import 'brace';

import 'brace/mode/json';
import 'brace/theme/github';

import './Editor.css';

import { fromJsonPretty, toJsonPretty } from './jsonl';

export default class CodeEditor extends Component {
  constructor(props) {
    super(props);
    console.log('props', props);
    this.state = {
      value: toJsonPretty(props.value),
      valid: true,
    };
    console.log('this.state', this.state);
  }

  onChange(value) {
    try {
      this.setState({ value, valid: true });
      this.onChange && this.onChange(fromJsonPretty(`[${value}]`));
    } catch (e) {
      this.setState({ valid: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: toJsonPretty(nextProps.value),
        valid: true,
      });
    }
  }

  render() {
    const className = `level-item ${this.state.valid ? 'valid' : 'invalid'}`;
    return (
      <Field>
        <Label>Layout</Label>
        <Control>
        <div className={className}>
          <AceEditor
            width="100%"
            height="250px"
            mode="json"
            theme="github"
            value={this.state.value}
            onChange={this.onChange.bind(this)}
            name="editor"
            useWorker="false"
            setOptions={{useWorker: false}}
            editorProps={{$blockScrolling: true}}
          />
          </div>
        </Control>
      </Field>
    );
  }
}
