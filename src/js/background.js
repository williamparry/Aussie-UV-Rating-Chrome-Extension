/// <reference path="utils.js" />

var DAL = new LocalStoreDAL('aussieuvrating', { city: "sydney", rating: null, date: null, time: null });

var messenger = null;

function setBrowserIcon() {

    var rating = DAL.get('rating');
    
    var levels = {
        low: {
            color: [78, 180, 0, 255],
            precautions: "You can safely stay outdoors with minimal protection.",
            category: "Low"
        },
        moderate: {
            color: [247, 228, 0, 255],
            precautions: "Wear sun protective clothing, a hat, sunscreen, sunglasses and seek shady areas.",
            category: "Moderate"
        },
        high: {
            color: [248, 135, 0, 255],
            precautions: "Wear sun protective clothing, a hat, sunscreen, sunglasses and seek shady areas.",
            category: "High"
        },
        veryhigh: {
            color: [216, 0, 29, 255],
            precautions: "Wear sun protective clothing, a hat, sunscreen, sunglasses and seek shady areas.",
            category: "Very High"
        },
        extreme: { 
            color: [153, 140, 255, 255],
            precautions: "Wear sun protective clothing, a hat, sunscreen, sunglasses and seek shady areas.",
            category: "Extreme"
        }
    }

    var ratingInfo = rating < 3 ? levels.low : rating < 6 ? levels.moderate : rating < 8 ? levels.high : rating < 11 ? levels.veryhigh : rating >= 11 ? levels.extreme : [];
   

    chrome.browserAction.setBadgeBackgroundColor({ color: ratingInfo.color })
    chrome.browserAction.setBadgeText({ 'text': String(rating) });
    chrome.browserAction.setTitle({ 'title': ratingInfo.precautions })
    

}


var scheduler = new function () {

    var $this = this;
    var defaultInterval = 65000;
    var interval = defaultInterval;
    var currentTimeout;
    var currentXhr;

    this.evtD = new EventDispatcher(['EVENT_COMPLETE']);

    function send(priority) {

        if (currentXhr && priority) {
            currentXhr.abort();
        }
        currentXhr = new XMLHttpRequest();
        currentXhr.open("GET", "http://www.arpansa.gov.au/uvindex/realtime/xml/uvvalues.xml", true);
        currentXhr.onreadystatechange = function () {
            if (currentXhr.readyState === 4) {
                if (currentXhr.status === 200) {

                    var city = DAL.get('city');

                    var xml = currentXhr.responseXML.querySelectorAll("location[id='" + city + "']")[0];

                    DAL.set('rating', getXMLString(xml, "index"));
                    DAL.set('time', getXMLString(xml, "time"));
                    DAL.set('date', getXMLString(xml, "date"));

                    $this.evtD.dispatchEvent('EVENT_COMPLETE');

                } else {

            }

                clearTimeout(currentTimeout);
                currentTimeout = null;

                currentTimeout = setTimeout(send, interval);

            }

            

        };
        currentXhr.send(null);

        

    }

    this.ResetInterval = function () {
        interval = defaultInterval;
    }

    this.SetInterval = function (newInterval) {
        interval = newInterval;
    }

    this.Override = function () {
        send(true);
    }

    this.Start = function () {
        send();
    };

}



chrome.extension.onConnect.addListener(function (port) {

    messenger = new PortMessenger(port);

    scheduler.evtD.addEventListener('EVENT_COMPLETE', function () {
        messenger.send('GOT_CURRENT');
    });

    messenger.receive('SET_CITY', function (city) {
        DAL.set('city', city);
        scheduler.Override();
    });

    scheduler.Override();

});

scheduler.evtD.addEventListener('EVENT_COMPLETE', function () {
    setBrowserIcon();
});


window.onload = function () {

    scheduler.Start();

};