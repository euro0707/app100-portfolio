// 動物と食べ物マッチングゲーム
class AnimalFoodMatchingGame {
    constructor() {
        // ゲームデータ
        this.animalFoodPairs = [
            { animal: { emoji: '🦁', name: 'ライオン' }, food: { emoji: '🥩', name: 'お肉' } },
            { animal: { emoji: '🐰', name: 'ウサギ' }, food: { emoji: '🥕', name: 'にんじん' } },
            { animal: { emoji: '🐼', name: 'パンダ' }, food: { emoji: '🎋', name: 'たけ' } },
            { animal: { emoji: '🐵', name: 'サル' }, food: { emoji: '🍌', name: 'バナナ' } },
            { animal: { emoji: '🐨', name: 'コアラ' }, food: { emoji: '🌿', name: 'ユーカリ' } }
        ];

        // ゲーム状態
        this.currentStep = 0;
        this.correctCount = 0;
        this.attemptCount = 0;
        this.selectedAnimal = null;
        this.selectedFood = null;
        this.gameCompleted = false;
        this.autoProgressTimer = null;

        this.init();
    }

    init() {
        this.shuffleGame();
        this.renderGame();
        this.setupEventListeners();
        this.updateStats();
        this.showHint();
    }

    shuffleGame() {
        // ペアをシャッフル
        this.animalFoodPairs = this.animalFoodPairs.sort(() => Math.random() - 0.5);
    }

    renderGame() {
        this.renderAnimals();
        this.renderFoods();
        this.updateSelectionDisplay();
    }

    renderAnimals() {
        const animalsGrid = document.getElementById('animalsGrid');
        animalsGrid.innerHTML = '';

        this.animalFoodPairs.forEach((pair, index) => {
            const animalCard = this.createItemCard(pair.animal, 'animal', index);
            animalsGrid.appendChild(animalCard);
        });
    }

    renderFoods() {
        const foodsGrid = document.getElementById('foodsGrid');
        foodsGrid.innerHTML = '';

        // 食べ物をシャッフルして表示
        const shuffledFoods = [...this.animalFoodPairs].sort(() => Math.random() - 0.5);
        shuffledFoods.forEach((pair, index) => {
            const foodCard = this.createItemCard(pair.food, 'food', index);
            foodsGrid.appendChild(foodCard);
        });
    }

    createItemCard(item, type, index) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.type = type;
        card.dataset.index = index;
        card.dataset.name = item.name;

        card.innerHTML = `
            <div class="item-emoji">${item.emoji}</div>
            <div class="item-name">${item.name}</div>
        `;

        card.addEventListener('click', () => this.selectItem(card, item, type));

