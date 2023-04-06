import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { getClosestIndex_ } from "./utils";
import "./index.less";

const clsPrefix = "van-virtual-waterfall-list";

function VirtualWaterfallList_(props, ref) {
  const {
    className,
    style,
    footer,
    dataSource,
    showCount = 6,
    listClssName = "",
    gap = 10,
    ItemRender,
    renderBackToTop,
    backToTopCritical,
    backToTopSuccess,
  } = props;
  const step = useMemo(() => {
    return Math.ceil(showCount / 2);
  }, [showCount]);
  const prevTransformIndex = useRef(0);
  const prevDataLength = useRef(0);
  const compareHistory = useRef({});

  const [leftData, setLeftData] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [leftRects, setLeftRects] = useState([]);
  const [rightRects, setRightRects] = useState([]);
  const [leftShowConfig, setLeftShowConfig] = useState({
    head: 0,
    tail: step,
    transformY: 0,
  });
  const [rightShowConfig, setRightShowConfig] = useState({
    head: 0,
    tail: step,
    transformY: 0,
  });

  const updateItemRect = useCallback((i, rectTarget, tn) => {
    let targetName = `van-virtual-${tn}-item${i}`;
    const dom = document.getElementsByClassName(targetName)[0];
    if (dom) {
      const res = {
        height: dom.offsetHeight,
      };
      let prev = {};
      if (i > 0) {
        prev = rectTarget[i - 1];
      }
      rectTarget[i] = {
        top: i === 0 ? 0 : Math.floor(prev.height) + prev.top,
        height: Math.floor(res.height),
      };
    }
  }, []);

  const updateLeftRects = useCallback(
    (leftRects) => {
      for (let i = leftShowConfig.head; i < leftShowConfig.tail; i++) {
        updateItemRect(i, leftRects, "left");
      }
      setLeftRects([...leftRects]);
    },
    [leftShowConfig.head, leftShowConfig.tail, updateItemRect]
  );

  const updateRightRects = useCallback(
    (rightRects) => {
      for (let i = rightShowConfig.head; i < rightShowConfig.tail; i++) {
        updateItemRect(i, rightRects, "right");
      }
      setRightRects([...rightRects]);
    },
    [rightShowConfig.head, rightShowConfig.tail, updateItemRect]
  );

  const leftDataGiveRight = useCallback(
    (diffHeight) => {
      let lastRectHeight = leftRects[leftRects.length - 1].height;
      while (diffHeight > lastRectHeight) {
        const d = leftData.pop();
        rightData.push(d);
        const rec = leftRects.pop();
        const rightRectLast = rightRects[rightRects.length - 1];
        rightRects.push({
          ...rec,
          top: rightRectLast.top + rightRectLast.height,
        });

        diffHeight = diffHeight - lastRectHeight;
        lastRectHeight = leftRects[leftRects.length - 1].height;
      }

      setLeftData([...leftData]);
      setRightData([...rightData]);
      setLeftRects([...leftRects]);
      setRightRects([...rightRects]);
    },
    [leftData, leftRects, rightData, rightRects]
  );

  const rightDataGiveLeft = useCallback(
    (diffHeight) => {
      let lastRectHeight = rightRects[rightRects.length - 1].height;
      while (diffHeight > lastRectHeight) {
        const d = rightData.pop();
        leftData.push(d);
        const rec = rightRects.pop();
        const leftRectLast = rightRects[rightRects.length - 1];

        leftRects.push({
          ...rec,
          top: leftRectLast.height + leftRectLast.top,
        });

        diffHeight = diffHeight - lastRectHeight;
        lastRectHeight = rightRects[rightRects.length - 1].height;
      }

      setLeftData([...leftData]);
      setRightData([...rightData]);
      setLeftRects([...leftRects]);
      setRightRects([...rightRects]);
    },
    [leftData, leftRects, rightData, rightRects]
  );

  const wrapperHeightLeft = useMemo(() => {
    if (leftRects.length) {
      const lastRectLeft = leftRects[leftRects.length - 1];
      return lastRectLeft.height + lastRectLeft.top;
    } else return 0;
  }, [leftRects]);

  const wrapperHeightRight = useMemo(() => {
    if (rightRects.length) {
      const lastRectRight = rightRects[rightRects.length - 1];
      return lastRectRight.height + lastRectRight.top;
    } else return 0;
  }, [rightRects]);

  useLayoutEffect(() => {
    const compareKey = `${leftShowConfig.head}&${rightShowConfig.tail}`;
    if (
      !compareHistory.current[compareKey] &&
      wrapperHeightLeft &&
      wrapperHeightRight
    ) {
      const heightDiff = wrapperHeightLeft - wrapperHeightRight;

      compareHistory.current[compareKey] = true;
      if (
        heightDiff > 0 &&
        heightDiff > leftRects[leftRects.length - 1].height
      ) {
        leftDataGiveRight(Math.abs(heightDiff));
      } else if (
        heightDiff < 0 &&
        Math.abs(heightDiff) > rightRects[rightRects.length - 1].height
      ) {
        rightDataGiveLeft(Math.abs(heightDiff));
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wrapperHeightLeft, wrapperHeightRight]);

  const handleScroll = useCallback(
    (e) => {
      const scrollTop = Math.floor(e.target.scrollTop);

      if (leftRects.length < leftShowConfig.tail) {
        updateLeftRects(leftRects);
      }

      if (rightRects.length < rightShowConfig.tail) {
        updateRightRects(rightRects);
      }

      if (leftRects.length && rightRects.length) {
        const startIndex = getClosestIndex_(leftRects, scrollTop);
        const startIndexR = getClosestIndex_(rightRects, scrollTop);

        if (leftRects[startIndex] && startIndex !== leftShowConfig.head) {
          setLeftShowConfig({
            head: startIndex,
            tail: startIndex + step,
            transformY: leftRects[startIndex].top,
          });
        }

        if (rightRects[startIndexR] && startIndexR !== rightShowConfig.head) {
          setRightShowConfig({
            head: startIndexR,
            tail: startIndexR + step,
            transformY: rightRects[startIndexR].top,
          });
        }
      }
    },
    [
      leftRects,
      leftShowConfig.head,
      rightRects,
      rightShowConfig.head,
      step,
      updateLeftRects,
      updateRightRects,
    ]
  );

  useEffect(() => {
    setTimeout(() => {
      if (prevTransformIndex.current < dataSource.length) {
        for (let i = prevTransformIndex.current; i < dataSource.length; i++) {
          if (i % 2 === 0) {
            leftData.push(dataSource[i]);
          }
          if (i % 2 !== 0) {
            rightData.push(dataSource[i]);
          }
        }
        prevTransformIndex.current = dataSource.length;

        setLeftData([...leftData]);
        setRightData([...rightData]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  useEffect(() => {
    if (dataSource.length > prevDataLength.current) {
      prevDataLength.current = dataSource.length;
      setTimeout(() => {
        setTimeout(() => {
          updateLeftRects(leftRects);
          updateRightRects(rightRects);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.length]);

  const reset = useCallback(() => {
    prevTransformIndex.current = 0;
    prevDataLength.current = 0;
    compareHistory.current = {};
    setLeftData([]);
    setRightData([]);
    setLeftShowConfig({
      head: 0,
      tail: step,
      transformY: 0,
    });
    setRightShowConfig({
      head: 0,
      tail: step,
      transformY: 0,
    });
    setRightRects([]);
    setLeftRects([]);
  }, [step]);

  useImperativeHandle(ref, () => {
    return {
      reset: reset,
      backToTop: scrollToTop,
    };
  });

  const onTouchMove = useCallback(
    (e) => {
      if (leftShowConfig.head > 0) {
        e.stopPropagation();
      }
    },
    [leftShowConfig.head]
  );

  const scrollToTop = useCallback(() => {
    setLeftShowConfig({
      head: 0,
      tail: step,
      transformY: 0,
    });
    setRightShowConfig({
      head: 0,
      tail: step,
      transformY: 0,
    });

    setTimeout(() => {
      const body = document.getElementsByClassName("van-virtual-list")[0];
      body.scrollTo({ top: 0 });
      backToTopSuccess?.();
    });
  }, [backToTopSuccess, step]);

  return (
    <div
      className={`van-virtual-list ${clsPrefix} ${className}`}
      style={{
        ...style,
        overflowY: "scroll",
      }}
      onScroll={handleScroll}
    >
      <div onTouchMove={onTouchMove}>
        <div style={{ display: "flex", flexDirection: "row", height: "auto" }}>
          <div
            style={{
              minHeight: wrapperHeightLeft || "auto",
              width: `calc(50% - ${gap / 2}px)`,
              marginRight: gap,
            }}
          >
            <div
              className={`${clsPrefix}-left ${listClssName}`}
              style={{
                transform: `translateY(${leftShowConfig.transformY}px)`,
              }}
            >
              {leftData
                .slice(leftShowConfig.head, leftShowConfig.tail)
                .map((item, i) => (
                  <div
                    style={{ paddingBottom: gap }}
                    key={`van-virtual-left-item${i + leftShowConfig.head}`}
                    className={`van-virtual-left-item${
                      i + leftShowConfig.head
                    }`}
                    id={`van-virtual-left-item${i + leftShowConfig.head}`}
                  >
                    <ItemRender item={item} index={leftShowConfig.head + i} />
                  </div>
                ))}
            </div>
          </div>
          <div
            style={{
              minHeight: wrapperHeightRight || "auto",
              width: `calc(50% - ${gap / 2}px)`,
            }}
          >
            <div
              className={`${clsPrefix}-right ${listClssName}`}
              style={{
                transform: `translateY(${rightShowConfig.transformY}px)`,
              }}
            >
              {rightData
                .slice(rightShowConfig.head, rightShowConfig.tail)
                .map((item, i) => (
                  <div
                    style={{ paddingBottom: gap }}
                    key={`van-virtual-right-item${i + rightShowConfig.head}`}
                    className={`van-virtual-right-item${
                      i + rightShowConfig.head
                    }`}
                  >
                    <ItemRender item={item} index={rightShowConfig.head + i} />
                  </div>
                ))}
            </div>
          </div>
        </div>
        {footer}
      </div>
      <div
        className={`van-virtual-backto-top-${
          leftShowConfig.head > (backToTopCritical || showCount)
            ? "show"
            : "hidden"
        }`}
      >
        {renderBackToTop || (
          <div className="van-virtual-backto-top" onClick={scrollToTop}>
            <svg viewBox="0 0 1024 1024" width="200" height="200">
              <path
                d="M511.99872 0C229.23008 0 0 229.23136 0 512c0 282.76992 229.23008 512 512 512 282.7712 0 512-229.23008 512-512C1024 229.23136 794.76992 0 511.99872 0zM743.37024 604.99968c-8.61696 0-16.47744-3.49312-22.1376-9.13792L542.752 417.46176l0 414.38592c0 17.24544-13.98528 31.2448-31.24608 31.2448-17.27744 0-31.27552-14.00064-31.27552-31.2448l0-0.02944L480.2304 418.432 303.33952 595.3408c-5.7088 5.96736-13.7536 9.67552-22.67904 9.67552-17.35168 0-31.41376-14.06208-31.41376-31.4304 0-8.6144 3.49184-16.43008 9.09312-22.0928l230.90816-230.9376c5.72288-6.03136 13.76768-9.81504 22.74048-9.81504 8.8128 0 16.79872 3.67744 22.47552 9.53856L765.61408 551.4624l0 0.02944c5.64736 5.6448 9.13792 13.47712 9.13792 22.12224C774.752 590.95296 760.70656 604.99968 743.37024 604.99968zM772.9216 281.8624 251.07712 281.8624c-17.2608 0-31.27552-14.03008-31.27552-31.2768 0-17.2928 14.01472-31.27808 31.27552-31.27808l521.84576 0c17.25952 0 31.27808 13.98528 31.27808 31.27808C804.19968 267.83104 790.1824 281.8624 772.9216 281.8624z"
                fill="#0FB269"
              ></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export const VirtualWaterfallList = forwardRef(VirtualWaterfallList_);

export default VirtualWaterfallList;
