/*
 * @Description: 全局配置
 * @Autor: zhy
 * @Date: 2025-06-26 15:14:00
 * @LastEditors: zhy
 * @LastEditTime: 2025-06-28 12:14:24
 */
export default {
  pages: ["pages/login/index","pages/index/index", "pages/my/index"],
  tabBar: {
    color:'#bfbfbf',
    selectedColor: '#1296db',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'images/tabbar/index.png',
        selectedIconPath: 'images/tabbar/index-active.png',
        
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'images/tabbar/my.png',
        selectedIconPath: 'images/tabbar/my-active.png',
      
      },
    ],
  },
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#1296db",
    navigationBarTextStyle: "white",
    backgroundColor:"#ffffff",
  },
};
