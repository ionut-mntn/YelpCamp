module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);  // execute the function I passed in and then catch any errors and pass it to next!!
    }
}