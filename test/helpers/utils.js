const LIM_ERR = 10 ** Math.ceil(Math.log10(Number.EPSILON));

let utils = {
    equal(num1, num2) {
        return Math.abs(num1 - num2) < LIM_ERR;
    }
};

export default utils;