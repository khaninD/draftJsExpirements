import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import classnames from 'classnames';
import moment from 'moment';
// константы классов
const selectDateCN = 'date-time-select__select-date';
const selectTimeCN = 'date-time-select__select-time';
const timeInputCN = 'date-time-select__time-input';
const transitionCN = 'date-time-select_transition';
const showCN = 'date-time-select_show';
const hiddenCN = 'date-time-select_hidden';



class SelectingFormValuesForm extends Component {
  constructor(props) {
    super();
    moment.locale('ru');
    this.items = ['Опубликовать сейчас', ...getNextDates(), 'Другая дата'];
    this.state = {
      anotherDate: false,
      stateInputValue: '',
      inputMask: '99.99'
    };
    function getNextDates() {
      let now = moment();
      const result = [];
      for (let i=0; i < 7; i++) {
        result.push(moment().add(i, 'd').format('D-MMM-dddd'));
      }
      return result;
    }
  }

  componentDidMount() {
    const {value} = this.props;
    const unixValue = value && moment.unix(value);
    // логика для постов пришедших ранее чем сейчас
    const onlyShow = unixValue && moment(unixValue).isBefore(moment());
    // логика для постов пришедших позже чем 7 дней от текущей даты
    const anotherDate = unixValue && moment(unixValue).isAfter(moment().add(7, 'd'));
    // текст для title
    const beforeMoment = onlyShow ? `: ${unixValue.format('D-MMM-dddd')}` : '';
    // текст для постов пришедших позже 7 дней чем сейчас
    const stateInputValue = anotherDate ? moment.unix(value).format('DD.MM.YYYY') : '';
    this.setState({
      currentValue: !anotherDate ? value : '',
      anotherDate,
      onlyShow,
      beforeMoment,
      stateInputValue
    })
  }

  handleChange(e) {
    const {onChange, value: propsValue} = this.props;
    const {target: {value}} = e;
    // для кейса: переход с Опубликовать сейчас на дату
    if (propsValue === '' && value !== 'Другая дата') {
      const isNowDay = value === moment().format('D-MMM-dddd');
      // кейс когда время суток 23 часа
      const checkHour = moment().hour() + 1 < 24;
      let currentHour = moment().hour()+1;
      let currentMinutes = moment().minutes();
      if (isNowDay) {
        currentHour = checkHour ? moment().hour()+1 : 23;
        currentMinutes = checkHour ? currentMinutes : 59;
      }
      const time = moment(value, 'DD-MM-YYYY').hour(currentHour).minute(currentMinutes).format('X');
      this.setState({
        currentValue: Number(time)
      }, () => onChange(Number(time)));
      return;
    }

    if (value && value === 'Опубликовать сейчас') {
      this.setState({
        currentValue: ''
      }, () => onChange(''));
    } else if (value && value !== 'Другая дата') {
      //@TODO пересмотреть эту ветку
      const unixTime = moment.unix(propsValue);
      const date = moment(value, 'DD-MM-YYYY');
      // для кейса когда выбираем текущий день, и время указанное в timestamp уже прошло
      const isNowDay = value === moment().format('D-MMM-dddd');
      const h = (isNowDay &&  unixTime.hours() < moment().hours()) ? moment().hours() : unixTime.hour();
      const m = (isNowDay && unixTime.minutes() < moment().minutes()) ? moment().minutes() : unixTime.minute();
      const result = Number(moment(value, 'DD-MM-YYYY').date(date.date()).hour(h).minute(m).format('X'));
      this.setState({
        currentValue: result
      }, () => onChange(result));
    } else if (value === 'Другая дата') {
      this.setState({
        anotherDate: true
      }, () => {
        this.dateInput.querySelector('input').focus();
      })
    }
  }

  handleBlur(e) {
    const {target: {value}} = e;
    const {onChange, value: propValue} = this.props;
    const {anotherDate, currentValue, inputMask} = this.state;
    if (!value) {
      this.setState({
        anotherDate: false
      }, () => {
        onChange(currentValue ? currentValue : '')
      });
    } else {
      // @TODO здесь корявая логика с propValue...
      // @TODO здесь исправить +1 на более сложную логику
      const time = moment.unix(propValue);
      const isInvalidDate = propValue === 'Invalid date';
      const h = propValue &&  !isInvalidDate? time.hour() : moment().hour() + 1;
      const m = propValue && !isInvalidDate? time.minutes() : moment().minutes();
      const timeToSend = Number(moment(value, 'DD.MM.YYYY').hour(h).minute(m).format('X'));
      // @TODO lol ;)))
      const unixTimeToSend = moment.unix(timeToSend).format('DD.MM.YYYY');
      const dateFormate = inputMask === '99.99.9999' ? 'DD.MM.YYYY' : 'DD.MM';
      const checkTime =  moment(value, dateFormate, true).isValid();
      if (!checkTime) {
        onChange('Invalid date');
        return;
      }
      if(timeToSend !== 'Invalid date') {
        //onChange(timeToSend);
        //@TODO что за пиздец
        if (!propValue) {
          onChange(timeToSend)
        } else if(!anotherDate){
          onChange(timeToSend)
        } else {
          onChange(timeToSend)
        }
      }
    }
  }

