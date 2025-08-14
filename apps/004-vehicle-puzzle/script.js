// 乗り物パズルアプリ - シンプル版
class VehiclePuzzleGame {
    constructor() {
        this.currentLevel = null;
        this.selectedPiece = null;
        this.completedPieces = 0;
        this.totalPieces = 0;
        
        // パズルデータ
        this.puzzleData = {
            3: {
                vehicle: '🚗',
                name: 'くるま',
                pieces: ['🚗', '🚙', '🚐'],
                gridClass: 'grid-3'
            },
            4: {
                vehicle: '🚂',
                name: 'でんしゃ', 
                pieces: ['🚂', '🚃', '🚄', '🚅'],
                gridClass: 'grid-4'
            },
            6: {
                vehicle: '✈️',
                name: 'ひこうき',
                pieces: ['✈️', '🛩️', '🚁', '🛸', '🚀', '🛰️'],
                gridClass: 'grid-6'
            }
        };
        
        this.init();
    }

    init() {
        console.log('ゲーム初期化開始');
        
        // レベル選択ボタン
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.currentTarget.dataset.level);
                console.log('レベル選択:', level);
                this.startGame(level);
            });
        });

        // 戻るボタン
        document.getElementById('backBtn').addEventListener('click', () => {
            this.backToMenu();
        });

        // ヒントボタン
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.toggleHint();
        });

        // 祝賀画面のボタン
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartCurrentLevel();
        });

        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.hideCelebration();
            this.backToMenu();
        });
        
        console.log('ゲーム初期化完了');
    }

    startGame(level) {
        console.log('ゲーム開始 - レベル:', level);
        this.currentLevel = level;
        const data = this.puzzleData[level];
        
        // 画面切り替え
        document.getElementById('levelSelection').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        
        // ヘッダー更新
        document.getElementById('currentVehicle').textContent = `${data.vehicle} ${data.name}`;
        
        // パズル初期化
        this.setupPuzzleBoard(data);
        this.setupPieces(data);
        
        // 完成カウンター初期化
        this.completedPieces = 0;
        this.totalPieces = level;
        this.selectedPiece = null;
        
        // ヒント非表示
        document.getElementById('hintImage').classList.add('hidden');
    }

    setupPuzzleBoard(data) {
        const board = document.getElementById('puzzleBoard');
        board.className = `puzzle-board ${data.gridClass}`;
        board.innerHTML = '';
        
        console.log('パズルボード作成:', data.pieces.length, 'スロット');
        
        // スロット作成
        for (let i = 0; i < data.pieces.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.pieceIndex = i;
            slot.dataset.isEmpty = 'true';
            
            // スロットに目標のピースをプレースホルダーとして表示
            const placeholder = document.createElement('div');
            placeholder.className = 'slot-placeholder';
            placeholder.textContent = data.pieces[i];
            slot.appendChild(placeholder);
            
            // スロットクリックイベント
            slot.addEventListener('click', () => {
                console.log('スロット', i, 'がクリックされました');
                this.onSlotClick(slot, i);
            });
            
            // ドロップ機能追加
            slot.addEventListener('dragover', (e) => {
                e.preventDefault(); // ドロップを許可
            });
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                this.onDrop(e, slot, i);
            });
            
            board.appendChild(slot);
        }
    }

    setupPieces(data) {
        const container = document.getElementById('piecesContainer');
        container.innerHTML = '';
        
        console.log('ピース作成:', data.pieces.length, '個');
        
        // ピースをシャッフル
        const shuffledPieces = [...data.pieces].sort(() => Math.random() - 0.5);
        
        shuffledPieces.forEach((pieceText, index) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.textContent = pieceText;
            piece.dataset.originalIndex = data.pieces.indexOf(pieceText);
            piece.dataset.isPlaced = 'false';
            
            // ピースサイズ設定
            this.setPieceSize(piece, data.gridClass);
            
            // ピースクリックイベント
            piece.addEventListener('click', () => {
                console.log('ピース', pieceText, 'がクリックされました');
                this.onPieceClick(piece);
            });
            
            // ドラッグ機能追加
            piece.draggable = true;
            piece.addEventListener('dragstart', (e) => {
                this.onDragStart(e, piece);
            });
            piece.addEventListener('dragend', (e) => {
                this.onDragEnd(e, piece);
            });
            
            container.appendChild(piece);
        });
    }

    setPieceSize(piece, gridClass) {
        switch (gridClass) {
            case 'grid-3':
                piece.style.width = '120px';
                piece.style.height = '80px';
                piece.style.fontSize = '3rem';
                break;
            case 'grid-4':
                piece.style.width = '140px';
                piece.style.height = '140px';
                piece.style.fontSize = '4rem';
                break;
            case 'grid-6':
                piece.style.width = '120px';
                piece.style.height = '120px';
                piece.style.fontSize = '3.5rem';
                break;
        }
    }

    onPieceClick(piece) {
        console.log('ピースクリック処理開始');
        
        // すでに配置済みなら無視
        if (piece.dataset.isPlaced === 'true') {
            console.log('すでに配置済みのピース');
            return;
        }
        
        // 他のピースの選択を解除
        document.querySelectorAll('.puzzle-piece').forEach(p => {
            p.classList.remove('selected');
        });
        
        // このピースを選択
        piece.classList.add('selected');
        this.selectedPiece = piece;
        
        console.log('ピース選択完了:', piece.textContent);
    }

    onSlotClick(slot, slotIndex) {
        console.log('スロットクリック処理開始');
        
        // ピースが選択されていない場合
        if (!this.selectedPiece) {
            console.log('ピースが選択されていません');
            return;
        }
        
        // スロットが既に埋まっている場合
        if (slot.dataset.isEmpty !== 'true') {
            console.log('スロットは既に埋まっています');
            return;
        }
        
        const pieceIndex = parseInt(this.selectedPiece.dataset.originalIndex);
        
        console.log('配置チェック - ピース:', pieceIndex, 'スロット:', slotIndex);
        
        if (pieceIndex === slotIndex) {
            // 正解
            this.placePiece(slot, this.selectedPiece);
            this.completedPieces++;
            console.log('正解！完成数:', this.completedPieces, '/', this.totalPieces);
            
            // 完成チェック
            if (this.completedPieces >= this.totalPieces) {
                setTimeout(() => {
                    this.showCelebration();
                }, 500);
            }
        } else {
            // 不正解
            console.log('不正解');
            this.showIncorrectEffect(this.selectedPiece);
        }
    }

    placePiece(slot, piece) {
        console.log('ピース配置処理');
        
        // スロットにピースを配置
        slot.innerHTML = piece.textContent;
        slot.style.fontSize = piece.style.fontSize;
        slot.style.background = 'rgba(76, 175, 80, 0.2)';
        slot.dataset.isEmpty = 'false';
        
        // 元のピースを非表示
        piece.style.opacity = '0.3';
        piece.dataset.isPlaced = 'true';
        piece.classList.remove('selected');
        
        // 選択解除
        this.selectedPiece = null;
        
        console.log('ピース配置完了');
    }

    showIncorrectEffect(piece) {
        piece.style.background = 'rgba(244, 67, 54, 0.3)';
        setTimeout(() => {
            piece.style.background = '';
        }, 500);
    }

    showCelebration() {
        console.log('祝賀画面表示');
        document.getElementById('celebration').classList.remove('hidden');
    }

    hideCelebration() {
        document.getElementById('celebration').classList.add('hidden');
    }

    toggleHint() {
        const hintImage = document.getElementById('hintImage');
        const hintContent = document.getElementById('hintContent');
        
        if (hintImage.classList.contains('hidden')) {
            const data = this.puzzleData[this.currentLevel];
            hintContent.textContent = data.vehicle;
            hintImage.classList.remove('hidden');
            
            setTimeout(() => {
                hintImage.classList.add('hidden');
            }, 3000);
        } else {
            hintImage.classList.add('hidden');
        }
    }

    restartCurrentLevel() {
        this.hideCelebration();
        this.startGame(this.currentLevel);
    }

    backToMenu() {
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('levelSelection').classList.remove('hidden');
        this.currentLevel = null;
        this.selectedPiece = null;
    }

    // ドラッグ開始
    onDragStart(e, piece) {
        console.log('ドラッグ開始:', piece.textContent);
        // すでに配置済みなら無視
        if (piece.dataset.isPlaced === 'true') {
            e.preventDefault();
            return;
        }
        
        // ドラッグ中のピースを記録
        this.selectedPiece = piece;
        piece.classList.add('dragging');
        
        // ドラッグデータを設定
        e.dataTransfer.setData('text/plain', piece.dataset.originalIndex);
        e.dataTransfer.effectAllowed = 'move';
    }

    // ドラッグ終了
    onDragEnd(e, piece) {
        console.log('ドラッグ終了:', piece.textContent);
        piece.classList.remove('dragging');
        this.selectedPiece = null;
    }

    // ドロップ処理
    onDrop(e, slot, slotIndex) {
        console.log('ドロップ処理開始 - スロット:', slotIndex);
        
        if (!this.selectedPiece) {
            console.log('ドラッグされたピースが見つかりません');
            return;
        }
        
        // スロットが既に埋まっている場合
        if (slot.dataset.isEmpty !== 'true') {
            console.log('スロットは既に埋まっています');
            return;
        }
        
        const pieceOriginalIndex = parseInt(this.selectedPiece.dataset.originalIndex);
        console.log('ピース配置チェック:', pieceOriginalIndex, '→', slotIndex);
        
        // 正しい位置かチェック
        if (pieceOriginalIndex === slotIndex) {
            // 正解
            console.log('正解！');
            this.placePieceInSlot(this.selectedPiece, slot);
            this.showFeedback(true);
            this.completedPieces++;
            
            if (this.completedPieces === this.totalPieces) {
                setTimeout(() => this.showCelebration(), 500);
            }
        } else {
            // 不正解
            console.log('不正解');
            this.showFeedback(false);
        }
        
        this.selectedPiece = null;
    }

    // ピースをスロットに配置
    placePieceInSlot(piece, slot) {
        console.log('ピースをスロットに配置:', piece.textContent);
        
        // プレースホルダーを隠してピースを表示
        const placeholder = slot.querySelector('.slot-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // ピースをスロットに移動
        const pieceContent = document.createElement('div');
        pieceContent.className = 'slot-piece';
        pieceContent.textContent = piece.textContent;
        slot.appendChild(pieceContent);
        
        slot.dataset.isEmpty = 'false';
        slot.classList.add('filled');
        
        // 元のピースを非表示にして配置済みマーク
        piece.style.opacity = '0.3';
        piece.dataset.isPlaced = 'true';
        piece.classList.add('placed');
        piece.draggable = false;
    }

    // フィードバック表示
    showFeedback(isCorrect) {
        console.log('フィードバック表示:', isCorrect ? '正解' : '不正解');
        
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackEl.textContent = isCorrect ? '✓ 正解!' : '✗ もう一度!';
        
        // フィードバック要素をゲーム画面に追加
        const gameScreen = document.getElementById('gameScreen');
        gameScreen.appendChild(feedbackEl);
        
        // アニメーション後に削除
        setTimeout(() => {
            if (feedbackEl.parentNode) {
                feedbackEl.parentNode.removeChild(feedbackEl);
            }
        }, 1500);
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM読み込み完了 - ゲーム作成');
    window.game = new VehiclePuzzleGame();
});