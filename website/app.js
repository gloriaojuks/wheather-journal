// loagin spinner element
const spinner = document.querySelector('.spinner');

// api key for open waether api
const MY_APP_API_KEY = '2fd02b89e321f33551078fbd81138297';

// update ui
const uiEngine = (payload = null) => {
	if (!payload) {
		document.querySelector('#date').innerHTML = '';
		document.querySelector('#temp').innerHTML = '';
		document.querySelector('#content').innerHTML = '';
		return;
	}
	const { temperature, date, userResponse } = payload;
	document.querySelector(
		'#date'
	).innerHTML = `<span>Date: <span class="value">${date}</span></span>`;

	document.querySelector(
		'#temp'
	).innerHTML = `<span>Temperature: <span class="value">${temperature}°F</span></span>`;

	document.querySelector('#content').innerHTML = `
    <span>Zip code: <span class="value">${userResponse.zip}</span></span>
    <br>
    <span>Feelings: <span class="value">${userResponse.feelings}<span></span>
  `;
};

//  parse form input
const receiveInput = () => {
	const zip = document.querySelector('#zip').value;
	const feelings = document.querySelector('#feelings').value;
	return { zip, feelings };
};

// util function for making api calls
const makeNetworkRequest = async (url, payload = null, method = 'GET') => {
	const reqConfig = {
		method: method,
		headers: {
			'Content-Type': 'application/json'
		}
	};
	try {
		if (payload) {
			reqConfig.body = JSON.stringify(payload);
			const res = await fetch(url, reqConfig);
			const data = await res.json();
			return data;
		}
		let res = await fetch(url, reqConfig);
		let data = await res.json();
		return data;
	} catch (error) {
		console.log(error);
		document.querySelector(
			'#error'
		).innerHTML = `<p>An error has occured!</p>`;
		spinner.classList.remove('show-spinner');
	}
};

const getWeatherInfo = async () => {
	// for clearing current ui content
	uiEngine();
	const { zip, feelings } = receiveInput();

	// input validation
	if (zip === '' || feelings === '') {
		return (document.querySelector(
			'#error'
		).innerHTML = `<p class="error">Enter your zip code and Feeling</p>`);
	}

	// spinner to show
	spinner.classList.add('show-spinner');
	// clear error
	document.querySelector('#error').innerHTML = ``;

	// compose url, corsUrl is used because to cors error
	const corsUrl = 'https://cors-anywhere.herokuapp.com/';
	const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
	const weatherFullUrl = `${corsUrl}${baseUrl}?zip=${zip}&appid=${MY_APP_API_KEY}`;

	// use util function to fetch weather data
	const weatherData = await makeNetworkRequest(weatherFullUrl);

	// check data receival
	if (weatherData && weatherData.main) {
		const date = new Date().toLocaleDateString();
		const userDetails = {
			temperature: weatherData.main.temp,
			date,
			userResponse: { zip, feelings }
		};

		// local server url
		const localServerUrl = 'http://localhost:3000/data';

		// post user data to local server
		await makeNetworkRequest(localServerUrl, userDetails, 'POST');

		// get the user data
		const serverRes = await makeNetworkRequest(localServerUrl);
		// hide the spinner
		spinner.classList.remove('show-spinner');

		// update ui with data received
		return uiEngine(serverRes);
	}

	// if no data, then an invalid zip code was entered
	document.querySelector(
		'#error'
	).innerHTML = `<p class="error">Invalid zip code!</p>`;

	// hide the spinner
	spinner.classList.remove('show-spinner');
};

// on click handler
const getWeatherBtn = document.querySelector('#generate');
getWeatherBtn.addEventListener('click', getWeatherInfo);
