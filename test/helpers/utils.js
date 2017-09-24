let utils = {
    equal(num1, num2) {
        return Math.abs(num1 - num2) <= Number.EPSILON;
    }
};

export default utils;