class ExpressError extends Error {
    constructor(message, statusCode){
        super(); // will call Error constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;