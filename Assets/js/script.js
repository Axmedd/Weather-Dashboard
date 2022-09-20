// The global  variables
var numberOfCities = 9;
var citiesListArr = [];
var myAPIKey = "appid=264dbcaa3899de05eeadc78d68ba06dc";
var unit = "units=imperial";
var dailyWeatherApiStarts =
  "https://api.openweathermap.org/data/2.5/weather?q=";
var dailyUVIndexApiStarts = "https://api.openweathermap.org/data/2.5/uvi?";
var forecastWeatherApiStarts =
  "https://api.openweathermap.org/data/2.5/onecall?";
// From html element
var searchCityForm = $("#searchCityForm");
var searchedCities = $("#searchedCityLi");
//----------- getting the weather information from OpenWeather starts here --------------//
var getCityWeather = function (searchCityName) {
  // formatting for the OpenWeather api
  var apiUrl =
    dailyWeatherApiStarts + searchCityName + "&" + myAPIKey + "&" + unit;

  // Making a request to url
  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      return response.json().then(function (response) {
        $("#cityName").html(response.name);
        // display date
        var unixTime = response.dt;
        var date = moment.unix(unixTime).format("MM/DD/YY");
        $("#currentdate").html(date);
        // display weather icon
        var weatherIncoUrl =
          "http://openweathermap.org/img/wn/" +
          response.weather[0].icon +
          "@2x.png";
        $("#weatherIconToday").attr("src", weatherIncoUrl);
        $("#todaysTemp").html(response.main.temp + " \u00B0F");
        $("#todaysHumidty").html(response.main.humidity + " %");
        $("#TodaysWindSpeed").html(response.wind.speed + " MPH");
        // return coordinate for getUVIndex to call
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        getUVIndex(lat, lon);
        getForecast(lat, lon);
      });
    } else {
      alert("Please provide a valid city name.");
    }
  });
};
var getUVIndex = function (lat, lon) {
  // formate the OpenWeather api url
  var apiUrl =
    dailyUVIndexApiStarts +
    myAPIKey +
    "&lat=" +
    lat +
    "&lon=" +
    lon +
    "&" +
    unit;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      // remove all class background
      $("#UVIndexToday").removeClass();
      $("#UVIndexToday").html(response.value);
      if (response.value < 3) {
        $("#UVIndexToday").addClass("p-1 rounded bg-success text-white");
      } else if (response.value < 8) {
        $("#UVIndexToday").addClass("p-1 rounded bg-warning text-white");
      } else {
        $("#UVIndexToday").addClass("p-1 rounded bg-danger text-white");
      }
    });
};
var getForecast = function (lat, lon) {
  // formate the OpenWeather api url
  var apiUrl =
    forecastWeatherApiStarts +
    "lat=" +
    lat +
    "&lon=" +
    lon +
    "&exclude=current,minutely,hourly" +
    "&" +
    myAPIKey +
    "&" +
    unit;
  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (response) {
      for (var i = 1; i < 6; i++) {
        //displaying the date
        var unixTime = response.daily[i].dt;
        var date = moment.unix(unixTime).format("MM/DD/YY");
        $("#Date" + i).html(date);
        //
        // displaying the weather icon
        var weatherIncoUrl =
          "http://openweathermap.org/img/wn/" +
          response.daily[i].weather[0].icon +
          "@2x.png";
        $("#weatherIconDay" + i).attr("src", weatherIncoUrl);
        // displaying the temperature of city
        var temp = response.daily[i].temp.day + " \u00B0F";
        $("#tempDay" + i).html(temp);
        // displaying the humidity
        var humidity = response.daily[i].humidity;
        $("#humidityDay" + i).html(humidity + " %");
      }
    });
};

var creatBtn = function (btnText) {
  // Creating the button
  var btn = $("<button>")
    .text(btnText)
    .addClass("list-group-item list-group-item-action")
    .attr("type", "submit");
  return btn;
};

var loadSavedCity = function () {
  // Loading the saved cities from the local storage
  citiesListArr = JSON.parse(localStorage.getItem("weatherInfo"));
  if (citiesListArr == null) {
    citiesListArr = [];
  }
  for (var i = 0; i < citiesListArr.length; i++) {
    var cityNameBtn = creatBtn(citiesListArr[i]);
    searchedCities.append(cityNameBtn);
  }
};

var saveCityName = function (searchCityName) {
  // saving searched cities in local storage
  var newcity = 0;
  citiesListArr = JSON.parse(localStorage.getItem("weatherInfo"));
  if (citiesListArr == null) {
    citiesListArr = [];
    citiesListArr.unshift(searchCityName);
  } else {
    for (var i = 0; i < citiesListArr.length; i++) {
      if (searchCityName.toLowerCase() == citiesListArr[i].toLowerCase()) {
        return newcity;
      }
    }
    //
    if (citiesListArr.length < numberOfCities) {
      // created object
      citiesListArr.unshift(searchCityName);
    } else {
      // controlling length of the array.
      //Will not allow user to save more than 10 cities
      citiesListArr.pop();
      citiesListArr.unshift(searchCityName);
    }
  }
  localStorage.setItem("weatherInfo", JSON.stringify(citiesListArr));
  newcity = 1;
  return newcity;
};

var createCityNameBtn = function (searchCityName) {
  //creating button with the searched city starts here
  var saveCities = JSON.parse(localStorage.getItem("weatherInfo"));
  // checking the searchCityName parameter with all children of citiesListArr
  if (saveCities.length == 1) {
    var cityNameBtn = creatBtn(searchCityName);
    searchedCities.prepend(cityNameBtn);
  } else {
    for (var i = 1; i < saveCities.length; i++) {
      if (searchCityName.toLowerCase() == saveCities[i].toLowerCase()) {
        return;
      }
    }
    // Making sure I do no have to many cities in list of buttons
    if (searchedCities[0].childElementCount < numberOfCities) {
      var cityNameBtn = creatBtn(searchCityName);
    } else {
      searchedCities[0].removeChild(searchedCities[0].lastChild);
      var cityNameBtn = creatBtn(searchCityName);
    }
    searchedCities.prepend(cityNameBtn);
    $(":button.list-group-item-action").on("click", function () {
      BtnClickHandler(event);
    });
  }
};

loadSavedCity(); // call functions directly

var formSubmitHandler = function (event) {
  // the event handler from the submit from
  event.preventDefault();
  // name of the city
  var searchCityName = $("#searchCity").val().trim();
  var newcity = saveCityName(searchCityName);
  getCityWeather(searchCityName);
  if (newcity == 1) {
    createCityNameBtn(searchCityName);
  }
};
var BtnClickHandler = function (event) {
  event.preventDefault();
  // name of the city
  var searchCityName = event.target.textContent.trim();
  getCityWeather(searchCityName);
};

$("#searchCityForm").on("submit", function () {
  // call function which has the submit button
  formSubmitHandler(event);
});
$(":button.list-group-item-action").on("click", function () {
  BtnClickHandler(event);
});
//-------------------------- END OF SCRIPT.JS ----------------------------//
