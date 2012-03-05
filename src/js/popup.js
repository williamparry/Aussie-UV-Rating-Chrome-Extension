/// <reference path="utils.js" />

var popupMessenger = new PortMessenger(chrome.extension.connect()),
    DAL = new LocalStoreDAL('aussieuvrating'),
    ECity,
    ERating,
    EPrecautions,
    EAsatDate,
    EAsatTime;

function updateUI(rating, asat) {
    
    var rating = DAL.get('rating'),
        date = DAL.get('date'),
        time = DAL.get('time');


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


    ERating.innerHTML = String(rating);
    var rgb = ratingInfo.color;
    ERating.style.backgroundColor = "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ", 100)";

    EPrecautions.innerHTML = '<strong>' + ratingInfo.category + ' - </strong>' + ratingInfo.precautions;
    EAsatDate.innerHTML = String(date);
    EAsatTime.innerHTML = String(time);

}

popupMessenger.receive('GOT_CURRENT', function () {
    updateUI();
});


window.onload = function () {

    ECity = $('city');
    ERating = $('rating');
    EPrecautions = $('precautions');
    EAsatDate = $('asat-date');
    EAsatTime = $('asat-time');

    ECity.value = DAL.get('city');
    ECity.onchange = function () {
        popupMessenger.send('SET_CITY', this.options[this.selectedIndex].value);
    };

}