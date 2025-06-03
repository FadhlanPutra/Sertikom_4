import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';
import { useSearchParams } from 'expo-router/build/hooks';
import { useNavigation } from 'expo-router';

export default function GameDetail({ route }: any) {
  const params = useSearchParams();
  const id = params.get('id');
  const navigation = useNavigation();

  const title = params.get('title') || "Detail Game";

  useEffect(() => {
    navigation.setOptions({ title: `Game Detail - ${title}` });
  }, [navigation, title]);


  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // API URL for fetching game details
  const API_URL = "https://www.freetogame.com/api";

  /**
   * Fetches the detail of a specific game from the API based on its ID.
   * Sets loading, error, and detail states accordingly.
   */
  const getGameDetail = async () => {
    setIsLoading(true);
    setError(null);     
    try {
      const response = await axios.get(`${API_URL}/game?id=${id}`);
      setDetail(response.data);
    } catch (err) {
      console.error("Error fetching game detail:", err);
      // Set error message based on the type of error
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to fetch game details. Please check your network connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false); // Set loading to false after fetch attempt
    }
  };

  // useEffect hook to call getGameDetail when the component mounts or ID changes
  useEffect(() => {
    getGameDetail();
  }, [id]); // Dependency array includes 'id' to refetch if ID changes

  // Render content based on loading, error, or data availability
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={tw.color('blue-500')} />
          <Text style={tw`mt-2 text-gray-600`}>Loading game details...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-red-600 text-lg text-center`}>Error: {error}</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}
            onPress={getGameDetail} // Allow user to retry fetching
          >
            <Text style={tw`text-white text-base font-semibold`}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!detail) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-gray-600 text-lg text-center`}>Game details not found.</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}
            onPress={getGameDetail} // Allow user to retry fetching
          >
            <Text style={tw`text-white text-base font-semibold`}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={tw`p-4`}>
        {/* Display game thumbnail, with a fallback image if uri is not available */}
        <Image
          source={{ uri: detail.thumbnail || 'https://placehold.co/600x400/cccccc/333333?text=No+Image' }}
          style={tw`w-full h-35% rounded-lg mb-4`}
          resizeMode="contain"
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
        />
        <Text style={tw`text-2xl font-bold text-gray-900 mb-2`}>{detail.title}</Text>
        <Text style={tw`text-sm text-gray-600 mb-4`}>{detail.short_description}</Text>
        <Text style={tw`text-lg text-gray-800 mb-2`}>Platform: {detail.platform}</Text>
        <Text style={tw`text-lg text-gray-800 mb-2`}>Genre: {detail.genre}</Text>
        <Text style={tw`text-lg text-gray-800 mb-2`}>Developer: {detail.developer}</Text>
        <Text style={tw`text-lg text-gray-800 mb-2`}>Release Date: {detail.release_date}</Text>
        <Text style={tw`text-base text-gray-700 mt-4`}>{detail.description}</Text>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {renderContent()}
    </SafeAreaView>
  );
}
