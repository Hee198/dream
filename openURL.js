import { Linking, Alert } from 'react-native';

export const openURL = (url) => {
  const encodedURL = encodeURI(url);
  Linking.openURL(encodedURL)
    .catch(err => {
      Alert.alert("링크 오류", err.message);
    });
};
