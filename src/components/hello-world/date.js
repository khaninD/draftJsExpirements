import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import moment from 'moment';
import classnames from 'classnames';
// конфиг компонента
const config = {
  text: {
    publishNow: 'Опубликовать сейчас',
    otherDate: 'Другая дата'
  },
  format: {
    visibleValue: 'D-MMM-dddd'
  },
  initialTime: {
    hour: 12,
    min: 0
  },
  time: {
    countNextDates: 7,
    countNextHour: 1
  },
  dateInputPlaceholder: 'DD.MM'
};

class SelectingFormValuesForm extends Component {
  constructor() {
    super();
    moment.locale('ru');
    const {text: {publishNow, otherDate}, format: {visibleValue}, time: {countNextDates}} = config;
    this.items = [publishNow, ...getNextDates(), otherDate];
    this.state = {
      otherDate: false,
      isValidDate: true,
      stateInputValue: '',
    };
    function getNextDates() {
      const result = [];
      for (let i = 0; i < countNextDates; i++) {
        result.push(moment().add(i, 'd').format(visibleValue));
      }
      return result;
    }
  }

  componentDidMount() {
    const {value} = this.props;
    this.initialValue = value;
    const {format: {visibleValue}, time: {countNextDates, countNextHour}, initialTime: {hour, min}} = config;
    if (typeof value !== 'number') {
      throw('timeStamp должен быть числом!!!')
    }
    const unixValue = moment.unix(value);
    if (!unixValue.isValid()) {
      throw('что-то пошло не так, так как не удалось провалидировать timeStamp')
    }
    // проверка на время initial time, dafault: 12 00
    const isTargetTime = unixValue.hours() === hour && unixValue.minutes() === min;
    // логика для постов пришедших ранее чем сейчас
    const onlyShow = unixValue && (moment(unixValue).isBefore(moment()) && !isTargetTime);
    // логика для постов пришедших позже чем n дней от текущей даты
    const otherDate = unixValue && moment(unixValue).isAfter(moment().add(countNextDates - 1, 'd'));
    // текст для title
    const beforeMoment = onlyShow ? `: ${unixValue.format(visibleValue)}` : '';
    // текст для постов пришедших позже n дней чем сейчас
    const stateInputValue = otherDate ? moment.unix(value).format('DD.MM') : '';
    this.setState({
      currentValue: !otherDate ? value : moment().add(countNextHour, 'h').unix(),
      otherDate,
      onlyShow,
      beforeMoment,
      stateInputValue,
      showTime: Boolean(otherDate) || !onlyShow
    })
  }

  /**
   * Обработчик события onChange, элемента select
   */
  handleChange = ({target: {value}}) => {
    const {onChange, value: propsValue} = this.props;
    const {currentValue} = this.state;
    const {text: {publishNow, otherDate}} = config;
    // для кейса: переход с ОПУБЛИКОВАТЬ СЕЙЧАС на какую нибудь дату
    if (propsValue === '' && value !== otherDate) {
      // орректируем время: часы и минуты в зависимости от условий момента
      const currentTime = this._correctTime(value);
      const time = moment(value, 'DD-MM-YYYY').hour(currentTime.hour).minute(currentTime.min).unix();
      this.setState({
        currentValue: time,
        showTime: true
      }, () => onChange(time));
      return;
    }

    // переход на ОПУБЛИКОВАТЬ СЕЙЧАС
    if (value === publishNow) {
      this.setState({
        currentValue: '',
        showTime: false
      }, () => {
        onChange('');
      });
      return
    }

    // переход с ДАТЫ на ДАТУ
    if (value !== otherDate) {
      const unixTime = moment.unix(propsValue);
      const date = moment(value, 'DD-MM-YYYY');
      const time = this._correctTime(value, true, unixTime);
      const result = moment(value, 'DD-MM-YYYY').date(date.date()).hour(time.hour).minute(time.min).unix();
      this.setState({
        currentValue: result,
        showTime: true
      }, () => {
        onChange(result);
      });
    } else {
      // переход на ДРУГАЯ ДАТА
      this.setState({
        otherDate: true,
        showTime: Boolean(currentValue),
        currentValue: currentValue ? currentValue : moment().unix(),
        isValidDate: true
      }, () => {
        onChange('');
        this.dateInput.querySelector('input').focus();
      });
    }
  };

