# potprox

## Synopsis

It is a quite common case when there is a need to describe computed numerical *ab initio* data with some analytical form of pair potential (e.g. the [Lennard-Jones function](https://en.wikipedia.org/wiki/Lennard-Jones_potential) or the [Morse function](https://en.wikipedia.org/wiki/Morse_potential)).

Potprox uses the [method of least squares](https://en.wikipedia.org/wiki/Least_squares) to approximate computed data with empirical pair potentials. The list of currently available potentials includes

* The Lennard-Jones potential
* The Morse potential

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
console.log("Morse potential parameters:");
console.log(`d0 = ${m.d0}; r0 = ${m.r0}; a = ${m.a}`);

// Approximate with the Lennard-Jones potential
let lj = potprox.LennardJones.from(data);
console.log("Lennard-Jones potential parameters:");
console.log(`epsilon = ${lj.epsilon}; sigma = ${lj.sigma}`);
```

## API

### The `potprox` object

The potprox module exports an object with potential names as keys and potential classes as values.

```javascript
console.log(potprox); // => Object {LennardJones: <class>, Morse: <class>}
```

### The `potprox.LennardJones` class

The `LennardJones` class instance represents the Lennard-Jones potential with the given parameters `epsilon` and `sigma`.

![V(r)=4*epsilon((sigma/r)^12-(sigma/r)^6)](https://wikimedia.org/api/rest_v1/media/math/render/svg/026d58558ad6588bea3419a152c7f414437c0a31)

#### The `LennardJones` constructor

You may instantiate the LennardJones class as follows:

```javascript
let lj = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
```

#### `LennardJones.from(data)`

The static method `from` creates an instance of the `LennardJones` class with potential parameters obtained via the least squares approximation procedure. The method expects a single argument, an array of objects `{r: Number, e: Number}`, where `r` is an interatomic distance, and `e` is the corresponding binding energy. Refer the [Usage](#usage) section for an example.

#### `LennardJones.epsilon`

The `epsilon` parameter of the potential. You provide this parameter during instantiation but you can also change it at any time later on.

#### `LennardJones.sigma`

The `sigma` parameter of the potential. You provide this parameter during instantiation but you can also change it at any time later on.

#### `LennardJones.at(r)`

Calculates the value of the Lennard-Jones potential for the given interatomic distance.

```javascript
let lj = new potprox.LennardJones({epsilon: 0.041, sigma: 4.5});
console.log(lj.at(6.0)); // => -0.02399355483055115
```

### The `potprox.Morse` class

The `Morse` class instance represents the Morse potential with the given parameters `d0`, `r0`, and `a` (which are often referenced as *D<sub>e</sub>*, *r<sub>e</sub>*, and *α* respectively).

![V(r)=d0((1-exp(-a*(r-r0)))^2-1)](https://wikimedia.org/api/rest_v1/media/math/render/svg/ffa35165dc39b206bcb0f80840214b92a75de130)

#### The `Morse` constructor

You may instantiate the LennardJones class as follows:

```javascript
let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
```

#### `Morse.from(data)`

The static method `from` creates an instance of the `Morse` class with potential parameters obtained via the least squares approximation procedure. The method expects a single argument, an array of objects `{r: Number, e: Number}`, where `r` is an interatomic distance, and `e` is the corresponding binding energy. Refer the [Usage](#usage) section for an example.

#### `Morse.d0`

The `d0` parameter of the potential. You provide this parameter during instantiation but you can also change it at any time later on.

#### `Morse.r0`

The `r0` parameter of the potential. You provide this parameter during instantiation but you can also change it at any time later on.

#### `Morse.a`

The `a` parameter of the potential. You provide this parameter during instantiation but you can also change it at any time later on.

#### `Morse.at(r)`

Calculates the value of the Morse potential for the given interatomic distance.

```javascript
let morse = new potprox.Morse({d0: 0.0368, r0: 5.316, a: 0.867});
console.log(morse.at(6.0)); // => -0.029435553046279185
```