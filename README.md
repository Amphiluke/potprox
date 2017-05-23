# potprox

## Synopsis

It is a quite common case when there is a need to describe computed numerical *ab initio* data with some analytical form of pair potential (e.g. the [Lennard-Jones function](https://en.wikipedia.org/wiki/Lennard-Jones_potential) or the [Morse function](https://en.wikipedia.org/wiki/Morse_potential)).

Potprox uses the [method of least squares](https://en.wikipedia.org/wiki/Least_squares) to approximate computed data with empirical pair potentials. The list of currently available potentials includes

* [The Lennard-Jones potential](#the-potproxlennardjones-class)
* [The modified Buckingham potential](#the-potproxbuckingham-class) (the exp-6 potential)
* [The Morse potential](#the-potproxmorse-class)
* [The Rydberg potential](#the-potproxrydberg-class)

More potentials will be provided with future releases.

## Requirements

Use the module in [environments with ES6 support](https://kangax.github.io/compat-table/es6/).

## Install

**As a NodeJS module:**

```
npm install potprox
```

The version for browsers (and web workers) is also available: check out the [dist directory](dist).

**Browsers:**

```html
<script src="dist/potprox.min.js"></script>
```

**Web workers:**

```javascript
importScripts("dist/potprox.min.js");
````

## Usage

Here is an example of approximation of some external computational data using the potprox module.

```javascript
let potprox = require("potprox");

// Computed numerical data on energy of interatomic binding
// r - interatomic distance
// e - binding energy
let data = [
    {r: 10.0, e: 0},
    {r: 9.5, e: -0.00065673},
    {r: 9.0, e: -0.00173718},
    {r: 8.5, e: -0.00346348},
    {r: 8.0, e: -0.00612669},
    {r: 7.5, e: -0.01005967},
    {r: 7.0, e: -0.01554171},
    {r: 6.5, e: -0.02256036},
    {r: 6.0, e: -0.03028974},
    {r: 5.5, e: -0.03598181},
    {r: 5.0, e: -0.03234259},
    {r: 4.5, e: 0.00189849}
];

// Approximate with the Morse potential
let morse = potprox.Morse.from(data);
console.log("Morse potential parameters:", morse.toJSON());

// Approximate with the exp-6 potential
let buckingham = potprox.Buckingham.from(data);
console.log("Buckingham potential parameters:", buckingham.toJSON());

// Approximate with the Rydberg potential
let rydberg = potprox.Rydberg.from(data);
console.log("Rydberg potential parameters:", rydberg.toJSON());

// Approximate with the Lennard-Jones potential
let lennardjones = potprox.LennardJones.from(data);
console.log("Lennard-Jones potential parameters:", lennardjones.toJSON());
```

## API

### The `potprox` object

The potprox module exports an object with potential names as keys and potential classes as values.

```javascript
console.log(potprox); // => Object {LennardJones: <class>, Buckingham: <class>, ...}
```

### The `potprox.LennardJones` class

The `LennardJones` class instance represents the Lennard-Jones potential with the given parameters `epsilon` and `sigma`.

![V(r)=4*epsilon((sigma/r)^12-(sigma/r)^6)](https://latex.codecogs.com/svg.latex?V&#40;r&#41;=4\varepsilon\left[\left&#40;\frac{\sigma}{r}\right&#41;^{12}-\left&#40;\frac{\sigma}{r}\right&#41;^{6}\right])

You may instantiate the LennardJones class as follows:

```javascript
let lennardjones = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
```

### The `potprox.Buckingham` class

The `Buckingham` class instance represents the modified Buckingham potential (the exp-6 potential) with the given parameters `d0`, `r0`, and `a` (which are often referenced to as *ε*, *r<sub>m</sub>*, and *α* respectively).

![V(r)=d0/(1-6/a)*(6/a*exp(a(1-r/r0))-(r0/r)^6)](https://latex.codecogs.com/gif.latex?V&#40;r&#41;=\frac{D_0}{1-6/a}\left&#40;\frac{6}{a}\exp\left[a\left&#40;1-\frac{r}{r_0}\right&#41;\right]-\left&#40;\frac{r_0}{r}\right&#41;^{6}\right&#41;)

You may instantiate the exp-6 class as follows:

```javascript
let buckingham = new potprox.Buckingham({d0: 0.0360, r0: 5.298, a: 4.332});
```

### The `potprox.Morse` class

The `Morse` class instance represents the Morse potential with the given parameters `d0`, `r0`, and `a` (which are often referenced to as *D<sub>e</sub>*, *r<sub>e</sub>*, and *α* respectively).

![V(r)=-d0+d0(1-exp(-a*(r-r0)))^2](https://latex.codecogs.com/gif.latex?V&#40;r&#41;=-D_{0}&plus;D_{0}\left[1-\exp\left&#40;-a\left&#40;r-r_{0}\right&#41;\right&#41;\right]^{2})

You may instantiate the Morse class as follows:

```javascript
let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
```

### The `potprox.Rydberg` class

The `Rydberg` class instance represents the Rydberg potential with the given parameters `d0`, `r0`, and `b`.

![V(r)=-d0(1+b(r-r0)/r0)*exp(-b(r-r0)/r0)](https://latex.codecogs.com/gif.latex?V&#40;r&#41;=-D_{0}\left[1&plus;\frac{b}{r_{0}}\left&#40;r-r_{0}\right&#41;\right]\exp\left[-\frac{b}{r_{0}}\left&#40;r-r_{0}\right&#41;\right])

You may instantiate the Rydberg class as follows:

```javascript
let rydberg = new potprox.Rydberg({d0: 0.0368, r0: 5.350, b: 6.415});
```

### Potential class methods

All the classes in the `potprox` object have a few common methods listed below.

#### `from(data)`

The *static* method `from` creates an instance of the specific class with potential parameters obtained via the least squares approximation procedure. The method expects a single argument, an array of objects `{r: Number, e: Number}`, where `r` is an interatomic distance, and `e` is the corresponding binding energy. Refer the [Usage](#usage) section for an example.

#### `at(r)`

Calculates the value of the potential for the given interatomic distance.

```javascript
let lennardjones = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
console.log(lj.at(6.0)); // => -0.02399355483055115

let buckingham = new potprox.Buckingham({d0: 0.0360, r0: 5.298, a: 4.332});
console.log(buckingham.at(6.0)); // => -0.028625141782941267

let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
console.log(morse.at(6.0)); // => -0.029435553046279185

let rydberg = new potprox.Rydberg({d0: 0.0368, r0: 5.350, b: 6.415});
console.log(rydberg.at(6.0)); // => -0.030035419908893232
```

#### `toJSON()`

Returns an object containing the potential parameters.

```javascript
let lennardjones = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
console.log(lj.toJSON()); // => {epsilon: 0.041, sigma: 4.5}

let buckingham = new potprox.Buckingham({d0: 0.0360, r0: 5.298, a: 4.332});
console.log(buckingham.toJSON()); // => {d0: 0.036, r0: 5.298, a: 4.332}

let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
console.log(morse.toJSON()); // => {d0: 0.0368, r0: 5.316, a: 0.867}

let rydberg = new potprox.Rydberg({d0: 0.0368, r0: 5.350, b: 6.415});
console.log(rydberg.toJSON()); // => {d0: 0.0368, r0: 5.350, b: 6.415}
```

Note that the potential parameters are also available as direct instance properties, and you may change them at any time.