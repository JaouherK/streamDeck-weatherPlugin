# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2020-05-23

### Added

- New input to choose where to display the city name or hide it
- Fixed default values after plugin update by @jahands

### Changed

- make the weather icon smaller

## [2.1.0] - 2020-05-19

### Added

- New provider Open Map API for weather data
- Add weather Icon + city name in same canvas and render from it
- Display city name
- Generic link to "Get API Key" dependant on the selected provider
- Added badge of version

### Changed

- Align software and hardware display
- Fix small bugs

## [2.0.2] - 2020-04-25

### Changed

- New function to set default value for dropdown
- Cleaned javascript code

## [2.0.1] - 2020-04-20

### Added

- Catch failure in response from weatherAPI to display error alert
- Show the city name in the software title
- Initial gitignore and Changelog files

### Changed

- Updated manifest file (tooltip, author full name, author website, description, version bump)
- Force the city name to be transformed to lowercase
- Added a link in plugin to submit a bug report
- Screenshot for readme updated

### Removed

- hidden .idea folder has been deleted

## [2.0.0] - 2020-04-18

### Added

- Possible selection of temperature units (celsius or fahrenheit)
- Set frequency of fetching of data (on push, 10 minutes, 30 minutes, 1 hour)

### Changed

- Select provider drop down list
- Rework the whole script for fetching data while implementing setInterval to get relevant data

## [1.0.0] - 2020-04-16

### Added

- Initial structure of plugin
- link to weatherAPI to fetch data
- Inputs provided are API key and City

[1.0.0]: https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v0.5
[2.0.0]: https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v1.0
[2.0.1]: https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v2.0.1
[2.0.2]: https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v2.0.2
[2.1.0]: https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v2.1.0
[2.1.1]: https://github.com/JaouherK/streamDeck-weatherPlugin/releases/tag/v2.1.1
