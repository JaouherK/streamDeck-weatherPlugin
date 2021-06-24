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
      let displayCity = 0;
      let roundDegree = true;
      let frequency = null;

      if (
        jsonObj.payload.settings != null &&
        jsonObj.payload.settings.hasOwnProperty("cityName") &&
        jsonObj.payload.settings.hasOwnProperty("unit") &&
        jsonObj.payload.settings.hasOwnProperty("frequency") &&
        jsonObj.payload.settings.hasOwnProperty("roundDegree")

      ) {
        cityName = jsonObj.payload.settings["cityName"].toLowerCase();
        unit = jsonObj.payload.settings["unit"];
        displayCity = jsonObj.payload.settings["displayCity"];
        roundDegree = jsonObj.payload.settings["roundDegree"] === "true";
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
        sendRequest(context, cityName, displayCity, unit, roundDegree);
        if (frequency) {
          setInterval(
            () => sendRequest(context, cityName, displayCity, unit, roundDegree),
            frequency
          );
        }
      }
    } else if (jsonObj["event"] === "didReceiveGlobalSettings") {
      if (
        jsonObj.payload.settings != null &&
        jsonObj.payload.settings.hasOwnProperty("apiKey")
      ) {
        apiKey = jsonObj.payload.settings["apiKey"];
        provider = jsonObj.payload.settings["provider"] || "weatherApi";
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

function prepareTemperature(response, unit, roundDegree) {
  let temp;
  switch (provider) {
    case "weatherApi":
      if (unit === "celsius") {
        temp = response.current.temp_c 
          ? response.current.temp_c.toFixed(roundDegree ? 0 : 2) + "°C" 
          : "NaN";
      }
      if (unit === "fahrenheit") {
        temp = response.current.temp_f 
          ? response.current.temp_f.toFixed(roundDegree ? 0 : 2) + "°F" 
          : "NaN";
      }
      break;
    case "openWeatherMap":
      if (unit === "celsius") {
        temp = response.main.temp 
          ? response.main.temp.toFixed(roundDegree ? 0 : 2) + "°C" 
          : "NaN";
      }
      if (unit === "fahrenheit") {
        temp = response.main.temp
          ? response.main.temp.toFixed(roundDegree ? 0 : 2) + "°F"
          : "NaN";
      }
      break;
  }
  return temp;
}

function setImageAndCity(response, context, city, displayCity) {
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
  dataFromCanvasDraw(url, city, displayCity, (dataUrl) => {
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

function sendRequest(context, cityName, displayCity, unit, roundDegree) {
  const request = new XMLHttpRequest();
  const url = prepareUrl(cityName, unit);
  request.open("GET", url);
  request.send();
  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        const response = JSON.parse(request.responseText);
        const temperature = prepareTemperature(response, unit, roundDegree);

        let jsonDeck = {
          event: "setTitle",
          context,
          payload: {
            title: temperature,
          },
        };

        websocket.send(JSON.stringify(jsonDeck));

        setImageAndCity(response, context, cityName, displayCity);
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

function dataFromCanvasDraw(url, city, displayCity = 0, callback) {
  const canvas = document.getElementById("idCanvas");
  const context = canvas.getContext("2d");
  let imageObj = new Image();
  imageObj.setAttribute("crossOrigin", "anonymous");

  imageObj.onload = ((city, displayCity) => {
    const canvas = document.getElementById("idCanvas");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      imageObj,
      0,
      0,
      imageObj.width,
      imageObj.height,
      5,
      10,
      canvas.width - 10,
      canvas.height - 20
    );
    if (displayCity !== 0) {
      context.font = "small-caps bold 13px Arial";
      context.fillStyle = "white";
      let align = "right";
      let x = 65;
      let y = 13;
      switch (displayCity) {
        case 1:
          x = 10;
          align = "left";
          break;
        case 3:
          x = 10;
          y = 65;
          align = "left";
          break;
        case 4:
          y = 65;
          break;
      }
      context.textAlign = align;
      context.fillText(city, x, y);
    }
    const dataURL = canvas.toDataURL();
    callback(dataURL);
  }).bind(this, city, displayCity);
  imageObj.src = url;
}
