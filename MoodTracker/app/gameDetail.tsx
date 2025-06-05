import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';
import { useSearchParams } from 'expo-router/build/hooks';
import { useNavigation } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Icon from 'react-native-vector-icons/Ionicons';

export default function GameDetail() {
  const params = useSearchParams();
  const id = params.get('id');
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const title = params.get('title') || "Detail Game";

  useEffect(() => {
    navigation.setOptions({ title: `Game Detail - ${title}` });
  }, [navigation, title]);

  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API URL for fetching game details
  const API_URL = "https://www.freetogame.com/api";

  const getGameDetail = async () => {
    setIsLoading(true);
    setError(null);     
    try {
      const response = await axios.get(`${API_URL}/game?id=${id}`);
      setDetail(response.data);
    } catch (err) {
      console.error("Error fetching game detail:", err);
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to fetch game details. Please check your network connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getGameDetail();
  }, [id]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: themeColors.background }]}> 
          <ActivityIndicator size="large" color={themeColors.tint} />
          <Text style={[tw`mt-2`, { color: themeColors.text }]}>Loading game details...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-red-600 text-lg text-center`}>{error}</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}
            onPress={getGameDetail}
          >
            <Text style={tw`text-white text-base font-semibold`}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!detail) {
      return (
        <View style={[tw`flex-1 justify-center items-center p-4`, { backgroundColor: themeColors.background }]}> 
          <Text style={[tw`text-gray-600 text-lg text-center`, { color: themeColors.text }]}>Game details not found.</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}
            onPress={getGameDetail}
          >
            <Text style={tw`text-white text-base font-semibold`}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-4`}> 
        {detail.thumbnail ? (
          <Image
            source={{ uri: detail.thumbnail }}
            style={tw`w-full h-60 rounded-lg mb-4`} 
            resizeMode="cover"
          />
        ) : (
          <View style={[tw`w-full h-60 rounded-lg mb-4 bg-gray-200 justify-center items-center`, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }]}/>
        )}
        <View style={[tw`rounded-xl p-4 shadow-md`, { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', elevation: 2 }]}> 
          <Text style={[tw`text-2xl font-bold mb-2`, { color: themeColors.text }]}>{detail.title}</Text>
          <Text style={[tw`text-sm mb-4`, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>{detail.short_description}</Text>
          
          <View style={tw`mt-4 pt-4 border-t border-gray-200`}>
            <Text style={[tw`text-lg font-semibold mb-2`, { color: themeColors.text }]}>Details:</Text>
            <View style={tw`mb-2`}>
              <Text style={[tw`text-base`, { color: colorScheme === 'dark' ? '#ccc' : '#555' }]}><Text style={tw`font-medium`}>Platform:</Text> {detail.platform}</Text>
            </View>
            <View style={tw`mb-2`}>
              <Text style={[tw`text-base`, { color: colorScheme === 'dark' ? '#ccc' : '#555' }]}><Text style={tw`font-medium`}>Genre:</Text> {detail.genre}</Text>
            </View>
            <View style={tw`mb-2`}>
              <Text style={[tw`text-base`, { color: colorScheme === 'dark' ? '#ccc' : '#555' }]}><Text style={tw`font-medium`}>Developer:</Text> {detail.developer}</Text>
            </View>
             <View>
              <Text style={[tw`text-base`, { color: colorScheme === 'dark' ? '#ccc' : '#555' }]}><Text style={tw`font-medium`}>Release Date:</Text> {detail.release_date}</Text>
            </View>
          </View>

          {detail.description && (
            <View style={tw`mt-6 pt-4 border-t border-gray-200`}>
              <Text style={[tw`text-lg font-semibold mb-2`, { color: themeColors.text }]}>Description:</Text>
              <Text style={[tw`text-base leading-6`, { color: colorScheme === 'dark' ? '#ccc' : '#555' }]}>{detail.description}</Text>
            </View>
          )}
          
          {detail.game_url && (
            <TouchableOpacity
              onPress={() => Linking.openURL(detail.game_url)}
              style={[tw`mt-6 py-3 px-4 rounded-lg flex-row items-center justify-center shadow-md`, { backgroundColor: themeColors.tint, elevation: 2 }]}>
              <Icon name="game-controller-outline" size={20} color="white" style={tw`mr-2`} />
              <Text style={tw`text-white font-medium text-center text-base`}>
                Play Game
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeColors.background }]}> 
      {renderContent()}
    </SafeAreaView>
  );
};
