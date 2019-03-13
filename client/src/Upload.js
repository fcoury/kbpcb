import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import { Field } from 'bloomer';

export default class Upload extends Component {
  constructor() {
    super();
    this.state = {};
  }

  onDrop(acceptedFiles) {
    console.log(acceptedFiles);
    const file = acceptedFiles[0];
    this.setState({ file: file.name });
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      this.props.onUploaded(file, result);
    };
    reader.readAsText(file);
  }

  render() {
    const fileName = this.state.file && <span className="file-name">{this.state.file}</span>;
    return (
      <Field>
        <div className="file is-boxed">
          <label className="file-label">
            <Dropzone onDrop={this.onDrop.bind(this)}>
              {({getRootProps, getInputProps, isDragActive}) => (
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fas fa-upload"></i>
                    </span>
                    <span className="file-label">
                    {
                      isDragActive ?
                        <p>Drop KLE file here...</p> :
                        <p>Choose KLE file...</p>
                    }
                    </span>
                  </span>
                  { fileName }
                </div>
              )}
              </Dropzone>
          </label>
        </div>
      </Field>
    )
  }
}
