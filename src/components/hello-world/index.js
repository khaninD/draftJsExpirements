import React, { Component } from 'react';
import SelectingFormValuesForm from './date.js';
import moment from 'moment';

class Root extends Component {
  constructor(props) {
    super();
    this.state = {
      value: moment().add(2, 'd').unix()
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