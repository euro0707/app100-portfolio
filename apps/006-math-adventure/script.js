class MathAdventure {
    constructor() {
        // ゲーム状態
        this.gameState = {
            player: {
                level: 1,
                hp: 10,
                maxHp: 10,
                coins: 0,
                exp: 0,
                expToNext: 10,
                items: {
                    healPotion: 0,
                    luckCharm: 0,
                    shieldRing: 0
                }
            },
            currentEnemy: null,
            currentProblem: null,
            settings: {
                soundEnabled: true,
                difficulty: 'normal'
            }
        };

        // 敵データ
        this.enemies = [
            { name: 'スライム', sprite: '🟢', hp: 5, maxHp: 5, level: 1, coinReward: 2 },
            { name: 'ゴブリン', sprite: '👺', hp: 8, maxHp: 8, level: 2, coinReward: 3 },
            { name: 'オーク', sprite: '👹', hp: 12, maxHp: 12, level: 3, coinReward: 5 },
            { name: 'ドラゴン', sprite: '🐉', hp: 20, maxHp: 20, level: 4, coinReward: 10 },
            { name: 'デーモン', sprite: '😈', hp: 30, maxHp: 30, level: 5, coinReward: 15 }
        ];

        // ショップアイテム
        this.shopItems = [
            { 
                id: 'healPotion', 
                name: 'かいふくのくすり', 
                sprite: '🧪', 
                price: 5, 
                description: 'HPを3回復する',
                effect: 'heal'
            },
            { 
                id: 'luckCharm', 
                name: 'ラッキーおまもり', 
                sprite: '🍀', 
                price: 8, 
                description: '次の戦闘で経験値2倍',
                effect: 'luck'
            },
            { 
                id: 'shieldRing', 
                name: 'まもりのゆびわ', 
                sprite: '🛡️', 
                price: 12, 
                description: '次のダメージを1回防ぐ',
                effect: 'shield'
            }
        ];

        // DOM要素
        this.elements = {};
        this.init();
    }

    init() {
        this.bindElements();
        this.setupEventListeners();
        this.loadGameData();
        this.showStartScreen();
    }

    bindElements() {
        // スクリーン要素
        this.elements.startScreen = document.getElementById('startScreen');
        this.elements.gameScreen = document.getElementById('gameScreen');
        this.elements.levelUpScreen = document.getElementById('levelUpScreen');
        this.elements.settingsScreen = document.getElementById('settingsScreen');
        this.elements.shopScreen = document.getElementById('shopScreen');

        // ボタン要素
        this.elements.newGameBtn = document.getElementById('newGameBtn');
        this.elements.continueBtn = document.getElementById('continueBtn');
        this.elements.settingsBtn = document.getElementById('settingsBtn');
        this.elements.shopBtn = document.getElementById('shopBtn');
        this.elements.homeBtn = document.getElementById('homeBtn');
        this.elements.levelUpContinueBtn = document.getElementById('levelUpContinueBtn');
        this.elements.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.elements.closeShopBtn = document.getElementById('closeShopBtn');
        this.elements.resetGameBtn = document.getElementById('resetGameBtn');

        // ゲーム情報要素
        this.elements.playerLevel = document.getElementById('playerLevel');
        this.elements.playerHp = document.getElementById('playerHp');
        this.elements.playerMaxHp = document.getElementById('playerMaxHp');
        this.elements.playerCoins = document.getElementById('playerCoins');

        // 敵情報要素
        this.elements.enemySprite = document.getElementById('enemySprite');
        this.elements.enemyName = document.getElementById('enemyName');
        this.elements.enemyHp = document.getElementById('enemyHp');
        this.elements.enemyMaxHp = document.getElementById('enemyMaxHp');
        this.elements.enemyHpBar = document.getElementById('enemyHpBar');

        // 問題要素
        this.elements.problemText = document.getElementById('problemText');
        this.elements.choicesContainer = document.getElementById('choicesContainer');
        this.elements.messageText = document.getElementById('messageText');

        // エフェクト要素
        this.elements.damageEffect = document.getElementById('damageEffect');
        this.elements.healEffect = document.getElementById('healEffect');
        this.elements.sparkleEffect = document.getElementById('sparkleEffect');

        // 設定要素
        this.elements.soundToggle = document.getElementById('soundToggle');
        this.elements.difficultySelect = document.getElementById('difficultySelect');

        // レベルアップ要素
        this.elements.oldLevel = document.getElementById('oldLevel');
        this.elements.newLevel = document.getElementById('newLevel');
        this.elements.hpIncrease = document.getElementById('hpIncrease');
        this.elements.coinBonus = document.getElementById('coinBonus');

        // ショップ要素
        this.elements.shopPlayerCoins = document.getElementById('shopPlayerCoins');
        this.elements.shopItemsContainer = document.getElementById('shopItemsContainer');
        this.elements.inventoryContainer = document.getElementById('inventoryContainer');
    }

    setupEventListeners() {
        // スタート画面
        this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.elements.continueBtn.addEventListener('click', () => this.continueGame());

        // ゲーム画面
        this.elements.homeBtn.addEventListener('click', () => this.showStartScreen());
        this.elements.settingsBtn.addEventListener('click', () => this.showSettingsScreen());
        this.elements.shopBtn.addEventListener('click', () => this.showShopScreen());

        // レベルアップ画面
        this.elements.levelUpContinueBtn.addEventListener('click', () => this.continueAfterLevelUp());

        // 設定画面
        this.elements.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.elements.resetGameBtn.addEventListener('click', () => this.resetGame());
        this.elements.soundToggle.addEventListener('change', () => this.updateSettings());
        this.elements.difficultySelect.addEventListener('change', () => this.updateSettings());

        // ショップ画面
        this.elements.closeShopBtn.addEventListener('click', () => this.closeShop());
    }

    // ゲームデータの保存・読み込み
    saveGameData() {
        localStorage.setItem('mathAdventureGame', JSON.stringify(this.gameState));
    }

    loadGameData() {
        const savedData = localStorage.getItem('mathAdventureGame');
        if (savedData) {
            this.gameState = { ...this.gameState, ...JSON.parse(savedData) };
            this.elements.continueBtn.style.display = 'block';
        } else {
            this.elements.continueBtn.style.display = 'none';
        }
        this.updateSettings();
    }

    // 画面切り替え
    showScreen(screenElement) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        screenElement.classList.add('active');
    }

    showStartScreen() {
        this.showScreen(this.elements.startScreen);
    }

    showGameScreen() {
        this.showScreen(this.elements.gameScreen);
        this.updatePlayerUI();
        this.updateEnemyUI();
    }

    showLevelUpScreen(oldLevel, newLevel) {
        this.elements.oldLevel.textContent = oldLevel;
        this.elements.newLevel.textContent = newLevel;
        this.elements.hpIncrease.textContent = '+5';
        this.elements.coinBonus.textContent = '+' + (newLevel * 2);
        this.showScreen(this.elements.levelUpScreen);
    }

    showSettingsScreen() {
        this.showScreen(this.elements.settingsScreen);
    }

    showShopScreen() {
        this.showScreen(this.elements.shopScreen);
        this.renderShop();
    }

    // ゲーム開始・継続
    startNewGame() {
        this.gameState.player = {
            level: 1,
            hp: 10,
            maxHp: 10,
            coins: 0,
            exp: 0,
            expToNext: 10,
            items: {
                healPotion: 0,
                luckCharm: 0,
                shieldRing: 0
            }
        };
        this.spawnNewEnemy();
        this.showGameScreen();
        this.generateNewProblem();
        this.updateMessage('新しい冒険が始まった！敵を倒して強くなろう！');
        this.saveGameData();
    }

    continueGame() {
        if (!this.gameState.currentEnemy) {
            this.spawnNewEnemy();
        }
        this.showGameScreen();
        this.generateNewProblem();
        this.updateMessage('冒険を再開しよう！');
    }

    continueAfterLevelUp() {
        this.spawnNewEnemy();
        this.showGameScreen();
        this.generateNewProblem();
        this.updateMessage('新しい敵が現れた！');
    }

    // 敵の管理
    spawnNewEnemy() {
        const playerLevel = this.gameState.player.level;
        const enemyIndex = Math.min(playerLevel - 1, this.enemies.length - 1);
        const enemyTemplate = this.enemies[enemyIndex];
        
        this.gameState.currentEnemy = {
            ...enemyTemplate,
            hp: enemyTemplate.maxHp
        };
    }

    // 問題生成
    generateNewProblem() {
        const playerLevel = this.gameState.player.level;
        const difficulty = this.gameState.settings.difficulty;
        
        let problem = this.generateProblemByLevel(playerLevel, difficulty);
        this.gameState.currentProblem = problem;
        
        // UI更新
        this.elements.problemText.textContent = problem.question;
        this.updateChoices(problem.choices, problem.correct);
    }

    generateProblemByLevel(level, difficulty) {
        let problem;
        
        if (level <= 3) {
            // 足し算
            problem = this.generateAdditionProblem(difficulty);
        } else if (level <= 6) {
            // 引き算
            problem = this.generateSubtractionProblem(difficulty);
        } else {
            // かけ算
            problem = this.generateMultiplicationProblem(difficulty);
        }
        
        return problem;
    }

    generateAdditionProblem(difficulty) {
        let max = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 10 : 15;
        const a = Math.floor(Math.random() * max) + 1;
        const b = Math.floor(Math.random() * max) + 1;
        const correct = a + b;
        
        const choices = this.generateChoices(correct);
        
        return {
            question: `${a} + ${b} = ?`,
            correct: correct,
            choices: choices
        };
    }

    generateSubtractionProblem(difficulty) {
        let max = difficulty === 'easy' ? 10 : difficulty === 'normal' ? 20 : 30;
        const a = Math.floor(Math.random() * max) + 10;
        const b = Math.floor(Math.random() * (a - 1)) + 1;
        const correct = a - b;
        
        const choices = this.generateChoices(correct);
        
        return {
            question: `${a} - ${b} = ?`,
            correct: correct,
            choices: choices
        };
    }

    generateMultiplicationProblem(difficulty) {
        const maxA = difficulty === 'easy' ? 5 : difficulty === 'normal' ? 9 : 12;
        const maxB = difficulty === 'easy' ? 5 : 9;
        
        const a = Math.floor(Math.random() * maxA) + 1;
        const b = Math.floor(Math.random() * maxB) + 1;
        const correct = a * b;
        
        const choices = this.generateChoices(correct);
        
        return {
            question: `${a} × ${b} = ?`,
            correct: correct,
            choices: choices
        };
    }

    generateChoices(correct) {
        const choices = [correct];
        
        while (choices.length < 3) {
            let wrong;
            if (correct <= 10) {
                wrong = Math.max(1, correct + Math.floor(Math.random() * 6) - 3);
            } else {
                wrong = Math.max(1, correct + Math.floor(Math.random() * 10) - 5);
            }
            
            if (!choices.includes(wrong)) {
                choices.push(wrong);
            }
        }
        
        // シャッフル
        return choices.sort(() => Math.random() - 0.5);
    }

    updateChoices(choices, correct) {
        this.elements.choicesContainer.innerHTML = '';
        
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice;
            button.dataset.answer = choice;
            button.addEventListener('click', () => this.handleAnswer(choice, correct));
            this.elements.choicesContainer.appendChild(button);
        });
    }

    // 回答処理
    handleAnswer(selectedAnswer, correctAnswer) {
        const isCorrect = selectedAnswer === correctAnswer;
        const buttons = this.elements.choicesContainer.querySelectorAll('.choice-btn');
        
        // ボタンの色を変更
        buttons.forEach(btn => {
            const btnAnswer = parseInt(btn.dataset.answer);
            if (btnAnswer === correctAnswer) {
                btn.classList.add('correct');
            } else if (btnAnswer === selectedAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.disabled = true;
        });

        setTimeout(() => {
            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleIncorrectAnswer();
            }
        }, 1000);
    }

    handleCorrectAnswer() {
        // 敵にダメージ
        const damage = 1;
        this.gameState.currentEnemy.hp = Math.max(0, this.gameState.currentEnemy.hp - damage);
        
        // エフェクト表示
        this.showDamageEffect(damage);
        
        // 経験値獲得（コインは敵を倒した時のみ）
        let expGain = 1;
        if (this.gameState.luckActive) {
            expGain *= 2;
            this.gameState.luckActive = false; // 一回使用で効果切れ
        }
        this.gameState.player.exp += expGain;
        
        // UI更新（敵のHPを0表示するため）
        this.updatePlayerUI();
        this.updateEnemyUI();
        
        if (this.gameState.currentEnemy.hp <= 0) {
            // 敵を倒した - HP0の状態を表示してから処理
            this.updateMessage('正解！敵を倒した！');
            // 敗北アニメーション追加
            this.elements.enemySprite.classList.add('defeated');
            setTimeout(() => this.handleEnemyDefeated(), 1000);
        } else {
            // 次の問題へ
            this.updateMessage('正解！敵にダメージを与えた！経験値+1');
            setTimeout(() => this.generateNewProblem(), 1500);
        }
    }

    handleIncorrectAnswer() {
        // プレイヤーがダメージを受ける
        if (this.gameState.shieldActive) {
            this.gameState.shieldActive = false; // シールド消費
            this.updateMessage('不正解...でもまもりのゆびわが守ってくれた！');
        } else {
            const damage = 1;
            this.gameState.player.hp = Math.max(0, this.gameState.player.hp - damage);
            this.updateMessage('不正解...敵の攻撃を受けた！');
        }
        
        this.updatePlayerUI();
        
        if (this.gameState.player.hp <= 0) {
            // ゲームオーバー
            this.handleGameOver();
        } else {
            setTimeout(() => this.generateNewProblem(), 1500);
        }
    }

    handleEnemyDefeated() {
        const enemy = this.gameState.currentEnemy;
        const coinReward = enemy.coinReward;
        const expReward = enemy.level * 3;
        
        this.gameState.player.coins += coinReward;
        this.gameState.player.exp += expReward;
        
        this.updateMessage(`${enemy.name}を倒した！コイン+${coinReward}、経験値+${expReward}！`);
        
        // レベルアップチェック
        if (this.gameState.player.exp >= this.gameState.player.expToNext) {
            setTimeout(() => this.handleLevelUp(), 2000);
        } else {
            setTimeout(() => {
                this.spawnNewEnemy();
                this.updateEnemyUI();
                this.generateNewProblem();
                this.updateMessage('新しい敵が現れた！');
            }, 2000);
        }
        
        this.updatePlayerUI();
        this.saveGameData();
    }

    handleLevelUp() {
        const oldLevel = this.gameState.player.level;
        const newLevel = oldLevel + 1;
        
        this.gameState.player.level = newLevel;
        this.gameState.player.maxHp += 5;
        this.gameState.player.hp = this.gameState.player.maxHp; // 完全回復
        this.gameState.player.coins += newLevel * 2;
        this.gameState.player.exp = 0;
        this.gameState.player.expToNext = newLevel * 10;
        
        this.saveGameData();
        this.showLevelUpScreen(oldLevel, newLevel);
    }

    handleGameOver() {
        this.updateMessage('ゲームオーバー...HPが0になってしまった！');
        setTimeout(() => {
            if (confirm('ゲームオーバーです。最初からやり直しますか？')) {
                this.startNewGame();
            } else {
                this.showStartScreen();
            }
        }, 2000);
    }

    // UI更新
    updatePlayerUI() {
        this.elements.playerLevel.textContent = this.gameState.player.level;
        this.elements.playerHp.textContent = this.gameState.player.hp;
        this.elements.playerMaxHp.textContent = this.gameState.player.maxHp;
        this.elements.playerCoins.textContent = this.gameState.player.coins;
    }

    updateEnemyUI() {
        if (!this.gameState.currentEnemy) return;
        
        const enemy = this.gameState.currentEnemy;
        this.elements.enemySprite.textContent = enemy.sprite;
        this.elements.enemyName.textContent = enemy.name;
        this.elements.enemyHp.textContent = enemy.hp;
        this.elements.enemyMaxHp.textContent = enemy.maxHp;
        
        // 新しい敵の場合はdefeatアニメーションをリセット
        if (enemy.hp === enemy.maxHp) {
            this.elements.enemySprite.classList.remove('defeated');
        }
        
        const hpPercent = (enemy.hp / enemy.maxHp) * 100;
        this.elements.enemyHpBar.style.width = hpPercent + '%';
    }

    updateMessage(message) {
        this.elements.messageText.textContent = message;
    }

    // エフェクト
    showDamageEffect(damage) {
        this.elements.damageEffect.textContent = '-' + damage;
        this.elements.damageEffect.style.top = '40%';
        this.elements.damageEffect.style.left = '50%';
        this.elements.damageEffect.classList.add('show-effect');
        
        setTimeout(() => {
            this.elements.damageEffect.classList.remove('show-effect');
        }, 1000);
    }

    // 設定
    updateSettings() {
        this.gameState.settings.soundEnabled = this.elements.soundToggle.checked;
        this.gameState.settings.difficulty = this.elements.difficultySelect.value;
        this.saveGameData();
    }

    closeSettings() {
        this.showGameScreen();
    }

    resetGame() {
        if (confirm('本当にゲームをリセットしますか？すべてのデータが消えます。')) {
            localStorage.removeItem('mathAdventureGame');
            location.reload();
        }
    }

    // ショップ機能
    closeShop() {
        this.showGameScreen();
    }

    renderShop() {
        // コイン表示更新
        this.elements.shopPlayerCoins.textContent = this.gameState.player.coins;

        // ショップアイテム表示
        this.elements.shopItemsContainer.innerHTML = this.shopItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-icon">${item.sprite}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-description">${item.description}</div>
                    <div class="shop-item-price">💰 ${item.price}</div>
                </div>
                <button onclick="window.game.buyItem('${item.id}')" ${this.gameState.player.coins < item.price ? 'disabled' : ''}>
                    ${this.gameState.player.coins >= item.price ? '購入' : 'お金が足りない'}
                </button>
            </div>
        `).join('');

        // インベントリ表示
        const inventoryItems = Object.entries(this.gameState.player.items)
            .filter(([id, count]) => count > 0)
            .map(([id, count]) => {
                const item = this.shopItems.find(shop => shop.id === id);
                return `
                    <div class="inventory-item">
                        <div class="inventory-item-icon">${item.sprite}</div>
                        <div class="inventory-item-name">${item.name}</div>
                        <div class="inventory-item-count">×${count}</div>
                        <button class="use-item-btn" onclick="window.game.useItem('${id}')">使う</button>
                    </div>
                `;
            });

        this.elements.inventoryContainer.innerHTML = inventoryItems.length > 0 
            ? inventoryItems.join('') 
            : '<p style="text-align: center; color: #7f8c8d;">アイテムを持っていません</p>';
    }

    buyItem(itemId) {
        const item = this.shopItems.find(shop => shop.id === itemId);
        if (!item) return;

        if (this.gameState.player.coins >= item.price) {
            this.gameState.player.coins -= item.price;
            this.gameState.player.items[itemId]++;
            this.saveGameData();
            this.renderShop();
            this.updatePlayerUI();
            
            // 購入成功エフェクト
            this.updateMessage(`${item.name}を購入しました！`);
        }
    }

    useItem(itemId) {
        if (this.gameState.player.items[itemId] <= 0) return;

        const item = this.shopItems.find(shop => shop.id === itemId);
        if (!item) return;

        this.gameState.player.items[itemId]--;
        
        // アイテム効果適用
        switch (item.effect) {
            case 'heal':
                const healAmount = Math.min(3, this.gameState.player.maxHp - this.gameState.player.hp);
                this.gameState.player.hp += healAmount;
                this.updateMessage(`${item.name}を使った！HP+${healAmount}回復！`);
                break;
            case 'luck':
                this.gameState.luckActive = true;
                this.updateMessage(`${item.name}を使った！次の戦闘で経験値2倍！`);
                break;
            case 'shield':
                this.gameState.shieldActive = true;
                this.updateMessage(`${item.name}を使った！次のダメージを防ぐ！`);
                break;
        }

        this.saveGameData();
        this.renderShop();
        this.updatePlayerUI();
    }
}

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MathAdventure();
});