# react-waterfall-virtual-list

适用于移动端的瀑布流虚拟列表

### Demo online

[在线查看](https://zuolung.github.io/react-waterfall-virtual-list/dist/index.html)

### install

npm i react-waterfall-virtual-list -S

### 基本使用

和 antdMoblie 的 PullToRefresh 和 InfiniteScroll 搭配使用

```jsx
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
```

### API

### props

| 参数              | 说明                                                           | 类型                                                                                                                                                                                                                                                       | 默认值                                                                     | 必填    |
| ----------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------- |
| listStyle         | 列容器的样式                                                   | _&nbsp;&nbsp;CSSProperties<br/>_                                                                                                                                                                                                                           | -                                                                          | `false` |
| listClssName      | 列容器的样式名                                                 | _&nbsp;&nbsp;string<br/>_                                                                                                                                                                                                                                  | -                                                                          | `false` |
| height            | 滚动外层容器高度                                               | _&nbsp;&nbsp;number&nbsp;&brvbar;&nbsp;string<br/>_                                                                                                                                                                                                        | -                                                                          | `true`  |
| footer            | 底部额外渲染                                                   | _&nbsp;&nbsp;ReactNode<br/>_                                                                                                                                                                                                                               | -                                                                          | `false` |
| showCount         | 可视区域展示的最大数量, 高度不一的时候按全部最小高度展示去计算 | _&nbsp;&nbsp;number<br/>_                                                                                                                                                                                                                                  | -                                                                          | `true`  |
| gap               | 可视区域展示的最大数量                                         | _&nbsp;&nbsp;number<br/>_                                                                                                                                                                                                                                  | -                                                                          | `false` |
| dataSource        | 数据源，数组                                                   | _&nbsp;&nbsp;Array<T><br/>_                                                                                                                                                                                                                                | -                                                                          | `true`  |
| ItemRender        | 自定义渲染每一项                                               | _&nbsp;&nbsp;FunctionComponent<<br/>&nbsp;&nbsp;&nbsp;&nbsp;{<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;item:&nbsp;T<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;index?:&nbsp;number<br/>&nbsp;&nbsp;&nbsp;&nbsp;}&nbsp;&&nbsp;ViewProps<br/>&nbsp;&nbsp;><br/>_ | -                                                                          | `true`  |
| renderBackToTop   | 自定义回到顶部按钮渲染                                         | _&nbsp;&nbsp;ReactNode<br/>_                                                                                                                                                                                                                               | -                                                                          | `false` |
| backToTopSuccess  | 成功返回顶部后执行                                             | _&nbsp;&nbsp;()&nbsp;=>&nbsp;void<br/>_                                                                                                                                                                                                                    | -                                                                          | `false` |
| backToTopCritical | 展示返回顶端按钮的临界值，上方隐藏了多少个 ItemRender          | _&nbsp;&nbsp;number<br/>_                                                                                                                                                                                                                                  | `VirtualHalfList`的为`showCount`乘 2,`VirtualWaterfallList`的为`showCount` | `false` |

### 组件实例

| 方法      | 说明     | 类型                                    |
| --------- | -------- | --------------------------------------- |
| reset     | 重置状态 | _&nbsp;&nbsp;()&nbsp;=>&nbsp;void<br/>_ |
| backToTop | 返回顶部 | _&nbsp;&nbsp;()&nbsp;=>&nbsp;void<br/>_ |
