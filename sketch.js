let cells = [];
let selected = [];
let probabilities = { p1: 0, p2: 0, p3: 0 };
let bestCombos = [];
let pointSlider;
let targetMode = 0; // 0: 保2拚3, 1: 全衝3線

const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15], [3, 6, 9, 12]
];

function setup() {
    let canvas = createCanvas(650, 750);
    canvas.elt.oncontextmenu = () => false;

    pointSlider = createSlider(0, 9, 2);
    pointSlider.parent(canvas.parent());
    pointSlider.position(50, 670);
    pointSlider.style('width', '200px');

    for (let i = 0; i < 16; i++) {
        let x = (i % 4) * 85 + 40;
        let y = Math.floor(i / 4) * 85 + 100;
        cells.push({ x, y, id: i });
    }
}

function draw() {
    background(250);
    drawUI();

    for (let i = 0; i < 16; i++) {
        let isSelected = selected.includes(i);
        stroke(220);
        fill(isSelected ? "#FFD700" : "#FFF");
        rect(cells[i].x, cells[i].y, 75, 75, 10);
        if (isSelected) {
            fill(255, 140, 0); noStroke(); textAlign(CENTER, CENTER);
            textSize(30); text("★", cells[i].x + 37, cells[i].y + 40);
        }
    }

    if (selected.length === 7) {
        calculateProb();
        drawSmartAnalysis();
    } else {
        fill(100); textAlign(LEFT); textSize(16);
        text(`請標記目前的 7 個貼紙 (${selected.length}/7)`, 40, height - 230);
    }

    drawInstructions();
    drawPointsUI();
    drawResetBtn();
    drawModeToggle();
}

function drawUI() {
    fill("#4a69bd"); rect(0, 0, width, 70);
    fill(255); textAlign(CENTER); textSize(24); textStyle(BOLD);
    text("流光旅人公會: 天書奇談分析器", 325, 45);
}

function drawInstructions() {
    let startX = 400;
    fill("#FFF"); stroke("#4a69bd"); strokeWeight(2);
    rect(startX, 100, 220, 380, 10);
    noStroke(); fill("#4a69bd"); textAlign(LEFT); textStyle(BOLD);
    textSize(18); text("📖 新手使用指南", startX + 15, 135);
    textStyle(NORMAL); textSize(14); fill(60);
    let steps = [
        "① 點擊左側標記 7 個貼紙。",
        "② 設定您的剩餘奇想點數。",
        "③ 【重要】切換您的目標：",
        "   - 保 2 拚 3：優先拿獎勵。",
        "   - 全衝 3 線：不中就洗牌。",
        "④ 觀察 建議區：",
        "   - 紅圈：達成 3 線關鍵格。",
        "   - 顏色：藍(穩)/綠(優)/紅(死)。",
        "",
        "💡 提示：洗牌一次扣 2 點。"
    ];
    for (let i = 0; i < steps.length; i++) text(steps[i], startX + 15, 170 + (i * 22));
}

function drawModeToggle() {
    let x = 400, y = 500, w = 220, h = 50;
    fill(targetMode === 0 ? "#3498db" : "#e67e22"); // 保2用藍色，全衝用橘色
    rect(x, y, w, h, 8);
    fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(16);
    let modeText = targetMode === 0 ? "模式：保 2 拚 3" : "模式：全衝 3 線";
    text(modeText, x + w / 2, y + h / 2);
}

function drawSmartAnalysis() {
    let p3 = float(probabilities.p3);
    let p2 = float(probabilities.p2);
    let pts = pointSlider.value();
    let advice = "";
    let riskTip = "";
    let adviceCol = "#666";

    if (targetMode === 1) { // --- 全衝 3 線模式 ---
        if (p3 === 0) {
            advice = "【死局】無 3 線可能";
            riskTip = "目標是 3 線，此版面機率為 0，請洗牌。";
            adviceCol = "#e74c3c";
        } else if (p3 >= 8) {
            advice = "【神陣】絕對保留";
            riskTip = "三線機率極高，這就是你要的。";
            adviceCol = "#2ecc71";
        } else if (pts >= 4 && p3 < 4) {
            advice = "【洗牌】機率太低";
            riskTip = "點數充足，洗出更高機率再開。";
            adviceCol = "#f39c12";
        } else {
            advice = "【直接開獎】";
            riskTip = "有機會但點數不多，直接賭了。";
            adviceCol = "#2ecc71";
        }
    } else { // --- 保 2 拚 3 模式 ---
        if (p3 === 0) {
            if (p2 >= 20) {
                advice = "【保留】穩拿二線";
                riskTip = "雖然 3 線已封死，但 2 線機率不錯。";
                adviceCol = "#3498db";
            } else {
                advice = "【死局】建議洗牌";
                riskTip = "3 線為 0 且 2 線也難，洗牌重生。";
                adviceCol = "#e74c3c";
            }
        } else if (p3 >= 2.5) {
            advice = "【保留】拚 3 兼保 2";
            riskTip = "目前佈局優良，推薦直接開獎。";
            adviceCol = "#2ecc71";
        } else if (p2 >= 30) {
            advice = "【保留】二線極穩";
            riskTip = "為了二線獎勵，不建議洗牌。";
            adviceCol = "#3498db";
        } else if (pts >= 4) {
            advice = "【洗牌】期待更好";
            riskTip = "二三線機率都普通，點數夠就洗。";
            adviceCol = "#f39c12";
        } else {
            advice = "【直接開獎】";
            riskTip = "沒點數洗了，祝你好運。";
            adviceCol = "#95a5a6";
        }
    }

    // 繪製建議區
    strokeWeight(2); stroke(adviceCol); fill(255);
    rect(40, height - 210, 320, 110, 15);
    noStroke(); fill(adviceCol); textAlign(LEFT);
    textSize(18); textStyle(BOLD); text(advice, 60, height - 175);
    textSize(13); textStyle(NORMAL); text(riskTip, 60, height - 150);
    textSize(14); text(`3 線: ${probabilities.p3}%  |  2 線: ${probabilities.p2}%`, 60, height - 120);

    // 紅圈標示達成 3 線的關鍵空格
    bestCombos.forEach(spot => {
        noFill(); stroke(231, 76, 60, 200); strokeWeight(4);
        ellipse(cells[spot].x + 37, cells[spot].y + 37, 55);
    });
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

function drawPointsUI() {
    let pts = pointSlider.value();
    fill(50); textAlign(LEFT); textSize(16); textStyle(BOLD);
    text(`剩餘奇想點: ${pts}`, 40, 650);
    textStyle(NORMAL); textSize(12); fill(100);
    text("(洗牌需消耗 2 點)", 40, 705);
}

function drawResetBtn() {
    fill(200); noStroke();
    if (mouseX > 280 && mouseX < 360 && mouseY > 640 && mouseY < 675) fill(170);
    rect(280, 640, 80, 35, 8);
    fill(255); textAlign(CENTER, CENTER); textSize(14); text("重置", 320, 657);
}

function mousePressed() {
    for (let i = 0; i < 16; i++) {
        if (mouseX > cells[i].x && mouseX < cells[i].x + 75 && mouseY > cells[i].y && mouseY < cells[i].y + 75) {
            let index = selected.indexOf(i);
            if (index > -1) selected.splice(index, 1);
            else if (selected.length < 7) selected.push(i);
        }
    }
    if (mouseX > 280 && mouseX < 360 && mouseY > 640 && mouseY < 675) selected = [];
    if (mouseX > 400 && mouseX < 620 && mouseY > 500 && mouseY < 550) targetMode = targetMode === 0 ? 1 : 0;
}