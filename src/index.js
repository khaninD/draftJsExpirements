import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import reducer from './reducers';
import {Editor, EditorState, RichUtils} from 'draft-js';
import './styles/Draft.css';
//import App from './components/hello-world'

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.onChange = (editorState) => this.setState({editorState});
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
  }
  handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  }

  addBoldStyle = () => {
    const {editorState} = this.state;
    const newState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
    this.onChange(newState);
  };

  render() {
    return (
      <div>
        <button onClick={this.addBoldStyle}>Add style</button>
        <Editor
          editorState={this.state.editorState}
          handleKeyCommand={this.handleKeyCommand}
          onChange={this.onChange}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <MyEditor />,
  document.getElementById('app')
);