  /**
   * Обработчик события onBlur, элемента input
   */
  handleBlur = ({target: {value}}) => {
    const {onChange} = this.props;
    const {currentValue} = this.state;
    // при пустом input
    if (!value) {
      this.setState({
        otherDate: false,
        showTime: Boolean(currentValue)
      }, () => {
        onChange(currentValue ? currentValue : '');
      });
      return
    }
    const isValidDate = this.dataValidation(value);
    let result;
    this.save = value;
    if (isValidDate) {
      // здесь берем время: часы и минуты из currentValue
      const unixCurrentTime = moment.unix(currentValue);
      const hour = unixCurrentTime.hour();
      const min = unixCurrentTime.minutes();
      result = moment.unix(this._getUnixTimeDate(value)).hour(hour).minutes(min).unix()
    } else {
      result = 'Invalid date';
    }
    this.setState({
      isValidDate,
      isDateInputChange: false
    }, () => onChange(result))
  };

  /**
   * Обработчик события onChange, элемента input
   */
  handleInputChange = ({target: {value}}) => {
    const {onChange} = this.props;
    const {showTime} = this.state;
    const now = moment();
    let month = false;
    const isValidValue = moment(value, 'DD.MM', true).isValid();
    // получаем месяц
    if (isValidValue) {
      month = Number(value.slice(3, 5));
      if (value.length <= 5) {
        const isNowMonth = month === now.month() + 1;
        value += isNowMonth ? '' : `.${now.year() + 1}`;
      } else {
        if (value.length === 5) {
          value += `.${now.year() + 1}`;
        }
      }
    }
    this.setState({
      stateInputValue: value,
      showTime: showTime || Boolean(month),
      isDateInputChange: true
    }, () => {
      onChange(value);
      this.dateInput.querySelector('input').focus();
    })
  };

  /**
   * Обработчик события onChange, элемента select, это общий обрабочтик для времени: часы, минуты
   * @param {string} type - тип select, часы или минуты
   */
  handleChangeTime = type => ({target: {value}}) => {
    const {value: propValue, onChange} = this.props;
    const {currentValue} = this.state;
    const isValidDate = propValue !== 'Invalid date';
    const unixFormatCurrentValue = moment.unix(currentValue);
    const currentValueTime = type === 'h' ? unixFormatCurrentValue.hour(Number(value)) : unixFormatCurrentValue.minute(Number(value));
    let time;
    if (isValidDate) {
      const unixFormat = moment.unix(propValue);
      time = type === 'h' ? unixFormat.hour(Number(value)).unix() : unixFormat.minute(Number(value)).unix();
    } else {
      time = 'Invalid date'
    }
    this.setState({
      currentValue: currentValueTime.unix()
    }, () => onChange(time));
  };

  /**
   * Этот метод генерирует значения элемента option для select часа и времени
   * @param type - параметр относительно которого происходит выборка чисел времени
   * @returns {Array} - массив времени: часы или минуты, взависимости от переданного параметра type
   */
  getNumbers(type) {
    const {value} = this.props;
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
    for (let i = startCount; i < maxCount; i++) {
      const num = i < 10 ? `0${i}` : i;
      result.push(num)
    }
    return result;
  }

  /**
   * Метод для валидации даты
   * @param {string || number} value - значение времени для валидации
   * @returns {boolean}
   */
  dataValidation(value) {
    // если пришло '' то это валидно, используется для поля Опубликовать сейчас
    if (value === '') {
      return true
    }
    // Ветка для unix формата даты
    if (typeof value === 'number') {
      // создем дату и валидируем её
      return moment.unix(value).isValid();
    } else if (typeof value === 'string') {
      // ветка для даты полученной через date-input
      const format = value.length < 6 ? 'DD.MM' : 'DD.MM.YYYY';
      // создаем дату и валидируем её
      return moment(value, format, true).isValid();
    }
    // так как остальные типы данных являются невалидными
    return false;
  }

  /**
   * Метод генерирования даты в unix формате
   * @param {string} value - значение даты
   * @returns {number} - дата в unix формате
   * @private
   */
  _getUnixTimeDate(value) {
    const format = value.length < 6 ? 'DD.MM' : 'DD.MM.YYYY';
    return moment(value, format).unix();
  }