  handleInputChange(e) {
    let {target: {value}} = e;
    const {onChange, value: propValue} = this.props;
    const now = moment();
    let inputMask = value.length <= 5 ? '99.99' : '99.99.9999';
    let month = false;
    let year = '';
    const rightValue = moment(value, 'DD.MM', true).isValid();
    // получаем месяц
    if (rightValue) {
      month = Number(value.slice(3, 5));
    }
    if (month) {
      if (inputMask === '99.99') {
        const isNowMonth = month === now.month() + 1;
        value += isNowMonth ? '' : `.${now.year() + 1}`;
        inputMask = '99.99.9999';
      } else {
        if (value.length === 5) {
          value += `.${now.year() + 1}`;
        }
      }
    }
    // @TODO пиздец
    const time = moment.unix(propValue);
    const isInvalidDate = propValue === 'Invalid date';
    const h = propValue &&  !isInvalidDate? time.hour() : moment().hour() + 1;
    const m = propValue && !isInvalidDate? time.minutes() : moment().minutes();
    const timeToSend = Number(moment(value, 'DD.MM.YYYY').hour(h).minute(m).format('X'));
    const unixTimeToSend = moment.unix(timeToSend).format('DD.MM.YYYY');
    const dateFormate = inputMask === '99.99.9999' ? 'DD.MM.YYYY' : 'DD.MM';
    const checkTime =  moment(value, dateFormate, true).isValid();
    this.setState({
      stateInputValue: value,
      inputMask
    }, () => {
      this.dateInput.querySelector('input').focus();
      if (!checkTime) {
        onChange('Invalid date');
      } else {
        onChange(timeToSend);
      }
      /*
      console.log(moment(value, format).format('X'));
      onChange(isValid ? Number(moment(value, format).format('X')) : 'Invalid date');
      */
    })
  }

  handleChangeTime(e, type) {
    const {target: {value}} = e;
    const {value: propValue, onChange} = this.props;
    const {anotherDate} = this.state;
    const unixFormat = moment.unix(propValue);
    const time = type === 'h' ? unixFormat.hour(Number(value)) : unixFormat.minute(Number(value));
    if (propValue !== 'Invalid date') {
      if (!anotherDate) {
        this.setState({
          currentValue: Number(time.format('X'))
        }, () => onChange(Number(time.format('X'))));
      } else {
        onChange(Number(time.format('X')))
      }
    }
  }

  getNumbers(type) {
    const {value, placeholder} = this.props;
    const {anotherDate, onlyShow} = this.state;
    const isNowDay = moment.unix(value).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY');
    const defaultMinVal = 0;
    let startCount;
    let maxCount;
    if (type === 'hours') {
      maxCount = 24;
      startCount = isNowDay ? moment().hours() : defaultMinVal;
    } else if(type === 'minutes') {
      maxCount = 60;
      // для кейса когда выбран тот же час что и сейчас
      const isNowHour = moment.unix(value).hour() === moment().hour();
      startCount = isNowDay && isNowHour ? moment().minutes() : defaultMinVal
    }
    const result = [];
    for (let i=startCount; i < maxCount; i++) {
      const num = i < 10 ? `0${i}` : i;
      result.push(num)
    }
    return result;
  }

  render() {
    const {value, placeholder} = this.props;
    const {anotherDate, stateInputValue, currentValue, beforeMoment, onlyShow, inputMask} = this.state;
    const unixValue = moment.unix(value);
    const isEmptyLine = value === '';
    const valueDate = !isEmptyLine ? unixValue.format('D-MMM-dddd') : 'Опубликовать сейчас';
    const valueHour = !isEmptyLine ? unixValue.hour() : '';
    const valueMin = !isEmptyLine ? unixValue.minute() : '';
    const isValidDate = value !== 'Invalid date';
    console.table({
      value,
      format: moment.unix(value).format(),
      valueDate,
      valueHour,
      valueMin,
      anotherDate,
      stateInputValue,
      currentValue,
      isEmptyLine,
      isValidDate,
      currentValueFormat: moment.unix(currentValue).format(),
      beforeMoment,
      inputMask
    });
    return (
      <FormGroup>
        <ControlLabel>{`${placeholder}${beforeMoment}`}</ControlLabel>{!onlyShow ?<div>
        {!anotherDate ?
          <FormControl componentClass="select" value={valueDate} onChange={(e) => this.handleChange(e)}>
            {this.items.map((item, index) => <option value={item}>{item}</option>)}
          </FormControl> : anotherDate ?
              <div ref = {(input) => this.dateInput = input}><FormControl
                value = {stateInputValue}
                onChange={(e) => this.handleInputChange(e)}
                onBlur={(e) => this.handleBlur(e)}
                placeholder="DD.MM"
              /></div> : null}
        {!isEmptyLine && isValidDate ?
          <div>
            <FormControl componentClass="select" value={valueHour} onChange={(e) => this.handleChangeTime(e, 'h')}>
              {this.getNumbers('hours').map((item, index) => <option value={item < 10 ? item[1] : item}>{item}</option>)}
            </FormControl>
            <FormControl componentClass="select" value={valueMin} onChange={(e) => this.handleChangeTime(e, 'm')}>
              {this.getNumbers('minutes').map((item, index) => <option value={item < 10 ? item[1] : item}>{item}</option>)}
            </FormControl>
          </div> : null} </div> : null}
      </FormGroup>
    )
  }
}


export default SelectingFormValuesForm