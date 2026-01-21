let cells = [];
let selected = [];
let probabilities = { p1: 0, p2: 0, p3: 0 };
let bestCombos = [];
let pointSlider;

const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15], [3, 6, 9, 12]
];

function setup() {
    createCanvas(450, 720);
    // 建立奇想點滑桿 (0-9點)
    pointSlider = createSlider(0, 9, 2);
    pointSlider.position(150, 615);
    pointSlider.style('width', '200px');

    for (let i = 0; i < 16; i++) {
        let x = (i % 4) * 90 + 45;
        let y = Math.floor(i / 4) * 90 + 100;
        cells.push({ x, y, id: i });
    }
}

function draw() {
    background(250);
    drawUI();

    // 繪製格子
    for (let i = 0; i < 16; i++) {
        let isSelected = selected.includes(i);
        stroke(220);
        fill(isSelected ? "#FFD700" : "#FFF");
        rect(cells[i].x, cells[i].y, 80, 80, 10);
        if (isSelected) {
            fill(255, 140, 0); noStroke(); textAlign(CENTER, CENTER);
            textSize(35); text("★", cells[i].x + 40, cells[i].y + 45);
        }
    }

    if (selected.length === 7) {
        calculateProb();
        drawSmartAnalysis();
    } else {
        drawGuide();
    }

    drawPointsUI();
    drawResetBtn();
}

function drawUI() {
    fill("#4a69bd"); rect(0, 0, width, 80);
    fill(255); textAlign(CENTER); textSize(22); textStyle(BOLD);
    text("流光旅人公會: 天書奇談分析器", width / 2, 45);
}

function drawPointsUI() {
    let pts = pointSlider.value();
    fill(50); textAlign(LEFT); textSize(16);
    text(`剩餘奇想點: ${pts}`, 40, 630);
    textSize(12); fill(100);
    text("(洗牌一次消耗 2 點)", 40, 645);
}

function drawSmartAnalysis() {
    let p3 = float(probabilities.p3);
    let pts = pointSlider.value();
    let advice = "";
    let subAdvice = "";
    let adviceCol = "#666";

    // AI 決策邏輯
    if (p3 === 0) {
        advice = "【死局】必須重骰！";
        subAdvice = "目前位置完全無法達成三線。";
        adviceCol = "#e74c3c";
    } else if (p3 >= 8.5) {
        advice = "【天選之局】直接開獎！";
        subAdvice = "三線機率極高，不建議再浪費點數。";
        adviceCol = "#2ecc71";
    } else if (pts >= 4 && p3 < 6) {
        advice = "【建議重骰】點數充足";
        subAdvice = "你有足夠點數洗出 >8% 的版面，再試試！";
        adviceCol = "#3498db";
    } else if (pts < 2 && p3 > 0) {
        advice = "【最後一搏】直接開獎";
        subAdvice = "已無點數洗牌，祝你好運！";
        adviceCol = "#f39c12";
    } else {
        advice = "【可以開獎】機率尚可";
        subAdvice = "目前的形狀已有一定三線潛力。";
        adviceCol = "#2ecc71";
    }

    // 分析面板
    fill(adviceCol); rect(30, height - 245, width - 60, 105, 15);
    fill(255); textAlign(LEFT);
    textSize(18); textStyle(BOLD); text(advice, 50, height - 215);
    textSize(13); textStyle(NORMAL); text(subAdvice, 50, height - 192);

    stroke(255); line(50, height - 175, width - 50, height - 175); noStroke();
    textSize(14);
    text(`3 線機率: ${probabilities.p3}%`, 50, height - 155);
    text(`2 線機率: ${probabilities.p2}%`, 180, height - 155);

    // 標註關鍵位置
    bestCombos.forEach(spot => {
        noFill(); stroke(231, 76, 60, 150); strokeWeight(4);
        ellipse(cells[spot].x + 40, cells[spot].y + 40, 60);
    });
}

function drawGuide() {
    fill(100); textAlign(CENTER); textSize(15);
    text(`請根據遊戲畫面標記 7 個貼紙 (${selected.length}/7)`, width / 2, height - 190);
}

function calculateProb() {
    let remaining = [];
    for (let i = 0; i < 16; i++) if (!selected.includes(i)) remaining.push(i);
    let total = 0, counts = { p2: 0, p3: 0 };
    bestCombos = [];

    for (let i = 0; i < remaining.length; i++) {
        for (let j = i + 1; j < remaining.length; j++) {
            total++;
            let testPattern = [...selected, remaining[i], remaining[j]];
            let lineCount = 0;
            for (let line of lines) if (line.every(pos => testPattern.includes(pos))) lineCount++;
            if (lineCount >= 2) counts.p2++;
            if (lineCount >= 3) { counts.p3++; bestCombos.push(remaining[i], remaining[j]); }
        }
    }
    probabilities.p2 = (counts.p2 / total * 100).toFixed(1);
    probabilities.p3 = (counts.p3 / total * 100).toFixed(1);
}

function drawResetBtn() {
    fill(200); noStroke();
    if (mouseX > 330 && mouseX < 410 && mouseY > 615 && mouseY < 650) fill(170);
    rect(330, 615, 80, 35, 8);
    fill(255); textAlign(CENTER, CENTER); textSize(14); text("重置", 370, 632);
}

function mousePressed() {
    for (let i = 0; i < 16; i++) {
        if (mouseX > cells[i].x && mouseX < cells[i].x + 80 && mouseY > cells[i].y && mouseY < cells[i].y + 80) {
            let index = selected.indexOf(i);
            if (index > -1) selected.splice(index, 1);
            else if (selected.length < 7) selected.push(i);
        }
    }
    if (mouseX > 330 && mouseX < 410 && mouseY > 615 && mouseY < 650) selected = [];
}