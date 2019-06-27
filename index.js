const axios = require('axios')
const moment = require('moment-timezone')
const i18n = require('i18n')
const path = require('path')
const fs = require('fs')

var Weather = function(params = {}) {
  this.data = []

  this.cacheSize = 5
  this.currentIndex = 0

  this.api = null
  this.mode = null
  this.unit = null
  this.position = null
  this.lang = null
  this.i18n = {}

  i18n.configure({
    locales: [Weather.LANG.EN, Weather.LANG.FR],
    register: this.i18n,
    defaultLocale: Weather.LANG.FR,
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    api: {
      '__': 'translate',
      '__n': 'plural',
      '__l': 'list',
      '__mf': 'messageFormat',
      '__h': 'hash'
    }
  });
  this.i18n.synonym = this.i18n.plural

  this.setAPI({
    key: null,
    host: "https://api.openweathermap.org",
    version: '2.5'
  })
  this.setMode(Weather.MODE.ACTUAL)
  this.setUnit(Weather.UNIT.MODE.METRIC)
  this.setTemperatureUnit(Weather.UNIT.TEMPERATURE.CELSIUS)
  this.setSpeedUnit(Weather.UNIT.SPEED.KMETER_HOUR)
  this.setPosition({
    city: "Paris",
    countryCode: 'fr'
  })
  this.setLang(Weather.LANG.FR)

  if(params.apiKey){
    this.setAPI(params.apiKey)
  }
  if(params.mode){
    this.setMode(params.mode)
  }
  if(params.unit && params.unit.mode){
    this.setUnit(params.unit.mode)
  }
  if(params.unit && params.unit.temperature){
    this.setTemperatureUnit(params.unit.temperature)
  }
  if(params.unit && params.unit.speed){
    this.setSpeedUnit(params.unit.speed)
  }
  if(params.position){
    this.setPosition(params.position)
  }
  if(params.lang){
    this.setLang(params.lang)
  }
}

Weather.prototype.setAPI = function(params){
  if(!Weather.isObject(params)){
    params = {
      key: params
    }
  }
  if(!this.api){
    this.api = {}
  }
  if(params.key){
    this.api.key = params.key
  }
  if(params.host){
    this.api.host = params.host
  }
  if(params.version){
    this.api.version = params.version
  }
  return this
}

Weather.prototype.setMode = function(params = {}){
  if(!Weather.isObject(params)){
    params = {
      type: params
    }
  }
  if(!this.mode){
    this.mode = {}
  }
  if(typeof params.date === 'undefined'){
    params.date = null
  }
  if(typeof params.allDay === 'undefined'){
    params.allDay = true
  }
  if(typeof params.tz === 'undefined'){
    params.tz = "+00:00"
  }

  if(Object.keys(Weather.MODE).findIndex(m => Weather.MODE[m] === params.type) !== -1){
    this.mode = {
      type: params.type
    }
    if(params.type === Weather.MODE.FORECAST){
      let _date = null
      if(params.date === null){
        _date = moment().add(1, 'days').hours(12).minutes(0).seconds(0).milliseconds(0)
      } else {
        _date = moment(params.date)
        if(params.allDay){
          _date.hours(12)
        } else {
          _date.utcOffset(params.tz)
        }
        _date.minutes(0).seconds(0).milliseconds(0)
      }

      _date = _date.toDate()

      this.mode.date = _date,
      this.mode.allDay = params.allDay,
      this.mode.tz = params.tz
    }
  }
  return this
}

Weather.prototype.setUnit = function(unit = ""){
  if(!this.unit){
    this.unit = {}
  }
  if(Object.keys(Weather.UNIT.MODE).findIndex(u => Weather.UNIT.MODE[u] === unit) !== -1){
    this.unit.node = unit
  }
  return this
}

Weather.prototype.setTemperatureUnit = function(unit = ""){
  if(!this.unit){
    this.unit = {}
  }
  if(Object.keys(Weather.UNIT.TEMPERATURE).findIndex(u => Weather.UNIT.TEMPERATURE[u] === unit) !== -1){
    this.unit.temperature = unit
  }
  return this
}

Weather.prototype.setSpeedUnit = function(unit = ""){
  if(!this.unit){
    this.unit = {}
  }
  if(Object.keys(Weather.UNIT.SPEED).findIndex(u => Weather.UNIT.SPEED[u] === unit) !== -1){
    this.unit.speed = unit
  }
  return this
}

