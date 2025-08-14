// アプリの初期化
document.addEventListener('DOMContentLoaded', function() {
    const numberSelect = document.getElementById('numberSelect');
    const itemSelect = document.getElementById('itemSelect');
    const showItemsBtn = document.getElementById('showItems');
    const numberDisplay = document.getElementById('numberDisplay');
    const itemsContainer = document.getElementById('itemsContainer');
    const countMessage = document.getElementById('countMessage');
    
    // ゲーム関連の要素
    const questionText = document.getElementById('questionText');
    const answerButtons = document.getElementById('answerButtons');
    const gameResult = document.getElementById('gameResult');
    
    // 統計関連の要素
    const totalGamesEl = document.getElementById('totalGames');
    const correctAnswersEl = document.getElementById('correctAnswers');
    const accuracyEl = document.getElementById('accuracy');
    const bestStreakEl = document.getElementById('bestStreak');
    const resetProgressBtn = document.getElementById('resetProgress');
    
    // データ管理用のオブジェクト
    let gameData = loadGameData();
    let currentStreak = 0;
    let currentGameAnswer = 0;
    let activeTimeouts = [];

    // 初期表示
    updateDisplay();
    updateStats();

    // ボタンクリックイベント
    showItemsBtn.addEventListener('click', updateDisplay);
    
    // セレクトボックス変更時も自動更新
    numberSelect.addEventListener('change', updateDisplay);
    itemSelect.addEventListener('change', updateDisplay);
    
    // 進捗リセットボタン
    resetProgressBtn.addEventListener('click', resetProgress);

    function clearTimeouts() {
        activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        activeTimeouts = [];
    }

    function updateDisplay() {
        // 親が選んだ数を取得
        const numberSelectedByParent = parseInt(numberSelect.value);
        const selectedItem = itemSelect.value;
        
        // 数字を表示
        numberDisplay.textContent = numberSelectedByParent;
        
        // 進行中のタイムアウトをクリア
        clearTimeouts();
        
        // アイテムコンテナをクリア
        itemsContainer.innerHTML = '';
        countMessage.textContent = '';
        gameResult.textContent = '';
        answerButtons.innerHTML = '';
        
        // アイテムを即座に表示（アニメーションを簡素化）
        for (let i = 0; i < numberSelectedByParent; i++) {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.textContent = selectedItem;
            itemsContainer.appendChild(itemElement);
        }
        
        // 少し遅延してメッセージとゲームを表示
        const messageTimeoutId = setTimeout(() => {
            showCountMessage(numberSelectedByParent, getItemName(selectedItem));
            setupCountingGame(numberSelectedByParent, selectedItem);
        }, 500);
        activeTimeouts.push(messageTimeoutId);
    }

    function showCountMessage(count, itemName) {
        countMessage.textContent = '数えてみよう！';
        
        // メッセージにアニメーション効果
        countMessage.style.opacity = '0';
        countMessage.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            countMessage.style.transition = 'all 0.5s ease-out';
            countMessage.style.opacity = '1';
            countMessage.style.transform = 'translateY(0)';
        }, 100);
    }

    function getItemName(emoji) {
        const itemNames = {
            '🍎': 'リンゴ',
            '🍌': 'バナナ',
            '🍊': 'みかん',
            '🍓': 'いちご',
            '🍇': 'ぶどう',
            '⚽': 'ボール',
            '🚗': '車',
            '🌟': 'お星様'
        };
        return itemNames[emoji] || 'アイテム';
    }

    // キーボードサポート（数字キーで数を変更）
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key >= '1' && key <= '9') {
            numberSelect.value = key;
            updateDisplay();
        } else if (key === '0') {
            numberSelect.value = '10';
            updateDisplay();
        }
    });

    // タッチデバイス対応
    let touchStartY = 0;
    numberDisplay.addEventListener('touchstart', function(event) {
        touchStartY = event.touches[0].clientY;
    });

    numberDisplay.addEventListener('touchend', function(event) {
        const touchEndY = event.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > 50) { // 50px以上のスワイプ
            const currentValue = parseInt(numberSelect.value);
            if (diff > 0 && currentValue < 10) { // 上スワイプで増加
                numberSelect.value = currentValue + 1;
                updateDisplay();
            } else if (diff < 0 && currentValue > 1) { // 下スワイプで減少
                numberSelect.value = currentValue - 1;
                updateDisplay();
            }
        }
    });

    // データ管理機能
    function loadGameData() {
        try {
            const saved = localStorage.getItem('numberLearningAppData');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('データの読み込みに失敗しました:', error);
        }
        
        return {
            totalGames: 0,
            correctAnswers: 0,
            bestStreak: 0,
            sessions: [],
            itemStats: {}
        };
    }

    function saveGameData() {
        try {
            localStorage.setItem('numberLearningAppData', JSON.stringify(gameData));
        } catch (error) {
            console.warn('データの保存に失敗しました:', error);
        }
    }

    function recordGameResult(isCorrect, number, item, userAnswer) {
        const session = {
            timestamp: new Date().toISOString(),
            number: number,
            item: getItemName(item),
            userAnswer: userAnswer,
            correct: isCorrect,
            streak: isCorrect ? currentStreak + 1 : 0
        };

        gameData.totalGames++;
        if (isCorrect) {
            gameData.correctAnswers++;
            currentStreak++;
            gameData.bestStreak = Math.max(gameData.bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }

        gameData.sessions.push(session);
        
        // アイテム別の統計
        const itemName = getItemName(item);
        if (!gameData.itemStats[itemName]) {
            gameData.itemStats[itemName] = { total: 0, correct: 0 };
        }
        gameData.itemStats[itemName].total++;
        if (isCorrect) {
            gameData.itemStats[itemName].correct++;
        }

        saveGameData();
        updateStats();
    }

    function updateStats() {
        totalGamesEl.textContent = gameData.totalGames;
        correctAnswersEl.textContent = gameData.correctAnswers;
        
        const accuracy = gameData.totalGames > 0 
            ? Math.round((gameData.correctAnswers / gameData.totalGames) * 100)
            : 0;
        accuracyEl.textContent = accuracy + '%';
        
        bestStreakEl.textContent = gameData.bestStreak;
    }

    function resetProgress() {
        if (confirm('本当に学習記録をリセットしますか？')) {
            gameData = {
                totalGames: 0,
                correctAnswers: 0,
                bestStreak: 0,
                sessions: [],
                itemStats: {}
            };
            currentStreak = 0;
            saveGameData();
            updateStats();
            gameResult.textContent = '';
            gameResult.className = 'game-result';
        }
    }

    // カウンティングゲーム機能
    function setupCountingGame(correctAnswer, item) {
        currentGameAnswer = correctAnswer;
        const itemName = getItemName(item);
        
        questionText.textContent = `${itemName}は何個あるかな？`;
        
        // 選択肢を生成（正解 + ランダムな間違い選択肢）
        const choices = generateChoices(correctAnswer);
        
        answerButtons.innerHTML = '';
        gameResult.textContent = '';
        gameResult.className = 'game-result';
        
        choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = choice;
            button.addEventListener('click', () => handleAnswer(choice, correctAnswer, item));
            answerButtons.appendChild(button);
        });
    }

    function generateChoices(correctAnswer) {
        const choices = [correctAnswer];
        
        // 間違い選択肢を生成
        while (choices.length < 4) {
            let wrongAnswer;
            if (Math.random() < 0.5) {
                // 正解より少ない数
                wrongAnswer = Math.max(1, correctAnswer - Math.floor(Math.random() * 3) - 1);
            } else {
                // 正解より多い数
                wrongAnswer = correctAnswer + Math.floor(Math.random() * 3) + 1;
            }
            
            if (!choices.includes(wrongAnswer) && wrongAnswer >= 1 && wrongAnswer <= 10) {
                choices.push(wrongAnswer);
            }
        }
        
        // シャッフル
        return choices.sort(() => Math.random() - 0.5);
    }

    function handleAnswer(userAnswer, correctAnswer, item) {
        const isCorrect = userAnswer === correctAnswer;
        const buttons = answerButtons.querySelectorAll('.answer-btn');
        
        // ボタンの色を変更
        buttons.forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.textContent) === correctAnswer) {
                btn.classList.add('correct');
            } else if (parseInt(btn.textContent) === userAnswer && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // 親からのフィードバック機能
        let parentFeedback = '';
        if (!isCorrect) {
            if (userAnswer < correctAnswer) {
                parentFeedback = `あと${correctAnswer - userAnswer}個多いよ！`;
            } else {
                parentFeedback = `${userAnswer - correctAnswer}個少ないよ！`;
            }
        }

        // 結果メッセージを表示
        setTimeout(() => {
            const itemName = getItemName(item);
            if (isCorrect) {
                gameResult.textContent = `🎉 せいかい！${itemName}は${correctAnswer}個だね！`;
                gameResult.className = 'game-result correct';
            } else {
                gameResult.textContent = `😊 ${parentFeedback} もう一度数えてみよう！`;
                gameResult.className = 'game-result incorrect';
            }
        }, 500);

        // データを記録
        recordGameResult(isCorrect, correctAnswer, item, userAnswer);

        // 3秒後に新しいゲームをセットアップ（同じ数で継続）
        setTimeout(() => {
            setupCountingGame(correctAnswer, item); // 同じ数とアイテムで新しい問題
        }, 3000);
    }
});