  /**
   * Метод для корректировки времени, учитывает переданное значение, чтобы правильно вернуть значение часов и минут
   * @param {string} value - дата
   * @param {boolean} checkBeforeTime - флажок для того, чтобы учесть прошедшее время
   * @param {number} unixTime - дата в формате unix
   * @returns {{hour: *, min: *}}
   * @private
   */
  _correctTime(value, checkBeforeTime = false, unixTime = 0) {
    const {format: {visibleValue}, time:{countNextHour}} = config;
    const now = moment();
    const isNowDay = value === now.format(visibleValue);
    let currentHour;
    let currentMinutes;
    if (checkBeforeTime) {
      // для кейса когда выбираем текущий день, и время указанное в timestamp уже прошло
      currentHour = (isNowDay &&  unixTime && unixTime.hours() < moment().hours()) ? moment().hours() : unixTime.hour();
      currentMinutes = (isNowDay && unixTime && unixTime.minutes() < moment().minutes()) ? moment().minutes() : unixTime.minute();
    } else {
      const nextHour = now.hour() + countNextHour;
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

  normalize = value => {
    console.log(value);
   if (value === 'Invalid date' || typeof value === 'number') {
     return this.save;
   }
    const now = moment();
    let month = false;
    const isValidValue = moment(value, 'DD.MM', true).isValid();
    // получаем месяц
    if (isValidValue) {
      month = Number(value.slice(3, 5));
      if (value.length <= 5) {
        const isNowMonth = month === now.month() + 1;
        value += isNowMonth ? '' : `.${now.year() + 1}`;
      } else {
        if (value.length === 5) {
          value += `.${now.year() + 1}`;
        }
      }
    }
    return value
  };

  getInitial = () => {
    const {onChange} = this.props;
    onChange(this.initialValue);
  };

  render() {
    const {value, placeholder, disabled} = this.props;
    const {
      otherDate,
      stateInputValue,
      currentValue,
      beforeMoment,
      onlyShow,
      showTime,
      isValidDate,
      isDateInputChange
    } = this.state;
    const {text: {publishNow}, format: {visibleValue}, dateInputPlaceholder} = config;
    const unixValue = moment.unix(value);
    const currentUnixValue = moment.unix(currentValue);
    const day = value && isValidDate ? unixValue.format(visibleValue) : value === '' ? publishNow : currentUnixValue.format(visibleValue);
    const hour = value && isValidDate && !isDateInputChange ? unixValue.hour() : moment.unix(currentValue).hour();
    const min = value && isValidDate && !isDateInputChange ? unixValue.minute() : moment.unix(currentValue).minute();
    const check = this.initialValue === value;
    const timeClass = classnames({
      'date-time-select__time-select': true,
      'hidden': check ? false : !showTime
    });
    const dateTimeSelectClass = classnames({
      'hidden': otherDate
    });
    const dateInputClass = classnames({
      'hidden': !otherDate,
      'time-select_has-error': !isValidDate,
      'date-time-select__input-date': true
    });
    const dateTimeSelectContainerClass = classnames({
      'hidden': onlyShow,
      'date-time-select': true
    });
    const selectTimeClass = classnames(['date-time-select__time']);
    console.table({
      value,
      valueFormat: moment.unix(value).format(),
      currentValue,
      format: moment.unix(currentValue).format('DD.MM.YYYY-hh:mm'),
      isDateInputChange
    });
    return (
      <FormGroup>
        <ControlLabel>
          {`${placeholder}${beforeMoment}`}
        </ControlLabel>
        <div className={dateTimeSelectContainerClass}>
          <FormControl componentClass="select"
                       className={dateTimeSelectClass}
                       value={day} onChange={this.handleChange}
                       disabled={disabled}
          >
            {this.items.map((item, index) => <option key={index} value={item}>{item}</option>)}
          </FormControl>
          <div className={dateInputClass} ref = {input => this.dateInput = input}>
            <FormControl
              disabled={disabled}
              value={this.normalize(value)}
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              placeholder={dateInputPlaceholder}
            />
          </div>
          <div className={timeClass}>
            <FormControl
              className={selectTimeClass}
              componentClass="select"
              value={hour}
              onChange={this.handleChangeTime('h')}
              disabled={disabled}
            >
              {this.getNumbers('hours').map((item, index) => <option key={index} value={item < 10 ? item[1] : item}>{item}</option>)}
            </FormControl>
            <FormControl className={selectTimeClass}
                         componentClass="select"
                         value={min}
                         onChange={this.handleChangeTime('m')}
                         disabled={disabled}
            >
              {this.getNumbers('minutes').map((item, index) => <option key={index} value={item < 10 ? item[1] : item}>{item}</option>)}
            </FormControl>
          </div>
        </div>
        <button onClick={this.getInitial}>Reset</button>
      </FormGroup>
    )
  }
}

export default SelectingFormValuesForm;
