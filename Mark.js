import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import storeData from './assets/store.json';

const Mark = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window');
  const mapHeight = height * 0.8;
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const webViewRef = React.useRef(null);
  const { selectedGu, selectedDong } = route.params || {};


  useEffect(() => {
    // Check if we're coming from Home screen with location request
    if (route.params?.requestLocation) {
      requestLocationPermission();
    }
  }, [route.params?.requestLocation]);

  useEffect(() => {
    // Initial location request removed from here
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한 요청',
            message: '앱에서 현재 위치를 사용하기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '취소',
            buttonPositive: '확인',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    console.log('getCurrentLocation called');
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Position received:', position);
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        // WebView에 현재 위치 정보 전달
        if (webViewRef.current) {
          const message = JSON.stringify({
            type: 'currentLocation',
            lat: latitude,
            lng: longitude
          });
          console.log('Sending to WebView:', message);
          webViewRef.current.injectJavaScript(`
            (function() {
              const data = ${message};
              if (currentLocationMarker) {
                currentLocationMarker.setMap(null);
              }
              var currentPosition = new kakao.maps.LatLng(data.lat, data.lng);
              currentLocationMarker = new kakao.maps.Marker({
                position: currentPosition,
                map: map,
                image: new kakao.maps.MarkerImage(
                  'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  new kakao.maps.Size(24, 35)
                )
              });
              map.setCenter(currentPosition);
              true;
            })();
          `);
        } else {
          console.log('webViewRef is not available');
        }
      },
      (error) => {
        console.log('Geolocation error:', error.code, error.message);
        alert('위치 정보를 가져오는데 실패했습니다: ' + error.message);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    );
  };

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'markerClick') {
      setSelectedPosition({
        lat: data.lat,
        lng: data.lng
      });
    } else if (data.type === 'getCurrentLocation') {
      getCurrentLocation();
    } else if (data.type === 'error') {
      alert(data.message);
    }
  };

  const filteredStores = selectedGu && selectedDong
    ? {
        stores: storeData.stores.filter(store =>
          store.구.replace(/\s/g, '') === selectedGu.replace(/\s/g, '') &&
          store.동.replace(/\s/g, '') === selectedDong.replace(/\s/g, '')
        )
      }
    : storeData;


  let initialLat = 37.516826;
  let initialLng = 127.0206567;
  
  if (filteredStores.stores.length > 0) {
    initialLat = filteredStores.stores[0].lat;
    initialLng = filteredStores.stores[0].lng;
  }  


  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Kakao Map</title>
      <style>
        html, body {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          touch-action: none;
        }
        .kakaoMapContainer {
          position: relative;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .mapContainer {
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 1;
        }
        .map {
          width: 100%;
          height: 100%;
        }
        .customzoomcontrol {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 80px;
          overflow: hidden;
          z-index: 1;
          background-color: #f5f5f5;
        }
        .customzoomcontrol span {
          display: block;
          width: 36px;
          height: 40px;
          text-align: center;
          cursor: pointer;
        }
        .customzoomcontrol span img {
          width: 15px;
          height: 15px;
          padding: 12px 0;
          border: none;
        }
        .customzoomcontrol span:first-child {
          border-bottom: 1px solid #bfbfbf;
        }
        .wrap {
          position: absolute;
          left: 0;
          bottom: 40px;
          width: 288px;
          margin-left: -144px;
          text-align: left;
          overflow: visible;
          font-size: 12px;
          font-family: 'Malgun Gothic', dotum, '돋움', sans-serif;
          line-height: 1.5;
        }
        .wrap * { padding: 0; margin: 0; }
        .wrap .info {
          width: 286px;
          height: auto;
          border-radius: 5px;
          border-bottom: 2px solid #ccc;
          border-right: 1px solid #ccc;
          overflow: visible;
          background: #fff;
        }
        .wrap .info:nth-child(1) {
          border: 0;
          box-shadow: 0px 1px 2px #888;
        }
        .info .body {
          position: relative;
          max-height: 200px;
          overflow-y: scroll;
          overflow-x: hidden;
          padding: 10px;
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch
        }
        .body::-webkit-scrollbar {
          width: 5px;
        }
        .body::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 3px;
        }
        .body::-webkit-scrollbar-track {
          background: transparent;
        }
        .info .close {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #888;
          width: 17px;
          height: 17px;
          background: url('https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/overlay_close.png');
        }
        .info .close:hover {
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="kakaoMapContainer">
        <div class="mapContainer">
          <div class="map"></div>
          <div class="customzoomcontrol">
            <span onclick="zoomIn()"><img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_plus.png" alt="확대"></span>
            <span onclick="zoomOut()"><img src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/ico_minus.png" alt="축소"></span>
          </div>
          <div class="currentLocationBtn" onclick="getCurrentLocation()" style="position: absolute; left: 15px; top: 15px; width: 40px; height: 40px; border-radius: 50%; background: white; border: none; display: flex; justify-content: center; align-items: center; cursor: pointer; z-index: 1; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M480-360q56 0 101-27.5t71-72.5q-35-29-79-44.5T480-520q-49 0-93 15.5T308-460q26 45 71 72.5T480-360Zm0-200q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0 374q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>
          </div>
        </div>
      </div>

      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=9e351cf89e99b94af8c9fe4551ff3299&libraries=services"></script>
      <script>
        var isDraggingOverlay = false;
        var justFinishedDragging = false;
        var storeData = ${JSON.stringify(filteredStores)};

        var mapContainer = document.querySelector('.mapContainer');
        var mapElement = document.querySelector('.map');
        var currentLocationMarker = null;

        var mapCenter = new kakao.maps.LatLng(${initialLat}, ${initialLng});
        var mapOption = {
          center: mapCenter,
          level: 3,
          draggable: true,
          scrollwheel: true,
          disableDoubleClickZoom: false
        };

        var map = new kakao.maps.Map(mapElement, mapOption);
        var geocoder = new kakao.maps.services.Geocoder();
        var storeMarkers = [];
        var overlays = [];

        function closeOverlay(index) {
          overlays[index].setMap(null);
        }

        function createStoreMarkers(storeData) {
          var storeGroups = {};

          storeData.stores.forEach(function(store) {
            if (store.lat && store.lng) {
              var key = store.lat + ',' + store.lng;
              if (!storeGroups[key]) {
                storeGroups[key] = [];
              }
              storeGroups[key].push(store);
            }
          });

          Object.keys(storeGroups).forEach(function(key, groupIndex) {
            var stores = storeGroups[key];
            var firstStore = stores[0];
            var storePosition = new kakao.maps.LatLng(firstStore.lat, firstStore.lng);

            var marker = new kakao.maps.Marker({
              position: storePosition,
              map: map,
              title: firstStore.가맹점명
            });

            var storesContent = '';
            stores.forEach(function(store) {
              storesContent += '<div class="store-info" style="margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:10px;">' +
                '<div class="store-name" style="font-weight:bold;margin-bottom:5px;">' + store.가맹점명 + '</div>' +
                '<div class="store-address" style="font-size:12px;">' + store.주소 + '</div>' +
                '<div class="store-postcode" style="font-size:11px;color:gray;">(우) ' + store.가맹점우편번호 + '</div>' +
                '<div class="store-phone" style="font-size:12px;">전화번호: ' + store.전화번호 + '</div>' +
              '</div>';
            });

            var content = '<div class="wrap">' +
                          '  <div class="info">' +
                          '    <div class="body">' + storesContent + '</div>' +
                          '  </div>' +
                          '</div>';

            var overlay = new kakao.maps.CustomOverlay({
              content: content,
              map: null,
              position: storePosition
            });

            kakao.maps.event.addListener(marker, 'click', function() {
              overlays.forEach(function(overlay) {
                overlay.setMap(null);
              });
              overlay.setMap(map);
              preventMapDragOnScroll();

              // 마커 클릭 시 좌표 저장
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerClick',
                lat: firstStore.lat,
                lng: firstStore.lng
              }));
            });

            storeMarkers.push(marker);
            overlays.push(overlay);
          });
        }

        function preventMapDragOnScroll() {
          var scrollableBodies = document.querySelectorAll('.body');

          scrollableBodies.forEach(function(body) {
            body.addEventListener('touchstart', function() {
              isDraggingOverlay = true;
              justFinishedDragging = false;
              map.setDraggable(false);
            });
            body.addEventListener('touchmove', function(e) {
              e.stopPropagation();
            });
            body.addEventListener('touchend', function() {
              isDraggingOverlay = false;
              justFinishedDragging = true;
              map.setDraggable(true);

              setTimeout(function() {
                justFinishedDragging = false;
              }, 300);
            });

            body.addEventListener('mousedown', function() {
              isDraggingOverlay = true;
              justFinishedDragging = false;
              map.setDraggable(false);
            });
            body.addEventListener('mouseup', function() {
              isDraggingOverlay = false;
              justFinishedDragging = true;
              map.setDraggable(true);

              setTimeout(function() {
                justFinishedDragging = false;
              }, 300);
            });
          });
        }

        function zoomIn() {
          map.setLevel(map.getLevel() - 1);
        }

        function zoomOut() {
          map.setLevel(map.getLevel() + 1);
        }

        function getCurrentLocation() {
          console.log('getCurrentLocation button clicked');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'getCurrentLocation'
          }));
        }

        createStoreMarkers(storeData);
        preventMapDragOnScroll();
        kakao.maps.event.addListener(map, 'click', function() {
          if (isDraggingOverlay) {
            console.log('오버레이 스크롤 중이어서 지도 클릭 무시');
            return;
          }
          overlays.forEach(function(overlay) {
            overlay.setMap(null);
          });
        });

        // WebView가 로드되면 자동으로 현재 위치 가져오기
        window.addEventListener('load', function() {
          // 자동 위치 요청 제거
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>급식카드 가맹점 지도</Text>
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <WebView
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          scalesPageToFit={true}
          startInLoadingState={true}
          mixedContentMode="always"
          scrollEnabled={true}
          nestedScrollEnabled={true}
          bounces={false}
          onMessage={onMessage}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          ref={webViewRef}
        />
      </View>
      <TouchableOpacity
        style={[styles.navButton, { bottom: 150 }]}
        onPress={() => navigation.navigate('Sub', selectedPosition)}
      >
        <Text style={styles.buttonText}>Road</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  mapContainer: {
    width: '100%',
    flex: 1,
    marginBottom: 80,
  },
  map: {
    flex: 1,
  },
  navButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default Mark;
