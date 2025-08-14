class OrekunaQuiz {
    constructor() {
        this.questions = [];
        this.comments = {};
        this.currentQuestion = null;
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.isEraser = false;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupCanvas();
        this.setupEventListeners();
        // 初期化：すべての画面を非表示にしてからゲーム画面のみ表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        this.startNewQuestion();
    }

    async loadData() {
        // データを直接埋め込み
        this.questions = [
            {
                "id": 1,
                "hint": "まるくて　あかい　くだもの",
                "answer": "りんご",
                "wrongCandidates": ["トマト", "さくらんぼ", "すいか"]
            },
            {
                "id": 2,
                "hint": "ながくて　きいろい　くだもの",
                "answer": "バナナ",
                "wrongCandidates": ["とうもろこし", "レモン", "パイナップル"]
            },
            {
                "id": 3,
                "hint": "しろくて　ふわふわ　そらにうかんでる",
                "answer": "くも",
                "wrongCandidates": ["わたがし", "ひつじ", "ゆき"]
            },
            {
                "id": 4,
                "hint": "みずのなかで　およぐ　きんいろのいきもの",
                "answer": "きんぎょ",
                "wrongCandidates": ["さかな", "たい", "まぐろ"]
            },
            {
                "id": 5,
                "hint": "よるになると　ひかる　まんまる",
                "answer": "つき",
                "wrongCandidates": ["たいよう", "でんきゅう", "ほし"]
            },
            {
                "id": 6,
                "hint": "ちちゃくて　あかい　てんてんがある　むし",
                "answer": "てんとうむし",
                "wrongCandidates": ["ちょうちょ", "はち", "あり"]
            },
            {
                "id": 7,
                "hint": "たかくて　みどりで　とりがすんでる",
                "answer": "き",
                "wrongCandidates": ["くさ", "はな", "やま"]
            },
            {
                "id": 8,
                "hint": "あまくて　つめたい　なつにたべる",
                "answer": "アイスクリーム",
                "wrongCandidates": ["かきごおり", "ジュース", "すいか"]
            },
            {
                "id": 9,
                "hint": "4つのあしで　はしって　わんわんなく",
                "answer": "いぬ",
                "wrongCandidates": ["ねこ", "うま", "ぞう"]
            },
            {
                "id": 10,
                "hint": "あおくて　ひろくて　おおきい　みず",
                "answer": "うみ",
                "wrongCandidates": ["いけ", "かわ", "プール"]
            }
        ];

        this.comments = {
            "thinking": [
                "AIが考え中…",
                "うーん…これは…",
                "まってね、見てるよ〜",
                "どれどれ…",
                "むむむ…これは何かな？",
                "えーっと…"
            ],
            "correct": [
                "これは{answer}だね！すごいね！",
                "ピンポーン！{answer}だ！よくかけたね！",
                "せいかい！{answer}だね！とってもじょうず！",
                "あたり！{answer}だった！すてきな絵だね！",
                "大正解！{answer}だね！かっこいい！"
            ],
            "almost": [
                "うーん…{wrong}かな？でもよくかけてるね！",
                "{wrong}にも見えるね！すごいじょうず！",
                "もしかして{wrong}？でもとってもいい絵だね！",
                "{wrong}かな？でもかわいくかけてる！",
                "あー！{wrong}だね！でもじょうずだよ！"
            ]
        };
    }

    setupCanvas() {
        this.canvas = document.getElementById('drawing-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas設定
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 3;
        
        // 背景を白に設定
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        // 描画イベント（マウス）
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // 描画イベント（タッチ）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });

        // カラーボタン
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.color-btn.active').classList.remove('active');
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
                this.isEraser = false;
                document.getElementById('eraser-btn').classList.remove('active');
            });
        });

        // 消しゴム
        document.getElementById('eraser-btn').addEventListener('click', () => {
            this.isEraser = !this.isEraser;
            document.getElementById('eraser-btn').classList.toggle('active');
            if (this.isEraser) {
                document.querySelector('.color-btn.active').classList.remove('active');
            }
        });

        // 全消し
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearCanvas();
        });

        // 完了ボタン
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.submitDrawing();
        });

        // もう1回ボタン
        document.getElementById('next-btn').addEventListener('click', () => {
            this.startNewQuestion();
        });
    }

    getCanvasPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getCanvasPosition(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getCanvasPosition(e);
        
        if (this.isEraser) {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineWidth = 10;
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = 3;
        }
        
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startNewQuestion() {
        // ランダムに問題を選択
        this.currentQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];
        
        // ヒントを表示
        document.getElementById('hint-text').textContent = this.currentQuestion.hint;
        
        // キャンバスをクリア
        this.clearCanvas();
        
        // 描画設定を初期化
        this.currentColor = '#000000';
        this.isEraser = false;
        
        // UIの状態をリセット
        document.querySelector('.color-btn.active')?.classList.remove('active');
        document.querySelector('.color-btn[data-color="#000000"]').classList.add('active');
        document.getElementById('eraser-btn').classList.remove('active');
        
        // ゲーム画面を表示
        this.showScreen('game-screen');
    }

    submitDrawing() {
        // 描いた絵を結果画面にコピー
        const resultCanvas = document.getElementById('result-canvas');
        const resultCtx = resultCanvas.getContext('2d');
        
        // 結果画面のキャンバスをクリア
        resultCtx.fillStyle = 'white';
        resultCtx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
        
        // 元の絵を縮小してコピー
        resultCtx.drawImage(this.canvas, 0, 0, resultCanvas.width, resultCanvas.height);
        
        // AI判定画面を表示
        this.showThinkingScreen();
    }

    showThinkingScreen() {
        this.showScreen('thinking-screen');
        
        // ランダムな考え中メッセージを表示
        const thinkingMessages = this.comments.thinking;
        const randomMessage = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
        document.getElementById('thinking-text').textContent = randomMessage;
        
        // 2-4秒後に結果を表示
        const thinkingTime = 2000 + Math.random() * 2000;
        setTimeout(() => {
            this.showResult();
        }, thinkingTime);
    }

    showResult() {
        // 正解か不正解かをランダムに決定（70%の確率で正解）
        const isCorrect = Math.random() < 0.7;
        
        let resultMessage;
        if (isCorrect) {
            // 正解のメッセージ
            const correctMessages = this.comments.correct;
            const randomMessage = correctMessages[Math.floor(Math.random() * correctMessages.length)];
            resultMessage = randomMessage.replace('{answer}', this.currentQuestion.answer);
        } else {
            // 惜しいメッセージ
            const almostMessages = this.comments.almost;
            const wrongCandidates = this.currentQuestion.wrongCandidates;
            const randomWrong = wrongCandidates[Math.floor(Math.random() * wrongCandidates.length)];
            const randomMessage = almostMessages[Math.floor(Math.random() * almostMessages.length)];
            resultMessage = randomMessage.replace('{wrong}', randomWrong);
        }
        
        document.getElementById('result-text').textContent = resultMessage;
        this.showScreen('result-screen');
    }

    showScreen(screenId) {
        // すべての画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 指定された画面を表示
        document.getElementById(screenId).classList.add('active');
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', () => {
    new OrekunaQuiz();
});