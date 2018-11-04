class AbstractProto {
    /**
     * Calculate the coefficient of determination to measure the goodness of fit
     * @param {Array.<{r: Number, e: Number}>} data - Experimental/ab initio data
     * @returns {Number}
     * @see https://en.wikipedia.org/wiki/Coefficient_of_determination
     */
    rSqr(data) {
        let avg = 0; // the mean of the experimental/ab initio data
        let ssRes = 0; // the residual sum of squares (RSS)
        for (let {r, e} of data) {
            avg += e;
            let residual = e - this.at(r);
            ssRes += residual * residual;
        }
        avg /= data.length;
        let ssTot = 0; // the total sum of squares
        for (let {e} of data) {
            let diff = e - avg;
            ssTot += diff * diff;
        }
        return 1 - ssRes / ssTot;
    }

    /**
     * Generate points of the potential curve
     * @param {Object} [options] - Configuration options
     * @param {Number} [options.start=this.r0/2] - Starting interatomic distance
     * @param {Number} [options.end=this.r0*2] - End interatomic distance
     * @param {Number} [options.step=(end-start)/49] - Step for point generation (defaults make 50 points)
     * @returns {Generator<{r: Number, e: Number}>}
     */
    * points({start = this.r0 / 2, end = this.r0 * 2, step = (end - start) / 49} = {}) {
        let i = 0;
        let r = start;
        let direction = Math.sign(end - start); // when end < start, iteration is backward
        step = Math.abs(step) * direction; // the user may specify step as signed or not
        while ((end - r) * direction >= 0) {
            yield {r, e: this.at(r), index: i};
            r = start + step * ++i;
        }
        return {r: end, e: this.at(end)};
    }
}

export default AbstractProto;