import {validationResult} from 'express-validator';
const validate_function = (req) =>{
    const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {        
        return `${param}: ${msg}`;
        };
        const errors = validationResult(req).formatWith(errorFormatter);
        return errors;
};
export default validate_function;