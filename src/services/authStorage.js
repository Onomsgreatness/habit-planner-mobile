import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "token";

export const saveToken = (token) => AsyncStorage.setItem(KEY, token);
export const getToken = () => AsyncStorage.getItem(KEY);
export const clearToken = () => AsyncStorage.removeItem(KEY);
