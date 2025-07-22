/*
 * @Description: 
 * @Autor: zhy
 * @Date: 2025-06-26 15:35:40
 * @LastEditors: zhy
 * @LastEditTime: 2025-07-22 16:57:24
 */
import { View, Text, Image, Button, Input } from "@tarojs/components";
import { useState } from "react";
import { getStorageSync, useReachBottom, useLoad, showToast } from '@tarojs/taro'
import { getInventoryHisList, InventoryHisList } from '../../api/index'
import loadingImg from "../../images/loading.gif"
import noData from "../../images/nodata.png"
import './index.scss'

const PAGE_SIZE = 10;


// 领用弹窗组件
const ReceiveModal = ({ visible, onClose, onSubmit }) => {
  const [remark, setRemark] = useState('');
  // 重置内容
  const handleClose = () => {
    setRemark('');
    onClose();
  };

  const handleOk = () => {
    onSubmit({ remark });
    handleClose();
  };

  if (!visible) return null;

  return (
    <View className="modal-mask">
      <View className="modal-content">
        <Text className="modal-title">审核处理</Text>
        <View className="modal-row">
          <Text>审核备注</Text>
          <Input
            className="modal-input"
            type="text"
            value={remark}
            placeholder="请输入备注"
            onInput={e => setRemark(e.detail.value)}
          />
        </View>
        <View className="modal-btns">
          <Button size="mini" className="cancel-btn" onTap={handleClose}>取消</Button>
          <Button size="mini" className="taro-btn" onTap={handleOk}>确定</Button>
        </View>
      </View>
    </View>
  );
};



const My = () => {

  const userInfo = getStorageSync('userInfo') || {
    avatar: "https://img.yzcdn.cn/vant/cat.jpeg",
    name: "***",
    phone: "*****",
    dept: "*****"
  };

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [depStatus, setdepStatus] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState<InventoryHisList | null>(null);


  // 首次加载
  useLoad(() => {
    fetchMore(1, true);
    // eslint-disable-next-line
  });

  // 下拉加载更多
  useReachBottom(() => {
    if (hasMore && !loading) {
      fetchMore(page + 1);
    }
  });


  const handleModalSubmit = ({ remark }) => {
    showToast({
      icon: 'none',
      duration: 1000,
      title: `已提交 审核备注:${remark}`,
    });
    setModalVisible(false);
    console.log('提交审核', remark, data);
    // 这里可加实际接口调用
  };



  const handleReceive = (item: InventoryHisList) => {
    setData(item);
    setModalVisible(true);
  };


  const fetchMore = async (pageNum = 1, reset = false) => {
    setLoading(true);
    // 用历史接口
    const res = await getInventoryHisList({ page: pageNum, limit: PAGE_SIZE });
    console.log(res)
    // res 直接是数组
    setHistoryList(prev =>
      reset ? (res || []) : [...prev, ...(res || [])]
    );
    setPage(pageNum);
    // 判断是否还有更多
    setHasMore((res && res.length === PAGE_SIZE) ? true : false);
    setLoading(false);
  };

  return (
    <View className="my-wrapper">
      {/* 顶部背景 */}
      <View className="user-card-gradient">
        <View className="user-card-inner">
          <Image className="avatar" src={userInfo.avatar} />
          <View className="user-meta">
            <Text className="user-phone">{userInfo.phone}</Text>
            <Text className="user-dept">{userInfo.dept}</Text>
          </View>
          <Button
            onTap={() => {
              if (!!depStatus) {
                setdepStatus(0);
              } else {
                setdepStatus(1);
              }
            }}
            size="mini"
          >权限测试按钮</Button>
        </View>
      </View>

      {/* 领用历史 */}
      <View className="history-section">
        <Text className="history-title">领用历史</Text>
        <View className="history-list">
          {historyList.map(item => (
            <View className="history-item" key={item.inventory_id + '-' + item.created_at}>
              <View className="item-left">
                <View>
                  <Text className="item-date">申请时间 {item.created_at || ''}</Text>
                  <Text className="item-desc">产品：{item.inventory_name || ''} </Text>
                  {!!depStatus && <Text className="item-desc">用户：{item.user_name || ''}</Text>}
                  <Text className="item-desc">数量：{item.num || 0}</Text>
                  <Text className="item-desc">单价：{item.price || 0}</Text>
                  <Text className="item-desc">总金额：{item.money || 0}</Text>
                  {item.comment && <Text className="item-desc">备注：{item.comment}</Text>}
                  {item.note && <Text className="item-desc">审核备注：{item.note}</Text>}
                </View>
              </View>
              <Text className={`item-status ${item.examine === 1 ? 'status-done' : item.examine === 2 ? 'status-reject' : 'status-using'
                }`}>
                {item.examine === 1 ? '已通过' : item.examine === 2 ? '已拒绝' : '待审核'}
              </Text>
              {!!depStatus && !item.examine && <Button
                size="mini"
                className="dep-btn"

                onTap={() => handleReceive(item)}
              >审核</Button>}

            </View>
          ))}
          {historyList.length === 0 && !loading && (
            <View className="no-data">
              <Image src={noData} />
            </View>
          )}
          {loading && (
            <View className="loading">
              <Image src={loadingImg} />
            </View>
          )}
          {!hasMore && historyList.length > 0 && !loading && (
            <View style={{ textAlign: 'center', color: '#bbb', padding: '16px 0' }}>没有更多了</View>
          )}
        </View>
      </View>


      {/* 领用弹窗 */}
      <ReceiveModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setData(null); }}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
};

export default My;