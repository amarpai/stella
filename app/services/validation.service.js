var _ = require('lodash');

exports.inputValidation = (inputs) => {
    let validationOutput;
    if(_.isEmpty(inputs.city)){
        validationOutput = { error: true, message: "Please select a valid city"}
        return validationOutput
    }

    if(!_.isEmpty(inputs.date) && !_.isEmpty(inputs.flexible)){
        validationOutput = { error: true, message: "Please select a date range or Flexible options"}
        return validationOutput
    }

    return { error: false }
}