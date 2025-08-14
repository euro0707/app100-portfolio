// 色と形の記憶ゲーム
class MemoryGame {
    constructor() {
        // 形と色のデータ
        this.shapes = ['circle', 'square', 'triangle', 'star'];
        this.colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
        this.shapeNames = {
            circle: '丸',
            square: '四角',
            triangle: '三角',
            star: '星'
        };
        this.colorNames = {
            red: '赤',
            blue: '青',
            green: '緑',
            yellow: '黄',
            purple: '紫',
            orange: 'オレンジ',
            pink: 'ピンク',
            cyan: '水色'
        };

        // ゲーム状態
        this.currentLevel = 1;
        this.maxLevel = 7;
        this.score = 0;
        this.sequence = [];
        this.playerSequence = [];
        this.isShowingSequence = false;
        this.isMemoryPhase = false;
        this.currentSequenceIndex = 0;
        this.gamePhase = 'ready'; // ready, showing, memory, result

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.updatePhase('ready');
        this.updateParentHint('ゲームを開始しましょう！お子さんと一緒にボタンを押してください。');
    }

    setupEventListeners() {
        // ボタンイベント
        document.getElementById('startButton').addEventListener('click', () => this.startLevel());
        document.getElementById('showSequenceButton').addEventListener('click', () => this.showSequence());
        document.getElementById('startMemoryButton').addEventListener('click', () => this.startMemoryPhase());
        document.getElementById('nextLevelButton').addEventListener('click', () => this.nextLevel());
        document.getElementById('restartButton').addEventListener('click', () => this.restartLevel());
        document.getElementById('playAgainButton').addEventListener('click', () => this.restartGame());
    }

    generateSequence() {
        this.sequence = [];
        const sequenceLength = this.currentLevel + 1; // レベル1で2個、レベル2で3個...

        for (let i = 0; i < sequenceLength; i++) {
            const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.sequence.push({ shape, color });
        }

        console.log('Generated sequence:', this.sequence);
    }

