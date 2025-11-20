/**
 * 部署前测试脚本
 * 验证项目结构和关键文件完整性
 */

const fs = require('fs');
const path = require('path');

// 必需的文件列表
const requiredFiles = [
  'index.html',
  'book.html', 
  'lesson.html',
  'CNAME',
  'LICENSE',
  'vercel.json',
  'README.md',
  'static/base.css',
  'static/index.css',
  'static/book.css',
  'static/lesson.css',
  'static/book.js',
  'static/lesson.js',
  'static/data.json',
  'images/NCE1.jpg',
  'images/NCE2.jpg',
  'images/NCE3.jpg',
  'images/NCE4.jpg'
];

// 检查教材目录结构
const checkTextbookStructure = () => {
  const textbooks = ['NCE1', 'NCE2', 'NCE3', 'NCE4'];
  const results = [];
  
  textbooks.forEach(book => {
    if (fs.existsSync(book)) {
      const files = fs.readdirSync(book);
      const mp3Files = files.filter(f => f.endsWith('.mp3'));
      const lrcFiles = files.filter(f => f.endsWith('.lrc'));
      
      results.push({
        book,
        exists: true,
        mp3Count: mp3Files.length,
        lrcCount: lrcFiles.length,
        balanced: mp3Files.length === lrcFiles.length
      });
    } else {
      results.push({
        book,
        exists: false,
        mp3Count: 0,
        lrcCount: 0,
        balanced: false
      });
    }
  });
  
  return results;
};

// 运行测试
console.log('🔍 开始项目结构测试...\n');

// 检查必需文件
console.log('📁 检查必需文件:');
let missingFiles = [];
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - 缺失`);
    missingFiles.push(file);
  }
});

// 检查教材结构
console.log('\n📚 检查教材结构:');
const textbookResults = checkTextbookStructure();
textbookResults.forEach(result => {
  const status = result.exists ? '✅' : '❌';
  const balance = result.balanced ? '✓' : '✗';
  console.log(`   ${status} ${result.book}: MP3=${result.mp3Count}, LRC=${result.lrcCount}, 平衡=${balance}`);
});

// 统计总文件数
console.log('\n📊 文件统计:');
const totalMp3 = textbookResults.reduce((sum, r) => sum + r.mp3Count, 0);
const totalLrc = textbookResults.reduce((sum, r) => sum + r.lrcCount, 0);
console.log(`   音频文件: ${totalMp3} 个`);
console.log(`   歌词文件: ${totalLrc} 个`);
console.log(`   总课程数: ${totalMp3} 课`);

// 输出测试结果
console.log('\n🎯 测试结果:');
if (missingFiles.length === 0) {
  console.log('   ✅ 所有必需文件都存在');
} else {
  console.log(`   ❌ 缺失 ${missingFiles.length} 个文件`);
  missingFiles.forEach(file => console.log(`      - ${file}`));
}

const allTextbooksExist = textbookResults.every(r => r.exists);
const allBalanced = textbookResults.every(r => r.balanced);

if (allTextbooksExist && allBalanced) {
  console.log('   ✅ 教材结构完整且平衡');
} else {
  if (!allTextbooksExist) {
    console.log('   ❌ 部分教材目录缺失');
  }
  if (!allBalanced) {
    console.log('   ❌ 部分教材MP3和LRC文件数量不匹配');
  }
}

console.log('\n🚀 部署准备状态:');
if (missingFiles.length === 0 && allTextbooksExist && allBalanced) {
  console.log('   ✅ 项目结构完整，可以部署到Vercel');
} else {
  console.log('   ❌ 项目结构存在问题，请先修复');
}

// 生成部署检查清单
console.log('\n📋 部署检查清单:');
console.log('   1. ✅ 项目结构验证');
console.log('   2. 🔄 推送到GitHub仓库');
console.log('   3. 🌐 在Vercel导入仓库');
console.log('   4. 🔗 配置自定义域名');
console.log('   5. ✅ 测试网站功能');