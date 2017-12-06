import React, { Component } from 'react';
import SelectingFormValuesForm from './date.js';


class Root extends Component {
  constructor(props) {
    super();
    this.state = {
      value:''
    }
  }

  change(value) {
    this.setState({
      value
    })
  }


  render() {
    const {value} = this.state;
    return (
      <SelectingFormValuesForm value={value} onChange={this.change.bind(this)} />
    )
  }
}


export default Root