        return card;
    }

    selectItem(card, item, type) {
        console.log(`🔍 selectItem: ${item.name} (${type}), currentStep: ${this.currentStep}, completed: ${card.classList.contains('completed')}`);
        
        // 現在のステップのペアが正解済みの場合は選択不可
        if (this.currentStep >= this.animalFoodPairs.length) {
            console.log('❌ ゲーム終了済み - 選択不可');
            return;
        }
        
        // 無効化されたカードは選択不可
        if (card.classList.contains('completed') || card.style.pointerEvents === 'none') {
            console.log('❌ 無効化されたカード - 選択不可');
            return;
        }

        // 自動進行タイマーをキャンセル（ユーザーが次の選択を始めた場合）
        if (this.autoProgressTimer) {
            console.log('⏰ 自動進行をキャンセル - ユーザーが選択中');
            clearTimeout(this.autoProgressTimer);
            this.autoProgressTimer = null;
            
            // currentStepを手動で進める（自動進行がキャンセルされたため）
            this.currentStep++;
            console.log(`📈 currentStep手動更新: ${this.currentStep}`);
            
            // 次へボタンを非表示にして、チェックボタンを有効にする
            document.getElementById('nextButton').style.display = 'none';
            document.getElementById('checkButton').style.display = 'inline-block';
            document.getElementById('resetButton').style.display = 'inline-block';
            // 結果エリアも非表示にする
            this.hideResult();
            // 統計とヒントを更新
            this.updateStats();
            this.updateHint();
            // 完了済みカードを無効化
            this.disableCompletedCards();
        }

        // 同じタイプの他のカードの選択状態をリセット
        document.querySelectorAll(`.item-card[data-type="${type}"]`).forEach(c => {
            c.classList.remove('selected');
        });

        // 現在のカードを選択状態に
        card.classList.add('selected');

        if (type === 'animal') {
            this.selectedAnimal = item;
            console.log(`✅ 動物選択: ${item.name}`);
        } else {
            this.selectedFood = item;
            console.log(`✅ 食べ物選択: ${item.name}`);
        }

        this.updateSelectionDisplay();
        this.updateCheckButton();
        this.updateHint();
    }

    updateSelectionDisplay() {
        const selectedAnimalDiv = document.getElementById('selectedAnimal');
        const selectedFoodDiv = document.getElementById('selectedFood');

        if (this.selectedAnimal) {
            selectedAnimalDiv.innerHTML = `${this.selectedAnimal.emoji} ${this.selectedAnimal.name}`;
            selectedAnimalDiv.classList.add('filled');
        } else {
            selectedAnimalDiv.innerHTML = '選択してください';
            selectedAnimalDiv.classList.remove('filled');
        }

        if (this.selectedFood) {
            selectedFoodDiv.innerHTML = `${this.selectedFood.emoji} ${this.selectedFood.name}`;
            selectedFoodDiv.classList.add('filled');
        } else {
            selectedFoodDiv.innerHTML = '選択してください';
            selectedFoodDiv.classList.remove('filled');
        }
    }

    updateCheckButton() {
        const checkButton = document.getElementById('checkButton');
        const shouldEnable = !!(this.selectedAnimal && this.selectedFood);
        checkButton.disabled = !shouldEnable;
        console.log(`🔘 checkButton: ${shouldEnable ? 'enabled' : 'disabled'} (動物: ${this.selectedAnimal?.name || 'なし'}, 食べ物: ${this.selectedFood?.name || 'なし'})`);
    }

    setupEventListeners() {
        // チェックボタン
        document.getElementById('checkButton').addEventListener('click', () => {
            console.log(`🔥 checkButton clicked! currentStep: ${this.currentStep}, 動物: ${this.selectedAnimal?.name}, 食べ物: ${this.selectedFood?.name}`);
            this.checkMatch();
        });

        // リセットボタン
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetSelection();
        });

        // 次のステップボタン
        document.getElementById('nextButton').addEventListener('click', () => {
            this.nextStep();
        });

        // もう一度遊ぶボタン
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.restartGame();
        });
    }

    checkMatch() {
        if (!this.selectedAnimal || !this.selectedFood) return;

        this.attemptCount++;
        
        // 現在のステップの正解ペア
        const correctPair = this.animalFoodPairs[this.currentStep];
        const isCorrect = this.selectedAnimal.name === correctPair.animal.name && 
                         this.selectedFood.name === correctPair.food.name;
        
        console.log(`ステップ ${this.currentStep + 1}: ${this.selectedAnimal.name} + ${this.selectedFood.name} = ${isCorrect ? '正解' : '不正解'}`);
        console.log(`正解: ${correctPair.animal.name} + ${correctPair.food.name}`);

        this.showResult(isCorrect);
        
        if (isCorrect) {
            this.correctCount++;
            this.highlightCorrectCards();
            
            // 正解したカードを即座に無効化
            setTimeout(() => {
                this.disableCompletedCards();
            }, 100);
            
            // 正解時のヒント更新
            setTimeout(() => {
                this.updateHintForCorrectAnswer();
            }, 1000);
            
            // まず次へボタンを表示
            setTimeout(() => {
                this.showNextButton();
            }, 1500);
            
            // その後自動進行
            this.autoProgressTimer = setTimeout(() => {
                console.log('⏰ 自動進行タイマー発火');
                this.currentStep++;
                if (this.currentStep >= this.animalFoodPairs.length) {
                    this.completeGame();
                } else {
                    this.nextStep();
                }
                this.autoProgressTimer = null;
            }, 3000);
        } else {
            this.highlightIncorrectCards();
            
            // 間違い時のヒント更新
            setTimeout(() => {
                this.updateHintForIncorrectAnswer();
            }, 1000);
            
            setTimeout(() => {
                this.hideResult();
                // 間違い後にヒントを元に戻す
                setTimeout(() => {
                    this.updateHint();
                }, 500);
            }, 2000);
        }

        this.updateStats();
    }

    showResult(isCorrect) {
        const resultArea = document.getElementById('resultArea');
        const resultMessage = document.getElementById('resultMessage');
        const resultAnimation = document.getElementById('resultAnimation');

        resultArea.style.display = 'block';
        resultArea.className = `result-area ${isCorrect ? 'correct' : 'incorrect'}`;

        if (isCorrect) {
            resultMessage.textContent = '🎉 正解！よくできました！';
            resultAnimation.textContent = '✨';
        } else {
            resultMessage.textContent = '😊 もう一度挑戦してみよう！';
            resultAnimation.textContent = '💪';
        }
    }

    hideResult() {
        document.getElementById('resultArea').style.display = 'none';
    }

    highlightCorrectCards() {
        document.querySelectorAll('.item-card.selected').forEach(card => {
            card.classList.add('correct');
            card.classList.remove('selected');
        });
    }

    highlightIncorrectCards() {
        document.querySelectorAll('.item-card.selected').forEach(card => {
            card.classList.add('incorrect');
            setTimeout(() => {
                card.classList.remove('incorrect', 'selected');
            }, 600);
        });
    }

    showNextButton() {
        document.getElementById('checkButton').style.display = 'none';
        document.getElementById('resetButton').style.display = 'none';
        document.getElementById('nextButton').style.display = 'inline-block';
    }

    nextStep() {
        console.log(`🔄 nextStep: ${this.currentStep} → ${this.currentStep + 1}`);
        
        // 自動進行タイマーをクリア
        if (this.autoProgressTimer) {
            clearTimeout(this.autoProgressTimer);
            this.autoProgressTimer = null;
        }
        
        // UI をリセット
        document.getElementById('checkButton').style.display = 'inline-block';
        document.getElementById('resetButton').style.display = 'inline-block';
        document.getElementById('nextButton').style.display = 'none';
        
        this.resetSelection();
        this.hideResult();
        this.updateStats();
        this.updateHint(); // showHint() の代わりに updateHint() を使用

        // 全ての正解済みカードを無効化（累積的に）
        this.disableCompletedCards();
        
        console.log(`✅ nextStep完了: currentStep = ${this.currentStep}`);
    }

    resetSelection() {
        this.selectedAnimal = null;
        this.selectedFood = null;
        
        document.querySelectorAll('.item-card').forEach(card => {
            if (!card.classList.contains('correct')) {
                card.classList.remove('selected', 'incorrect');
            }
        });

        this.updateSelectionDisplay();
        this.updateCheckButton();
        this.updateHint();
    }

    updateStats() {
        document.getElementById('currentStep').textContent = this.currentStep + 1;
        document.getElementById('totalSteps').textContent = this.animalFoodPairs.length;
        document.getElementById('correctCount').textContent = this.correctCount;
        document.getElementById('attemptCount').textContent = this.attemptCount;
    }

    showHint() {
        const hintText = document.getElementById('hintText');
        
        if (this.currentStep < this.animalFoodPairs.length) {
            const currentPair = this.animalFoodPairs[this.currentStep];
            hintText.textContent = `${currentPair.animal.emoji} ${currentPair.animal.name}は何を食べるかな？`;
        } else {
            hintText.textContent = 'すべてのペアを見つけました！';
        }
    }

    updateHint() {
        const hintText = document.getElementById('hintText');
        
        if (this.currentStep >= this.animalFoodPairs.length) {
            hintText.textContent = 'すべてのペアを見つけました！';
            return;
        }

        const currentPair = this.animalFoodPairs[this.currentStep];

        if (!this.selectedAnimal && !this.selectedFood) {
            // 何も選択していない状態
            hintText.textContent = `${currentPair.animal.emoji} ${currentPair.animal.name}は何を食べるかな？`;
        } else if (this.selectedAnimal && !this.selectedFood) {
            // 動物を選択済み
            if (this.selectedAnimal.name === currentPair.animal.name) {
                hintText.textContent = `${this.selectedAnimal.emoji} ${this.selectedAnimal.name}が選ばれました！今度は食べ物を選んでね`;
            } else {
                hintText.textContent = `${currentPair.animal.emoji} ${currentPair.animal.name}を選んでね`;
            }
        } else if (!this.selectedAnimal && this.selectedFood) {
            // 食べ物を選択済み
            hintText.textContent = `${this.selectedFood.emoji} ${this.selectedFood.name}が選ばれました！今度は動物を選んでね`;
        } else {
            // 両方選択済み
            hintText.textContent = `${this.selectedAnimal.emoji} ${this.selectedAnimal.name}と${this.selectedFood.emoji} ${this.selectedFood.name}が選ばれました！ペアをチェックしてみよう！`;
        }
    }

    updateHintForCorrectAnswer() {
        const hintText = document.getElementById('hintText');
        
        if (this.currentStep + 1 < this.animalFoodPairs.length) {
            const nextPair = this.animalFoodPairs[this.currentStep + 1];
            hintText.textContent = `🎉 正解！次は${nextPair.animal.emoji} ${nextPair.animal.name}のペアを見つけてね！`;
        } else {
            hintText.textContent = '🎉 正解！もうすぐゴールです！';
        }
    }

    updateHintForIncorrectAnswer() {
        const hintText = document.getElementById('hintText');
        const currentPair = this.animalFoodPairs[this.currentStep];
        
        // どちらが間違っているかを判定してヒントを出す
        const isAnimalCorrect = this.selectedAnimal && this.selectedAnimal.name === currentPair.animal.name;
        const isFoodCorrect = this.selectedFood && this.selectedFood.name === currentPair.food.name;
        
        if (!isAnimalCorrect && !isFoodCorrect) {
            // 両方間違い
            hintText.textContent = `💡 ${currentPair.animal.emoji} ${currentPair.animal.name}と${currentPair.food.emoji} ${currentPair.food.name}が正解だよ！もう一度挑戦してね`;
        } else if (!isAnimalCorrect) {
            // 動物が間違い
            hintText.textContent = `💡 正解は${currentPair.animal.emoji} ${currentPair.animal.name}だよ！${currentPair.food.emoji} ${currentPair.food.name}は合ってるね`;
        } else if (!isFoodCorrect) {
            // 食べ物が間違い
            hintText.textContent = `💡 ${currentPair.animal.emoji} ${currentPair.animal.name}は合ってるね！正解は${currentPair.food.emoji} ${currentPair.food.name}だよ`;
        }
    }

    disableCompletedCards() {
        // 正解済みカード(.correct)を全て無効化
        document.querySelectorAll('.item-card.correct:not(.completed)').forEach(card => {
            card.classList.add('completed');
        });
    }

    completeGame() {
        this.gameCompleted = true;
        
        // 最終統計を更新
        const accuracy = Math.round((this.correctCount / this.attemptCount) * 100) || 0;
        
        document.getElementById('finalCorrect').textContent = this.correctCount;
        document.getElementById('finalAttempts').textContent = this.attemptCount;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        
        // 完了画面を表示
        document.getElementById('completionScreen').style.display = 'flex';
        
        // 花火エフェクト（簡単な実装）
        this.showCelebration();
    }

    showCelebration() {
        // 簡単な祝賀エフェクト
        const celebration = () => {
            const emoji = ['🎉', '🎊', '✨', '🌟', '🎈'][Math.floor(Math.random() * 5)];
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
        for (let i = 0; i < 10; i++) {
            setTimeout(celebration, i * 200);
        }
    }

    restartGame() {
        // ゲーム状態をリセット
        this.currentStep = 0;
        this.correctCount = 0;
        this.attemptCount = 0;
        this.selectedAnimal = null;
        this.selectedFood = null;
        this.gameCompleted = false;

        // UI をリセット
        document.getElementById('completionScreen').style.display = 'none';
        document.getElementById('checkButton').style.display = 'inline-block';
        document.getElementById('resetButton').style.display = 'inline-block';
        document.getElementById('nextButton').style.display = 'none';

        // ゲームを再初期化
        this.shuffleGame();
        this.renderGame();
        this.updateStats();
        this.showHint();
        this.hideResult();
    }

    // デバッグ用メソッド
    debugShowAnswer() {
        const currentPair = this.animalFoodPairs[this.currentStep];
        console.log(`正解: ${currentPair.animal.name} → ${currentPair.food.name}`);
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    const game = new AnimalFoodMatchingGame();
    
    // デバッグ用にグローバルに公開
    window.game = game;
    
    // タッチデバイス対応
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    console.log('🎮 動物と食べ物マッチングゲーム開始！');
    console.log('デバッグ: game.debugShowAnswer() で正解を確認できます');
});