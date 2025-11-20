(() => {
    document.addEventListener('DOMContentLoaded', () => {

        /** 正则常量 */
        const LINE_RE = /\[(\d+:\d+\.\d+)\](.*)/;
        const TIME_RE = /\[(\d+):(\d+(?:\.\d+)?)\]/;
        const INFO_RE = {
            album: /\[al:(.*)\]/,
            artist: /\[ar:(.*)\]/,
            title: /\[ti:(.*)\]/
        };

        /** 读取 URL hash 并构造资源路径 */
        const filename = location.hash.slice(1).split('?')[0];
        if (!filename) {
            window.location.href = "book.html"
        }
        const book = filename.split('/').shift()
        const bookScr = `book.html#${book}`;
        const bookImgSrc = `images/${book}.jpg`;
        const mp3Src = `${filename}.mp3`;
        const lrcSrc = `${filename}.lrc`;
        
        // 解析URL参数判断是奇数课还是偶数课
        const urlParams = new URLSearchParams(location.hash.split('?')[1]);
        const lessonType = urlParams.get('type') || 'odd'; // odd 或 even

        // 保存学习进度
        function saveStudyProgress() {
            const progress = {
                lastBook: book,
                lastLesson: filename.split('/').pop()
            };
            localStorage.setItem('nce_study_progress', JSON.stringify(progress));
        }

        // 页面加载时自动保存进度
        saveStudyProgress();

        /** DOM 引用 */
        const audio = document.getElementById('player');
        const content = document.getElementById('content');
        const bookEl = document.getElementById('book');
        const bookTitleEl = document.getElementById('book-title');
        const bookImgEl = document.getElementById('book-img');
        const lessonTitleEl = document.getElementById('lesson-title');
        const backButton = document.getElementById('back-button');
        const homeButton = document.getElementById('home-button');

        /** 数据结构 */
        const state = {
            data: [],          // [{en, cn, start, end}]
            album: '',
            artist: '',
            title: '',
            segmentEnd: 0,
            activeIdx: -1
        };
        audio.src = mp3Src;
        bookImgEl.src = bookImgSrc;
        bookImgEl.alt = book;

        /** -------------------------------------------------
         *  元信息解析
         * ------------------------------------------------- */
        function parseInfo(line) {
            for (const key in INFO_RE) {
                const m = line.match(INFO_RE[key]);
                if (m) state[key] = m[1];
            }
        }

        /** -------------------------------------------------
         *  时间解析
         * ------------------------------------------------- */
        function parseTime(tag) {
            const m = TIME_RE.exec(tag);
            return m ? parseInt(m[1], 10) * 60 + parseFloat(m[2]) -0.5 : 0;
        }

        /** -------------------------------------------------
         *  LRC 解析
         * ------------------------------------------------- */
        async function loadLrc() {
            const lrcRes = await fetch(lrcSrc);
            const text = await lrcRes.text();
            const lines = text.split(/\r?\n/).filter(Boolean);

            lines.forEach((raw, i) => {
                const line = raw.trim();
                const match = line.match(LINE_RE);

                if (!match) {
                    parseInfo(line);
                    return;
                }

                const start = parseTime(`[${match[1]}]`);
                const [en, cn = ''] = match[2].split('|').map(s => s.trim());

                let end = 0;
                for (let j = i + 1; j < lines.length; j++) {
                    const nxt = lines[j].match(LINE_RE);
                    if (nxt) {
                        end = parseTime(`[${nxt[1]}]`);
                        break;
                    }
                }
                state.data.push({en, cn, start, end});
            });
            render();
        }


        /** -------------------------------------------------
         *  渲染
         * ------------------------------------------------- */
        function render() {
            bookEl.href = bookScr;
            bookTitleEl.textContent = state.album;
            
            // 根据课程类型设置标题
            if (book === 'NCE1') {
                // 对于第一册，根据课程类型显示不同的标题
                const lessonNumber = filename.split('/').pop().split('&')[0];
                const lessonNum = parseInt(lessonNumber);
                if (lessonType === 'even') {
                    lessonTitleEl.textContent = `第${lessonNum + 1}课`;
                } else {
                    lessonTitleEl.textContent = `第${lessonNum}课`;
                }
            } else {
                lessonTitleEl.textContent = state.title;
            }

            // 对于第一册偶数课，显示偶数课内容
            if (book === 'NCE1' && lessonType === 'even') {
                // 显示偶数课内容
                getEvenLessonContent().then(evenContent => {
                    if (evenContent) {
                        content.innerHTML = `<div class="sentence">
                            <div class="en">${evenContent}</div>
                            <div class="cn">这是偶数课的内容，与奇数课不同</div>
                        </div>`;
                    } else {
                        // 如果没有专门的偶数课内容，显示提示信息
                        content.innerHTML = `<div class="sentence">
                            <div class="en">Even lesson content is being prepared</div>
                            <div class="cn">偶数课内容正在准备中，敬请期待</div>
                        </div>`;
                    }
                });
            } else {
                // 正常显示LRC内容（奇数课或其他册）
                content.innerHTML = state.data.map(
                    (item, idx) =>
                        `<div class="sentence" data-idx="${idx}">
                        <div class="en">${item.en}</div>
                        <div class="cn">${item.cn}</div>
                    </div>`
                ).join('');
            }
        }

        // 获取偶数课内容
        async function getEvenLessonContent() {
            // 从数据中获取偶数课内容
            const lessonFilename = filename.split('/').pop();
            const lessonNumber = parseInt(lessonFilename.split('&')[0]);
            const lessonIndex = Math.floor((lessonNumber - 1) / 2);
            
            // 获取课程数据
            const lessons = await getLessonsData();
            if (lessons && lessons[1] && lessons[1][lessonIndex]) {
                const lesson = lessons[1][lessonIndex];
                if (lesson.evenContent) {
                    return lesson.evenContent;
                }
            }
            
            // 如果没有专门的偶数课内容，返回默认内容
            switch(lessonNumber) {
                case 1: return "Is this your handbag? Yes, it is. Thank you very much.";
                case 3: return "Sorry sir. Is this your umbrella? No, it isn't. Is this it? Yes, it is. Thank you very much.";
                case 5: return "What make is it? It's a Volvo. It's Swedish. What make is it? It's a Peugeot. It's French.";
                case 7: return "What's your job? I'm a policeman. What's your job? I'm a policewoman. What's your job? I'm a taxi driver.";
                default: return "Even lesson content is being prepared. This is different from the odd lesson content.";
            }
        }

        // 获取课程数据
        let lessonsDataCache = null;
        async function getLessonsData() {
            if (lessonsDataCache) {
                return lessonsDataCache;
            }
            
            try {
                const dataSrc = 'static/data.json';
                const dataRes = await fetch(dataSrc);
                if (dataRes.ok) {
                    lessonsDataCache = await dataRes.json();
                    return lessonsDataCache;
                }
            } catch (error) {
                console.error('Failed to load lesson data:', error);
            }
            return null;
        }

        /** -------------------------------------------------
         *  播放区间
         * ------------------------------------------------- */
        function playSegment(start, end) {
            state.segmentEnd = end
            audio.currentTime = start;
            audio.play();
            state.activeIdx = -1;
        }

        /** -------------------------------------------------
         *  高亮 & 自动滚动
         * ------------------------------------------------- */
        function highlight(idx) {
            if (idx === state.activeIdx) return;
            const prev = content.querySelector('.sentence.active');
            if (prev) prev.classList.remove('active');
            const cur = content.querySelector(`.sentence[data-idx="${idx}"]`);
            if (cur) {
                cur.classList.add('active');
                cur.scrollIntoView({behavior: 'smooth', block: 'center'});
            }
            state.activeIdx = idx;
        }

        /** -------------------------------------------------
         *  事件绑定（委托）
         * ------------------------------------------------- */
        content.addEventListener('click', e => {
            const target = e.target.closest('.sentence');
            if (!target) return;
            const idx = Number(target.dataset.idx);
            const {start, end} = state.data[idx];
            playSegment(start, end);
        });

        audio.addEventListener('timeupdate', () => {
            const cur = audio.currentTime;
            // 区间结束自动暂停
            if (state.segmentEnd && cur >= state.segmentEnd) {
                audio.pause();
                audio.currentTime = state.segmentEnd;
                state.segmentEnd = 0;
                state.activeIdx = -1;
                return;
            }

            // 找到当前句子索引
            const idx = state.data.findIndex(
                item => cur > item.start && (cur < item.end || !item.end)
            );
            if (idx !== -1) highlight(idx);
        });

        // 导航按钮事件监听
        backButton.addEventListener('click', () => {
            window.history.back();
        });

        homeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // 初始化
        loadLrc().then(r => {
        });

    })
})();