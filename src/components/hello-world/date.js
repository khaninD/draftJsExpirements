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
    const {currentValue} = this.state;
    //@TODO здесь нужно отрефакторить слишком много DRY
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
        currentValue: Number(time),
        showTime: true
      }, () => onChange(Number(time)));
      return;
    }

    if (value && value === 'Опубликовать сейчас') {
      this.setState({
        currentValue: '',
        showTime: false
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
        currentValue: result,
        showTime: true
      }, () => onChange(result));
    } else if (value === 'Другая дата') {
      this.setState({
        anotherDate: true,
        showTime: !!currentValue
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
        anotherDate: false,
        showTime: !!currentValue
      }, () => {
        onChange(currentValue ? currentValue : '')
      });
    } else {
      // @TODO здесь корявая логика с propValue...
      // @TODO здесь исправить +1 на более сложную логику
      const time = moment.unix(propValue);
      const isInvalidDate = propValue === 'Invalid date';
      const h = propValue && !isInvalidDate? time.hour() : moment().hour() + 1;
      const m = propValue && !isInvalidDate? time.minutes() : moment().minutes();
      const timeToSend = Number(moment(value, 'DD.MM.YYYY').hour(h).minute(m).format('X'));
      const dateFormate = inputMask === '99.99.9999' ? 'DD.MM.YYYY' : 'DD.MM';
      const checkTime =  moment(value, dateFormate, true).isValid();
      if (!checkTime) {
        this.setState({
          h,
          m
        }, () => {
          onChange('Invalid date');
          return;
        });
      }
      if(timeToSend !== 'Invalid date') {
        if (!propValue) {
          onChange(timeToSend);
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
    const {showTime} = this.state;
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
    // @TODO можно убрать inputMask из state и проверять 1 строчкой
    const time = moment.unix(propValue);
    const isInvalidDate = propValue === 'Invalid date';
    const h = propValue &&  !isInvalidDate? time.hour() : moment().hour() + 1;
    const m = propValue && !isInvalidDate? time.minutes() : moment().minutes();
    const timeToSend = Number(moment(value, 'DD.MM.YYYY').hour(h).minute(m).format('X'));
    const dateFormate = inputMask === '99.99.9999' ? 'DD.MM.YYYY' : 'DD.MM';
    const checkTime =  moment(value, dateFormate, true).isValid();
    this.setState({
      stateInputValue: value,
      inputMask,
      showTime: showTime ? true : month ? true : false
    }, () => {
      this.dateInput.querySelector('input').focus();
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
          currentValue: Number(time.format('X')),
          [type]: false
        }, () => onChange(Number(time.format('X'))));
      } else {
        this.setState({
          [type]: false
        }, () => onChange(Number(time.format('X'))))
      }
    } else {
      this.setState({
        [type]: value
      })
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
    const {
      anotherDate,
      stateInputValue,
      currentValue,
      beforeMoment,
      onlyShow,
      showTime,
      h,
      m
    } = this.state;
    let valueHour;
    let valueMin;
    const now = moment();
    const unixValue = moment.unix(value);
    const valueDate = value ? unixValue.format('D-MMM-dddd') : 'Опубликовать сейчас';
    // @TODO здесь должна быть логика учитывающая час при > 23:00
    if (value !== 'Invalid date') {
      valueHour = value ? unixValue.hour() : now.hour() + 1;
      valueMin = value ? unixValue.minute() : now.minutes();
    } else {
      valueHour = h;
      valueMin = m;
    }
    const timeClass = classnames({
      'time-select': true,
      'hidden': !showTime
    });
    console.table({
      value,
      format: moment.unix(value).format(),
      valueDate,
      valueHour,
      valueMin,
      anotherDate,
      stateInputValue,
      currentValue,
      currentValueFormat: moment.unix(currentValue).format(),
      beforeMoment
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
          <div className={timeClass}>
            <FormControl componentClass="select" value={valueHour} onChange={(e) => this.handleChangeTime(e, 'h')}>
              {this.getNumbers('hours').map((item, index) => <option value={item < 10 ? item[1] : item}>{item}</option>)}
            </FormControl>
            <FormControl componentClass="select" value={valueMin} onChange={(e) => this.handleChangeTime(e, 'm')}>
              {this.getNumbers('minutes').map((item, index) => <option value={item < 10 ? item[1] : item}>{item}</option>)}
            </FormControl>
          </div></div> : null}
      </FormGroup>
    )
  }
}


export default SelectingFormValuesForm