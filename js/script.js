const overlayImage = new Image();
overlayImage.src = 'images/image.png';

const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const bgImageInput = document.getElementById('bgImageInput');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let overlayX = 0;
let overlayY = 0;
let overlayScale = 1;

canvas.width = 800;
canvas.height = 600;

// 初始化叠加图片
overlayImage.onload = function() {
    drawCanvas();
};

// 绘制画布函数
function drawCanvas() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (currentBgImage) {
        ctx.drawImage(currentBgImage, 0, 0, canvas.width, canvas.height);
    }
    
    const width = overlayImage.width * overlayScale;
    const height = overlayImage.height * overlayScale;
    ctx.drawImage(overlayImage, overlayX, overlayY, width, height);
}

// 鼠标事件处理
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (x >= overlayX && x <= overlayX + overlayImage.width * overlayScale &&
        y >= overlayY && y <= overlayY + overlayImage.height * overlayScale) {
        isDragging = true;
        dragStartX = x - overlayX;
        dragStartY = y - overlayY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        overlayX = e.clientX - rect.left - dragStartX;
        overlayY = e.clientY - rect.top - dragStartY;
        drawCanvas();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// 缩放处理
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    overlayScale *= scaleFactor;
    
    // 限制缩放范围
    overlayScale = Math.max(0.1, Math.min(3, overlayScale));
    
    drawCanvas();
});

let currentBgImage = null;

bgImageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const bgImage = new Image();
            bgImage.onload = function() {
                currentBgImage = bgImage;
                canvas.width = bgImage.width;
                canvas.height = bgImage.height;
                drawCanvas();
            };
            bgImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// 清除背景图片
clearBtn.addEventListener('click', function() {
    currentBgImage = null;
    canvas.width = 800;
    canvas.height = 600;
    overlayX = (canvas.width - overlayImage.width * overlayScale) / 2;
    overlayY = (canvas.height - overlayImage.height * overlayScale) / 2;
    drawCanvas();
});

// 生成按钮处理保持不变
generateBtn.addEventListener('click', function () {
    const newTab = window.open();
    newTab.document.write(`
        <html>
            <head>
                <title>合成结果</title>
                <style>
                    body { margin: 20px; text-align: center; }
                    button { padding: 10px 20px; margin: 20px; }
                </style>
            </head>
            <body>
                <img src="${canvas.toDataURL('image/png')}" alt="Composite Image">
                <br>
                <button onclick="saveImage()">Save Image</button>
                <script>
                    function saveImage() {
                        const link = document.createElement('a');
                        link.download = 'composite-image.png';
                        link.href = document.querySelector('img').src;
                        link.click();
                    }
                </script>
            </body>
        </html>
    `);
});