class ApiResponse {
	constructor(success, statusCode, data = null, message = '') {
		this.success = success;
		this.statusCode = statusCode;
		this.data = data;
		this.message = message;
	}

	static success(statusCode, data = null, message = '') {
		return new ApiResponse(true, statusCode, data, message);
	}

	static error(statusCode, message = '', data = null) {
		return new ApiResponse(false, statusCode, data, message);
	}
}

export default ApiResponse;
