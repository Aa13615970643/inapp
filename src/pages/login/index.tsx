/*
 * @Description: 登陆
 * @Autor: zhy
 * @Date: 2025-06-27 05:40:24
 * @LastEditors: zhy
 * @LastEditTime: 2025-07-22 13:37:34
 */
import { View, Text, Input, Button, Image } from "@tarojs/components";
import { useState, } from "react";
import { getStorageSync, useLoad, showToast, setStorageSync, switchTab } from '@tarojs/taro'
import './index.scss';
import loadingImg from "../../images/loading.gif"

const Login = () => {
  const [phone, setPhone] = useState('');
  const [dept, setDept] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = () => {
    // 登录逻辑
    if (!phone || !dept || !password) {
      showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }
    setStorageSync('token', 'mocked_token'); // 模拟登录成功，实际应用中应调用后端API
    setStorageSync('userInfo', {
      phone,
      dept,
      password,
    });
    setTimeout(() => {
      {
        switchTab
          ({
            url: '/pages/index/index', // 登录成功后跳转到首页
          });
      }
    }, 1000);
  };

  useLoad(() => {
    const token = getStorageSync('token')
    setLoading(!!token);
  });



  return (
    <View>
      {loading ? (
        <View className="login-loading">
          <Image className="login-loading-img" src={loadingImg} />
        </View>
      ) : (
        <View className="login-wrapper">
          <View className="login-bg" />
          <View className="login-card">
            <Text className="login-title">账号登录</Text>
            <Input
              className="login-input"
              type="text"
              placeholder="手机号"
              value={phone}
              onInput={e => setPhone(e.detail.value)}
            />
            <Input
              className="login-input"
              type="text"
              placeholder="部门"
              value={dept}
              onInput={e => setDept(e.detail.value)}
            />
            <Input
              className="login-input"
              type={"password" as any}
              placeholder="密码"
              value={password}
              onInput={e => setPassword(e.detail.value)}
            />
            <Button className="login-btn" onTap={handleLogin}>登录</Button>
          </View>
        </View>
      )}
    </View>
  );






};

export default Login;