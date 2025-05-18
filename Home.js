import React, { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Pressable,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapScreen from './MapScreen';
import { motion } from 'moti';
import Svg, { Path } from 'react-native-svg';
import { openURL } from './openURL';

import welfareData from './assets/서울시 사회복지시설(청소년복지시설) 목록.json';
import academyData from './assets/서울시 청소년방과후아카데미 시설현황정보.json';
import libraryData from './assets/서울시 공공도서관 현황정보.json';


// 화면 크기 상수
const { width, height } = Dimensions.get('window');

/**
 * 검색 결과 항목 컴포넌트
 */
const SearchResultItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
    <Text style={styles.resultTitle}>{item.title}</Text>
    <Text style={styles.resultDescription}>{item.description}</Text>
  </TouchableOpacity>
);

/**
 * 바로가기 버튼 컴포넌트
 */
const ShortcutButton = ({ title, onPress }) => (
  <TouchableOpacity style={styles.shortcutButton} onPress={onPress}>
    <Text style={styles.shortcutButtonText}>{title}</Text>
  </TouchableOpacity>
);

/**
 * 바로가기 버튼 그룹 컴포넌트
 */
const ShortcutButtons = ({ onShortcutPress }) => (
  <View style={styles.shortcutContainer}>
    <View style={styles.shortcutRow}>
      <ShortcutButton title="복지시설" onPress={() => onShortcutPress('welfare')} />
      <ShortcutButton title="아카데미" onPress={() => onShortcutPress('academy')} />
    </View>
    <View style={styles.shortcutRow}>
      <ShortcutButton title="유스내비" onPress={() => onShortcutPress('youthnavi')} />
      <ShortcutButton title="도서관" onPress={() => onShortcutPress('library')} />
    </View>
  </View>
);

/**
 * 게시판 항목 컴포넌트
 */
const BoardItem = ({ item, onPress }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.boardItem}>
      <TouchableOpacity
        style={styles.boardItemHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.boardItemTitleContainer}>
          <Text style={styles.boardItemTitle}>{item.title}</Text>
          <Text style={styles.boardItemDate}>{item.date}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '−' : '+'}</Text>
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.boardItemContent}>
          <Text style={styles.boardItemContentText}>{item.content}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * 게시판 컴포넌트
 */
const BulletinBoard = ({ onItemPress, onMorePress }) => {
  const boardItems = [
    {
      id: 'board1',
      title: '시스템 점검 안내',
      content: '2024년 3월 15일 새벽 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
      date: '2024.03.10',
    },
    {
      id: 'board2',
      title: '신규 서비스 오픈',
      content: '더욱 편리한 서비스를 위해 새로운 기능이 추가되었습니다.',
      date: '2024.03.08',
    },
    {
      id: 'board3',
      title: '이용약관 개정 안내',
      content: '서비스 이용약관이 개정되었습니다. 변경된 내용을 확인해 주시기 바랍니다.',
      date: '2024.03.05',
    },
  ];

  return (
    <View style={styles.boardContainer}>
      <View style={styles.boardHeader}>
        <Text style={styles.boardTitle}>공지사항</Text>
        <TouchableOpacity onPress={onMorePress}>
          <Text style={styles.boardMore}>더보기</Text>
        </TouchableOpacity>
      </View>
      {boardItems.map(item => (
        <BoardItem key={item.id} item={item} onPress={onItemPress} />
      ))}
    </View>
  );
};

/**
 * 검색 결과 목록 컴포넌트
 */
const SearchResults = ({ results, onItemPress }) => (
  <FlatList
    data={results}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <SearchResultItem 
        item={item} 
        onPress={onItemPress}
      />
    )}
    style={styles.resultsList}
  />
);

/**
 * 모달 화면 컴포넌트
 */
const ModalScreen = ({ visible, onClose, title, children }) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </View>
  </Modal>
);

/**
 * 복지시설 화면 컴포넌트
 */
const WelfareScreen = () => {
  const [selectedTab, setSelectedTab] = useState('복지시설');
  const facilities = welfareData.DATA;
  const academies = academyData.DATA;
  const libraries = libraryData.DATA;

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, selectedTab === '복지시설' && styles.selectedTab]}
        onPress={() => setSelectedTab('복지시설')}
      >
        <Text style={[styles.tabText, selectedTab === '복지시설' && styles.selectedTabText]}>복지시설</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, selectedTab === '아카데미' && styles.selectedTab]}
        onPress={() => setSelectedTab('아카데미')}
      >
        <Text style={[styles.tabText, selectedTab === '아카데미' && styles.selectedTabText]}>아카데미</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, selectedTab === '유스내비' && styles.selectedTab]}
        onPress={() => setSelectedTab('유스내비')}
      >
        <Text style={[styles.tabText, selectedTab === '유스내비' && styles.selectedTabText]}>유스내비</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tabButton, selectedTab === '도서관' && styles.selectedTab]}
        onPress={() => setSelectedTab('도서관')}
      >
        <Text style={[styles.tabText, selectedTab === '도서관' && styles.selectedTabText]}>도서관</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case '복지시설':
        return facilities.map((item, index) => (
        <View key={index} style={styles.facilityItem}>
          <Text style={styles.facilityName}>{item.fclt_nm}</Text>
          <Text style={styles.facilityAddr}>주소: {item.fclt_addr}</Text>
          <Text style={styles.facilityTel}>전화번호: {item.fclt_tel_no}</Text>
        </View>
        ));
      case '아카데미':
        return academies.map((item, index) => (
          <View key={index} style={styles.facilityItem}>
            <Text style={styles.facilityName}>{item.fclty_nm}</Text>
            <Text style={styles.facilityAddr}>주소: {item.bass_adres}</Text>
            <Text style={styles.facilityLink}>사이트: {item.site_url}</Text>
          </View>
        ));
      case '유스내비':
        return (
          <View style={styles.facilityItem}>
            <Text style={styles.facilityName}>유스내비 정보</Text>
            <Text style={styles.facilityAddr}>유스내비 관련 정보가 표시됩니다.</Text>
          </View>
        );
      case '도서관':
        return libraries.map((item, index) => (
          <View key={index} style={styles.facilityItem}>
            <Text style={styles.facilityName}>{item.lbrry_name}</Text>
            <Text style={styles.facilityAddr}>주소: {item.adres}</Text>
            <Text style={styles.facilityTel}>전화번호: {item.tel_no}</Text>
            <Text style={styles.facilityTime}>운영시간: {item.op_time}</Text>
            <Text style={styles.facilityLink}>홈페이지: {item.hmpg_url}</Text>
          </View>
        ));
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      <View style={styles.mapContainer}>
        <Image 
          source={require('./assets/map.png')}
          style={styles.mapImage}
          resizeMode="contain"
        />
      </View>
      <ScrollView style={styles.scrollContainer}>
        {renderContent()}
    </ScrollView>
    </View>
  );
};

