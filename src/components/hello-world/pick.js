import React, { Component } from 'react';
import { Picker } from 'emoji-mart'
import { FormControl, ButtonToolbar, DropdownButton } from 'react-bootstrap';
const emodjiIcon = <i className='emodji-icon md md-keyboard-alt' />;
export default class Pick extends Component {
  render() {
    return (
      <div>
        <ButtonToolbar style={{zIndex: 20001}}>
          <DropdownButton
            bsStyle="default"
            title={emodjiIcon}
            noCaret
            id="dropdown"
          >
            <Picker set='emojione' />
          </DropdownButton>
        </ButtonToolbar>
      </div>
    )
  }
}