var apiKey = '7089b10be0f7e0c3dff81e4121ed4d8f';
var theCity;

// pulling in from HTML
var userInput = $('#user-input');
var searchBtn = $('#search-button');
var clearBtn = $('#clear-button');
var displaySearchHistory = $('#saved-searches');


// fetching API for current weather. It's working but not displaying correctly.....
function fetchForecast(data) {

    var requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${data.lat}&lon=${data.lon}&appid=${apiKey}`
    fetch(requestUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {

            // current weather div creator
            var currentWeather = $('#current-weather');
            currentWeather.addClass('border border-success');

            // create and display city name
            var cityName = $('<h2>');
            cityName.text(theCity);
            currentWeather.append(cityName);
            
            // date won't display....
            var currentDate = data.list;
            currentDate = dayjs.unix(currentDate.dt).format("MM/DD/YYYY");
            var displayDate = $('<h3>');
            displayDate.text(` (${currentDate}) `);
            cityName.append(displayDate);


            // temp doesn't display a correct temp...
            var cityTemp = data.list[0].main.temp;
            var displayTemp = $('<p>')
            displayTemp.text(`Temp: ${cityTemp}°F`)
            currentWeather.append(displayTemp);
            
            // wind won't display...
            var cityWindSpeed = data.list[0].wind.wind_speed;
            var displayWindSpeed = $('<p>')
            displayWindSpeed.text(`Wind: ${cityWindSpeed} MPH`)
            currentWeather.append(displayWindSpeed);

            // humidity works though?
            var cityHumidity = data.list[0].main.humidity;
            var displayHumidity = $('<p>')
            displayHumidity.text(`Humidity: ${cityHumidity}%`)
            currentWeather.append(displayHumidity);


            // separate space for new header. Begin forecast.
            var forecastHeader = $('#forecast-header');
            var displayForecastHeader = $('<h2>');
            displayForecastHeader.text('5-Day Forecast:');
            forecastHeader.append(displayForecastHeader);

            var forecast = $('#forecast-display');

            // started at index 1. Temp is definitely not that high.....?
            for (var i = 1; i <=5; i++) {
                var date;
                var icon;
                var temp;
                var windSpeed;
                var humidity;

                date = data.list[i].dt;
                date = dayjs.unix(currentDate.dt).format("MM/DD/YYYY");

                icon = data.list[i].weather[0].icon;
                temp = data.list[i].main.temp;
                windSpeed = data.list[i].main.wind_speed;
                humidity = data.list[i].main.humidity;

                // display cards for forecast card bodies
                var card = document.createElement('div');
                card.classList.add('card', 'col-2', 'm-1', 'bg-success', 'text-white');
                
                var cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
                cardBody.innerHTML = 
                `<h5>${date}</h5>
                <img src= "http://openweathermap.org/img/wn/${icon}.png"/><br>
                ${temp}°F<br>
                ${windSpeed} MPH<br>
                ${humidity}% Humidity`
                
                card.appendChild(cardBody);
                forecast.append(card);
            }
        })
    return;
}

// Begin local storage and history
function seeHistory() {
    var savedHistory = JSON.parse(localStorage.getItem("savedCities")) || [];
    var displaySavedSearches = document.getElementById('saved-searches');

    displaySavedSearches.innerHTML ='';

    for (i = 0; i < savedHistory.length; i++) {
        
        var cityHistoryButton = document.createElement("button");
        cityHistoryButton.classList.add("btn", "btn-secondary", "my-2", "city-history");
        cityHistoryButton.setAttribute("style", "width: 100%");
        cityHistoryButton.innerHTML = `${savedHistory[i].city}`;
        displaySavedSearches.appendChild(cityHistoryButton);
    }
    return;
}

// latitude longitude for the city
function latiLongi () {
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${theCity}&appid=${apiKey}`;
    var savedHistory = JSON.parse(localStorage.getItem("savedCities")) || [];

    fetch(requestUrl)
    .then(function (response) {
        if (response.status >= 200 && response.status <= 299) {
            return response.json();
        } else {
            throw Error(response.statusText);
        }
    })
    .then(function(data) {

        var cityLatiLongi = {
            city: theCity,
            lon: data.coord.lon,
            lat: data.coord.lat
        }

        savedHistory.push(cityLatiLongi);
        localStorage.setItem("savedCities", JSON.stringify(savedHistory));

        seeHistory();

        return cityLatiLongi;
    })
    .then(function (data) {
        fetchForecast(data);
    })
    return;
}

// to delete history
function deleteHistory (event) {
    event.preventDefault();
    var displaySavedSearches = document.getElementById('saved-searches');

    localStorage.removeItem("savedCities");
    displaySavedSearches.innerHTML ='';

    return;
}

function clearCurrentDisplay () {
    var currentWeather = document.getElementById("current-weather");
    currentWeather.innerHTML = '';

    var forecastHeader = document.getElementById("forecast-header");
    forecastHeader.innerHTML = '';

    var forecast = document.getElementById("forecast-display");
    forecast.innerHTML = '';

    return;
}

// trim user input and display functions
function userInputCity (event) {
    event.preventDefault();
    theCity = userInput.val().trim();

    clearCurrentDisplay();
    latiLongi();

    return;
}

// reload saved searches
function reloadSavedSearch (event) {
    var savedElement = event.target;

    if (savedElement.matches(".city-history")) {
        theCity = savedElement.innerHTML;
        
        clearCurrentDisplay();

        var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${theCity}&appid=${apiKey}`;
        
        fetch(requestUrl)
          .then(function (response) {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
              } else {
                throw Error(response.statusText);
              }
           })
           .then(function(data) {
                var cityLatiLongi = {
                    city: theCity,
                    lon: data.coord.lon,
                    lat: data.coord.lat
                }
                return cityLatiLongi;
            })
           .then(function (data) {
                fetchForecast(data);
        })
    }
    return;
}

seeHistory();

searchBtn.on("click", userInputCity);

clearBtn.on("click", deleteHistory);

displaySearchHistory.on("click", reloadSavedSearch);












