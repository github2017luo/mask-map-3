import React, { useState, useEffect, useRef } from "react";
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
        console.log("call");
        fn.apply(context, args);
      } else {
        console.log("null");
        timer = null;
      }
    }, delay);
  };
}

const MapItem = React.memo(({ dataList }) => {
  if (dataList.length === 0) return <div>沒有資料</div>;
  return dataList.map((itm, idx) => {
    return (
      <a
        className="mapListItem"
        key={itm["properties"]["id"]}
        href={`https://www.google.com.tw/maps/place/${itm["geometry"]["coordinates"][1]},${itm["geometry"]["coordinates"][0]}`}
        target="_blank"
      >
        <div className="listWrap">
          <div className="img">
            <img src="" alt="" />
          </div>
          <div className="items">
            <div className="name">
              <span className="title">藥局姓名</span>
              <span>{itm["properties"]["name"]}</span>
            </div>
            <div className="mask_adult">
              <span className="title">成人口罩</span>
              <span>{itm["properties"]["mask_adult"]}</span>
            </div>
            <div className="mask_child">
              <span className="title">小孩口罩</span>
              <span>{itm["properties"]["mask_child"]}</span>
            </div>
            <div className="address">
              <span className="title">地　　址</span>
              <span>{itm["properties"]["address"]}</span>
            </div>
            <div className="phone">
              <span className="title">電　　話</span>
              <span>{itm["properties"]["phone"]}</span>
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
  console.log("dataList", dataList);
  useEffect(() => {
    debounceSearch.current(searchText);
  }, [searchText]);

  return (
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
      <div className="mapList">
        <MapItem dataList={dataList}></MapItem>
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [test, setTest] = useState([]);
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
      })
      .catch(err => setErrText("好像壞了"));
  }, []);
  if (isLoading) return <div>資料加載中</div>;
  if (errText) return <div>{errText}</div>;
  if (!mapData || mapData.length === 0) return <div>沒有資料</div>;
  // console.log("test", test);
  return (
    <div className="App">
      <h1>口罩即時庫存列表</h1>
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
