// Portfolio website functionality - Security Enhanced Version
'use strict';

// Security utility functions
const SecurityUtils = {
    // HTML escape to prevent XSS
    escapeHtml: function(unsafe) {
        if (typeof unsafe !== 'string') return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    
    // Sanitize search input
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return '';
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .substring(0, 100)
            .trim();
    },
    
    // Validate URL format
    isValidUrl: function(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
        } catch {
            return false;
        }
    }
};

class SecurePortfolio {
    constructor() {
        this.apps = [];
        this.startDate = new Date('2025-07-27');
        this.currentFilter = 'all';
        this.currentSearch = '';
        
        this.init = this.init.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        
        this.init();
    }

    init() {
        try {
            this.loadApps();
            this.renderApps();
            this.renderTimeline();
            this.updateStats();
            this.setupEventListeners();
            this.animateProgressRing();
        } catch (error) {
            console.error('Portfolio initialization failed:', error);
            this.showError('サイトの初期化に失敗しました。');
        }
    }

    loadApps() {
        // Current apps data - Updated with correct GitHub URLs
        this.apps = [
            {
                id: '001',
                title: '数のお勉強アプリ',
                description: '子ども向けの数の概念を学ぶ教育アプリ。親が設定した数だけアイテムを表示し、カウンティングゲームで学習できます。',
                category: 'education',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'データ保存'],
                liveUrl: 'https://euro0707.github.io/app/apps/001-number-learning/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/apps/001-number-learning',
                completedDate: '2025-07-27',
                features: ['数の表示', 'カウンティングゲーム', '学習記録', '進捗統計'],
                image: null,
                status: 'completed'
            },
            {
                id: '002',
                title: '動物と食べ物マッチングゲーム',
                description: '4〜6歳の子ども向けの教育的マッチングゲーム。動物とその食べ物を正しくペアにすることで学習します。',
                category: 'game',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'レスポンシブ'],
                liveUrl: 'https://euro0707.github.io/app/apps/002-animal-food-matching/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/apps/002-animal-food-matching',
                completedDate: '2025-07-27',
                features: ['動的ヒントシステム', '段階的進行', '学習統計', 'レスポンシブデザイン'],
                image: null,
                status: 'completed'
            },
            {
                id: '003',
                title: '色と形の記憶ゲーム',
                description: '4〜6歳の子ども向けの記憶力向上ゲーム。色々な形が順番に表示され、覚えた順番でタップして遊びます。',
                category: 'education',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'アニメーション'],
                liveUrl: 'https://euro0707.github.io/app/apps/003-memory-game/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/apps/003-memory-game',
                completedDate: '2025-07-27',
                features: ['段階的難易度', '親向けヒント', '視覚的フィードバック', '記憶力トレーニング'],
                image: null,
                status: 'completed'
            },
            {
                id: '004',
                title: '乗り物パズル',
                description: '4〜6歳の子ども向けドラッグ&ドロップパズルゲーム。車、電車、飛行機の3段階難易度で空間認識力を育みます。',
                category: 'game',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'ドラッグ操作'],
                liveUrl: 'https://euro0707.github.io/app/apps/004-vehicle-puzzle/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/apps/004-vehicle-puzzle',
                completedDate: '2025-07-29',
                features: ['3段階難易度', 'ドラッグ&ドロップ操作', 'プレースホルダー表示', '正解フィードバック'],
                image: null,
                status: 'completed'
            },
            {
                id: '005',
                title: 'これなーんだ？おえかきクイズ',
                description: '4〜6歳の子ども向けの知育アプリ。ヒントをもとに自由にお絵描きして、AIが答えを当ててくれるインタラクティブなクイズゲーム。',
                category: 'education',
                technologies: ['Canvas', 'CSS3', 'JavaScript', 'タッチ操作'],
                liveUrl: 'https://euro0707.github.io/app/005-orekuna-quiz/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/005-orekuna-quiz',
                completedDate: '2025-08-08',
                features: ['Canvas描画機能', 'AI風判定演出', '褒めるフィードバック', 'モバイル対応'],
                image: null,
                status: 'completed'
            },
            {
                id: '006',
                title: 'さんすうアドベンチャー',
                description: '小学校低学年向けRPG風計算ゲーム。足し算・引き算・かけ算の問題を解いて敵を倒し、レベルアップして強くなろう！',
                category: 'education',
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'RPGシステム'],
                liveUrl: 'https://euro0707.github.io/app/apps/006-math-adventure/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/apps/006-math-adventure',
                completedDate: '2025-08-09',
                features: ['RPG風バトル', '段階的問題難易度', 'プレイヤー進行システム', 'セーブ機能'],
                image: null,
                status: 'completed'
            },
            {
                id: '007',
                title: '3つのドア めいろゲーム',
                description: '4～6歳児向け論理思考学習ゲーム。カギやスイッチを使って3つのドアを開ける段階的パズル。条件・状態・組み合わせの論理を迷路遊びで体験学習。5つのランダム迷路パターンで毎回違う体験。',
                category: 'education',
                technologies: ['HTML5', 'Canvas', 'JavaScript', 'タッチ操作', 'ゲームループ'],
                liveUrl: 'https://euro0707.github.io/app/apps/007-3doors-logic-maze/',
                githubUrl: 'https://github.com/euro0707/app/tree/main/apps/007-3doors-logic-maze',
                completedDate: '2025-08-11',
                features: ['5つのランダム迷路パターン', 'スムーズ移動アニメーション', '衝突判定システム', '論理思考育成'],
                image: null,
                status: 'completed'
            }
        ];

        this.apps = this.apps.filter(app => this.validateAppData(app));

        // 残り93個のプレースホルダー
        for (let i = 8; i <= 100; i++) {
            this.apps.push({
                id: String(i).padStart(3, '0'),
                title: `アプリ #${i}`,
                description: '近日公開予定...',
                category: 'upcoming',
                technologies: [],
                liveUrl: null,
                githubUrl: null,
                completedDate: null,
                features: [],
                image: null,
                status: 'upcoming'
            });
        }
    }

    validateAppData(app) {
        const requiredFields = ['id', 'title', 'description', 'category', 'status'];
        
        for (const field of requiredFields) {
            if (!app.hasOwnProperty(field) || typeof app[field] !== 'string') {
                console.warn(`Invalid app data - missing or invalid ${field}:`, app);
                return false;
            }
        }
        
        if (app.liveUrl && !SecurityUtils.isValidUrl(app.liveUrl)) {
            console.warn('Invalid live URL:', app.liveUrl);
            app.liveUrl = null;
        }
        
        if (app.githubUrl && !SecurityUtils.isValidUrl(app.githubUrl)) {
            console.warn('Invalid GitHub URL:', app.githubUrl);
            app.githubUrl = null;
        }
        
        return true;
    }

    renderApps(filter = 'all', searchTerm = '') {
        const grid = document.getElementById('appsGrid');
        if (!grid) return;

        try {
            const sanitizedSearch = SecurityUtils.sanitizeInput(searchTerm);
            
            const filteredApps = this.apps.filter(app => {
                const matchesFilter = filter === 'all' || app.category === filter || (filter === 'completed' && app.status === 'completed');
                const matchesSearch = sanitizedSearch === '' || 
                    app.title.toLowerCase().includes(sanitizedSearch.toLowerCase()) ||
                    app.description.toLowerCase().includes(sanitizedSearch.toLowerCase());
                return matchesFilter && matchesSearch;
            });

            grid.innerHTML = filteredApps.map(app => this.createAppCard(app)).join('');
        } catch (error) {
            console.error('Render apps failed:', error);
            this.showError('アプリの表示に失敗しました。');
        }
    }

    createAppCard(app) {
        try {
            const safeApp = {
                id: SecurityUtils.escapeHtml(app.id),
                title: SecurityUtils.escapeHtml(app.title),
                description: SecurityUtils.escapeHtml(app.description),
                category: SecurityUtils.escapeHtml(app.category)
            };

            if (app.status === 'upcoming') {
                return `
                    <div class="app-card upcoming" data-category="${safeApp.category}">
                        <div class="app-header">
                            <div class="app-number">${safeApp.id}</div>
                            <div class="app-title">
                                <h4>${safeApp.title}</h4>
                                <span class="app-category upcoming">準備中</span>
                            </div>
                        </div>
                        <div class="app-description">
                            ${safeApp.description}
                        </div>
                        <div class="app-tech">
                            <span class="tech-tag">Coming Soon</span>
                        </div>
                        <div class="app-actions">
                            <button class="btn btn-secondary" disabled>
                                開発中...
                            </button>
                        </div>
                    </div>
                `;
            }

            const categoryLabels = {
                education: '教育',
                game: 'ゲーム',
                utility: 'ユーティリティ',
                creative: 'クリエイティブ'
            };

            const safeTechnologies = app.technologies.map(tech => SecurityUtils.escapeHtml(tech));
            const safeFeatures = app.features.map(feature => SecurityUtils.escapeHtml(feature));

            return `
                <div class="app-card" data-category="${safeApp.category}">
                    <div class="app-header">
                        <div class="app-number">${safeApp.id}</div>
                        <div class="app-title">
                            <h4>${safeApp.title}</h4>
                            <span class="app-category ${safeApp.category}">${categoryLabels[app.category] || safeApp.category}</span>
                        </div>
                    </div>
                    <div class="app-description">
                        ${safeApp.description}
                    </div>
                    <div class="app-tech">
                        ${safeTechnologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                    <div class="app-actions">
                        ${app.liveUrl && SecurityUtils.isValidUrl(app.liveUrl) ? `<a href="${SecurityUtils.escapeHtml(app.liveUrl)}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15,3 21,3 21,9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            試してみる
                        </a>` : ''}
                        ${app.githubUrl && SecurityUtils.isValidUrl(app.githubUrl) ? `<a href="${SecurityUtils.escapeHtml(app.githubUrl)}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                            コード
                        </a>` : ''}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Create app card failed:', error);
            return '<div class="app-card error">アプリカードの表示でエラーが発生しました。</div>';
        }
    }

    renderTimeline() {
        const timeline = document.getElementById('timeline');
        if (!timeline) return;

        try {
            const completedApps = this.apps.filter(app => app.status === 'completed');
            
            const timelineItems = completedApps.map(app => `
                <div class="timeline-item">
                    <div class="timeline-marker">${SecurityUtils.escapeHtml(app.id)}</div>
                    <div class="timeline-content">
                        <div class="timeline-date">${this.formatDate(app.completedDate)}</div>
                        <div class="timeline-title">${SecurityUtils.escapeHtml(app.title)}</div>
                        <div class="timeline-description">${SecurityUtils.escapeHtml(app.description)}</div>
                    </div>
                </div>
            `).join('');

            timeline.innerHTML = timelineItems;
        } catch (error) {
            console.error('Render timeline failed:', error);
            this.showError('タイムラインの表示に失敗しました。');
        }
    }

    updateStats() {
        try {
            const completedApps = this.apps.filter(app => app.status === 'completed').length;
            const progressPercent = Math.round((completedApps / 100) * 100);
            const daysSince = Math.floor((new Date() - this.startDate) / (1000 * 60 * 60 * 24)) + 1;

            const elements = {
                completedApps: document.getElementById('completedApps'),
                progressPercent: document.getElementById('progressPercent'),
                daysSince: document.getElementById('daysSince'),
                lastUpdate: document.getElementById('lastUpdate')
            };

            if (elements.completedApps && Number.isInteger(completedApps)) {
                elements.completedApps.textContent = completedApps;
            }
            if (elements.progressPercent && Number.isInteger(progressPercent)) {
                elements.progressPercent.textContent = `${progressPercent}%`;
            }
            if (elements.daysSince && Number.isInteger(daysSince)) {
                elements.daysSince.textContent = daysSince;
            }
            if (elements.lastUpdate) {
                elements.lastUpdate.textContent = this.formatDate(new Date().toISOString());
            }

            this.updateProgressRing(progressPercent);
        } catch (error) {
            console.error('Update stats failed:', error);
        }
    }

    updateProgressRing(percent) {
        const progressBar = document.querySelector('.progress-bar');
        const progressNumber = document.querySelector('.progress-number');
        
        if (progressBar && progressNumber && Number.isFinite(percent)) {
            const circumference = 2 * Math.PI * 90;
            const offset = circumference - (percent / 100) * circumference;
            
            progressBar.style.strokeDashoffset = offset;
            progressNumber.textContent = Math.round(percent);
        }
    }

    handleSearch(e) {
        const searchTerm = SecurityUtils.sanitizeInput(e.target.value);
        const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.renderApps(filter, searchTerm);
        }, 300);
    }

    handleFilter(e) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const validFilters = ['all', 'education', 'game', 'utility', 'creative', 'completed'];
        const filter = e.target.dataset.filter;
        
        if (!validFilters.includes(filter)) {
            console.warn('Invalid filter:', filter);
            return;
        }
        
        filterButtons.forEach(b => {
            b.classList.remove('active');
        });
        e.target.classList.add('active');
        
        const searchTerm = document.getElementById('searchInput')?.value || '';
        this.renderApps(filter, searchTerm);
    }

    setupEventListeners() {
        try {
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.addEventListener('click', this.handleFilter);
            });

            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.addEventListener('input', this.handleSearch);
                
                searchInput.addEventListener('paste', (e) => {
                    setTimeout(() => {
                        e.target.value = SecurityUtils.sanitizeInput(e.target.value);
                    }, 0);
                });
            }

            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = anchor.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });

            let lastScrollY = window.scrollY;
            window.addEventListener('scroll', () => {
                const header = document.querySelector('.header');
                if (header && window.scrollY > lastScrollY && window.scrollY > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else if (header) {
                    header.style.transform = 'translateY(0)';
                }
                lastScrollY = window.scrollY;
            });

            this.setupAnimationObserver();
        } catch (error) {
            console.error('Setup event listeners failed:', error);
        }
    }

    setupAnimationObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.app-card, .timeline-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    animateProgressRing() {
        setTimeout(() => {
            this.updateStats();
        }, 500);
    }

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '日付不明';
            }
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '日付不明';
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = SecurityUtils.escapeHtml(message);
        errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #f56565; color: white; padding: 10px; border-radius: 5px; z-index: 1000;';
        
        document.body.appendChild(errorDiv);
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const portfolio = new SecurePortfolio();
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.portfolio = portfolio;
        }
        
        setInterval(() => {
            portfolio.updateStats();
        }, 60000);
    } catch (error) {
        console.error('Portfolio initialization failed:', error);
    }
});