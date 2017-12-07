import {combineReducers} from 'redux';
import { reducer as formReducer } from 'redux-form'
import form from './form';
export default combineReducers({
  form: formReducer
})