Weather.prototype.setPosition = function(params){
  if(params.cityID){
    this.position = {
      cityID: params.cityID
    }
  } else if(params.city && (params.country || params.countryCode)){
    this.position = {
      city: params.city,
      country: params.country,
      countryCode: params.countryCode
    }
  } else if (params.lat && param.lon) {
    this.position = {
      lat: params.lat,
      lon: params.lon
    }
  } else if(params.zip && params.countryCode){
    this.position = {
      zip: params.zip,
      countryCode: params.countryCode
    }
  }
  return this
}

Weather.prototype.setLang = function(lang = ''){
  if(Object.keys(Weather.LANG).findIndex(l => Weather.LANG[l] === lang) !== -1){
    this.i18n.setLocale(lang)
    this.lang = lang
  }
  return this
}

Weather.prototype.getQueryPosition = function(){
  let res = {}
  if(this.position.cityID){
    res.id = this.position.cityID
  } else if(this.position.city && (this.position.country || this.position.countryCode)){
    res.q = this.position.city
    if(this.position.countryCode){
      res.q = `${res.q},${this.position.countryCode}`
    } else {
      res.q = `${res.q},${this.position.country}`
    }
  } else if(this.position.lat && this.position.lon){
    res.lat = this.position.lat
    res.lon = this.position.lat
  } else if(this.position.zip && this.position.countryCode){
    res.zip = `${this.position.zip},${this.position.countryCode}`
  }
  return res
}

Weather.prototype.getRequest = function(){
  if(!this.api.key){
    return null
  }
  return {
    url: `${this.api.host}/data/${this.api.version}/${this.mode.type}`,
    options: {
      params: Object.assign(
        {
          appid: this.api.key,
          units: Weather.UNIT.MODE.METRIC
        },
        this.getQueryPosition()
      )
    }
  }
}

Weather.prototype.allocIndex = function(){
  let i = 0
  if(this.currentIndex < this.cacheSize){
    this.currentIndex = this.currentIndex
  } else {
    this.currentIndex = 0
  }
  i = this.currentIndex
  this.data[i] = {}
  return i
}

Weather.prototype.fetchRawData = function(){
  return new Promise( (resolve, reject) => {
    var _request = this.getRequest()
    if(_request === null){
      reject(new Error("The API Key from openweathermap.org must be set. weather.setAPI(apiKey)"))
      return
    }
    axios.get(_request.url, _request.options)
    .then( resp => {
      try{
        resp.data = JSON.parse(resp.data)
      } catch(e){}
      if(resp.status !== 0 || !Weather.isObject(resp.data)){
        var index = this.allocIndex()
        this.data[index].raw = resp.data
        this.data[index].date = Date.now()
        this.data[index].mode = Object.assign({}, this.mode)
        this.data[index].unit = Object.assign({}, this.unit)
        this.data[index].api = Object.assign({}, this.api)
        resolve(index)
      } else {
        throw new Error(`Unexpected response from ${_request.url}`)
      }
    })
    .catch( err => {
      reject(err)
    })
  })
}

