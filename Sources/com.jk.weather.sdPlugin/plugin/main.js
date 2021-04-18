let websocket = null,
    pluginUUID = null;
apiKey = "";

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo) {
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function () {
        // WebSocket is connected, register the plugin
        const json = {
            "event": inRegisterEvent,
            "uuid": inPluginUUID
        };

        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        const context = jsonObj['context'];

        if (jsonObj['event'] === "keyUp") {
            let cityName = "";
            let unit = "";
            let frequency = null;
            if (
                jsonObj.payload.settings != null &&
                jsonObj.payload.settings.hasOwnProperty('cityName') &&
                jsonObj.payload.settings.hasOwnProperty('unit') &&
                jsonObj.payload.settings.hasOwnProperty('frequency')
            ) {
                cityName = jsonObj.payload.settings["cityName"];
                unit = jsonObj.payload.settings["unit"];
                frequency = (jsonObj.payload.settings["frequency"] !== "0") ? parseInt(jsonObj.payload.settings["frequency"]) : false;
            }

            if (cityName === "" || apiKey === "") {
                const json = {
                    "event": "showAlert",
                    "context": jsonObj.context,
                };
                websocket.send(JSON.stringify(json));
            } else {
                requestSending(context, cityName, unit);
                if (frequency) {
                    setInterval(() => requestSending(context, cityName, unit), frequency);
                }
            }
        } else if (jsonObj['event'] === "didReceiveGlobalSettings") {
            if (jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('apiKey')) {
                apiKey = jsonObj.payload.settings["apiKey"];
            }

        } else if (jsonObj['event'] === "keyDown") {
            const json = {
                "event": "getGlobalSettings",
                "context": pluginUUID
            };

            websocket.send(JSON.stringify(json));
        }
    };
}


function requestSending(context, cityName, unit) {
    console.log('Sending');
    const request = new XMLHttpRequest();
    request.open("GET", 'https://api.weatherapi.com/v1/current.json?key=' + apiKey + '&q=' + cityName + '&aqi=no');
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState === XMLHttpRequest.DONE) {
            const response = JSON.parse(request.responseText);
            let temperature = "";
            if (unit === 'celsius') {
                temperature = response.current.temp_c ? response.current.temp_c + "°C" : "NaN";
            }
            if (unit === 'fahrenheit') {
                temperature = response.current.temp_f ? response.current.temp_f + "°F" : "NaN";
            }
            let json = {
                "event": "setTitle",
                "context": context,
                "payload": {
                    "title": "" + temperature,
                    "target": 1
                }
            };

            websocket.send(JSON.stringify(json));

            function toDataURL(url, callback) {
                let xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    let reader = new FileReader();
                    reader.onloadend = function () {
                        callback(reader.result);
                    }
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            }

            if (response.current.condition.icon != null) {
                toDataURL("https:" + response.current.condition.icon, function (dataUrl) {
                    let json = {
                        "event": "setImage",
                        "context": context,
                        "payload": {
                            "image": '' + dataUrl,
                            "target": 1
                        }
                    };

                    websocket.send(JSON.stringify(json));
                })
            }
        }
    }
}
