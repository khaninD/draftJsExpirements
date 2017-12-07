const initialState = {
  name: 'Daniil',
  surname: 'Khanin',
  age: 25
};
export default function(state = initialState, {type, payload} = action) {
  if (type === 'getFromStorage') {
    const data = localStorage && JSON.parse(localStorage.getItem('form'));
    if (data) {
      return Object.assign(state, data);;
    }
  }
  else if (type === 'saveForm') {
    localStorage && localStorage.setItem('form', payload);
    return Object.assign(state, JSON.parse(payload));
  }
  return state;
}