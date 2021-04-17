let websocket = null,
    uuid = null,
    actionInfo = {};

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {

    uuid = inPropertyInspectorUUID;
    actionInfo = JSON.parse(inActionInfo);

    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the Property Inspector
        let json = {
            "event": inRegisterEvent,
            "uuid": inPropertyInspectorUUID
        };
        websocket.send(JSON.stringify(json));

        json = {
            "event": "getSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));

        json = {
            "event": "getGlobalSettings",
            "context": uuid,
        };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt) {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        if (jsonObj.event === 'didReceiveSettings') {
            const payload = jsonObj.payload.settings;

            document.getElementById('cityName').value = payload.cityName;

            if(document.getElementById('cityName').value === "undefined") {
                document.getElementById('cityName').value = "";
            }
        }
        if (jsonObj.event === 'didReceiveGlobalSettings') {
            const payload = jsonObj.payload.settings;

            document.getElementById('apiKey').value = payload.apiKey;

            if(document.getElementById('apiKey').value === "undefined") {
                document.getElementById('apiKey').value = "";
            }

            const el = document.querySelector('.sdpi-wrapper');
            el && el.classList.remove('hidden');
        }
    };

}

function updateCityName() {
    if (websocket && (websocket.readyState === 1)) {
        let payload = {};
        payload.cityName = document.getElementById('cityName').value;
        const json = {
            "event": "setSettings",
            "context": uuid,
            "payload": payload
        };
        websocket.send(JSON.stringify(json));
        console.log(json)
    }    
}

function updateApiKey() {
    if (websocket && (websocket.readyState === 1)) {
        let payload = {};
        payload.apiKey = document.getElementById('apiKey').value;
        const json = {
            "event": "setGlobalSettings",
            "context": uuid,
            "payload": payload
        };
        websocket.send(JSON.stringify(json));
        console.log(json)
    }    
}

function openPage(site) {
    if (websocket && (websocket.readyState === 1)) {
        const json = {
            'event': 'openUrl',
            'payload': {
                'url': 'https://' + site
            }
        };
        websocket.send(JSON.stringify(json));
    }
}
