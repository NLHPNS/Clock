const scene = document.querySelector(".scene");
const environment = document.getElementById("environment");

const clouds = document.querySelectorAll(".cloud");
const stars = document.querySelectorAll(".star");

const sun = document.getElementById("sun");
const moon = document.getElementById("moon");

const clock = document.getElementById("clock");
const speedDisplay = document.getElementById("speed");

const speedUpButton = document.getElementById("speedUp");
const resetButton = document.getElementById("reset");

let currentTime = new Date();
let timeSpeed = 1;

const MAX_SPEED = 100000;

let lastRealTime = performance.now();

const colors = {
    nightTop: [7, 14, 35],
    nightBottom: [20, 35, 70],

    sunriseTop: [245, 145, 95],
    sunriseBottom: [105, 135, 175],

    dayTop: [75, 185, 250],
    dayBottom: [175, 225, 245],

    sunsetTop: [245, 105, 80],
    sunsetBottom: [75, 70, 120]
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
    const t = clamp(
        (value - edge0) / (edge1 - edge0),
        0,
        1
    );

    return t * t * (3 - 2 * t);
}

function interpolateColor(color1, color2, amount) {
    return [
        Math.round(
            color1[0] +
            (color2[0] - color1[0]) * amount
        ),
        Math.round(
            color1[1] +
            (color2[1] - color1[1]) * amount
        ),
        Math.round(
            color1[2] +
            (color2[2] - color1[2]) * amount
        )
    ];
}

function colorToString(color) {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function getTimeInHours() {
    return (
        currentTime.getHours() +
        currentTime.getMinutes() / 60 +
        currentTime.getSeconds() / 3600 +
        currentTime.getMilliseconds() / 3600000
    );
}

function getSunAngle() {
    const hours = getTimeInHours();

    /*
        Natural solar path:

        00:00 = bottom
        03:00 = lower left
        06:00 = left
        09:00 = upper left
        12:00 = top
        15:00 = upper right
        18:00 = right
        21:00 = lower right
        24:00 = bottom
    */

    return (
        hours / 24 * Math.PI * 2 +
        Math.PI
    );
}

function updateClock() {
    const hours = String(
        currentTime.getHours()
    ).padStart(2, "0");

    const minutes = String(
        currentTime.getMinutes()
    ).padStart(2, "0");

    const seconds = String(
        currentTime.getSeconds()
    ).padStart(2, "0");

    clock.textContent =
        `${hours}:${minutes}:${seconds}`;

    speedDisplay.textContent =
        `${timeSpeed}x`;
}

function updateBackground() {
    const hours = getTimeInHours();

    /*
        Background follows the clock directly.

        00:00 = midnight
        06:00 = sunrise
        12:00 = noon
        18:00 = sunset
        24:00 = midnight
    */

    const solarPhase =
        (hours - 6) / 24 * Math.PI * 2;

    /*
        -1 = midnight
         0 = sunrise/sunset
         1 = noon
    */
    const sunHeight =
        Math.sin(solarPhase);

    /*
        Smooth daylight strength.
    */
    const dayAmount =
        smoothstep(
            -0.18,
            0.28,
            sunHeight
        );

    let topColor =
        interpolateColor(
            colors.nightTop,
            colors.dayTop,
            dayAmount
        );

    let bottomColor =
        interpolateColor(
            colors.nightBottom,
            colors.dayBottom,
            dayAmount
        );

    /*
        Sunrise and sunset happen around
        06:00 and 18:00.
    */
    const horizonAmount =
        Math.sqrt(
            Math.max(
                0,
                1 - sunHeight * sunHeight
            )
        );

    const horizonStrength =
        smoothstep(
            0.45,
            1.0,
            horizonAmount
        );

    /*
        Determine which side of the horizon
        the sun is crossing.

        Around 06:00:
        sunrise is strongest.

        Around 18:00:
        sunset is strongest.
    */
    const morningFactor =
        Math.max(
            0,
            -Math.cos(solarPhase)
        );

    const eveningFactor =
        Math.max(
            0,
            Math.cos(solarPhase)
        );

    const sunriseStrength =
        morningFactor *
        horizonStrength *
        0.65;

    const sunsetStrength =
        eveningFactor *
        horizonStrength *
        0.65;

    topColor =
        interpolateColor(
            topColor,
            colors.sunriseTop,
            sunriseStrength
        );

    bottomColor =
        interpolateColor(
            bottomColor,
            colors.sunriseBottom,
            sunriseStrength
        );

    topColor =
        interpolateColor(
            topColor,
            colors.sunsetTop,
            sunsetStrength
        );

    bottomColor =
        interpolateColor(
            bottomColor,
            colors.sunsetBottom,
            sunsetStrength
        );

    scene.style.background =
        `linear-gradient(
            to bottom,
            ${colorToString(topColor)},
            ${colorToString(bottomColor)}
        )`;
}

function getOrbitRadius() {
    return window.innerWidth <= 600
        ? 250
        : 310;
}

function moveAroundEarth(object, angle) {
    const centerX =
        window.innerWidth / 2;

    const centerY =
        window.innerHeight / 2;

    const orbitRadius =
        getOrbitRadius();

    const x =
        centerX +
        Math.sin(angle) *
        orbitRadius;

    const y =
        centerY -
        Math.cos(angle) *
        orbitRadius;

    object.style.left =
        `${x - object.offsetWidth / 2}px`;

    object.style.top =
        `${y - object.offsetHeight / 2}px`;
}

function updateCelestialBodies() {
    const sunAngle =
        getSunAngle();

    const moonAngle =
        sunAngle + Math.PI;

    moveAroundEarth(
        sun,
        sunAngle
    );

    moveAroundEarth(
        moon,
        moonAngle
    );

    /*
        Rotate the Earth environment
        so the day side always faces the sun.
    */
    const environmentRotation =
        sunAngle + Math.PI / 2;

    const rotationDegrees =
        environmentRotation *
        180 /
        Math.PI;

    environment.style.transform =
        `rotate(${rotationDegrees}deg)`;

    const counterRotation =
        -rotationDegrees;

    clouds.forEach((cloud) => {
        let scale = 1;

        if (cloud.classList.contains("cloud-two")) {
            scale = 0.8;
        }

        if (cloud.classList.contains("cloud-three")) {
            scale = 0.7;
        }

        if (cloud.classList.contains("cloud-four")) {
            scale = 0.65;
        }

        cloud.style.transform =
            `rotate(${counterRotation}deg) scale(${scale})`;
    });

    stars.forEach((star) => {
        star.style.transform =
            `rotate(${counterRotation}deg)`;
    });
}

function updateEverything() {
    updateClock();
    updateBackground();
    updateCelestialBodies();
}

function animate() {
    const now =
        performance.now();

    const realDelta =
        now - lastRealTime;

    lastRealTime = now;

    currentTime =
        new Date(
            currentTime.getTime() +
            realDelta * timeSpeed
        );

    updateEverything();

    requestAnimationFrame(animate);
}

speedUpButton.addEventListener(
    "click",
    () => {
        if (timeSpeed < MAX_SPEED) {
            timeSpeed *= 10;

            if (timeSpeed > MAX_SPEED) {
                timeSpeed = MAX_SPEED;
            }
        }

        updateClock();
    }
);

resetButton.addEventListener(
    "click",
    () => {
        currentTime = new Date();

        timeSpeed = 1;

        lastRealTime =
            performance.now();

        updateEverything();
    }
);

window.addEventListener(
    "resize",
    () => {
        updateCelestialBodies();
    }
);

updateEverything();

requestAnimationFrame(animate);