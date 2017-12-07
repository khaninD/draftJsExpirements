import React from 'react';
import App from '../src/components/hello-world/date';
const { shallow } = require('enzyme');

describe('react-component: App', () => {
  let wrapper = shallow(<App />);
  it('should be render component', () => {
    expect(wrapper.length).toBe(1);
  })
});
