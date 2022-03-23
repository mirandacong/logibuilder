// tslint:disable: ter-max-len
export const LOGI_REG_EMAIL = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
export const LOGI_REG_PHNOE = /^1[34578]\d{9}$/
export const LOGI_REG_SIMPLE_PWD = /^\w*$/

/**
 * https://stackoverflow.com/questions/58767980/aws-cognito-password-regex-specific-to-aws-cognito
 */
export const LOGI_REG_COMPLEX_PWD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\^$*.\[\]{}\(\)?\-“!@#%&\/,><\’:;|_~`])\S{6,40}$/
