let websocket = null,
  pluginUUID = null,
  apiKey = "",
  provider = "";

function connectElgatoStreamDeckSocket(
  inPort,
  inPluginUUID,
  inRegisterEvent,
  inInfo
) {
  pluginUUID = inPluginUUID;

  // Open the web socket
  websocket = new WebSocket("ws://localhost:" + inPort);

  websocket.onopen = function () {
    // WebSocket is connected, register the plugin
    const json = {
      event: inRegisterEvent,
      uuid: inPluginUUID,
    };

    websocket.send(JSON.stringify(json));
  };

  websocket.onmessage = function (evt) {
    // Received message from Stream Deck
    const jsonObj = JSON.parse(evt.data);
    const context = jsonObj["context"];

    if (jsonObj["event"] === "keyUp") {
      let cityName = "";
      let unit = "";
      let frequency = null;
      if (
        jsonObj.payload.settings != null &&
        jsonObj.payload.settings.hasOwnProperty("cityName") &&
        jsonObj.payload.settings.hasOwnProperty("unit") &&
        jsonObj.payload.settings.hasOwnProperty("frequency")
      ) {
        cityName = jsonObj.payload.settings["cityName"].toLowerCase();
        unit = jsonObj.payload.settings["unit"];
        frequency =
          jsonObj.payload.settings["frequency"] !== "0"
            ? parseInt(jsonObj.payload.settings["frequency"])
            : false;
      }

      if (cityName === "" || apiKey === "") {
        const json = {
          event: "showAlert",
          context: jsonObj.context,
        };
        websocket.send(JSON.stringify(json));
      } else {
        sendRequest(context, cityName, unit);
        if (frequency) {
          setInterval(() => sendRequest(context, cityName, unit), frequency);
        }
      }
    } else if (jsonObj["event"] === "didReceiveGlobalSettings") {
      if (
        jsonObj.payload.settings != null &&
        jsonObj.payload.settings.hasOwnProperty("apiKey")
      ) {
        apiKey = jsonObj.payload.settings["apiKey"];
        provider = jsonObj.payload.settings["provider"];
      }
    } else if (jsonObj["event"] === "keyDown") {
      const json = {
        event: "getGlobalSettings",
        context: pluginUUID,
      };

      websocket.send(JSON.stringify(json));
    }
  };
}

function prepareUrl(cityName, unit) {
  let url;
  const u = unit === "celsius" ? "metric" : "imperial";
  switch (provider) {
    case "weatherApi":
      url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${cityName}&aqi=no`;
      break;
    case "openWeatherMap":
      url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${u}`;
      break;
  }
  return url;
}

function prepareTemperature(response, unit) {
  let temp;
  switch (provider) {
    case "weatherApi":
      if (unit === "celsius") {
        temp = response.current.temp_c ? response.current.temp_c + "°C" : "NaN";
      }
      if (unit === "fahrenheit") {
        temp = response.current.temp_f ? response.current.temp_f + "°F" : "NaN";
      }
      break;
    case "openWeatherMap":
      if (unit === "celsius") {
        temp = response.main.temp ? response.main.temp + "°C" : "NaN";
      }
      if (unit === "fahrenheit") {
        temp = response.main.temp ? response.main.temp + "°F" : "NaN";
      }
      break;
  }
  return temp;
}

function setImageAndCity(response, context, city) {
  let url;
  const defaultImg =
    "https://raw.githubusercontent.com/JaouherK/streamDeck-weatherPlugin/master/Sources/com.jk.weather.sdPlugin/resources/actionIcon.png";
  switch (provider) {
    case "weatherApi":
      url =
        response.current.condition.icon != null
          ? "https:" + response.current.condition.icon
          : defaultImg;
      break;
    case "openWeatherMap":
      url =
        response.weather[0].icon != null
          ? "https://openweathermap.org/img/wn/" +
            response.weather[0].icon +
            ".png"
          : defaultImg;
      break;
  }
  dataFromCanvasDraw(url, city, (dataUrl) => {
    let json = {
      event: "setImage",
      context,
      payload: {
        image: dataUrl,
      },
    };
    websocket.send(JSON.stringify(json));
  });

  return url;
}

function sendRequest(context, cityName, unit) {
  const request = new XMLHttpRequest();
  const url = prepareUrl(cityName, unit);
  request.open("GET", url);
  request.send();
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        const response = JSON.parse(request.responseText);
        const temperature = prepareTemperature(response, unit);

        let jsonDeck = {
          event: "setTitle",
          context,
          payload: {
            title: temperature,
          },
        };

        websocket.send(JSON.stringify(jsonDeck));

        setImageAndCity(response, context, cityName);
      } else {
        const json = {
          event: "showAlert",
          context,
        };
        websocket.send(JSON.stringify(json));
      }
    }
  };
}

function dataFromCanvasDraw(url, city, callback) {
  const canvas = document.getElementById("idCanvas");
  const context = canvas.getContext("2d");
  let imageObj = new Image();
  imageObj.setAttribute("crossOrigin", "anonymous");

  imageObj.onload = ((city) => {
    const canvas = document.getElementById("idCanvas");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      imageObj,
      0,
      0,
      imageObj.width,
      imageObj.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
    context.font = "small-caps bold 13px Arial";
    context.fillStyle = "white";
    context.fillText(city, 65, 13);
    const dataURL = canvas.toDataURL();
    callback(dataURL);
  }).bind(this, city);
  imageObj.src = url;
}
