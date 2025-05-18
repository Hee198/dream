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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import welfareData from './HomeData/서울시 사회복지시설(청소년복지시설) 목록.json';
import academyData from './HomeData/서울시 청소년방과후아카데미 시설현황정보.json';
import libraryData from './HomeData/서울시 공공도서관 현황정보.json';


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
      <ShortcutButton title="강좌정보" onPress={() => onShortcutPress('course')} />
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
      id: '1',
      title: '시스템 점검 안내',
      content: '2024년 3월 15일 새벽 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
      date: '2024.03.10',
    },
    {
      id: '2',
      title: '신규 서비스 오픈',
      content: '더욱 편리한 서비스를 위해 새로운 기능이 추가되었습니다.',
      date: '2024.03.08',
    },
    {
      id: '3',
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
  const facilities = welfareData.DATA;

  return (
    <ScrollView style={styles.scrollContainer}>
      {facilities.map((item, index) => (
        <View key={index} style={styles.facilityItem}>
          <Text style={styles.facilityName}>{item.fclt_nm}</Text>
          <Text style={styles.facilityAddr}>주소: {item.fclt_addr}</Text>
          <Text style={styles.facilityTel}>전화번호: {item.fclt_tel_no}</Text>
        </View>
      ))}
    </ScrollView>
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
 * 강좌정보 화면 컴포넌트
 */
const CourseScreen = () => (
  <View style={styles.screenContent}>
    <Text style={styles.screenText}>강좌 정보가 표시됩니다.</Text>
  </View>
);

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
const MovingBanner = ({ onBannerPress }) => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const bannerWidth = width - 40;

  const banners = [
    { 
      id: '1', 
      title: '봄맞이 이벤트', 
      description: '봄맞이 특별 이벤트에 참여하세요!',
      link: 'spring_event'
    },
    { 
      id: '2', 
      title: '신규 회원 혜택', 
      description: '신규 회원 등록 시 특별 할인 혜택을 받으세요.',
      link: 'new_member'
    },
    { 
      id: '3', 
      title: '주말 특별 프로그램', 
      description: '주말에만 진행되는 특별 프로그램을 확인하세요.',
      link: 'weekend_program'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentIndex < banners.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentIndex * bannerWidth,
        animated: true
      });
    }
  }, [currentIndex]);

  const handleBannerPress = (banner) => {
    if (onBannerPress) {
      onBannerPress(banner);
    }
  };

  return (
    <View style={styles.bannerContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
          setCurrentIndex(newIndex);
        }}
      >
        {banners.map((banner) => (
          <TouchableOpacity 
            key={banner.id} 
            style={[styles.bannerItem, { width: bannerWidth }]}
            onPress={() => handleBannerPress(banner)}
            activeOpacity={0.7}
          >
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerDescription}>{banner.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
    </View>
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
      case 'course':
        return '강좌정보';
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
      default:
        return '';
    }
  };

  const getScreenContent = () => {
    switch(screenType) {
      case 'welfare':
        return <WelfareScreen />;
      case 'academy':
        return <AcademyScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'notice':
        if (selectedItem) {
          return (
            <View style={styles.noticeDetailContainer}>
              <View style={styles.noticeDetailHeader}>
                <Text style={styles.noticeDetailTitle}>{selectedItem.title}</Text>
                <Text style={styles.noticeDetailDate}>{selectedItem.date}</Text>
              </View>
              <Text style={styles.noticeDetailContent}>{selectedItem.content}</Text>
            </View>
          );
        }
        return '공지사항 상세 내용이 표시됩니다.';
      case 'allNotices':
        return (
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
        );
      case 'banner':
        if (selectedItem) {
          return (
            <View style={styles.bannerDetailContainer}>
              <View style={styles.bannerDetailHeader}>
                <Text style={styles.bannerDetailTitle}>{selectedItem.title}</Text>
              </View>
              <Text style={styles.bannerDetailContent}>{selectedItem.description}</Text>
              <Text style={styles.bannerDetailLink}>링크: {selectedItem.link}</Text>
            </View>
          );
        }
        return '이벤트 상세 내용이 표시됩니다.';
      case 'allBanners':
        return (
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
 * 검색 바 컴포넌트
 */
const SearchBar = ({ onNavigateToSecondScreen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // 연관 검색어 데이터
  const suggestionData = [
    { id: '1', text: '복지시설', type: 'welfare' },
    { id: '2', text: '아카데미', type: 'academy' },
    { id: '3', text: '강좌정보', type: 'course' },
    { id: '4', text: '도서관', type: 'library' },
    { id: '5', text: '공지사항', type: 'notice' },
    { id: '6', text: '이벤트', type: 'banner' },
    { id: '7', text: '복지 프로그램', type: 'welfare' },
    { id: '8', text: '교육 프로그램', type: 'academy' },
    { id: '9', text: '문화 프로그램', type: 'course' },
  ];

  const handleInputChange = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      const filteredSuggestions = suggestionData.filter(item =>
        item.text.toLowerCase().includes(text.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSuggestions([]);
    
    // 임시 검색 결과 데이터
    const mockResults = [
      {
        id: '1',
        title: '복지시설 검색 결과',
        description: '복지시설 관련 정보가 검색되었습니다.',
        type: 'welfare'
      },
      {
        id: '2',
        title: '아카데미 검색 결과',
        description: '아카데미 관련 정보가 검색되었습니다.',
        type: 'academy'
      },
      {
        id: '3',
        title: '강좌정보 검색 결과',
        description: '강좌 관련 정보가 검색되었습니다.',
        type: 'course'
      },
      {
        id: '4',
        title: '도서관 검색 결과',
        description: '도서관 관련 정보가 검색되었습니다.',
        type: 'library'
      }
    ];

    // 검색어가 포함된 결과만 필터링
    const filteredResults = mockResults.filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filteredResults);
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색어를 입력하세요"
          value={searchQuery}
          onChangeText={handleInputChange}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => handleSearch(searchQuery)}
        >
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>
      
      {searchQuery.length > 0 && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(item.text);
                  handleSearch(item.text);
                }}
              >
                <Text style={styles.suggestionText}>{item.text}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      
      {isSearching && searchResults.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => {
                  onNavigateToSecondScreen(item.type);
                }}
              >
                <Text style={styles.searchResultTitle}>{item.title}</Text>
                <Text style={styles.searchResultDescription}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      
      {isSearching && searchResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

/**
 * 메인 화면 컴포넌트
 * 통합검색 기능을 제공하는 메인 화면
 */
const MainScreen = ({ onNavigateToSecondScreen }) => {
  const handleSearch = (query) => {
    // 실제 검색 로직 구현
    console.log('검색어:', query);
  };

  const handleShortcutPress = (type) => {
    onNavigateToSecondScreen(type);
  };

  const handleBoardItemPress = (item) => {
    onNavigateToSecondScreen('notice', item);
  };

  const handleMorePress = () => {
    onNavigateToSecondScreen('allNotices');
  };

  const handleBannerPress = (banner) => {
    onNavigateToSecondScreen('banner', banner);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={require('./assets/star_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.mainContainer}>
          <SearchBar onNavigateToSecondScreen={onNavigateToSecondScreen} />
          <ShortcutButtons onShortcutPress={handleShortcutPress} />
          <BulletinBoard 
            onItemPress={handleBoardItemPress} 
            onMorePress={handleMorePress}
          />
          <MovingBanner onBannerPress={handleBannerPress} />
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
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
      id: '1',
      title: '시스템 점검 안내',
      content: '2024년 3월 15일 새벽 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
      date: '2024.03.10',
    },
    {
      id: '2',
      title: '신규 서비스 오픈',
      content: '더욱 편리한 서비스를 위해 새로운 기능이 추가되었습니다.',
      date: '2024.03.08',
    },
    {
      id: '3',
      title: '이용약관 개정 안내',
      content: '서비스 이용약관이 개정되었습니다. 변경된 내용을 확인해 주시기 바랍니다.',
      date: '2024.03.05',
    },
    {
      id: '4',
      title: '봄맞이 이벤트 안내',
      content: '봄맞이 특별 이벤트가 시작됩니다. 많은 참여 부탁드립니다.',
      date: '2024.03.01',
    },
    {
      id: '5',
      title: '휴관일 안내',
      content: '3월 1일은 휴관일입니다. 이용에 참고하시기 바랍니다.',
      date: '2024.02.28',
    },
  ];
  
  // 배너 데이터
  const allBanners = [
    {
      id: '1', 
      title: '봄맞이 이벤트', 
      description: '봄맞이 특별 이벤트에 참여하세요! 봄맞이 특별 이벤트에 참여하시면 다양한 혜택을 받으실 수 있습니다. 이벤트 기간은 3월 1일부터 3월 31일까지입니다. 많은 참여 부탁드립니다.',
      link: 'spring_event'
    },
    { 
      id: '2', 
      title: '신규 회원 혜택', 
      description: '신규 회원 등록 시 특별 할인 혜택을 받으세요. 신규 회원 등록 시 첫 달 이용료 50% 할인, 두 번째 달 30% 할인 혜택을 제공합니다. 지금 바로 가입하세요!',
      link: 'new_member'
    },
    { 
      id: '3', 
      title: '주말 특별 프로그램', 
      description: '주말에만 진행되는 특별 프로그램을 확인하세요. 주말 특별 프로그램은 매주 토요일과 일요일에 진행됩니다. 다양한 주제의 강좌와 체험 프로그램이 준비되어 있습니다.',
      link: 'weekend_program'
    },
    { 
      id: '4', 
      title: '여름 캠프 안내', 
      description: '여름 캠프 신청이 시작되었습니다. 여름 캠프는 7월 15일부터 7월 30일까지 진행됩니다. 다양한 활동과 체험을 통해 즐거운 여름을 보내세요.',
      link: 'summer_camp'
    },
    { 
      id: '5', 
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
        <MainScreen onNavigateToSecondScreen={handleNavigateToSecondScreen} />
      ) : (
        <SecondScreen 
          screenType={screenType} 
          onBack={handleBackToMain} 
          selectedItem={selectedItem}
          allNotices={allNotices}
          allBanners={allBanners}
        />
      )}
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => navigation.navigate('Sub')}
      >
        <View style={styles.menuIcon}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  introContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(245, 245, 245)',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'column',
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    width: 80,
    height: 50,
    backgroundColor: '#4a90e2',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  searchResultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchResultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  searchResultDescription: {
    fontSize: 14,
    color: '#666',
  },
  noResultsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  shortcutContainer: {
    marginBottom: 20,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  shortcutButton: {
    width: (width - 60) / 2,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  shortcutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  boardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 1)',
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  boardMore: {
    fontSize: 14,
    color: '#4a90e2',
  },
  boardItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.7)',
  },
  boardItemHeader: {
    paddingVertical: 12,
  },
  boardItemTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  boardItemDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  expandIcon: {
    fontSize: 20,
    color: '#666',
    marginLeft: 10,
    width: 20,
    textAlign: 'center',
  },
  boardItemContent: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(245, 245, 245, 0.5)',
    borderRadius: 5,
    marginBottom: 10,
  },
  boardItemContentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#4a90e2',
    fontSize: 16,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  screenText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  bannerContainer: {
    height: 100,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 1)',
  },
  bannerItem: {
    height: '100%',
    padding: 15,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#666',
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4a90e2',
  },
  noticeContainer: {
    flex: 1,
  },
  noticeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeDate: {
    fontSize: 12,
    color: '#999',
  },
  noticeContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  secondScreenContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
  },
  secondScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  secondScreenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4a90e2',
  },
  placeholder: {
    width: 44,
  },
  secondScreenScrollView: {
    flex: 1,
  },
  secondScreenScrollContent: {
    paddingBottom: 30,
  },
  secondScreenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  secondScreenText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noticeDetailContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 0.7)',
  },
  noticeDetailHeader: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.7)',
  },
  noticeDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeDetailDate: {
    fontSize: 12,
    color: '#999',
  },
  noticeDetailContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  allNoticesContainer: {
    width: '100%',
  },
  allNoticeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 0.7)',
  },
  allNoticeHeader: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.7)',
  },
  allNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  allNoticeDate: {
    fontSize: 12,
    color: '#999',
  },
  allNoticeContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bannerDetailContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 0.7)',
  },
  bannerDetailHeader: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.7)',
  },
  bannerDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bannerDetailContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  bannerDetailLink: {
    fontSize: 14,
    color: '#4a90e2',
    fontStyle: 'italic',
  },
  allBannersContainer: {
    width: '100%',
  },
  allBannerItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(221, 221, 221, 0.7)',
  },
  allBannerHeader: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.7)',
  },
  allBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  allBannerContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  allBannerLink: {
    fontSize: 12,
    color: '#4a90e2',
    fontStyle: 'italic',
  },
  facilityItem: {
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  facilityAddr: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  facilityTel: {
    fontSize: 14,
    color: '#666',
  },
  programName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  targetName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  courseText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  facilityLink: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 3,
  },
  facilityTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
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
});

export default Home; 