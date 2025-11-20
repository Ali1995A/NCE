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
            const dataSrc = 'static/data.json';
            const dataRes = await fetch(dataSrc);
            lessonsData = await dataRes.json();
        }

        // 生成课文列表的函数
        function generateLessons(bookNumber) {
            const container = document.getElementById(`book-${bookNumber}-lessons`);
            const lessons = lessonsData[bookNumber];

            container.innerHTML = '';
            lessons.forEach((lesson, index) => {
                if (bookNumber === 1) {
                    // 第一册：每项包含两课，分别显示奇数课和偶数课
                    const oddLessonNumber = index * 2 + 1;
                    const evenLessonNumber = index * 2 + 2;
                    
                    // 奇数课
                    const oddLessonElement = document.createElement('a');
                    oddLessonElement.href = `lesson.html#NCE${bookNumber}/${lesson.filename}`;
                    oddLessonElement.className = 'lesson-item';
                    oddLessonElement.innerHTML = `
                        <span class="lesson-number">第${oddLessonNumber}课</span>
                        <span class="lesson-title">${lesson.oddTitle || lesson.title}</span>
                    `;
                    // 添加进度保存
                    oddLessonElement.addEventListener('click', () => {
                        saveStudyProgress(`NCE${bookNumber}`, lesson.filename);
                    });
                    container.appendChild(oddLessonElement);
                    
                    // 偶数课（如果存在）
                    if (evenLessonNumber <= 144) {
                        const evenLessonElement = document.createElement('a');
                        evenLessonElement.href = `lesson.html#NCE${bookNumber}/${lesson.filename}`;
                        evenLessonElement.className = 'lesson-item';
                        evenLessonElement.innerHTML = `
                            <span class="lesson-number">第${evenLessonNumber}课</span>
                            <span class="lesson-title">${lesson.evenTitle || lesson.title}</span>
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
                        <span class="lesson-title">${lesson.title}</span>
                    `;
                    // 添加进度保存
                    lessonElement.addEventListener('click', () => {
                        saveStudyProgress(`NCE${bookNumber}`, lesson.filename);
                    });
                    container.appendChild(lessonElement);
                }
            });
        }

    })
})()