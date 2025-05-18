import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import libraryData from './assets/서울시 공공도서관 현황정보.json';

const Library = ({ route, navigation }) => {
  const webViewRef = useRef(null);
  const { height } = Dimensions.get('window');
  const mapHeight = height * 0.8;
  const district = route.params?.district;

  const [selectedPosition, setSelectedPosition] = useState(null);

const safeParse = (val) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

const filteredData = district
  ? libraryData.DATA.filter(item => item.구 === district).map(item => {
      const lat = safeParse(item.lat) ?? (safeParse(item.Dlat) ?? 0.001); 
      const lng = safeParse(item.lng) ?? (safeParse(item.Dlng) ?? 0.001); 
      return {
        ...item,
        lat,
        lng,
        name: item.fclt_nm,
        address: item.adres
      };
    })
  : libraryData.DATA.map(item => {
      const lat = safeParse(item.lat) ?? (safeParse(item.Dlat) ?? 0.001);
      const lng = safeParse(item.lng) ?? (safeParse(item.Dlng) ?? 0.001);
      return {
        ...item,
        lat,
        lng,
        name: item.fclt_nm,
        address: item.adres
      };
    });


  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentLocation();
      } catch (err) {
        console.warn(err);
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        if (webViewRef.current) {
          const message = JSON.stringify({ type: 'currentLocation', lat: latitude, lng: longitude });
          webViewRef.current.injectJavaScript(`
            (function() {
              const data = ${message};
              if (window.currentLocationMarker) {
                window.currentLocationMarker.setMap(null);
              }
              var currentPosition = new kakao.maps.LatLng(data.lat, data.lng);
              window.currentLocationMarker = new kakao.maps.Marker({
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
        }
      },
      error => alert('위치 정보를 가져오는데 실패했습니다: ' + error.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const onMessage = event => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'markerClick') {
      setSelectedPosition({ lat: data.lat, lng: data.lng });
    } else if (data.type === 'getCurrentLocation') {
      requestLocationPermission();
    }
  };

  const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=9e351cf89e99b94af8c9fe4551ff3299&libraries=services"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; }
    #map { width: 100%; height: 100%; }
    .currentLocationBtn {
      position: absolute;
      left: 15px;
      top: 15px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: white;
      border: none;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 1;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="currentLocationBtn" onclick="getCurrentLocation()">
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666">
      <path d="M480-360q56 0 101-27.5t71-72.5q-35-29-79-44.5T480-520q-49 0-93 15.5T308-460q26 45 71 72.5T480-360Zm0-200q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0 374q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
    </svg>
  </div>
  <script>
    var map = new kakao.maps.Map(document.getElementById('map'), {
      center: new kakao.maps.LatLng(${route.params?.centerLat || 37.5665}, ${route.params?.centerLng || 126.9780}),
      level: 8
    });

    var overlays = [];
    var data = ${JSON.stringify(filteredData)};
    data.forEach(function(facility) {
      var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(facility.lat, facility.lng),
        title: facility.fclt_nm
      });

      var info = '<div style="padding:10px; font-size:14px; line-height:1.5; max-width:200px; max-height:100px; overflow:auto;"><b>' + facility.fclt_nm + '</b><br>' + facility.주소 + '</div>'
      var infowindow = new kakao.maps.InfoWindow({ content: info });

      kakao.maps.event.addListener(marker, 'click', function() {
        overlays.forEach(function(ov) { ov.setMap(null); });
        overlays = [];
        infowindow.open(map, marker);
        overlays.push(infowindow);

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'markerClick',
          lat: facility.lat,
          lng: facility.lng
        }));
      });
    });

    kakao.maps.event.addListener(map, 'click', function() {
      overlays.forEach(function(ov) { ov.setMap(null); });
      overlays = [];
    });

    function getCurrentLocation() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'getCurrentLocation' }));
    }
  </script>
</body>
</html>`;



  return (
    <View style={styles.container}>
      <Text style={styles.title}>{district || '전체'} 도서관</Text>
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          onMessage={onMessage}
        />
      </View>

      <TouchableOpacity style={[styles.navButton, { bottom: 160 }]} onPress={() =>
        navigation.navigate('Sub', { lat: selectedPosition?.lat, lng: selectedPosition?.lng, from: 'Library' })
      }>
        <Text style={styles.buttonText}>Road</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.navButton, { bottom: 90 }]} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5FCFF' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', margin: 20 },
  mapContainer: { width: '100%', flex: 1, marginBottom: 80 },
  map: { flex: 1 },
  navButton: {
    position: 'absolute',
    right: 20,
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

export default Library;
