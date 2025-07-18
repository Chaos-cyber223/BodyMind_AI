// 清除所有 AsyncStorage 数据
if (typeof window !== 'undefined' && window.localStorage) {
  console.log('Clearing AsyncStorage data...');
  const keysToRemove = ['access_token', 'user_data', 'profile_complete', 'language', 'user_profile'];
  keysToRemove.forEach(key => {
    window.localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  console.log('AsyncStorage cleared!');
}
