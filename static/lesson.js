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
            // 正常解析LRC文件
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

            // 对于第一册合并课程，添加偶数课内容
            if (book === 'NCE1') {
                const evenContent = getEvenLessonContent();
                state.data = state.data.concat(evenContent);
            }

            render();
        }

        // 获取偶数课内容
        function getEvenLessonContent() {
            const lessonFilename = filename.split('/').pop();
            const lessonNumber = parseInt(lessonFilename.split('&')[0]);
            
            // 根据课程编号返回对应的偶数课内容
            switch(lessonNumber) {
                case 1: // 第2课内容
                    return [
                        { en: "Is this your handbag?", cn: "这是你的手提包吗？", start: 30, end: 33 },
                        { en: "Yes, it is.", cn: "是的，它是。", start: 33, end: 36 },
                        { en: "Thank you very much.", cn: "非常感谢。", start: 36, end: 39 },
                        { en: "Is this your pen?", cn: "这是你的钢笔吗？", start: 39, end: 42 },
                        { en: "No, it isn't.", cn: "不，它不是。", start: 42, end: 45 },
                        { en: "Is this your book?", cn: "这是你的书吗？", start: 45, end: 48 },
                        { en: "Yes, it is.", cn: "是的，它是。", start: 48, end: 51 },
                        { en: "Thank you.", cn: "谢谢你。", start: 51, end: 54 }
                    ];
                case 3: // 第4课内容
                    return [
                        { en: "Is this your umbrella?", cn: "这是你的雨伞吗？", start: 30, end: 33 },
                        { en: "No, it isn't.", cn: "不，它不是。", start: 33, end: 36 },
                        { en: "Is this it?", cn: "是这个吗？", start: 36, end: 39 },
                        { en: "Yes, it is.", cn: "是的，它是。", start: 39, end: 42 },
                        { en: "Thank you very much.", cn: "非常感谢。", start: 42, end: 45 },
                        { en: "Is this your coat?", cn: "这是你的外套吗？", start: 45, end: 48 },
                        { en: "Yes, it is.", cn: "是的，它是。", start: 48, end: 51 },
                        { en: "Thank you.", cn: "谢谢你。", start: 51, end: 54 }
                    ];
                case 5: // 第6课内容
                    return [
                        { en: "What make is your car?", cn: "你的车是什么牌子的？", start: 30, end: 33 },
                        { en: "It's a Ford.", cn: "是福特。", start: 33, end: 36 },
                        { en: "It's American.", cn: "是美国的。", start: 36, end: 39 },
                        { en: "What make is your car?", cn: "你的车是什么牌子的？", start: 39, end: 42 },
                        { en: "It's a Toyota.", cn: "是丰田。", start: 42, end: 45 },
                        { en: "It's Japanese.", cn: "是日本的。", start: 45, end: 48 },
                        { en: "What make is your car?", cn: "你的车是什么牌子的？", start: 48, end: 51 },
                        { en: "It's a Mercedes.", cn: "是奔驰。", start: 51, end: 54 }
                    ];
                case 7: // 第8课内容
                    return [
                        { en: "What's your job?", cn: "你的工作是什么？", start: 30, end: 33 },
                        { en: "I'm a policeman.", cn: "我是警察。", start: 33, end: 36 },
                        { en: "What's your job?", cn: "你的工作是什么？", start: 36, end: 39 },
                        { en: "I'm a policewoman.", cn: "我是女警察。", start: 39, end: 42 },
                        { en: "What's your job?", cn: "你的工作是什么？", start: 42, end: 45 },
                        { en: "I'm a taxi driver.", cn: "我是出租车司机。", start: 45, end: 48 },
                        { en: "What's your job?", cn: "你的工作是什么？", start: 48, end: 51 },
                        { en: "I'm an air hostess.", cn: "我是空姐。", start: 51, end: 54 }
                    ];
                default:
                    return [
                        { en: "Even lesson content", cn: "偶数课内容", start: 30, end: 33 },
                        { en: "This is different from odd lesson", cn: "这与奇数课不同", start: 33, end: 36 },
                        { en: "Practice and exercises", cn: "练习和训练", start: 36, end: 39 },
                        { en: "Thank you for learning", cn: "感谢学习", start: 39, end: 42 }
                    ];
            }
        }

        /** -------------------------------------------------
         *  渲染
         * ------------------------------------------------- */
        function render() {
            bookEl.href = bookScr;
            bookTitleEl.textContent = state.album;
            
            // 设置课程标题
            if (book === 'NCE1') {
                // 对于第一册，显示合并后的课程标题（如第1-2课）
                const lessonFilename = filename.split('/').pop();
                const startLessonNumber = parseInt(lessonFilename.split('&')[0]);
                const endLessonNumber = parseInt(lessonFilename.split('&')[1]);
                lessonTitleEl.textContent = `第${startLessonNumber}-${endLessonNumber}课`;
            } else {
                lessonTitleEl.textContent = state.title;
            }

            // 正常显示LRC内容
            content.innerHTML = state.data.map(
                (item, idx) =>
                    `<div class="sentence" data-idx="${idx}">
                    <div class="en">${item.en}</div>
                    <div class="cn">${item.cn}</div>
                </div>`
            ).join('');
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