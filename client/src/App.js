import React, { Component } from 'react';
import {
  Container,
  Title
} from 'bloomer';
import Upload from './Upload';
import './App.css';

class App extends Component {
  render() {
    return (
      <section class="section">
        <Container>
          <Title>MrKeebs PCB Generator</Title>

          <Upload />
        </Container>
      </section>
    );
  }
}

export default App;
