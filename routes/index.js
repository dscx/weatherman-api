var express = require("express");
var router = express.Router();
const Axios = require("Axios");
const v4 = require("uuid");
const { metaweather } = require("../config");

const asyncHandler = require("express-async-handler");

const GET = "get";
const client = Axios.create({
	baseURL: metaweather.baseURL
});

/* ROUTES */
router.get(
	"/weather",
	asyncHandler(async (req, res, next) => {
		const response = await fetchWeather(req.query.lat, req.query.lng);
		res.send(response);
	})
);

router.get(
	"/login",
	asyncHandler(async (req, res, next) => {
		const response = await login();
		res.send({ token: v4() });
	})
);

/* HELPERS */
const fetchWeather = async (lat, lng) => {
	// TODO: attach token from header in request
	const token = v4();
	const searchUrl = `${metaweather.searchURL}${lat},${lng}`;
	const response = await request(GET, searchUrl, token);

	if (response.error) return response;

	const id = response.data[0] ? response.data[0].woeid : null;
	const url = `${metaweather.lookupURL}${id}`;
	const { data, error, status } = await request(GET, url, token);

	if (error) return { error, status };
	return { data };
};

const login = async () => {
	return {
		token: v4()
	};
};

const request = async (method, url, token) => {
	try {
		const requestConfig = {
			url,
			method
		};

		if (token && token.length > 0) {
			requestConfig.headers = {
				Authorization: `Bearer ${this.token}`
			};
		} else {
			return { error: "Unauthorized", status: 401 };
		}

		const response = await client.request(requestConfig);
		return { data: response.data, status: response.status };
	} catch (error) {
		if (error.response && error.response.status === 401)
			return { error, status: 401 };
		else {
			return { error, status: error.response.status };
		}
	}
};

module.exports = router;
