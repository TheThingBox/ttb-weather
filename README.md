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
  .setUnit(Weather.UNIT.CELSIUS)
  .setMode(Weather.MODE.WEATHER)
  .setLang(Weather.LANG.FR)
  .get()
  .then( data => {
    console.log(data)
  })
```

#### output

``` json
{
  "weather": {
    "forecast": false,
    "day": false,
    "date": "2019-03-15T10:30:17.000Z",
    "sunrise": "2019-03-15T06:14:23.000Z",
    "sunset": "2019-03-15T18:03:57.000Z",
    "temperature": 11.56,
    "humidity": 87,
    "wind_speed": 42.48,
    "condition": "cloudy"
  },
  "text": {
    "normal": "il fait fortement nuageux",
    "simple": "fortement nuageux"
  },
  "icon": {
    "path": "/root/userdir/node_modules/ttb-node-meteo-2/nodes/lib/icons/cloudy.png",
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
  .setUnit(Weather.UNIT.CELSIUS)
  .setMode({ type: Weather.MODE.FORECAST, date: date, allDay: false, tz: "+01:00"})
  .setLang(Weather.LANG.EN)
  .get()
  .then( data => {
    console.log(data)
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
    "humidity": 95,
    "wind_speed": 15.73,
    "condition": "rain_day"
  },
  "text": {
    "normal": "there are light rain showers",
    "simple": "light rain showers"
  },
  "icon": {
    "path": "/root/userdir/node_modules/ttb-node-meteo-2/nodes/lib/icons/rain_day.png",
    "name": "rain_day"
  }
}
```
