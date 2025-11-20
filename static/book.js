(() => {
    document.addEventListener('DOMContentLoaded', () => {
        /** 读取 URL hash 并构造资源路径 */
        const idx = location.hash.slice(1).split('?')[0];
        let bookNumber = idx.replace("NCE", "")
        if (!bookNumber) {
            bookNumber = 1
        }
        let lessonsData = {}
        document.getElementById(`book-${bookNumber}`).classList.add('active');

        // 获取学习进度
        function getStudyProgress() {
            const progress = localStorage.getItem('nce_study_progress');
            return progress ? JSON.parse(progress) : {};
        }

        // 保存学习进度
        function saveStudyProgress(book, lesson) {
            const progress = getStudyProgress();
            progress.lastBook = book;
            progress.lastLesson = lesson;
            localStorage.setItem('nce_study_progress', JSON.stringify(progress));
        }

        // 恢复上次学习进度
        function restoreStudyProgress() {
            const progress = getStudyProgress();
            if (progress.lastBook && progress.lastLesson) {
                // 滚动到上次学习的课程
                setTimeout(() => {
                    const lessonElement = document.querySelector(`[href="lesson.html#${progress.lastBook}/${progress.lastLesson}"]`);
                    if (lessonElement) {
                        lessonElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // 添加高亮效果
                        lessonElement.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                        lessonElement.style.color = 'white';
                    }
                }, 500);
            }
        }

        loadData().then(() => {
            // 初始化所有课文列表
            for (let i = 1; i <= 4; i++) {
                generateLessons(i);
            }
            // 恢复学习进度
            restoreStudyProgress();
        })

        async function loadData() {
            try {
                const dataSrc = 'static/data.json';
                const dataRes = await fetch(dataSrc);
                if (!dataRes.ok) {
                    throw new Error(`HTTP error! status: ${dataRes.status}`);
                }
                lessonsData = await dataRes.json();
            } catch (error) {
                console.error('Failed to load lesson data:', error);
                // 如果数据加载失败，显示错误信息
                for (let i = 1; i <= 4; i++) {
                    const container = document.getElementById(`book-${i}-lessons`);
                    if (container) {
                        container.innerHTML = '<div style="color: #ff6b6b; text-align: center; padding: 20px;">课程数据加载失败，请刷新页面重试</div>';
                    }
                }
            }
        }

        // 生成课文列表的函数
        function generateLessons(bookNumber) {
            const container = document.getElementById(`book-${bookNumber}-lessons`);
            const lessons = lessonsData[bookNumber];

            // 检查课程数据是否存在
            if (!lessons || !Array.isArray(lessons)) {
                container.innerHTML = '<div style="color: #ff6b6b; text-align: center; padding: 20px;">课程数据格式错误</div>';
                return;
            }

            container.innerHTML = '';
            lessons.forEach((lesson, index) => {
                try {
                    if (bookNumber === 1) {
                        // 第一册：每项包含两课，分别显示奇数课和偶数课
                        const oddLessonNumber = index * 2 + 1;
                        const evenLessonNumber = index * 2 + 2;
                        
                        // 奇数课
                        const oddLessonElement = document.createElement('a');
                        oddLessonElement.href = `lesson.html#NCE${bookNumber}/${lesson.filename}?type=odd`;
                        oddLessonElement.className = 'lesson-item';
                        oddLessonElement.innerHTML = `
                            <span class="lesson-number">第${oddLessonNumber}课</span>
                            <span class="lesson-title">${lesson.oddTitle || lesson.title || '未知课程'}</span>
                        `;
                        // 添加进度保存
                        oddLessonElement.addEventListener('click', () => {
                            saveStudyProgress(`NCE${bookNumber}`, lesson.filename);
                        });
                        container.appendChild(oddLessonElement);
                        
                        // 偶数课（如果存在）
                        if (evenLessonNumber <= 144) {
                            const evenLessonElement = document.createElement('a');
                            evenLessonElement.href = `lesson.html#NCE${bookNumber}/${lesson.filename}?type=even`;
                            evenLessonElement.className = 'lesson-item';
                            evenLessonElement.innerHTML = `
                                <span class="lesson-number">第${evenLessonNumber}课</span>
                                <span class="lesson-title">${lesson.evenTitle || lesson.title || '未知课程'}</span>
                            `;
                            // 添加进度保存
                            evenLessonElement.addEventListener('click', () => {
                                saveStudyProgress(`NCE${bookNumber}`, lesson.filename);
                            });
                            container.appendChild(evenLessonElement);
                        }
                    } else {
                        // 其他册：正常显示
                        const lessonNumber = index + 1;
                        const lessonElement = document.createElement('a');
                        lessonElement.href = `lesson.html#NCE${bookNumber}/${lesson.filename}`;
                        lessonElement.className = 'lesson-item';
                        lessonElement.innerHTML = `
                            <span class="lesson-number">第${lessonNumber}课</span>
                            <span class="lesson-title">${lesson.title || '未知课程'}</span>
                        `;
                        // 添加进度保存
                        lessonElement.addEventListener('click', () => {
                            saveStudyProgress(`NCE${bookNumber}`, lesson.filename);
                        });
                        container.appendChild(lessonElement);
                    }
                } catch (error) {
                    console.error(`Error generating lesson ${index + 1} for book ${bookNumber}:`, error);
                    // 如果单个课程生成失败，跳过该课程
                }
            });
        }

    })
})()