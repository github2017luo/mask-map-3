import React, { useState, useEffect, useRef } from "react";
import loadingGif from "./maskLoading.gif";
import "./App.scss";

function debounce(fn, delay, immediate) {
  let timer = null;
  return function() {
    clearTimeout(timer);
    let context = this;
    let args = arguments;
    if (!timer && immediate) {
      fn.apply(context, args);
    }
    timer = setTimeout(function() {
      if (!immediate) {
        fn.apply(context, args);
      } else {
        timer = null;
      }
    }, delay);
  };
}

const MapItem = React.memo(({ dataList }) => {
  if (dataList.length === 0) return <div>沒有資料</div>;
  const hasMask = "#21aa93";
  const emptyMask = "#434343";
  return dataList.map((itm, idx) => {
    return (
      <a
        className="mapListItem"
        key={itm["properties"]["id"]}
        href={`https://www.google.com.tw/maps/place/${itm["geometry"]["coordinates"][1]},${itm["geometry"]["coordinates"][0]}`}
        target="_blank"
        rel="noreferrer noopener"
      >
        <div className="listWrap">
          <div className="stock">
            {itm["properties"]["mask_adult"] > 0 ||
            itm["properties"]["mask_child"] > 0 ? (
              <div className="hasStock">
                <div>有庫存</div>
              </div>
            ) : (
              <div className="emptyStock">
                <div>無庫存</div>
              </div>
            )}
          </div>
          <div className="items">
            <div className="name">
              {/* <span className="title">藥局姓名</span> */}
              <span>{itm["properties"]["name"]}</span>
            </div>
            <div className="mask_number">
              <span style={{ color: "#fff", background: "#113f67" }}>成人</span>
              <span
                style={
                  itm["properties"]["mask_adult"] > 0
                    ? { color: hasMask }
                    : { color: emptyMask }
                }
              >
                {itm["properties"]["mask_adult"]}
              </span>
              <span style={{ color: "#fff", background: "#dd6b4d" }}>小孩</span>
              <span
                style={
                  itm["properties"]["mask_child"] > 0
                    ? { color: hasMask }
                    : { color: emptyMask }
                }
              >
                {itm["properties"]["mask_child"]}
              </span>
            </div>
            <div className="phone">
              <span>{itm["properties"]["phone"]}</span>
            </div>
            <div className="address">
              <span>{itm["properties"]["address"]}</span>
            </div>
            <div className="updated">
              <span className="title">更新時間</span>
              <span>{itm["properties"]["updated"]}</span>
            </div>
          </div>
        </div>
      </a>
    );
  });
});

const MapList = ({ mapData }) => {
  const [searchText, setSearchText] = useState("");
  const [dataList, setDataList] = useState(mapData);

  const dataFilter = searchText => {
    let mapArr = mapData.filter(
      (itm, idx) => itm["properties"]["address"].indexOf(searchText) !== -1
    );
    setDataList(mapArr);
  };

  const debounceSearch = useRef(debounce(dataFilter, 800));
  useEffect(() => {
    debounceSearch.current(searchText);
  }, [searchText]);

  return (
    <React.Fragment>
      <div className="header">
        <h1>口罩即時庫存列表</h1>
        <div className="listWrap">
          <div className="inputWrap">
            <span>請輸入地址：</span>
            <input
              type="text"
              name="address"
              onChange={e => {
                setSearchText(e.target.value);
              }}
              value={searchText}
              placeholder="台北市、大安區、基隆路"
            />
          </div>
        </div>
      </div>
      <div className="mapList">
        <MapItem dataList={dataList}></MapItem>
      </div>
    </React.Fragment>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [errText, setErrText] = useState("");
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
    )
      .then(response => {
        return response.json();
      })
      .then(data => {
        // let mapArr = Object.values(data)[1].map(itm => Object.values(itm)[1]);
        let mapArr = Object.values(data)[1];
        setMapData(mapArr);
        // setTest(test);
        setIsLoading(false);
        console.log("create by Jeremy Chang");
      })
      .catch(err => setErrText("好像壞了"));
  }, []);
  if (isLoading)
    return (
      <div className="App">
        <div className="loading">
          <img src={loadingGif} alt="" />
        </div>
      </div>
    );
  if (errText)
    return (
      <div className="App">
        <div>{errText}</div>
      </div>
    );
  if (!mapData || mapData.length === 0)
    return (
      <div className="App">
        <div>沒有資料</div>
      </div>
    );
  return (
    <div className="App">
      <MapList mapData={mapData} isLoading={isLoading} />
      <div className="information">
        資料提供：
        <a href="https://g0v.hackmd.io/gGrOI4_aTsmpoMfLP1OU4A">
          口罩供需資訊平台
        </a>
        、
        <a href="https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json">
          藥局+衛生所即時庫存 geojson by kiang
        </a>
      </div>
    </div>
  );
}

export default App;
