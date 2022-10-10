// SETUP
console.log("canvas.js linked!");

const canvas = document.querySelector("canvas");
const hiddenInput = document.getElementById("hiddenInput");
const clearButton = document.querySelector("#clear-button");
const ctx = canvas.getContext("2d");

// VARIABLES
let writingMode = false;

// HANDLERS
const handlePointerDown = (event) => {
    console.log("Pointer Down!");
    writingMode = true;
    ctx.beginPath();
    const [positionX, positionY] = getCursorPosition(event);
    ctx.moveTo(positionX, positionY);
};

const handlePointerUp = () => {
    console.log("Pointer Up!");
    if (writingMode) {
        hiddenInput.value = canvas.toDataURL(); // Insert canvas data to hiddenInput value
    }
    writingMode = false;
};

const handlePointerMove = (event) => {
    if (!writingMode) return;
    console.log("Cursor moved!");
    const [positionX, positionY] = getCursorPosition(event);
    ctx.lineTo(positionX, positionY);
    ctx.stroke();
};

const getCursorPosition = (event) => {
    positionX = event.clientX - event.target.getBoundingClientRect().x;
    positionY = event.clientY - event.target.getBoundingClientRect().y;
    return [positionX, positionY];
};

const clearPad = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// STYLE
ctx.lineWidth = 3;
ctx.lineJoin = ctx.lineCap = "round";

// EVENT LISTENERS
canvas.addEventListener("mousedown", handlePointerDown, { passive: true });
canvas.addEventListener("mouseup", handlePointerUp, { passive: true });
canvas.addEventListener("mouseleave", handlePointerUp, { passive: true });
canvas.addEventListener("mousemove", handlePointerMove, { passive: true });

clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    hiddenInput.value = "";
    clearPad();
});
