// =============================
// 时间系统
// =============================

// 网页当前时间
let currentTime = new Date();

// 时间速度
// 1 = 正常速度
// 600 = 现实1秒 = 网页10分钟
let timeSpeed = 1;

// 上一次更新时间
let lastRealTime = performance.now();


// =============================
// 更新时钟
// =============================

function updateClock() {

    // 获取时、分、秒
    const hour = String(currentTime.getHours()).padStart(2, "0");
    const minute = String(currentTime.getMinutes()).padStart(2, "0");
    const second = String(currentTime.getSeconds()).padStart(2, "0");

    // 显示时间
    document.getElementById("clock").textContent =
        `${hour}:${minute}:${second}`;


    // =============================
    // 根据时间改变背景
    // =============================

    const currentHour = currentTime.getHours();

    if (currentHour >= 6 && currentHour < 8) {

        // 日出
        document.body.style.background =
            "linear-gradient(to bottom, #ff9966, #ffcc66)";

    } 
    
    else if (currentHour >= 8 && currentHour < 17) {

        // 白天
        document.body.style.background =
            "linear-gradient(to bottom, #4facfe, #00f2fe)";

    } 
    
    else if (currentHour >= 17 && currentHour < 19) {

        // 黄昏
        document.body.style.background =
            "linear-gradient(to bottom, #ff7e5f, #feb47b)";

    } 
    
    else {

        // 夜晚
        document.body.style.background =
            "linear-gradient(to bottom, #141e30, #243b55)";
    }
}


// =============================
// 时间动画
// =============================

function animate() {

    // 当前真实时间
    const now = performance.now();

    // 距离上一次更新经过了多少毫秒
    const delta = now - lastRealTime;

    // 保存这一次的时间
    lastRealTime = now;


    // 根据速度推进网页时间
    currentTime = new Date(
        currentTime.getTime() + delta * timeSpeed
    );


    // 更新显示
    updateClock();


    // 下一帧继续
    requestAnimationFrame(animate);
}


// =============================
// 加速按钮
// =============================

document.getElementById("speedUp").addEventListener("click", function () {

    // 点击一次进入高速模式
    timeSpeed = 30000;

});


// =============================
// 重置按钮
// =============================

document.getElementById("reset").addEventListener("click", function () {

    // 回到真实当前时间
    currentTime = new Date();

    // 恢复正常速度
    timeSpeed = 1;

    // 重置计时器
    lastRealTime = performance.now();

    updateClock();
});


// =============================
// 开始
// =============================

updateClock();
animate();
