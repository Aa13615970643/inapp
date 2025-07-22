

import Taro from '@tarojs/taro'
const BASE_URL = 'https://www.123fe.net'


/**
 * @param {Object} props
 * @description 针对搜索值做统一处理
 */
const convertParams = (props) => {
  const newParams = {};
  for (const index in props) {
    const item = props[index];
    const type = typeof item;
    if (item || item === false || item === 0) {
      if (item && type === 'string') {
        newParams[index] = item.replace(/\s/g, '');
      }
      if (Object.prototype.toString.call(item) === '[object Object]') {
        newParams[index] = convertParams(item)
      } else {
        newParams[index] = item;
      }
    }
  }
  return newParams;
};

interface configData {
  contentType?: string
}

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '请求资源不存在。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const removeSorage = () => {
  Taro.removeStorage({ key: 'token' })
  Taro.removeStorage({ key: 'userInfo' })
  Taro.showToast({
    icon: 'none',
    duration: 3000,
    title: '登录已过期，请重新登录',
  })
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const route = (currentPage && currentPage.route) || (currentPage && currentPage.__route__) || '';
  if (!route.includes('login')) {
    Taro.reLaunch({
      url: '/pages/login/index'
    });
  }
}

const baseOptions = (url: string, params: object = {}, method = 'get', config: configData = {}) => {
  const { contentType } = config
  Taro.showLoading({ title: "", mask: false });
  const option: any = {
    url: BASE_URL + url,
    data: params,
    method: method,
    timeout: 10000,
    header: { 'content-type': contentType || 'application/json;charset=UTF-8', Authorization: Taro.getStorageSync('token') },
    success(response) {
      Taro.hideLoading();
      const data = response.data;
      if (data.code === 200) return data
      if (data.code === 403) return removeSorage()
      Taro.showToast({
        icon: 'none',
        duration: 3000,
        title: data.msg || '',
      })
      return data
    },
    error(err) {
      Taro.hideLoading();
      if (err.statusCode === 403) return removeSorage()
      Taro.showToast({
        icon: 'none',
        duration: 3000,
        title: codeMessage[err.statusCode] || '',
      })
      return Promise.reject(err)
    }
  }
  return Taro.request(option)
}


 export const request = async (url: string, params: object = {}, method = 'get', config?) => {
  params = convertParams(params)
  try {
    const res = await baseOptions(url, params, method, config)
    return res.data
  } catch (err) {
    throw new Error(err)
  }
}




const mockGetInventoryList = async (url, data: InventoryData, x): Promise<InventoryList[]> => {
  console.log('mockGetInventoryList', url, data, x);
  // 总数据量
  const total = 100;
  const parr = [
    'https://img2.baidu.com/it/u=3018303209,1765139986&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=722',
    'https://img0.baidu.com/it/u=4067836619,99985868&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=283',
    'https://img2.baidu.com/it/u=3693067398,2696388876&fm=253&fmt=auto&app=138&f=JPEG?w=750&h=500',
    ''
  ];
  // 生成全部数据
  const allList: InventoryList[] = Array.from({ length: total }, (_, i) => ({
    id: i + 1,
    name: `产品${i + 1}`,
    price: Math.floor(Math.random() * 100),
    in_stock: Math.floor(Math.random() * 100),
    is_available: Math.random() > 0.2,
    category_id: Math.floor(Math.random() * 5) + 1,
    picture: parr[Math.floor(Math.random() * parr.length)],
    created_at: new Date().toISOString(),
  }));

  // 搜索过滤
  let filteredList = allList;
  if (data.name) {
    filteredList = allList.filter(item => item.name&& item.name.includes(data.name!));
  }

  // 分页
  const start = (data.page - 1) * data.limit;
  const end = start + data.limit;
  const pageList = filteredList.slice(start, end);

  // 模拟网络延迟
  return new Promise<InventoryList[]>(resolve => {
    setTimeout(() => {
      Taro.hideLoading();
      resolve(pageList);
    }, 500);
  });
};





const mockGetInventoryList2 = async (url, data: InventoryData & { page: number; limit: number }, x): Promise<InventoryHisList[]> => {
  console.log('mockGetInventoryList2', url, data, x);
  // 总数据量
  const total = 100;

  // 生成全部数据
  const allList: InventoryHisList[] = Array.from({ length: total }, (_, i) => {
    const num = Math.floor(Math.random() * 10) + 1;
    const price = Math.floor(Math.random() * 100) + 1;
    const examine = Math.floor(Math.random() * 3);
    return {
      user_name: `用户${(i % 10) + 1}`,
      user_id: (i % 10) + 1,
      inventory_name: `产品${(i % 20) + 1}`,
      inventory_id: (i % 20) + 1,
      examine,
      price,
      num,
      money: price * num,
      created_at: new Date(Date.now() - Math.random() * 1000000000).toISOString().slice(0, 19).replace('T', ' '),
      comment: `备注${i + 1}`,
      note: examine === 2 ? '审核不通过，原因示例' : (Math.random() > 0.8 ? '补充说明' : ''),
    }
  });

  // 不做任何过滤，直接分页
  const start = (data.page - 1) * data.limit;
  const end = start + data.limit;
  const pageList = allList.slice(start, end);

  // 模拟网络延迟
  return new Promise<InventoryHisList[]>(resolve => {
    setTimeout(() => {
      Taro.hideLoading();
      resolve(pageList);
    }, 500);
  });
};





/* 
  获取库存列表
*/
 export  interface InventoryData {
  name?: string;
  page: number;
  limit: number;
}
 
 export interface InventoryList {
  id: number;             // 产品ID，可选
  name?: string;           // 产品名称，可选
  in_stock?: number;       // 库存数，可选
  is_available?: boolean;  // 是否启用，可选
  category_id?: number;    // 分类id，可选
  picture?: string;        // 图片地址，可选
  created_at?: string;     // 创建时间，可选
  price?: number;         // 价格，可选
}

export  const getInventoryList = async (data:InventoryData):Promise<InventoryList[]| null> => {
  const url = '/api/inventory/list'
  return mockGetInventoryList(url, data, 'get')
//  return request(url, data, 'get')
};



export interface InventoryHisList{
  user_name?: string; // 用户名
  user_id?: number; // 用户ID
  inventory_name?: string; // 产品名称
  inventory_id?: number; // 产品ID
  examine?: number; // 审核状态
  price?: number; // 价格
  num?: number; // 数量
  money?: number; // 金额
  created_at?: string; // 创建时间
  comment?: string; // 备注
  note?: string; // 审核备注
}


export const getInventoryHisList = async (data: InventoryData): Promise<InventoryHisList[] | null> => {
  const url = '/api/inventory/history'
  return mockGetInventoryList2(url, data, 'get')
};





