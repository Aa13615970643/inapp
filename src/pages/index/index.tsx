import { View, Text, Input, Button, Image } from "@tarojs/components";
import { useLoad, useReachBottom, showToast, hideKeyboard } from '@tarojs/taro'
import { useState } from "react";
import { getInventoryList, InventoryData, InventoryList } from '../../api/index'
import loadingImg from "../../images/loading.gif"
import noData from "../../images/nodata.png"
import './index.scss'

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onConfirm?: () => void;
}

const SearchInput = ({ value, onChange, placeholder = "请输入搜索内容", onConfirm = () => { } }: SearchInputProps) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <View className="search-wrapper" >
      <Input
        className="input"
        type="text"
        value={value}
        holdKeyboard
        onInput={e => {
          onChange(e.detail.value);
        }}
        placeholder={placeholder}
        placeholderClass="placeholder"
        confirmType="search"
        onConfirm={onConfirm}
      />
      {value && (
        <View className="clear-btn-box">
          <Text
            className="clear-btn"
            onClick={handleClear}
          >×</Text>
        </View>
      )}
      <Button className="search-btn" size="mini" onTap={() => { hideKeyboard(); onConfirm() }} >
        搜索
      </Button>
    </View >
  );
}

// 领用弹窗组件
const ReceiveModal = ({ visible, onClose, onSubmit, maxNum = 1 }) => {
  const [remark, setRemark] = useState('');
  const [num, setNum] = useState(1);

  // 重置内容
  const handleClose = () => {
    setRemark('');
    setNum(1);
    onClose();
  };

  const handleOk = () => {
    onSubmit({ remark, num });
    handleClose();
  };

  if (!visible) return null;

  return (
    <View className="modal-mask">
      <View className="modal-content">
        <Text className="modal-title">领用信息</Text>
        <View className="modal-row">
          <Text>数量</Text>
          <Input
            className="modal-input"
            type="number"
            value={String(num)}
            onInput={e => {
              let v = Number(e.detail.value);
              if (v < 1) v = 1;
              if (v > maxNum) v = maxNum;
              setNum(v);
            }}
          />
          <Text style={{ marginLeft: 8 }}>（最多{maxNum}）</Text>
        </View>
        <View className="modal-row">
          <Text>备注</Text>
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

const PAGE_SIZE = 20;

const Index = () => {
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState(true);
  const [list, setList] = useState<InventoryList[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 弹窗控制
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMax, setModalMax] = useState(1);
  const [data, setData] = useState<InventoryList | null>(null);
  // 打开弹窗
  const handleReceive = (item: InventoryList) => {
    if (!item.in_stock) {
      showToast({
        icon: 'none',
        duration: 1000,
        title: '库存不足，请联系管理员',
      });
      return;
    }
    setModalMax(item.in_stock || 1);
    setData(item);
    setModalVisible(true);
  };

  // 弹窗提交
  const handleModalSubmit = ({ remark, num }) => {
    showToast({
      icon: 'none',
      duration: 1000,
      title: `已提交，数量:${num} 备注:${remark}`,
    });
    setModalVisible(false);
    console.log(data)
    console.log('提交领用', remark, num);
    // 这里可加实际接口调用
  };

  const handleSearch = () => {
    setPage(1);
    setList([]);
    setHasMore(true);
    fetchInventoryList(1, true);
  };

  const fetchInventoryList = async (pageNum = page, isSearch = false) => {
    if (loading || (!hasMore && !isSearch)) return;
    setLoading(true);
    try {
      const data: InventoryData = { name: searchValue, page: pageNum, limit: PAGE_SIZE };
      const response = await getInventoryList(data);

      const filtered = (response || []).filter(item => !!item.is_available);
      if (isSearch) {
        setList(filtered);
      } else {
        setList(prev => [...prev, ...filtered]);
      }

      setHasMore(Array.isArray(response) && response.length === PAGE_SIZE);
      setPage(pageNum + 1);
    } catch (error) {
      console.error("获取库存列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useReachBottom(() => {
    if (hasMore) {
      fetchInventoryList();
    }
  });

  useLoad(() => {
    setPage(1);
    setList([]);
    setHasMore(true);
    fetchInventoryList(1, true);
  });

  return (
    <View className="wrapper">
      <SearchInput
        value={searchValue}
        onChange={setSearchValue}
        placeholder="请输入搜索内容"
        onConfirm={handleSearch}
      />
      <View className="main" onTap={() => { hideKeyboard(); }}>
        <View className="main-header" >
          <Text>saixuan</Text>
          <Button className="main-btn" size="mini" onTap={() => { setStatus(!status); }} >
            {status ? "表格" : "卡片"}
          </Button>
        </View>
        <View className="main-content">
          {status ? (
            <View className="card-view">
              {list.map(item => (
                <View className="card-item" key={item.id}>
                  <View className="card-img-wrapper">
                    <Image src={item.picture || ''} mode="aspectFit" className="card-img" />
                  </View>
                  <Text className="card-title">名称: {item.name || ''}</Text>
                  <View className="card-info">
                    <Text className="card-text">库存: {item.in_stock || 0}</Text>
                    <Text className="card-text">价格: {item.price || 0}</Text>
                  </View>
                  <Button
                    onTap={() => handleReceive(item)}
                    className={(item.in_stock === 0 || item.in_stock === null) ? 'disabled-btn' : 'td-btn'}
                    size="mini"
                  >领用</Button>
                </View>
              ))}
            </View>
          ) : (
            <View className="table-view">
              <View className="table-header">
                <Text className="th">名称</Text>
                <Text className="th">库存</Text>
                <Text className="th">价格</Text>
                <Text className="th">操作</Text>
              </View>
              {list.map(item => (
                <View className="table-row" key={item.id}>
                  <Text className="td">{item.name || ''}</Text>
                  <Text className="td">{item.in_stock || 0}</Text>
                  <Text className="td" >{item.price || 0} </Text>
                  <Button
                    onTap={() => handleReceive(item)}
                    className={(item.in_stock === 0 || item.in_stock === null) ? 'disabled-btn' : 'td-btn'}
                    size="mini"
                  >领用</Button>
                </View>
              ))}
            </View>
          )}

          {list.length === 0 && !loading && (
            <View className="no-data">
              <Image src={noData} />
            </View>
          )}
          {loading && (
            <View className="loading">
              <Image src={loadingImg} />
            </View>
          )}
          {!hasMore && list.length > 0 && !loading && (
            <View style={{ textAlign: 'center', color: '#bbb', padding: '16px 0' }}>
              没有更多了
            </View>
          )}
        </View>
      </View>
      {/* 领用弹窗 */}
      <ReceiveModal
        visible={modalVisible}
        maxNum={modalMax}
        onClose={() => { setModalVisible(false); setData(null); }}
        onSubmit={handleModalSubmit}
      />
    </View >
  );
}
export default Index;