Weather.prototype.retrieveWeatherFromRawData = function(index = null){
  return new Promise( (resolve, reject) => {
    if(index === null){
      index = this.currentIndex
    }

    if(this.data[index].api.version === "2.5"){
      if(this.data[index].mode.type === Weather.MODE.FORECAST && this.data[index].raw.list && this.data[index].raw.list.length > 0){
        var pdh = this.data[index].mode.date.getHours();
        pdh = pdh-(pdh%3)

        var pdt = moment(this.data[index].mode.date).hour(pdh).startOf('hour').unix();

        var hdataIndex = this.data[index].raw.list.findIndex(d => d.dt === pdt);
        if(hdataIndex === -1){
          hdataIndex = 0
        }

        this.data[index].weather = {
          forecast: true,
          day: this.data[index].mode.allDay === true,
          date: new Date(this.data[index].raw.list[hdataIndex].dt*1000),
          temperature: this.data[index].raw.list[hdataIndex].main.temp,
          temperature_unit: this.data[index].unit.temperature,
          humidity: this.data[index].raw.list[hdataIndex].main.humidity,
          humidity_unit: 'percent',
          wind_speed: this.data[index].raw.list[hdataIndex].wind.speed,
          wind_speed_unit: this.data[index].unit.speed,
          city: this.data[index].raw.city.name
        }

        this.data[index].weather.condition = Weather.transformOpenWeatherCodeToInternalCode(this.data[index].raw.list[hdataIndex].weather[0].id, this.data[index].raw.list[hdataIndex].weather[0].icon);
      } else {
        this.data[index].weather = {
          forecast: false,
          day: false,
          date: new Date(this.data[index].raw.dt*1000),
          sunrise: new Date(this.data[index].raw.sys.sunrise*1000),
          sunset: new Date(this.data[index].raw.sys.sunset*1000),
          temperature: this.data[index].raw.main.temp,
          temperature_unit: this.data[index].unit.temperature,
          humidity: this.data[index].raw.main.humidity,
          humidity_unit: 'percent',
          wind_speed: this.data[index].raw.wind.speed,
          wind_speed_unit: this.data[index].unit.speed,
          city: this.data[index].raw.name
        };

        var _wind_speed = this.data[index].weather.wind_speed
        var _temperature = this.data[index].weather.temperature

        switch(this.data[index].unit.mode){
          case Weather.UNIT.MODE.METRIC: // celsius && meter/sec
            if(this.data[index].unit.temperature===Weather.UNIT.TEMPERATURE.FAHRENHEIT){
              _temperature = Weather.conversion.temperature.celsiusToFahrenheit(_temperature)
            }
            if(this.data[index].unit.speed===Weather.UNIT.SPEED.MILES_HOUR){
              _wind_speed =  Weather.conversion.speed.meterSecondToMilesHour(_wind_speed)
            } else if(this.data[index].unit.speed===Weather.UNIT.SPEED.KMETER_HOUR){
              _wind_speed =  Weather.conversion.speed.meterSecondToKilometerHour(_wind_speed)
            }
            break
          case Weather.UNIT.MODE.IMPERIAL: // fahrenheit && miles/hour
            if(this.data[index].unit.temperature===Weather.UNIT.TEMPERATURE.CELSIUS){
              _temperature = Weather.conversion.temperature.FahrenheitToCelsius(_temperature)
            }

            if(this.data[index].unit.speed===Weather.UNIT.SPEED.METER_SECOND){
              _wind_speed =  Weather.conversion.speed.milesHourToMeterSecond(_wind_speed)
            } else if(this.data[index].unit.speed===Weather.UNIT.SPEED.KMETER_HOUR){
              _wind_speed =  Weather.conversion.speed.milesHourToMeterSecond(_wind_speed)
              _wind_speed =  Weather.conversion.speed.meterSecondToKilometerHour(_wind_speed)
            }
            break
        }

        this.data[index].weather.temperature = Number(_temperature.toFixed(2))
        this.data[index].weather.wind_speed = Number(_wind_speed.toFixed(2))
        this.data[index].weather.condition = Weather.transformOpenWeatherCodeToInternalCode(this.data[index].raw.weather[0].id, this.data[index].raw.weather[0].icon);
      }
      resolve()
    } else {
      reject(new Error(`Missing parser fot api version ${this.data[index].api.version}`))
    }
  })
}

Weather.prototype.retrieveTextAndIconFromWeather = function(index = null){
  if(index === null){
    index = this.currentIndex
  }
  this.data[index].icon = this.weatherConditionToIcon(this.data[index].weather.condition)
  this.data[index].text = this.weatherConditionToText(this.data[index].weather.condition)
  const _place = `${this.i18n.translate('at')} ${this.data[index].weather.city}`
  const _temperature = `${this.data[index].weather.temperature} ${this.data[index].weather.temperature_unit==='celsius'?'°C':'°F'}`
  let _prefix = ""
  let _text = ""
  if(this.data[index].mode.type===Weather.MODE.WEATHER){
    _prefix = `${this.i18n.translate('temperature.is')}`
    _text = this.data[index].text.normal
  } else {
    let daydiff = this.data[index].weather.date.getDate() - (new Date()).getDate()
    let day
    if(daydiff === 0){
      day = 10
    } else if(daydiff ===  1){
      day = 11
    } else {
      day = this.data[index].weather.date.getDay()
    }
    _prefix = this.i18n.synonym('days', day)
    if(this.data[index].weather.day === false){
      _prefix = `${_prefix} ${this.i18n.translate('at').toLowerCase()} ${moment(this.data[index].weather.date).utcOffset(this.data[index].mode.tz).get('hours')}${this.i18n.translate('hour')}00`
    }
    _prefix = `${_prefix}, ${this.i18n.translate('temperature.will')}`
    _text = this.data[index].text.simple
  }
  this.data[index].text.advanced = `${_place} : ${_prefix} ${_temperature}, ${_text}`
}

Weather.prototype.weatherConditionToIcon = function(condition){
  let icon = condition
  if(icon === 'thunderstorm'){
    icon = 'stormy'
  }
  return {
    path: path.join(__dirname, 'icons', `${icon}.png`),
    name: icon
  }
}

