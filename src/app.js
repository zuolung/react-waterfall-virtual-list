import React from "react";
import VirtualWaterfallList from "./index";
import { InfiniteScroll, PullToRefresh } from "antd-mobile";
import "./app.less";
const data = mockGoods();

export default function Demo() {
  const [data, setdata] = React.useState([]);
  const VirtualListInstance = React.useRef();

  const loadMore = async () => {
    const reslult = await mockGoods();
    const newData = [].concat(data, reslult);
    if (Math.random() < 0.05) {
      throw new Error("mock request failed");
    }
    setdata(newData);
  };

  const onRefresh = async () => {
    const reslult = await mockGoods();
    await VirtualListInstance.current.reset();
    setdata(reslult);
    resolve();
  };

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <VirtualWaterfallList
        style={{
          boxSizing: "border-box",
          height: "calc(100vh - 12px)",
        }}
        ref={VirtualListInstance}
        dataSource={data}
        showCount={10}
        gap={4}
        footer={<InfiniteScroll loadMore={loadMore} hasMore={true} />}
        ItemRender={React.memo(({ index, item, className, ...props }) => {
          return (
            <div
              className={`van-demo-goods-item-wrapper ${className}`}
              {...props}
            >
              <div className="van-demo-goods-item">
                <img src={item.image} className="img" />
                <div className="title">{item.title}</div>
                {item.isCutPrice && (
                  <span className="cutPrice">最近大降价</span>
                )}
                <div className="price">{item.price}</div>
              </div>
            </div>
          );
        })}
      />
    </PullToRefresh>
  );
}

function mockGoods() {
  const initData = [
    {
      image: "https://img.yzcdn.cn/vant/cat.jpeg",
      title:
        "中老年羽绒服男冬季爸爸装薄短款白鸭绒中年人男士保暖外套男装 夜空黑 L【建议115斤以内】",
      price: "¥165.00",
    },
    {
      image: "https://img.yzcdn.cn/vant/cat.jpeg",
      title: "HLA海澜之家马丁靴男士高帮男靴复古工装鞋",
      price: "¥361.00",
    },
    {
      image: "https://img.yzcdn.cn/vant/cat.jpeg",
      title:
        "洁丽雅拖鞋男夏浴室洗澡防滑家居室内EVA大码男士凉拖鞋居家用夏季防臭 灰色 41-42【标准码】",
      price: "¥22.50",
    },
    {
      image: "https://img.yzcdn.cn/vant/cat.jpeg",
      title: "夏季新款男士T恤宽松气质高端百搭时尚短袖体恤潮牌",
      price: "¥212.00",
    },
  ];
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        new Array(20).fill("").map((item, index) => {
          return {
            index,
            ...initData[index % 4],
            isCutPrice: index % 2 === 0 ? true : false,
          };
        })
      );
    }, 1400);
  });
}
