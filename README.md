
# Weather

[![badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/JaouherK/a489177df4f24946281bdc1b21524b13/raw/2a1aa8de67ca47bf45667a18bd2cdd8bc6ea0e30/weatherMetaData.json)](https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v2.1.0)

`Weather` is a plugin that displays the weather condition as a picture image, the city name and the temperature of a given location. It is connected to multiple providers and needs an API Key to connect.

Possible providers:

- WeatherAPI
- OpenWeather

Optionally, you can choose the frequency of fetching updated data and the temperature unit ( Celsius or Fahrenheit).

# Button settings

The button is configured as follows:

- Title: Please do not set any value in order to display the temperature correctly
- Image: Please do not update picture in order to display the weather icon correctly
- Provider: the weather information provider: WeatherAPI or OpenWeather
- API key: your provider account key available in your account information on the associated provider website
- City Name: the city for which the information will be displayed on the button
- Temperature: the temperature unit ( Celsius or Fahrenheit)
- Fetch frequency: how often the data is updated (beware for free accounts the limits set by the provider)
- "Get my API key" button: to retrieve the key for your account
- "Report bug" button: to report a bug

# Features

- code written in Javascript
- cross-platform (macOS, Windows)
- Choice of Weather provider
- Choose temperature unit
- choose fetching frequency of the weather data

![screen](screenshot.png)

# Installation

In the Release folder, you can find the file `com.jk.weather.streamDeckPlugin`. If you double-click this file on your machine, Stream Deck will install the plugin.

# Source code

The `Sources` folder contains the source code of the plugin.

Application main icon made by [Smashicons](https://www.flaticon.com/authors/smashicons) from [www.flaticon.com](https://www.flaticon.com/)