/**
 * 아카데미 화면 컴포넌트
 */
const AcademyScreen = () => {
  const facilities = academyData.DATA;

  return (
    <ScrollView style={styles.scrollContainer}>
      {facilities.map((item, index) => (
        <View key={index} style={styles.facilityItem}>
          <Text style={styles.facilityName}>{item.fclty_nm}</Text>
          <Text style={styles.facilityAddr}>주소: {item.bass_adres}</Text>
          <Text style={styles.facilityLink}>사이트: {item.site_url}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

/**
 * 유스내비 화면 컴포넌트
 */
const YouthnaviScreen = () => {
  const [expandedNotices, setExpandedNotices] = useState({});

  const toggleNotice = (index) => {
    setExpandedNotices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const notices = [
    {
      title: '2024년 청소년 문화활동 프로그램 안내',
      content: '2024년 청소년 문화활동 프로그램이 시작됩니다. 다양한 프로그램에 참여하실 수 있습니다.'
    },
    {
      title: '여름방학 특별 프로그램 모집',
      content: '여름방학을 맞이하여 특별 프로그램을 모집합니다. 많은 참여 부탁드립니다.'
    },
    {
      title: '청소년 동아리 지원사업 안내',
      content: '청소년 동아리 지원사업이 시작됩니다. 지원 방법과 자격요건을 확인해주세요.'
    },
    {
      title: '문화활동 참여 혜택 안내',
      content: '문화활동에 참여하시는 청소년들에게 다양한 혜택이 제공됩니다.'
    }
  ];

  return (
    <ScrollView style={styles.cultureContainer}>
      {/* 상단 2개 박스 */}
      <View style={styles.cultureRow}>
        <View style={styles.cultureBox}>
          <Text>재미있는 활동사진</Text>
        </View>
        <View style={styles.cultureBox}>
          <Text>이벤트 사진</Text>
        </View>
      </View>

      {/* 중간 2개 박스 */}
      <View style={styles.cultureRow}>
        <View style={styles.cultureBox}>
          <Text>동아리 추천</Text>
        </View>
        <View style={styles.cultureBox}>
          <Text>새로운 소식</Text>
        </View>
      </View>

      {/* 공지사항 */}
      <View style={styles.cultureNoticeContainer}>
        <Text style={styles.noticeTitle}>공지사항</Text>
        {notices.map((notice, index) => (
          <View key={index} style={styles.noticeItem}>
            <TouchableOpacity 
              style={styles.noticeHeader}
              onPress={() => toggleNotice(index)}
            >
              <Text style={styles.noticeHeaderText}>{notice.title}</Text>
              <Text style={styles.noticeToggle}>
                {expandedNotices[index] ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedNotices[index] && (
              <View style={styles.noticeContent}>
                <Text style={styles.noticeContentText}>{notice.content}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* QR 코드 */}
      <View style={styles.qrContainer}>
        <View style={styles.cultureRow}>
          <TouchableOpacity 
            style={styles.cultureQrBox}
            onPress={() => openURL('https://youthnavi.net')}
          >
            <Image 
              source={require('./assets/youth.jpg')}
              style={styles.qrIcon}
              resizeMode="contain"
            />
            <Image 
              source={require('./assets/site.png')}
              style={styles.cultureQrImage}
              resizeMode="contain"
            />
            <Text style={styles.cultureQrText}>유스내비{'\n'}QR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cultureQrBox}
            onPress={() => openURL('https://apps.apple.com/kr/app/유스내비/id123456789')}
          >
            <Image 
              source={require('./assets/app store.png')}
              style={styles.qrIcon}
              resizeMode="contain"
            />
            <Image 
              source={require('./assets/appqr.png')}
              style={styles.cultureQrImage}
              resizeMode="contain"
            />
            <Text style={styles.cultureQrText}>앱스토어{'\n'}QR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cultureQrBox}
            onPress={() => openURL('https://play.google.com/store/apps/details?id=com.youthnavi')}
          >
            <Image 
              source={require('./assets/google play.png')}
              style={styles.qrIcon}
              resizeMode="contain"
            />
            <Image 
              source={require('./assets/googleqr.png')}
              style={styles.cultureQrImage}
              resizeMode="contain"
            />
            <Text style={styles.cultureQrText}>구글플레이{'\n'}QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

/**
 * 도서관 화면 컴포넌트
 */
const LibraryScreen = () => {
  // use local JSON data
  const libraries = libraryData.DATA;

  return (
    <ScrollView style={styles.scrollContainer}>
      {libraries.map((item, index) => (
        <View key={index} style={styles.facilityItem}>
          <Text style={styles.facilityName}>{item.lbrry_name}</Text>
          <Text style={styles.facilityAddr}>주소: {item.adres}</Text>
          <Text style={styles.facilityTel}>전화번호: {item.tel_no}</Text>
          <Text style={styles.facilityTime}>운영시간: {item.op_time}</Text>
          <Text style={styles.facilityLink}>홈페이지: {item.hmpg_url}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

/**
 * 움직이는 배너 컴포넌트
 */
const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerData = [
    {
      title: "봄맞이 이벤트",
      description: "봄맞이 특별 이벤트에 참여하세요!"
    },
    {
      title: "신규 회원 혜택",
      description: "신규 회원 등록 시 특별 할인 혜택을 받으세요."
    },
    {
      title: "주말 특별 프로그램",
      description: "주말에만 진행되는 특별 프로그램을 확인하세요."
    },
    {
      title: "여름 캠프 안내",
      description: "여름 캠프 신청이 시작되었습니다."
    },
    {
      title: "도서관 휴관일 안내",
      description: "도서관 휴관일을 확인하세요."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === bannerData.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerWrapper}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{bannerData[currentIndex].title}</Text>
          <Text style={styles.bannerDescription}>
            {bannerData[currentIndex].description}
          </Text>
        </View>
        <View style={styles.bannerPagination}>
          {bannerData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

/**
 * 지도 위의 버튼 컴포넌트
 */
const MapButton = ({ x_location, y_location, color, text, onPress, id, width = 30, fontSize = 10, textColor, selectedTab }) => {
  const navigation = useNavigation();
  const isDisabled = onPress.toString().includes('=> {}');
  const [modalVisible, setModalVisible] = useState(false);

  const dongsByDistrict = {
    '강서구': ['화곡동', '가양동', '염창동', '등촌동', '마곡동', '공항동', '방화동', '내발산동', '화곡본동'],
    '양천구': ['신월동', '목동', '신정동'],
    '영등포구': ['신길동', '대림동', '여의도동'],
    '구로구': ['신도림동', '구로동', '가리봉동', '고척동', '개봉동', '오류동', '항동', '궁동', '온수동'],
    '금천구': ['가산동', '독산동', '시흥동'],
    '동작구': ['노량진동', '상도동', '사당동', '대방동'],
    '관악구': ['봉천동', '신림동', '남현동', '신사동', '난곡동', '난향동', '서원동', '삼성동'],
    '서초구': ['서초동', '방배동', '반포동', '양재동'],
    '강남구': ['신사동', '압구정동', '논현동', '삼성동', '역삼동', '청담동', '대치동', '도곡동', '개포동', '일원동', '수서동', '세곡동'],
    '송파구': ['석촌동', '가락동', '문정동', '방이동', '마천동', '잠실동'],
    '강동구': ['명일동', '고덕동', '암사동', '천호동', '성내동', '둔촌동', '강일동', '상일동', '길동'],
    '노원구': ['월계동', '공릉동', '하계동', '상계동', '중계동', '중계본동'],
    '도봉구': ['쌍문동', '방학동', '창동', '도봉동'],
    '은평구': ['불광동', '갈현동', '구산동', '응암동', '신사동'],
    '서대문구': ['홍제동', '창천동'],

    '강북구': ['번동', '수유동', '미아동', '우이동'],
    '성북구': ['정릉동', '장위동', '성북동'],
    '성동구': ['성수동', '성수동2가'],
    '중랑구': ['면목동', '망우동'],
    '광진구': ['중곡동', '구의동', '광장동', '자양동', '능동', '화양동', '군자동'],
    '동대문구': ['제기동', '답십리동', '장안동', '휘경동', '이문동', '용두동', '회기동'],
    '종로구': ['숭인동'],
    '중구': ['소공동', '회현동', '순화동', '광희동', '남창동', '북창동', '신당동', '황학동', '태평로2가', '태평로1가', '남산동1가', '남산동2가', '을지로1가', '을지로2가', '을지로3가', '을지로6가', '을지로7가', '회현동1가', '명동2가', '명동1가',
      '충무로1가', '필동1가', '필동2가', '장충동2가', '광희동2가'],

    '용산구': ['이촌동', '이태원동', '하왕십리동', '후암동', '남영동', '효창동', '용문동', '보광동', '서빙고동', '한남동', '갈월동', '용산동5가', '용산동2가', '원효로3가',
        '원효로4가', '청파동1가', '청파동2가', '청파동3가', '한강로1가', '한강로2가', '한강로3가'],

    '마포구': ['서교동', '망원동', '성산동', '상암동', '도화동', '서강동', '대흥동', '합정동']
  };

  const currentDongs = dongsByDistrict[text] || [];

  const handlePress = () => {
    if (selectedTab === '가맹점') {
      setModalVisible(true);
    } else {
      onPress();
    }
  };

  // 동 버튼 클릭 핸들러
  const handleDongPress = (dong) => {
    setModalVisible(false);
    navigation.navigate('Mark', {
      selectedGu: text.trim(),   // text는 MapButton의 구 이름
      selectedDong: dong.trim(), // 클릭한 동 이름
    });
  };

  return (
    <>
      <TouchableOpacity
        key={id}
        style={[
          styles.mapButton,
          {
            position: 'absolute',
            left: x_location,
            top: y_location,
            backgroundColor: color,
            width: width,
          }
        ]}
        onPress={handlePress}
      >
        <Text style={[styles.mapButtonText, { fontSize: fontSize, color: textColor }]}>{text}</Text>
      </TouchableOpacity>

      {/* 가맹점 탭일 때만 모달 표시 */}
      {selectedTab === '가맹점' && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}>
            <View style={{
              position: 'absolute',
              top: '50%',
              width: 400,
              height: 600,
              padding: 40,
              alignItems: 'center',
              backgroundColor: 'rgb(255, 255, 255)',
              borderRadius: 10,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 5,
              transform: [{ translateY: -300 }],
            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 20,
                textAlign: 'center',
              }}>{text} 행정동 목록</Text>
              
              <Text style={{
                fontSize: 16,
                marginBottom: 20,
                textAlign: 'center',
              }}>
                {text}의 행정동을 선택하세요.
              </Text>
              
              <ScrollView 
                style={{ 
                  width: '100%',
                  maxHeight: 400,
                  marginBottom: 20
                }}
              >
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                  paddingHorizontal: 5
                }}>
                  {currentDongs.map((dong, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor: color,
                        paddingVertical: 10,
                        paddingHorizontal: 5,
                        margin: 4,
                        borderRadius: 5,
                        width: '30%',
                        alignItems: 'center',
                      }}
                      onPress={() => handleDongPress(dong)}
                    >
                      <Text style={{
                        color: '#000',
                        fontWeight: 'bold',
                        fontSize: 13,
                      }}>{dong}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <TouchableOpacity
                style={{
                  backgroundColor: '#007AFF',
                  paddingVertical: 12,
                  paddingHorizontal: 30,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginTop: 10,
                }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};


/**
 * 두 번째 화면 컴포넌트
 */
const SecondScreen = ({ screenType, onBack, selectedItem, allNotices, allBanners }) => {
  const getScreenTitle = () => {
    switch(screenType) {
      case 'welfare':
        return '복지시설';
      case 'academy':
        return '아카데미';
      case 'youthnavi':
        return '유스내비';
      case 'library':
        return '도서관';
      case 'notice':
        return '공지사항';
      case 'allNotices':
        return '전체 공지사항';
      case 'banner':
        return '이벤트';
      case 'allBanners':
        return '전체 이벤트';
      case 'activity':
        return '활동사진';
      case 'logo':
        return '로고';
      default:
        return '';
    }
  };

  const getScreenContent = () => {
    switch(screenType) {
      case 'welfare':
        return (
          <View style={styles.contentContainer}>
            <WelfareScreen />
          </View>
        );
      case 'academy':
        return (
          <View style={styles.contentContainer}>
            <AcademyScreen />
          </View>
        );
      case 'youthnavi':
        return (
          <View style={styles.contentContainer}>
            <YouthnaviScreen />
          </View>
        );
      case 'library':
        return (
          <View style={styles.contentContainer}>
            <LibraryScreen />
          </View>
        );
      case 'activity':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>재밌어 보이는 활동사진</Text>
              <View style={styles.gridRow}>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>재밌어 보이는 활동사진</Text>
                  <TouchableOpacity style={styles.gridItem} 
                  onPress={() => {openURL('https://google.com');
                  console.log("눌림1");
                  }}>
                    <Image 
                      source={require('./assets/fun.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>이벤트 사진</Text>
                  <TouchableOpacity style={styles.gridItem}
                  onPress={() => openURL('https://www.youthnavi.net/customer/expinfo/detailExpinfo?uidKey=PRGUIDNV00000000000000014632')}>
                    <Image 
                      source={require('./assets/event.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                      
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>동아리 추천</Text>
                  <TouchableOpacity style={styles.gridItem}
                  onPress={() => openURL('https://www.youthnavi.net/customer/homebase/homeBaseDetail?paramUid=HBSUIDNV_00000000000000012096')}>
                    <Image 
                      source={require('./assets/club.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                      
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>새로운 소식</Text>
                  <TouchableOpacity style={styles.gridItem}
                  onPress={() => openURL('https://www.youthnavi.net/customer/notice/goNoticeDetail?uid=QNA_00000000000006652')}>
                    <Image 
                      source={require('./assets/new.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                      
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      case 'logo':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.contentSection}>
              <Text style={styles.sectionTitle}>로고</Text>
              <View style={styles.logoGrid}>
                <Image 
                  source={require('./assets/dream.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.logoDescription}>
                  로고에 대한 설명이나 관련 내용이 들어갑니다.
                </Text>
              </View>
            </View>
          </View>
        );
      case 'notice':
        if (selectedItem) {
          return (
            <View style={styles.contentContainer}>
              <View style={styles.noticeDetailContainer}>
                <View style={styles.noticeDetailHeader}>
                  <Text style={styles.noticeDetailTitle}>{selectedItem.title}</Text>
                  <Text style={styles.noticeDetailDate}>{selectedItem.date}</Text>
                </View>
                <Text style={styles.noticeDetailContent}>{selectedItem.content}</Text>
              </View>
            </View>
          );
        }
        return '공지사항 상세 내용이 표시됩니다.';
      case 'allNotices':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.allNoticesContainer}>
              {allNotices.map(item => (
                <View key={item.id} style={styles.allNoticeItem}>
                  <View style={styles.allNoticeHeader}>
                    <Text style={styles.allNoticeTitle}>{item.title}</Text>
                    <Text style={styles.allNoticeDate}>{item.date}</Text>
                  </View>
                  <Text style={styles.allNoticeContent}>{item.content}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'banner':
        if (selectedItem) {
          return (
            <View style={styles.contentContainer}>
              <View style={styles.bannerDetailContainer}>
                <View style={styles.bannerDetailHeader}>
                  <Text style={styles.bannerDetailTitle}>{selectedItem.title}</Text>
                </View>
                <Text style={styles.bannerDetailContent}>{selectedItem.description}</Text>
                <Text style={styles.bannerDetailLink}>링크: {selectedItem.link}</Text>
              </View>
            </View>
          );
        }
        return '이벤트 상세 내용이 표시됩니다.';
      case 'allBanners':
        return (
          <View style={styles.contentContainer}>
            <View style={styles.allBannersContainer}>
              {allBanners.map(item => (
                <View key={item.id} style={styles.allBannerItem}>
                  <View style={styles.allBannerHeader}>
                    <Text style={styles.allBannerTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.allBannerContent}>{item.description}</Text>
                  <Text style={styles.allBannerLink}>링크: {item.link}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./assets/star_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.secondScreenContainer}>
          <View style={styles.secondScreenHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.secondScreenTitle}>{getScreenTitle()}</Text>
            <View style={styles.placeholder} />
          </View>
          <ScrollView 
            style={styles.secondScreenScrollView}
            contentContainerStyle={styles.secondScreenScrollContent}
            showsVerticalScrollIndicator={true}
          >
            {typeof getScreenContent() === 'string' ? (
              <Text style={styles.secondScreenText}>{getScreenContent()}</Text>
            ) : (
              getScreenContent()
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
};

/**
 * 메인 화면 컴포넌트
 * 통합검색 기능을 제공하는 메인 화면
 */
const MainScreen = ({ onNavigateToSecondScreen, allNotices, navigation }) => {
  const enabledDistrictsForWelfare = ['종로구', '강남구', '관악구', '금천구', '양천구', '강동구', '도봉구'];
  const enabledDistrictsForLibrary = [
    '강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'
  ];
  const enabledDistrictsForAcademy = ['중구', '양천구', '마포구', '강남구', '중랑구', '은평구', '영등포구', '성동구', '성북구', '동작구', '동대문구', '도봉구', '노원구', '금천구', '강서구', '강북구', '강동구'];
  const [selectedTab, setSelectedTab] = useState('가맹점');
  const [expandedNotices, setExpandedNotices] = useState({});
  const [mapButtons, setMapButtons] = useState([]);
  const [selectedGu, setSelectedGu] = useState('');
  const [selectedDong, setSelectedDong] = useState('');

const handleMapButtonPress = (button) => {
    if (selectedTab === '복지시설' && enabledDistrictsForWelfare.includes(button.text)) {
      const facilityInDistrict = welfareData.DATA.find(f => f.구 === button.text);
      if (facilityInDistrict) {
        const centerLat = parseFloat(facilityInDistrict.Dlat);
        const centerLng = parseFloat(facilityInDistrict.Dlng);
        navigation.navigate('Social', {
          district: button.text,
          centerLat,
          centerLng,
        });
      }
    } else if (selectedTab === '도서관' && enabledDistrictsForLibrary.includes(button.text)) {
      const libraryInDistrict = libraryData.DATA.find(f => f.구 === button.text);
      if (libraryInDistrict) {
        const centerLat = parseFloat(libraryInDistrict.Dlat);
        const centerLng = parseFloat(libraryInDistrict.Dlng);
        navigation.navigate('Library', {
          district: button.text,
          centerLat,
          centerLng,
        });
      } else {
        console.warn('도서관 위치 정보를 찾을 수 없습니다:', button.text);
      }
    } else if (selectedTab === '아카데미' && enabledDistrictsForAcademy.includes(button.text)) {
      const academyInDistrict = academyData.DATA.find(f => f.구 === button.text);  // 아카데미 데이터에서 해당 구의 시설 찾기
      if (academyInDistrict) {
        const centerLat = parseFloat(academyInDistrict.Dlat);
        const centerLng = parseFloat(academyInDistrict.Dlng);
        navigation.navigate('Academy', {  // 아카데미 화면으로 이동
          district: button.text,
          centerLat,
          centerLng,
        });
      } else {
        console.warn('아카데미 위치 정보를 찾을 수 없습니다:', button.text);
      }
    }
  };
  // 초기 map위에 버튼 설정
  useEffect(() => {
    // 각 구의 고유 ID를 부여
    const districts = [
      { id: 'district1', x: 45, y: 165, color: '#befae7', name: "강서구"},
      { id: 'district2', x: 65, y: 220, color: '#acf2e6', name: "양천구" },
      { id: 'district3', x: 115, y: 210, color: '#7eeddf', name: "영등포구", width: 38, fontSize: 7 },
      { id: 'district4', x: 60, y: 260, color: '#91f4da', name: "구로구" },
      { id: 'district5', x: 110, y: 300, color: '#76ecd7', name: "금천구" },
      { id: 'district6', x: 320, y: 250, color: '#fea6b8', name: "송파구"},
      { id: 'district7', x: 265, y: 270, color: '#ffb1c4', name: "강남구" },
      { id: 'district8', x: 220, y: 283, color: '#ffb7c8', name: "서초구" },
      { id: 'district9', x: 160, y: 234, color: '#ffe6ed', name: "동작구"},
      { id: 'district10', x: 160, y: 290, color: '#fcd3df', name: "관악구" },
      { id: 'district11', x: 180, y: 180, color: '#b0ebf9', name: "용산구" },
      { id: 'district12', x: 293, y: 165, color: '#e4f2a5', name: "광진구"},
      { id: 'district13', x: 257, y: 188, color: '#f2f9c8', name: "성동구" },
      { id: 'district14', x: 344, y: 190, color: '#f5f9d8', name: "강동구" },
      { id: 'district15', x: 280, y: 30, color: '#f5ee89', name: "노원구" },
      { id: 'district16', x: 244, y: 150, color: '#ceee72', name: "동대문구", width: 40 , fontSize: 9},
      { id: 'district17', x: 300, y: 110, color: '#c7e643', name: "중랑구" },
      { id: 'district18', x: 113, y: 150, color: '#95e4fb', name: "마포구" },
      { id: 'district19', x: 185, y: 143, color: '#96e3fb', name: "중구" },
      { id: 'district20', x: 220, y: 60, color: '#fff7b6', name: "강북구"},
      { id: 'district21', x: 220, y: 105, color: '#ffee86', name: "성북구"},
      { id: 'district22', x: 230, y: 15, color: '#fef5b6', name: "도봉구"},
      { id: 'district23', x: 130, y: 80, color: '#77dbfb', name: "은평구"},
      { id: 'district24', x: 148, y: 137, color: '#95e5fa', name: "서대문구", width: 32, fontSize: 6.5},
      { id: 'district25', x: 170, y: 110, color: '#93e3f9', name: "종로구"},

    ]
   
    setMapButtons([]); // 기존 버튼 초기화

    // districts 배열을 순회하며 버튼 생성
    districts.forEach(district => {
      addMapButton(
        district.x,
        district.y,
        district.color,
        district.name,
        district.width || 30,
        district.id,
        district.fontSize || 9
      );
    });
  }, [selectedTab]); // selectedTab이 바뀔 때마다 실행

  const toggleNotice = (index) => {
    setExpandedNotices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const addMapButton = (x_location, y_location, color, text, width, id, fontSize) => {
    const newButton = {
      id: id || Date.now().toString(),
      x_location,
      y_location,
      color,
      text,
      width,
      fontSize,
    };
    setMapButtons(prev => [...prev, newButton]);
  };

  const removeMapButton = (buttonId) => {
    setMapButtons(prev => prev.filter(button => button.id !== buttonId));
  };
  
  const handleCurrentLocationPress = () => {
    navigation.navigate('Mark', {
      requestLocation: true,
      selectedGu: selectedGu?.trim(),    // 선택된 구
      selectedDong: selectedDong?.trim() // 선택된 동
    });
  };

  // 모달창 닫기 함수
  const closeModal = () => {
    setDistrictModal(false);
  };
  


  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.initialScreenContainer}>
          {/* 상단 여백 */}
          <View style={styles.topSpace} />
          
          {/* 급식카드 가맹점 제목 */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>급식카드 가맹점 지도</Text>
          </View>
          
          {/* 지도 영역 */}
          <View style={styles.mapContainer}>
            {/* Add current location button */}
            <Image 
              source={
                selectedTab === '복지시설'
                  ? require('./assets/map.png')
                  : require('./assets/map.png')
              }
              style={styles.mapImage}
              resizeMode="contain"
            />
            {mapButtons.map(button => {
              const welfareEnabledDistricts = [
                '종로구', '강남구', '관악구', '금천구', '강서구', '강동구', '도봉구', '양천구'
              ];

              const academyExcludedDistricts = [
                '관악구', '광진구', '구로구',
                '서대문구', '서초구', '송파구', '용산구',
                '종로구'
              ];

              const shouldShowButton =
                (selectedTab === '복지시설' && welfareEnabledDistricts.includes(button.text)) ||
                (selectedTab === '아카데미' && !academyExcludedDistricts.includes(button.text)) ||
                (selectedTab !== '복지시설' && selectedTab !== '아카데미');

              return shouldShowButton && (
                <MapButton
                  key={button.id}
                  id={button.id}
                  x_location={button.x_location}
                  y_location={button.y_location}
                  color={button.color}
                  text={button.text}
                  width={button.width}
                  fontSize={button.fontSize}
                  textColor={
                    (selectedTab === '복지시설' && !welfareEnabledDistricts.includes(button.text)) ||
                    (selectedTab === '아카데미' && academyExcludedDistricts.includes(button.text))
                      ? 'transparent'
                      : '#000'
                  }
                  selectedTab={selectedTab}
                  onPress={() => handleMapButtonPress(button)}
                />
              );
            })}

          </View>
          
          {/* 탭 메뉴 - 지도 아래로 이동 */}
          <View style={[styles.tabContainer, { marginTop: 15, marginBottom: 15 }]}>
            <TouchableOpacity 
              style={[styles.tabButton, selectedTab === '가맹점' && styles.selectedTab]}
              onPress={() => setSelectedTab('가맹점')}
            >
              <Text style={styles.tabText}>가맹점</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, selectedTab === '복지시설' && styles.selectedTab]}
              onPress={() => setSelectedTab('복지시설')}
            >
              <Text style={styles.tabText}>복지시설</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, selectedTab === '아카데미' && styles.selectedTab]}
              onPress={() => setSelectedTab('아카데미')}
            >
              <Text style={styles.tabText}>아카데미</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, selectedTab === '도서관' && styles.selectedTab]}
              onPress={() => setSelectedTab('도서관')}
            >
              <Text style={styles.tabText}>도서관</Text>
            </TouchableOpacity>
          </View>

          {/* 배너 슬라이더 */}
          <BannerSlider />

          {/* 스크롤링 컨텐츠 */}
          <View style={styles.scrollContent}>
            {/* 공지사항 */}
            <View style={styles.noticeContainer}>
              <View style={styles.noticeHeader}>
                <Text style={styles.noticeTitle}>공지사항</Text>
                <TouchableOpacity onPress={() => onNavigateToSecondScreen('allNotices')}>
                  <Text style={styles.moreButton}>더보기</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.noticeList}>
                {allNotices.slice(0, 3).map((notice, index) => (
                  <TouchableOpacity 
                    key={notice.id}
                    style={styles.noticeItem}
                    onPress={() => toggleNotice(index)}
                  >
                    <View style={styles.noticeItemHeader}>
                      <View style={styles.noticeItemLeft}>
                        <Text style={styles.noticeItemTitle}>{notice.title}</Text>
                        <Text style={styles.noticeItemDate}>{notice.date}</Text>
                      </View>
                      <Text style={styles.expandIcon}>{expandedNotices[index] ? '−' : '+'}</Text>
                    </View>
                    {expandedNotices[index] && (
                      <Text style={styles.noticeItemContent}>{notice.content}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 그리드 영역 */}
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>재밌어 보이는 활동사진</Text>
                  <TouchableOpacity style={styles.gridItem} 
                  onPress={() => {openURL('https://www.youthnavi.net/customer/homebase/contentsDetail?paramUid=HBSUIDNV_00000000000000012100&homeUid=undefined');
                  }}>
                    <Image 
                      source={require('./assets/fun.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>이벤트 사진</Text>
                  <TouchableOpacity style={styles.gridItem}
                  onPress={() => openURL('https://www.youthnavi.net/customer/expinfo/detailExpinfo?uidKey=PRGUIDNV00000000000000014632')}>
                    <Image 
                      source={require('./assets/event.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>동아리 추천</Text>
                  <TouchableOpacity style={styles.gridItem}
                  onPress={() => openURL('https://www.youthnavi.net/customer/homebase/homeBaseDetail?paramUid=HBSUIDNV_00000000000000012096')}>
                    
                    <Image 
                      source={require('./assets/club.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                      
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.gridItemContainer}>
                  <Text style={styles.gridItemText}>새로운 소식</Text>
                  <TouchableOpacity style={styles.gridItem}
                  onPress={() => openURL('https://www.youthnavi.net/customer/notice/goNoticeDetail?uid=QNA_00000000000006652')}>
                    <Image 
                      source={require('./assets/new.jpg')}
                      style={styles.gridImage}
                      resizeMode="cover"
                      
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


/**
 * 메인 앱 컴포넌트
 * 인트로 화면과 메인 화면 간의 전환을 관리
 */
const Home = ({ navigation }) => {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [screenType, setScreenType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
    // 공지사항 데이터
    const allNotices = [
      {
        id: 'notice1',
        title: '어플리케이션 안내',
        content: "'꿈쓰'는 서울시 청소년이 이용할 수 있는 복지 기반 시설 정보를 직관적으로 제공하는 맞춤형 복지 안내 어플리케이션입니다.",
        date: '2025.05.09',
      },
      {
        id: 'notice2',
        title: '신규 서비스 오픈',
        content: '도서관 카테고리가 추가 되었습니다.',
        date: '2025.05.09',
      },
      {
        id: 'notice3',
        title: '어플리케이션 사용법',
        content: '1. 지도의 지명을 선택하면 가맹점 정보를 확인할 수 있습니다.\n2. 복지시설, 아카데미, 도서관 버튼을 선택한 후 지도 선택 시 해당하는 시설의 정보를 확인 가능합니다.\n3. 마커 선택 후 로드맵 버튼 선택 시 해당 장소의 로드맵을 볼 수 있습니다.\n4. 좌측 상단 현 위치 버튼 선택 시 현 위치 주변 정보를 볼 수 있습니다.\n5. 하단 이미지 선택 시 외부 사이트로 이동됩니다.',
        date: '2025.05.09',
      },
      {
        id: 'notice4',
        title: '가맹점 등록 안내',
        content: '꿈쓰 어플리케이션에 가맹점을 등록하고 싶으신 경우, 홈페이지 또는 고객센터를 통해 신청해 주세요. 심사 후 등록이 진행됩니다.',
        date: '2025.05.08',
      },
      {
        id: 'notice5',
        title: '프로모션 이벤트 안내',
        content: '청소년 여러분을 위한 다양한 프로모션이 준비되어 있습니다! 자세한 내용은 공지사항과 이벤트 페이지를 확인해 주세요.',
        date: '2025.05.07',
      },
    ];
    
  // 배너 데이터
  const allBanners = [
    {
      id: 'banner1', 
      title: '봄맞이 이벤트', 
      description: '봄맞이 특별 이벤트에 참여하세요! 봄맞이 특별 이벤트에 참여하시면 다양한 혜택을 받으실 수 있습니다. 이벤트 기간은 3월 1일부터 3월 31일까지입니다. 많은 참여 부탁드립니다.',
      link: 'spring_event'
    },
    { 
      id: 'banner2', 
      title: '신규 회원 혜택', 
      description: '신규 회원 등록 시 특별 할인 혜택을 받으세요. 신규 회원 등록 시 첫 달 이용료 50% 할인, 두 번째 달 30% 할인 혜택을 제공합니다. 지금 바로 가입하세요!',
      link: 'new_member'
    },
    { 
      id: 'banner3', 
      title: '주말 특별 프로그램', 
      description: '주말에만 진행되는 특별 프로그램을 확인하세요. 주말 특별 프로그램은 매주 토요일과 일요일에 진행됩니다. 다양한 주제의 강좌와 체험 프로그램이 준비되어 있습니다.',
      link: 'weekend_program'
    },
    { 
      id: 'banner4', 
      title: '여름 캠프 안내', 
      description: '여름 캠프 신청이 시작되었습니다. 여름 캠프는 7월 15일부터 7월 30일까지 진행됩니다. 다양한 활동과 체험을 통해 즐거운 여름을 보내세요.',
      link: 'summer_camp'
    },
    { 
      id: 'banner5', 
      title: '도서관 휴관일 안내', 
      description: '도서관은 매월 첫 번째 월요일과 공휴일에는 휴관합니다. 이용에 참고하시기 바랍니다.',
      link: 'library_holiday'
    },
  ];

  const handleNavigateToSecondScreen = (type, item = null) => {
    setScreenType(type);
    setSelectedItem(item);
    setCurrentScreen('second');
  };

  const handleBackToMain = () => {
    setCurrentScreen('main');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'main' ? (
        <MainScreen 
          onNavigateToSecondScreen={handleNavigateToSecondScreen}
          allNotices={allNotices}
          navigation={navigation}
        />
      ) : (
        <SecondScreen 
          screenType={screenType} 
          onBack={handleBackToMain} 
          selectedItem={selectedItem}
          allNotices={allNotices}
          allBanners={allBanners}
        />
      )}
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e8',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSpace: {
    height: 25,
  },
  searchSection: {
    backgroundColor: '#fbf4e8',
    padding: 15,
    width: '95%',
    marginHorizontal: 10,
    marginTop: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    paddingLeft: 15,
    color: '#666',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#feedcf',
    padding: 5,
    marginHorizontal: 20,
    borderRadius: 50,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 40,
    backgroundColor: '#fbf4e8',
    marginHorizontal: 2,
    height: 40,
  },
  selectedTab: {
    backgroundColor: '#feedcf',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  mapContainer: {
    height: 360,
    marginVertical: 10,
    marginTop: 35,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
  },
  mapImage: {
    width: '110%',
    height: '110%',
    resizeMode: 'contain',
  },
  currentLocationButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  initialScreenContainer: {
    height: '100%',
  },
  contentGrid: {
    padding: 15,
    marginTop: 20,
  },
  gridContainer: {
    padding: 10,
    marginTop: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItemContainer: {
    width: '48%',
    marginBottom: 5,
  },
  gridItemText: {
    fontSize: 13,
    textAlign: 'left',
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 3,
    paddingHorizontal: 2,
    height: 20,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  gridItem: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    pointerEvents: 'none',
  },
  noticeList: {
    marginTop: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  noticeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
  },
  qrContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  qrItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  bannerContainer: {
    marginTop: 20,
    marginHorizontal: 15,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerWrapper: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 12,
    color: '#666',
  },
  bannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDD',
  },
  activeDot: {
    backgroundColor: '#666',
  },
  suggestionsContainer: {
    padding: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  searchContainer: {
    flex: 1,
  },
  searchResultsContainer: {
    padding: 10,
  },
  searchResultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchResultDescription: {
    fontSize: 14,
    color: '#666',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
  },
  secondScreenContainer: {
    flex: 1,
    padding: 20,
  },
  secondScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  secondScreenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  placeholder: {
    flex: 1,
  },
  secondScreenScrollView: {
    flex: 1,
  },
  secondScreenScrollContent: {
    padding: 10,
  },
  secondScreenText: {
    fontSize: 16,
    color: '#666',
  },
  noticeDetailContainer: {
    flex: 1,
    padding: 20,
  },
  noticeDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeDetailDate: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  noticeDetailContent: {
    fontSize: 16,
    color: '#333',
  },
  allNoticesContainer: {
    flex: 1,
  },
  allNoticeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  allNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  allNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  allNoticeDate: {
    fontSize: 14,
    color: '#666',
  },
  allNoticeContent: {
    fontSize: 14,
    color: '#333',
  },
  bannerDetailContainer: {
    flex: 1,
    padding: 20,
  },
  bannerDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bannerDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerDetailContent: {
    fontSize: 16,
    color: '#333',
  },
  bannerDetailLink: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
  },
  allBannersContainer: {
    flex: 1,
  },
  allBannerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  allBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  allBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  allBannerContent: {
    fontSize: 14,
    color: '#333',
  },
  allBannerLink: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 10,
  },
  backgroundImage: {
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
  menuIcon: {
    width: 30,
    height: 20,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  scrollContent: {
    padding: 15,
    marginTop: 30,
  },
  facilityList: {
    padding: 10,
  },
  facilityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  facilityInfo: {
    fontSize: 14,
    color: '#666',
  },
  newsList: {
    padding: 10,
  },
  newsItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  newsDate: {
    fontSize: 14,
    color: '#666',
  },
  cultureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cultureBox: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cultureNoticeContainer: {
    marginTop: 15,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cultureQrBox: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cultureQrImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  cultureQrText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  noticeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  moreButton: {
    fontSize: 13,
    color: '#666',
  },
  noticeList: {
    gap: 10,
  },
  noticeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    paddingBottom: 10,
  },
  noticeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeItemLeft: {
    flex: 1,
  },
  noticeItemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  noticeItemDate: {
    fontSize: 12,
    color: '#999',
  },
  expandIcon: {
    fontSize: 16,
    color: '#999',
    marginLeft: 10,
  },
  noticeItemContent: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    paddingLeft: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 2,
    padding: 10,
  },
  contentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  logoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  logoDescription: {
    fontSize: 14,
    color: '#666',
  },
  mapButton: {
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 10,
    color: '#000',
    textAlign: 'center',
  },

  titleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Home; 