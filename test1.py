import json
import time
import sys
import requests
from urllib.parse import quote

# 좌표 얻어오는 함수
def get_coordinates(address):
    # 주소 형식 정리
    address = ' '.join(address.split())  # 여러 공백을 하나로 변환
    print(f"검색할 주소: {address}")  # 디버깅용 출력
    
    # OpenStreetMap Nominatim API 호출
    url = f"https://nominatim.openstreetmap.org/search?q={quote(address)}&format=json&limit=1"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # HTTP 에러 체크
        
        result = response.json()
        
        if result:
            lng = float(result[0]['lon'])
            lat = float(result[0]['lat'])
            print(f"좌표 찾음: ({lng}, {lat})")  # 디버깅용 출력
            return lng, lat
        else:
            print(f"좌표를 찾을 수 없음: {address}")  # 디버깅용 출력
            return None
            
    except Exception as e:
        print(f"에러 발생: {e}")
        return None

# 진행률 바 출력 함수
def print_progress(current, total):
    bar_length = 40  # 진행 바 길이
    progress = current / total
    block = int(bar_length * progress)
    text = f"\r진행률: [{'■' * block}{'□' * (bar_length - block)}] {current}/{total}개 완료"
    sys.stdout.write(text)
    sys.stdout.flush()

# 메인 실행 부분
def main():
    # 1. 기존 데이터 불러오기
    with open('assets/store.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    stores = data['stores']
    total_stores = len(stores)
    updated_count = 0
    failed_stores = []  # 실패한 가게 목록 저장

    # 2. 순회하면서 좌표 채우기
    for idx, store in enumerate(stores, 1):
        if 'lng' not in store or 'lat' not in store:
            address = store['주소']
            coords = get_coordinates(address)

            if coords:
                lng, lat = coords
                store['lng'] = lng
                store['lat'] = lat
                print(f"\n{store['가맹점명']} - 좌표 추가 완료 ({lng}, {lat})")
            else:
                print(f"\n{store['가맹점명']} - 좌표 찾기 실패")
                failed_stores.append({
                    '가맹점명': store['가맹점명'],
                    '주소': store['주소']
                })

            updated_count += 1
            time.sleep(1)  # API 호출 간 딜레이 추가 (Nominatim API는 1초 간격 요청)

        # 진행률 표시
        print_progress(idx, total_stores)

    # 3. 수정된 데이터를 원본 파일에 저장
    with open('assets/store.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # 4. 실패한 가게 목록 저장
    if failed_stores:
        with open('assets/failed_stores.json', 'w', encoding='utf-8') as f:
            json.dump(failed_stores, f, ensure_ascii=False, indent=2)
        print(f"\n\n{len(failed_stores)}개의 가게에서 좌표를 찾지 못했습니다.")
        print("실패한 가게 목록은 assets/failed_stores.json에 저장되었습니다.")

    print("\n\n모든 작업 완료! 결과는 assets/store.json에 저장했습니다.")

if __name__ == "__main__":
    main()
