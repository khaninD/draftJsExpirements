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
      isValidDate: true
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
    if (typeof value !== 'number') {
      throw('timestamp олжен быть числом!!!')
    }
    const unixValue = moment.unix(value);
    if (!unixValue.isValid()) {
      throw('Что-то пошло не так, так как не удалось провалидировать timeStamp')
    }
    // проверка на время 12 00
    const isTargetTime = unixValue.hours() === 12 && unixValue.minutes() === 0;
    // логика для постов пришедших ранее чем сейчас
    const onlyShow = unixValue && (moment(unixValue).isBefore(moment()) && !isTargetTime);
    // логика для постов пришедших позже чем 7 дней от текущей даты
    const anotherDate = unixValue && moment(unixValue).isAfter(moment().add(6, 'd'));
    // текст для title
    const beforeMoment = onlyShow ? `: ${unixValue.format('D-MMM-dddd')}` : '';
    // текст для постов пришедших позже 7 дней чем сейчас
    const stateInputValue = anotherDate ? moment.unix(value).format('DD.MM') : '';
    this.setState({
      currentValue: !anotherDate ? value : '',
      anotherDate,
      onlyShow,
      beforeMoment,
      stateInputValue,
      showTime: !!anotherDate || !onlyShow
    })
  }

  handleChange(e) {
    const {onChange, value: propsValue} = this.props;
    const {target: {value}} = e;
    const {currentValue} = this.state;

    // для кейса: переход с ОПУБЛИКОВАТЬ СЕЙЧАС на какую нибудь дату
    if (propsValue === '' && value !== 'Другая дата') {
      // орректируем время: часы и минуты в зависимости от условий момента
      const currentTime = this.correctTime(value);
      const time = moment(value, 'DD-MM-YYYY').hour(currentTime.hour).minute(currentTime.min).unix();
      this.setState({
        currentValue: time,
        showTime: true
      }, () => onChange(time));
      return;
    }

    // переход на ОПУБЛИКОВАТЬ СЕЙЧАС
    if (value === 'Опубликовать сейчас') {
      this.setState({
        currentValue: '',
        showTime: false
      }, () => {
        onChange('');
      });
      return
    }

    // переход с ДАТЫ на ДАТУ
    if (value !== 'Другая дата') {
      const unixTime = moment.unix(propsValue);
      const date = moment(value, 'DD-MM-YYYY');
      const time = this.correctTime(value, true, unixTime);
      console.log(time);
      debugger;
      const result = moment(value, 'DD-MM-YYYY').date(date.date()).hour(time.hour).minute(time.min).unix();
      this.setState({
        currentValue: result,
        showTime: true
      }, () => {
        onChange(result);
      });
      return
    }

    // переход на ДРУГАЯ ДАТА
    if (value === 'Другая дата') {
      this.setState({
        anotherDate: true,
        showTime: !!currentValue
      }, () => {
        this.dateInput.querySelector('input').focus();
      });
    }
  }

  handleBlur(e) {
    const {target: {value}} = e;
    const {onChange} = this.props;
    const {currentValue} = this.state;
    if (!value) {
      this.setState({
        anotherDate: false,
        showTime: !!currentValue
      }, () => {
        onChange(currentValue ? currentValue : '');
      });
      return
    }
    const isValidDate = this.dataValidation(value);
    this.setState({
      isValidDate
    }, () => onChange(isValidDate ? this.getUnixTimeDate(value) : 'Invalid date'))
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
    // @TODO ppc
    const dateFormate = inputMask === '99.99.9999' ? 'DD.MM.YYYY' : 'DD.MM';
    const checkTime =  moment(value, dateFormate, true).isValid();
    this.setState({
      stateInputValue: value,
      showTime: !!showTime || !!month
    }, () => {
      this.dateInput.querySelector('input').focus();
    })
  }

  handleChangeTime(e, type) {
    const {target: {value}} = e;
    const {value: propValue, onChange} = this.props;
    const {anotherDate, currentValue} = this.state;
    const isValidDate = propValue !== 'Invalid date';
    const unixFormat = moment.unix(isValidDate ? propValue : currentValue);
    const time = type === 'h' ? unixFormat.hour(Number(value)) : unixFormat.minute(Number(value));
    this.setState({
      currentValue: Number(time.format('X'))
    }, () => isValidDate ? onChange(Number(time.format('X'))) : 'Invalid date');
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

  dataValidation(value) {
    // если пришло '' то это валидно, используется для поля Опубликовать сейчас
    if (value === '') {
      return true
    }
    // Ветка для unix формата даты
    if (typeof value === 'number') {
      // создем дату и валидируем её
      const isValidUnixDate = moment.unix(value).isValid();
      return isValidUnixDate
    } else if (typeof value === 'string') {
      // ветка для даты полученной через date-input
      const format = value.length < 6 ? 'DD.MM' : 'DD.MM.YYYY';
      // создаем дату и валидируем её
      const isValidDate = moment(value, format, true).isValid();
      console.table({
        format,
        isValidDate
      });
      return isValidDate;
    }
    // так как остальные типы данных являются невалидными
    return false;
  }

  getUnixTimeDate(value) {
    const format = value.length < 6 ? 'DD.MM' : 'DD.MM.YYYY';
    return moment(value, format).unix();
  }

  correctTime(value, checkBeforeTime = false, unixTime) {
    const now = moment();
    const isNowDay = value === now.format('D-MMM-dddd');
    let currentHour;
    let currentMinutes;
    if (checkBeforeTime) {
      // для кейса когда выбираем текущий день, и время указанное в timestamp уже прошло
      currentHour = (isNowDay &&  unixTime.hours() < moment().hours()) ? moment().hours() : unixTime.hour();
      currentMinutes = (isNowDay && unixTime.minutes() < moment().minutes()) ? moment().minutes() : unixTime.minute();
    } else {
      const nextHour = now.hour() + 1;
      // кейс когда время суток 23 часа
      const checkHour = nextHour < 24;
      currentHour = nextHour;
      currentMinutes = now.minutes();
      if (isNowDay) {
        currentHour = checkHour ? nextHour : 23;
        currentMinutes = checkHour ? currentMinutes : 59;
      }
    }
    return {
      hour: currentHour,
      min: currentMinutes
    }
  }

  correctInputValue(value) {

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
      isValidDate
    } = this.state;
    const now = moment();
    const unixValue = moment.unix(value);
    const currentUnixValue = moment.unix(currentValue);
    const valueDate = value && isValidDate ? unixValue.format('D-MMM-dddd') : value === '' ? 'Опубликовать сейчас' : currentUnixValue.format('D-MMM-dddd');
    const valueHour = value && isValidDate ? unixValue.hour() : moment.unix(currentValue).hour();
    const valueMin = value && isValidDate ? unixValue.minute() : moment.unix(currentValue).minute();
    // @TODO здесь должна быть логика учитывающая час при > 23:00
    // @TODO здесь эта логика не нужна, зачем она???
    /*
    if (isValidDate) {
      //@TODO здесь пересмотреть логику возможно now.hour можно вынести в функцию correctTime
      valueHour = value ? unixValue.hour() : now.hour() + 1;
      valueMin = value ? unixValue.minute() : now.minutes();
    } else {
      valueHour = h;
      valueMin = m;
    }
    */
    const timeClass = classnames({
      'time-select': true,
      'hidden': !showTime
    });
    const dateTimeSelectClass = classnames({
      'hidden': anotherDate
    });
    const dateInputClass = classnames({
      'hidden': !anotherDate,
      'time-select_has-error': !isValidDate
    });
    console.table({
      value,
      format: moment.unix(value).format(),
      valueDate,
      valueHour,
      valueMin,
      currentValue,
      currentValueFormat: moment.unix(currentValue).format()
    });
    return (
      <FormGroup>
        <ControlLabel>{`${placeholder}${beforeMoment}`}</ControlLabel>{!onlyShow ? <div>
        <FormControl componentClass="select" className={dateTimeSelectClass} value={valueDate} onChange={(e) => this.handleChange(e)}>
          {this.items.map((item, index) => <option key={index} value={item}>{item}</option>)}
        </FormControl>
        <div className={dateInputClass} ref = {(input) => this.dateInput = input}>
          <FormControl
            value = {stateInputValue}
            onChange={(e) => this.handleInputChange(e)}
            onBlur={(e) => this.handleBlur(e)}
            placeholder="DD.MM"
          />
        </div>
        <div className={timeClass}>
          <FormControl componentClass="select" value={valueHour} onChange={(e) => this.handleChangeTime(e, 'h')}>
            {this.getNumbers('hours').map((item, index) => <option key={index} value={item < 10 ? item[1] : item}>{item}</option>)}
          </FormControl>
          <FormControl componentClass="select" value={valueMin} onChange={(e) => this.handleChangeTime(e, 'm')}>
            {this.getNumbers('minutes').map((item, index) => <option key={index} value={item < 10 ? item[1] : item}>{item}</option>)}
          </FormControl>
        </div></div> : null}
      </FormGroup>
    )
  }
}


export default SelectingFormValuesForm