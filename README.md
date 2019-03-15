[![License](https://img.shields.io/badge/license-WTFPL-blue.svg)](http://www.wtfpl.net/)
![GitHub issues](https://img.shields.io/github/issues-raw/thethingbox/ttb-weather.svg)
![GitHub package.json version](https://img.shields.io/github/package-json/v/thethingbox/ttb-weather.svg)

# ttb-weather

A node module to retreive weather from the openweathermap.org APIs for TheThingBox.

# Usages

## Actual weather

#### sample
```
const Weather = require('ttb-weather')
const weather = new Weather()

const apiKey = ""

weather
  .setAPI({ key: apiKey})
  .setPosition({city:"Argentan", countryCode: 'fr'})
  .setTemperatureUnit(Weather.UNIT.TEMPERATURE.CELSIUS)
  .setSpeedUnit(Weather.UNIT.SPEED.KMETER_HOUR)
  .setMode(Weather.MODE.WEATHER)
  .setLang(Weather.LANG.FR)
  .get().then( data => {
      console.log(JSON.stringify(data, null, 4))
  })
```

#### output

``` json
{
    "weather": {
        "forecast": false,
        "day": false,
        "date": "2019-03-15T15:30:17.000Z",
        "sunrise": "2019-03-15T06:14:23.000Z",
        "sunset": "2019-03-15T18:03:57.000Z",
        "temperature": 10.8,
        "temperature_unit": "celsius",
        "humidity": 93,
        "humidity_unit": "percent",
        "wind_speed": 10.8,
        "wind_speed_unit": "kilometer/hour",
        "city": "Argentan",
        "condition": "cloudy"
    },
    "text": {
        "normal": "il fait fortement nuageux",
        "simple": "fortement nuageux"
    },
    "icon": {
        "path": "/root/userdir/node_modules/ttb-weather/icons/cloudy.png",
        "name": "cloudy"
    }
}
```

## Forecast
```
const Weather = require('ttb-weather')
const weather = new Weather()

let date = new Date()
date.setDate(date.getDate()+3)
date.setHours(10)

const apiKey = ""

weather
  .setAPI({ key: apiKey})
  .setPosition({city:"Argentan", countryCode: 'fr'})
  .setTemperatureUnit(Weather.UNIT.TEMPERATURE.CELSIUS)
  .setSpeedUnit(Weather.UNIT.SPEED.KMETER_HOUR)
  .setMode({ type: Weather.MODE.FORECAST, date: date, allDay: false, tz: "+01:00"})
  .setLang(Weather.LANG.EN)
  .get().then( data => {
      console.log(JSON.stringify(data, null, 4))
  })
```

#### output

``` json
{
    "weather": {
        "forecast": true,
        "day": false,
        "date": "2019-03-18T09:00:00.000Z",
        "temperature": 7.02,
        "temperature_unit": "celsius",
        "humidity": 95,
        "humidity_unit": "percent",
        "wind_speed": 4.37,
        "wind_speed_unit": "kilometer/hour",
        "city": "Argentan",
        "condition": "rain_day"
    },
    "text": {
        "normal": "there is rain",
        "simple": "rain"
    },
    "icon": {
        "path": "/root/userdir/node_modules/ttb-weather/icons/rain_day.png",
        "name": "rain_day"
    }
}

```