    startLevel() {
        this.generateSequence();
        this.playerSequence = [];
        this.currentSequenceIndex = 0;
        
        this.updateStats();
        this.updatePhase('ready-to-show');
        this.updateParentHint(`レベル${this.currentLevel}です。${this.sequence.length}個の形が順番に表示されます。お子さんと一緒に覚えましょう！`);
        
        // ボタンの表示/非表示
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('showSequenceButton').style.display = 'inline-block';
        document.getElementById('startMemoryButton').style.display = 'none';
        document.getElementById('nextLevelButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'none';
    }

    async showSequence() {
        this.isShowingSequence = true;
        this.updatePhase('showing');
        this.updateParentHint('形をよく見て覚えてくださいね！お子さんに「この順番を覚えようね」と声をかけてあげてください。');
        
        // ボタンを隠す
        document.getElementById('showSequenceButton').style.display = 'none';
        
        // シーケンスを表示
        this.renderShapes(this.sequence, false);
        
        // 順番に形をハイライト
        for (let i = 0; i < this.sequence.length; i++) {
            await this.highlightShape(i);
            await this.delay(800); // 少し間隔をあける
        }
        
        this.isShowingSequence = false;
        this.updatePhase('ready-for-memory');
        this.updateParentHint('覚えられましたか？');
        
        // 記憶テスト開始ボタンを表示
        document.getElementById('startMemoryButton').style.display = 'inline-block';
    }

    async highlightShape(index) {
        const shapeElements = document.querySelectorAll('.shape-item');
        if (shapeElements[index]) {
            shapeElements[index].classList.add('active');
            await this.delay(600);
            shapeElements[index].classList.remove('active');
        }
    }

    startMemoryPhase() {
        this.isMemoryPhase = true;
        this.updatePhase('memory');
        this.updateParentHint(`順番にタップしてください！${this.playerSequence.length + 1}番目は何だったかな？`);
        
        // ボタンを隠す
        document.getElementById('startMemoryButton').style.display = 'none';
        
        // 形を再レンダリング（クリック可能にする）
        this.renderShapes(this.sequence, true);
    }

    renderShapes(sequence, clickable = false) {
        const grid = document.getElementById('shapesGrid');
        grid.innerHTML = '';

        sequence.forEach((item, index) => {
            const shapeDiv = document.createElement('div');
            shapeDiv.className = 'shape-item fade-in';
            if (!clickable) {
                shapeDiv.classList.add('disabled');
            }
            
            const shape = document.createElement('div');
            shape.className = `shape ${item.shape} color-${item.color}`;
            
            shapeDiv.appendChild(shape);
            
            if (clickable) {
                shapeDiv.addEventListener('click', () => this.handleShapeClick(index, item));
            }
            
            grid.appendChild(shapeDiv);
        });
    }

    handleShapeClick(index, item) {
        if (!this.isMemoryPhase) return;

        const expectedIndex = this.playerSequence.length;
        const expectedItem = this.sequence[expectedIndex];
        
        console.log(`Clicked: ${item.shape}-${item.color}, Expected: ${expectedItem.shape}-${expectedItem.color}`);
        
        if (item.shape === expectedItem.shape && item.color === expectedItem.color) {
            // 正解
            this.playerSequence.push(item);
            this.showShapeResult(index, true);
            
            if (this.playerSequence.length === this.sequence.length) {
                // レベルクリア
                setTimeout(() => this.levelComplete(), 500);
            } else {
                // 次の形を待つ
                this.updateParentHint(`正解！次は${this.playerSequence.length + 1}番目の形をタップしてね。`);
            }
        } else {
            // 不正解
            this.showShapeResult(index, false);
            setTimeout(() => this.levelFailed(), 1000);
        }
    }

    showShapeResult(index, isCorrect) {
        const shapeElements = document.querySelectorAll('.shape-item');
        if (shapeElements[index]) {
            shapeElements[index].classList.add(isCorrect ? 'correct' : 'incorrect');
        }
    }

    levelComplete() {
        this.isMemoryPhase = false;
        this.score += this.currentLevel * 10;
        
        this.showResult(true, '🎉 正解！素晴らしい記憶力です！');
        this.updateStats();
        
        if (this.currentLevel >= this.maxLevel) {
            // ゲーム完了
            setTimeout(() => this.gameComplete(), 2000);
        } else {
            // 次のレベルへ
            this.updateParentHint('レベルクリア！次のレベルに挑戦しますか？');
            document.getElementById('nextLevelButton').style.display = 'inline-block';
        }
    }

    levelFailed() {
        this.isMemoryPhase = false;
        
        const correctShape = this.sequence[this.playerSequence.length];
        const shapeName = this.shapeNames[correctShape.shape];
        const colorName = this.colorNames[correctShape.color];
        
        this.showResult(false, `😊 もう一度挑戦しよう！\n正解は${colorName}の${shapeName}でした。`);
        this.updateParentHint(`正解は${colorName}の${shapeName}でした。お子さんと一緒にもう一度挑戦してみましょう！`);
        
        document.getElementById('restartButton').style.display = 'inline-block';
    }

    showResult(isCorrect, message) {
        const resultArea = document.getElementById('resultArea');
        const resultMessage = document.getElementById('resultMessage');
        const resultAnimation = document.getElementById('resultAnimation');
        
        resultArea.style.display = 'block';
        resultArea.className = `result-area ${isCorrect ? 'correct' : 'incorrect'}`;
        resultMessage.textContent = message;
        resultAnimation.textContent = isCorrect ? '🎉' : '😊';
    }

    hideResult() {
        document.getElementById('resultArea').style.display = 'none';
    }

    nextLevel() {
        this.currentLevel++;
        this.hideResult();
        this.updatePhase('ready');
        this.updateParentHint(`レベル${this.currentLevel}に挑戦！`);
        
        // ボタンをリセット
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('nextLevelButton').style.display = 'none';
        
        // 形をクリア
        document.getElementById('shapesGrid').innerHTML = '';
    }

    restartLevel() {
        this.hideResult();
        this.updatePhase('ready');
        this.updateParentHint('もう一度挑戦しましょう！今度はきっとできます。');
        
        // ボタンをリセット
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('restartButton').style.display = 'none';
        
        // 形をクリア
        document.getElementById('shapesGrid').innerHTML = '';
    }

    gameComplete() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.maxLevel;
        document.getElementById('completionScreen').style.display = 'flex';
        
        // 祝賀エフェクト
        this.showCelebration();
    }

    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.sequence = [];
        this.playerSequence = [];
        this.isShowingSequence = false;
        this.isMemoryPhase = false;
        
