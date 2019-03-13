import React, { Component } from 'react';
import {
  Container,
  Title,
  Notification,
  Delete,
  Field,
  Label,
  Control,
  Input,
} from 'bloomer';
import Upload from './Upload';
import Editor from './Editor';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      layout: [],
      name: '',
    };
  }

  onUploaded(file, text) {
    try {
      this.setState({ error: null });
      const json = JSON.parse(text);
      console.log('json', json);
      if (!Array.isArray(json)) {
        return this.setState({ error: 'File doesn\'t seem to be a valid KLE json' });
      }
      if (json[0] && json[0].name) {
        const name = json[0].name;
        const layout = json.slice(1);
        console.log('name', name, layout);
        this.setState({ name, layout });
      } else {
        const name = file.name;
        const layout = json;
        console.log('name', name, layout);
        this.setState({ name, layout });
      }
    } catch (e) {
      this.setState({ error: `Error reading file: ${e.message}` });
    }
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleLayoutChange(e) {
    this.setState({ layout: e.target.value });
  }

  render() {
    const error = this.state.error ? (
        <Notification isColor='danger'>
            <Delete />
            { this.state.error }
        </Notification>
      ) : null;

    console.log('render layout', this.state.layout);

    return (
      <section class="section">
        <Container>
          <Title>MrKeebs PCB Generator</Title>
          { error }
          <Upload onUploaded={this.onUploaded.bind(this)} />
          <Editor
            value={this.state.layout}
            onChange={this.handleLayoutChange.bind(this)}
          />
          <Field>
            <Label>Layout Name</Label>
            <Control>
              <Input
                placeholder="name"
                value={this.state.name}
                onChange={this.handleNameChange.bind(this)}
              />
            </Control>
          </Field>
        </Container>
      </section>
    );
  }
}

export default App;
