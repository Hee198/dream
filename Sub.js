import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

const Sub = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window');
  const mapHeight = height * 0.8; // 화면 높이의 80%로 설정

  // route.params에서 좌표를 가져옴
  const initialLat = route.params?.lat || 37.5000;
  const initialLng = route.params?.lng || 126.9780;

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
                transition: height 0.3s ease;
            }
            .map {
                width: 100%;
                height: 100%;
            }
            .roadviewContainer {
                position: relative;
                width: 100%;
                height: 0;
                z-index: 1;
                transition: height 0.3s ease;
                display: none;
            }
            .roadview {
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
            .roadviewToggle {
                position: absolute;
                top: 10px;
                left: 10px;
                width: 36px;
                height: 36px;
                background-color: #f5f5f5;
                border: 1px solid #bfbfbf;
                border-radius: 4px;
                cursor: pointer;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: center;
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
            <div class="roadviewToggle" onclick="toggleRoadviewVisibility()">
                <img src="https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png" alt="로드뷰 토글" style="width: 20px; height: 20px;">
            </div>
        </div>
        <div class="roadviewContainer">
            <div class="roadview"></div>
        </div>
    </div>

    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=9e351cf89e99b94af8c9fe4551ff3299"></script>
    <script>
    // 디버깅을 위한 스타일 체크 함수
    function checkStyles() {
        console.log('Map Container Styles:', {
            width: mapContainer.style.width,
            height: mapContainer.style.height,
            display: mapContainer.style.display,
            position: mapContainer.style.position
        });
        console.log('Roadview Container Styles:', {
            width: roadviewContainer.style.width,
            height: roadviewContainer.style.height,
            display: roadviewContainer.style.display,
            position: roadviewContainer.style.position
        });
    }

    var mapContainer = document.querySelector('.mapContainer');
    var mapElement = document.querySelector('.map');
    var roadviewContainer = document.querySelector('.roadviewContainer');
    var roadviewElement = document.querySelector('.roadview');

    // 초기 스타일 체크
    checkStyles();

    var mapCenter = new kakao.maps.LatLng(${initialLat}, ${initialLng});
    var mapOption = {
        center: mapCenter,
        level: 3,  // 3레벨은 약 30m 단위
        draggable: true,
        scrollwheel: true,
        disableDoubleClickZoom: false
    };

    var map = new kakao.maps.Map(mapElement, mapOption);
    map.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);

    var roadview = new kakao.maps.Roadview(roadviewElement);
    var roadviewClient = new kakao.maps.RoadviewClient();

    var markImage = new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/2018/pc/roadview_minimap_wk_2018.png',
        new kakao.maps.Size(26, 46),
        {
            spriteSize: new kakao.maps.Size(1666, 168),
            spriteOrigin: new kakao.maps.Point(705, 114),
            offset: new kakao.maps.Point(13, 46)
        }
    );

    var isRoadviewVisible = false;

    var roadviewMarker = new kakao.maps.Marker({
        image: markImage,
        position: mapCenter,
        draggable: true,
        map: null
    });

    function zoomIn() {
        map.setLevel(map.getLevel() - 1);
    }

    function zoomOut() {
        map.setLevel(map.getLevel() + 1);
    }

    // 드래그 이벤트 리스너 추가
    kakao.maps.event.addListener(map, 'dragend', function() {
        var currentCenter = map.getCenter();
        var currentLevel = map.getLevel();
        
        // 현재 중심점을 기준으로 약간 더 큰 범위의 지도 미리 로드
        var swLatLng = new kakao.maps.LatLng(currentCenter.getLat() - 0.001, currentCenter.getLng() - 0.001);
        var neLatLng = new kakao.maps.LatLng(currentCenter.getLat() + 0.001, currentCenter.getLng() + 0.001);
        var bounds = new kakao.maps.LatLngBounds(swLatLng, neLatLng);
        map.setBounds(bounds);
        
        // 원래 줌 레벨로 복귀
        map.setLevel(currentLevel);
        
        // 추가 새로고침으로 지도 영역 확보
        setTimeout(function() {
            map.relayout();
            map.setCenter(currentCenter);
            map.setLevel(currentLevel);
        }, 100);
    });

    function initializeMap() {
        checkStyles();
        map.relayout();
        roadview.relayout();
        
        // 초기 줌 레벨 설정 (30m 단위)
        map.setLevel(3);
    }

    // 페이지 로드 완료 후 지도 초기화
    window.addEventListener('load', initializeMap);

    function toggleRoadviewVisibility() {
        isRoadviewVisible = !isRoadviewVisible;
        if (isRoadviewVisible) {
            roadviewContainer.style.display = 'block';
            mapContainer.style.height = '50%';
            roadviewContainer.style.height = '50%';
            roadviewMarker.setMap(map);
            
            // 현재 지도의 중심점과 줌 레벨 저장
            var currentCenter = map.getCenter();
            var currentLevel = map.getLevel();
            
            // 스타일 변경 후 디버깅
            checkStyles();
            
            // 지도 새로고침 후 현재 위치 유지
            setTimeout(function() {
                map.relayout();
                map.setCenter(currentCenter);
                map.setLevel(currentLevel);
                
                // 로드뷰 새로고침
                var currentPosition = roadviewMarker.getPosition();
                roadviewClient.getNearestPanoId(currentPosition, 50, function(panoId) {
                    if (panoId !== null) {
                        roadview.setPanoId(panoId, currentPosition);
                        roadview.relayout();
                    }
                });
                
                // 추가 새로고침으로 지도 영역 확보
                setTimeout(function() {
                    map.relayout();
                    map.setCenter(currentCenter);
                    map.setLevel(currentLevel);
                }, 300);
            }, 100);
        } else {
            roadviewContainer.style.display = 'none';
            mapContainer.style.height = '100%';
            roadviewContainer.style.height = '0';
            roadviewMarker.setMap(null);
            
            // 현재 지도의 중심점과 줌 레벨 저장
            var currentCenter = map.getCenter();
            var currentLevel = map.getLevel();
            
            // 스타일 변경 후 디버깅
            checkStyles();
            
            // 지도 새로고침 후 현재 위치 유지
            setTimeout(function() {
                map.relayout();
                map.setCenter(currentCenter);
                map.setLevel(currentLevel);
                
                // 추가 새로고침으로 지도 영역 확보
                setTimeout(function() {
                    map.relayout();
                    map.setCenter(currentCenter);
                    map.setLevel(currentLevel);
                }, 300);
            }, 100);
        }
    }

    // 윈도우 리사이즈 이벤트 처리
    window.addEventListener('resize', function() {
        if (!isRoadviewVisible) {
            var currentCenter = map.getCenter();
            var currentLevel = map.getLevel();
            map.relayout();
            map.setCenter(currentCenter);
            map.setLevel(currentLevel);
        }
    });

    function toggleRoadview(position) {
        if (!isRoadviewVisible) return;
        
        roadviewClient.getNearestPanoId(position, 50, function(panoId) {
            if (panoId === null) {
                roadviewContainer.style.display = 'none';
                mapContainer.style.height = '100%';
                roadviewContainer.style.height = '0';
                roadviewMarker.setMap(null);
                
                // 현재 지도의 중심점과 줌 레벨 저장
                var currentCenter = map.getCenter();
                var currentLevel = map.getLevel();
                
                // 스타일 변경 후 디버깅
                checkStyles();
                
                // 지도 새로고침 후 현재 위치 유지
                setTimeout(function() {
                    map.relayout();
                    map.setCenter(currentCenter);
                    map.setLevel(currentLevel);
                }, 100);
            } else {
                mapContainer.style.height = '50%';
                roadviewContainer.style.height = '50%';
                map.relayout();
                roadviewContainer.style.display = 'block';
                roadviewMarker.setMap(map);
                roadview.setPanoId(panoId, position);
                
                // 스타일 변경 후 디버깅
                checkStyles();
                
                roadview.relayout();
            }
        });
    }

    kakao.maps.event.addListener(roadviewMarker, 'dragend', function(mouseEvent) {
        var position = roadviewMarker.getPosition();
        toggleRoadview(position);
    });

    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        var position = mouseEvent.latLng;
        roadviewMarker.setPosition(position);
        toggleRoadview(position);
    });
    </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>지도</Text>
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
          bounces={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      </View>
 
      <TouchableOpacity
        style={[styles.navButton, { bottom: 90 }]}
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
    marginTop: 20,
  },
  mapContainer: {
    width: '100%',
    flex: 1,
    marginBottom: 80, // 삼선 버튼을 위한 여백
  },
  map: {
    flex: 1,
  },
  navButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
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
//   menuIcon: {
//     width: 30,
//     height: 20,
//     justifyContent: 'space-between',
//   },
//   menuLine: {
//     width: '100%',
//     height: 3,
//     backgroundColor: '#000',
//     borderRadius: 2,
//   },
});

export default Sub; 
