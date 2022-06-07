import {check} from 'express-validator';

export const signupValidation = [
    check('firstName').not().isEmpty().withMessage('First Name is required'),
    check('lastName').not().isEmpty().withMessage('Last Name is required'),
    check('email','Please include a valid email').isEmail(),
    check('password','Password must be 5 or more characters').isLength({ min: 5 })
];
export const loginValidator = [
    check('email','Please include a valid email').isEmail(),    
];
export const forgetpasswordValidator = [
    check('email','Please include a valid email').isEmail(),    
];
export const newpasswordValidator = [
    check('password','Password must be 5 or more characters').isLength({ min: 5 })
];
export const quoteFormValidator = [
    check('firstName').not().isEmpty().withMessage('First Name is required'),
    check('lastName').not().isEmpty().withMessage('Last Name is required'),
    check('email','Please include a valid email').isEmail(),
    check('phoneNumber').isNumeric().escape('+').isLength({ min: 10, max: 13 }).withMessage('Must be a number with minimum 10 digits excluding +91'),
    check('message').not().isEmpty().withMessage('Message is required')
];

