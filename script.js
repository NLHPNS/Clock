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

const DAY_MS = 24 * 60 * 60 * 1000;

const colors = {
    nightTop: [7, 14, 35],
    nightBottom: [20, 35, 70],

    dayTop: [80, 190, 255],
    dayBottom: [180, 225, 245],

    sunriseTop: [245, 150, 100],
    sunriseBottom: [100, 150, 190],

    sunsetTop: [245, 115, 90],
    sunsetBottom: [70, 70, 120]
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
    const r =
        color1[0] +
        (color2[0] - color1[0]) * amount;

    const g =
        color1[1] +
        (color2[1] - color1[1]) * amount;

    const b =
        color1[2] +
        (color2[2] - color1[2]) * amount;

    return [
        Math.round(r),
        Math.round(g),
        Math.round(b)
    ];
}

function mixColors(color1, color2, amount) {
    return interpolateColor(
        color1,
        color2,
        clamp(amount, 0, 1)
    );
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

    return (
        hours / 24
    ) * Math.PI * 2;
}

function updateBackground() {
    const sunAngle = getSunAngle();

    const sunHeight = Math.cos(sunAngle);
    const sunSide = Math.sin(sunAngle);

    const dayAmount = smoothstep(
        -0.2,
        0.35,
        sunHeight
    );

    let topColor = mixColors(
        colors.nightTop,
        colors.dayTop,
        dayAmount
    );

    let bottomColor = mixColors(
        colors.nightBottom,
        colors.dayBottom,
        dayAmount
    );

    const horizonAmount =
        1 - Math.abs(sunHeight);

    const horizonStrength =
        smoothstep(
            0.15,
            0.95,
            horizonAmount
        );

    const sunriseWeight =
        Math.max(0, sunSide) *
        horizonStrength;

    const sunsetWeight =
        Math.max(0, -sunSide) *
        horizonStrength;

    const sunriseStrength =
        sunriseWeight * 0.55;

    const sunsetStrength =
        sunsetWeight * 0.55;

    topColor = mixColors(
        topColor,
        colors.sunriseTop,
        sunriseStrength
    );

    bottomColor = mixColors(
        bottomColor,
        colors.sunriseBottom,
        sunriseStrength
    );

    topColor = mixColors(
        topColor,
        colors.sunsetTop,
        sunsetStrength
    );

    bottomColor = mixColors(
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
        Math.sin(angle) * orbitRadius;

    const y =
        centerY -
        Math.cos(angle) * orbitRadius;

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