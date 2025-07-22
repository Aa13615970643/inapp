/*
 * @Description: 
 * @Autor: zhy
 * @Date: 2025-06-26 15:14:00
 * @LastEditors: zhy
 * @LastEditTime: 2025-07-22 19:24:58
 */
/// <reference types="@tarojs/taro" />
/// <reference types="@taro-hooks/plugin-react" />
 

//import '@taro-hooks/plugin-react';
declare module '*.png';
declare module '*.gif';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.styl';

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd'
  }
}


