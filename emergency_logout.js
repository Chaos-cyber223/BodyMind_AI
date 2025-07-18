// 紧急登出脚本
// 在浏览器控制台直接粘贴运行

console.log('🚨 紧急登出程序启动...');

// 1. 清除所有存储
console.log('1️⃣ 清除 localStorage...');
localStorage.clear();

console.log('2️⃣ 清除 sessionStorage...');  
sessionStorage.clear();

// 2. 清除所有cookies
console.log('3️⃣ 清除 cookies...');
document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});

// 3. 清除IndexedDB (如果有)
console.log('4️⃣ 清除 IndexedDB...');
if ('indexedDB' in window) {
    indexedDB.databases().then(dbs => {
        dbs.forEach(db => indexedDB.deleteDatabase(db.name));
    });
}

// 4. 清除缓存存储
console.log('5️⃣ 清除 Cache Storage...');
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
    });
}

// 5. 显示清除结果
console.log('✅ 所有存储已清除！');
console.log('📋 验证清除结果:');
console.log('  - localStorage 项目数:', Object.keys(localStorage).length);
console.log('  - sessionStorage 项目数:', Object.keys(sessionStorage).length);

// 6. 强制刷新
console.log('🔄 3秒后强制刷新页面...');
setTimeout(() => {
    window.location.href = 'http://localhost:8081';
}, 3000);