        document.getElementById('completionScreen').style.display = 'none';
        this.hideResult();
        this.updateStats();
        this.updatePhase('ready');
        this.updateParentHint('新しいゲームを始めましょう！お子さんと一緒に楽しんでください。');
        
        // ボタンをリセット
        document.getElementById('startButton').style.display = 'inline-block';
        document.getElementById('showSequenceButton').style.display = 'none';
        document.getElementById('startMemoryButton').style.display = 'none';
        document.getElementById('nextLevelButton').style.display = 'none';
        document.getElementById('restartButton').style.display = 'none';
        
        // 形をクリア
        document.getElementById('shapesGrid').innerHTML = '';
    }

    updateStats() {
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('shapeCount').textContent = this.currentLevel + 1;
        document.getElementById('score').textContent = this.score;
    }

    updatePhase(phase) {
        this.gamePhase = phase;
        const phaseTitle = document.getElementById('phaseTitle');
        const phaseDescription = document.getElementById('phaseDescription');
        
        switch (phase) {
            case 'ready':
                phaseTitle.textContent = '準備完了！';
                phaseDescription.textContent = 'ゲームを始める準備ができました';
                break;
            case 'ready-to-show':
                phaseTitle.textContent = '順番を見せるよ！';
                phaseDescription.textContent = 'これから形が順番に表示されます';
                break;
            case 'showing':
                phaseTitle.textContent = '順番を覚えよう！';
                phaseDescription.textContent = '光る順番をよく見て覚えてね';
                break;
            case 'ready-for-memory':
                phaseTitle.textContent = '覚えられたかな？';
                phaseDescription.textContent = '同じ順番でタップしてみよう';
                break;
            case 'memory':
                phaseTitle.textContent = 'タップしてみよう！';
                phaseDescription.textContent = '覚えた順番でタップしてね';
                break;
        }
    }

    updateParentHint(text) {
        document.getElementById('parentHintText').textContent = text;
    }

    showCelebration() {
        // 簡単な祝賀エフェクト
        const celebration = () => {
            const emoji = ['🎉', '🎊', '✨', '🌟', '🎈', '🏆'][Math.floor(Math.random() * 6)];
            const element = document.createElement('div');
            element.textContent = emoji;
            element.style.position = 'fixed';
            element.style.left = Math.random() * window.innerWidth + 'px';
            element.style.top = '0px';
            element.style.fontSize = '2rem';
            element.style.pointerEvents = 'none';
            element.style.zIndex = '1000';
            
            document.body.appendChild(element);
            
            // アニメーション
            let pos = 0;
            const fall = setInterval(() => {
                pos += 5;
                element.style.top = pos + 'px';
                
                if (pos > window.innerHeight) {
                    clearInterval(fall);
                    document.body.removeChild(element);
                }
            }, 50);
        };

        // 複数の祝賀エフェクトを実行
        for (let i = 0; i < 15; i++) {
            setTimeout(celebration, i * 200);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // デバッグ用メソッド
    debugShowSequence() {
        console.log('Current sequence:', this.sequence.map(item => 
            `${this.colorNames[item.color]}の${this.shapeNames[item.shape]}`
        ));
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    const game = new MemoryGame();
    
    // デバッグ用にグローバルに公開
    window.game = game;
    
    console.log('🧠 色と形の記憶ゲーム開始！');
    console.log('デバッグ: game.debugShowSequence() で現在のシーケンスを確認できます');
});