Weather.prototype.weatherConditionToText = function(condition){
  var text = ''
  var text_simple = ''
  var prefix = ""
  var indexCondition = 0
  const _indexCondition = parseInt(this.i18n.translate(`weathers.${condition}.length`), 10)
  if(!isNaN(_indexCondition)){
    indexCondition = _indexCondition-1
  }
  indexCondition = Weather.randomInt(0, indexCondition)

  var prefix_key = this.i18n.synonym(`weathers.${condition}.prefix_keys`, indexCondition)
  var prefix = this.weatherGetRandomPrefixByKey(prefix_key)

  text = this.i18n.synonym(`weathers.${condition}.weather`, indexCondition)
  return {
    normal: `${prefix} ${text}`.trim(),
    simple: text
  }
}

Weather.prototype.weatherGetRandomPrefixByKey = function(key){
  var indexPrefix = 0
  const _indexPrefix = parseInt(this.i18n.translate(`prefixs.${key}.length`), 10)
  if(!isNaN(_indexPrefix)){
    indexPrefix = _indexPrefix-1
  }
  indexPrefix = Weather.randomInt(0, indexPrefix)
  return this.i18n.synonym(`prefixs.${key}.prefix`, indexPrefix)
}

Weather.prototype.get = function(){
  return new Promise( (resolve, reject) => {
    let _index = null
    this.fetchRawData()
    .then( index => {
      if(index !== null){
        _index = index
        return this.retrieveWeatherFromRawData()
      } else {
        throw new Error('Cannot fetch weather')
      }
    })
    .then( () => {
      this.retrieveTextAndIconFromWeather(_index)
      resolve({
        weather: this.data[_index].weather,
        text: this.data[_index].text,
        icon: this.data[_index].icon
      })
    })
    .catch(reject)
  })
}

Weather.isObject = function(obj){
  if(obj === null) {
    return false
  }
  return ((typeof obj === 'function') || (typeof obj === 'object'))
}

Weather.randomInt = function(min = 0, max = 1){
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min +1)) + min;
}

Weather.transformOpenWeatherCodeToInternalCode = function(x, icon) {
    var day = icon.endsWith("d");
    if(x >= 200 && x < 300) return "thunderstorm";
    else if(x == 800 && day) return "sunny";
    else if(x == 800) return "night";
    else if(x == 801 && day) return "cloudy_day";
    else if(x == 801) return "cloudy_night";
    else if(x >= 802 && x < 900) return "cloudy";
    else if(x >= 700 & x < 800) return "fog";
    else if(x >= 300 & x < 400) return "rain";
    else if(x == 511) return "meltedsnow";

    if(x >= 500 && x < 600) { // rain
      if([520, 521, 522, 531].indexOf(x) != -1) return "showerrain";
      if(day) return "rain_day";
      return "rain_night";
    }

    if(x >= 600 && x < 700) { // snow
      if([611, 612, 615, 616].indexOf(x) != -1) return "meltedsnow";
      if([602, 621, 622].indexOf(x) != -1) return "snow";
      if(day) return "snow_day";
      return "snow_night";
    }
}

Weather.conversion = {
  temperature: {
    celsiusToFahrenheit: function(temp){
      return temp * 9 / 5 + 32
    },
    FahrenheitToCelsius: function(temp){
      return (temp - 32) * 5 / 9
    }
  },
  speed: {
    milesHourToMeterSecond: function(speed){
      return speed*0.44704
    },
    meterSecondToMilesHour: function(speed){
      return speed/0.44704
    },
    meterSecondToKilometerHour: function(speed){
      return speed*3.6
    },
    kilometerHourToMeterSecond: function(speed){
      return speed/3.6
    }
  }
}

Weather.MODE = {
  ACTUAL: 'weather',
  WEATHER: 'weather',
  FORECAST: 'forecast',
  PREVISION: 'forecast'
}

Weather.UNIT = {
  MODE: {
    METRIC: 'metric',
    IMPERIAL: 'imperial'
  },
  TEMPERATURE: {
    C: 'celsius',
    CELSIUS: 'celsius',
    METRIC: 'celsius',
    F: 'fahrenheit',
    FAHRENHEIT: 'fahrenheit',
    IMPERIAL: 'fahrenheit'
  },
  SPEED: {
    METRIC: 'meter/sec',
    METER_SECOND: 'meter/sec',
    IMPERIAL: 'miles/hour',
    MILES_HOUR: 'miles/hour',
    KMETER_HOUR: 'kilometer/hour'
  }
}

Weather.LANG = {
  EN: 'en-US',
  FR: 'fr-FR',
  US: 'en-US'
}

module.exports = Weather
