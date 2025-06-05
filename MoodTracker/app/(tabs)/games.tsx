import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, RefreshControl, Image } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Icon from '@expo/vector-icons/Ionicons';

export default function Games() {
  type GamesProps = {
    id: string;
    title: string;
    genre: string;
    platform: string;
    release_date: string;
    thumbnail: string;
    short_description: string;
  };

  let API_URL = "https://www.freetogame.com/api/games";

  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const categories = [
    { label: 'All', value: '' },
    { label: 'MMORPG', value: 'mmorpg' },
    { label: 'Shooter', value: 'shooter' },
    { label: 'Strategy', value: 'strategy' },
    { label: 'MOBA', value: 'moba' },
    { label: 'Racing', value: 'racing' },
    { label: 'Sports', value: 'sports' },
    { label: 'Survival', value: 'survival' },
    { label: 'Action', value: 'action' },
    { label: 'Fantasy', value: 'fantasy' },
    { label: 'Horror', value: 'horror' },
    { label: 'Card', value: 'card' },
    { label: 'Battle Royale', value: 'battle-royale' },
    { label: 'Anime', value: 'anime' },
    { label: 'Sci-Fi', value: 'sci-fi' },
    { label: 'MMOFPS', value: 'mmofps' },
    { label: 'MMOTPS', value: 'mmotps' },
    { label: '3D', value: '3d' },
    { label: '2D', value: '2d' },
    { label: 'Open World', value: 'open-world' },
    { label: 'Pixel', value: 'pixel' },
    { label: 'Sandbox', value: 'sandbox' },
    { label: 'Top Down', value: 'top-down' },
    { label: 'Superhero', value: 'superhero' },
    { label: 'Tower Defense', value: 'tower-defense' },
    { label: 'MMORTS', value: 'mmorts' },
  ];

  const [games, setGames] = useState<GamesProps[]>([]);
  const [filteredGames, setFilteredGames] = useState<GamesProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const getGames = async (category = selectedCategory) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = [];
      if (category && category !== '') params.push(`category=${category}`);
      if (params.length > 0) API_URL += `?${params.join('&')}`;
      const response = await axios.get(API_URL);
      setGames(response.data);

      if (searchQuery.trim() !== '') {
        const filtered = response.data.filter((game: GamesProps) =>
          game.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
        setFilteredGames(filtered);
      } else {
        setFilteredGames(response.data);
      }
    } catch (err) {
      setError('Gagal memuat data');
      setGames([]);
      setFilteredGames([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const filtered = games.filter((game) =>
        game.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames(games);
    }
  }, [searchQuery, games]);

  useEffect(() => {
    getGames();
  }, [selectedCategory]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    getGames();
  }, [selectedCategory]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: themeColors.background }]}> 
          <ActivityIndicator size="large" color={themeColors.tint} />
          <Text style={[tw`mt-2`, { color: themeColors.text }]}>Loading games...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-red-600 text-lg text-center`}>{error}</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}
            onPress={() => getGames()}
          >
            <Text style={tw`text-white text-base font-semibold`}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (filteredGames.length === 0) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={[tw`text-lg text-center`, { color: themeColors.text }]}>Tidak ada game ditemukan.</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={filteredGames}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[themeColors.tint]}
            tintColor={themeColors.tint}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              tw`flex-row rounded-2xl mb-4 shadow-md`,
              { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', elevation: 2 }
            ]}
            onPress={() => router.push(`/gameDetail?id=${item.id}&title=${item.title}`)}
            activeOpacity={0.9}
          >
            {/* Gambar Game */}
            {item.thumbnail ? (
              <View style={tw`p-3`}>
                <Image
                  source={{ uri: item.thumbnail }}
                  style={tw`h-20 w-20 rounded-xl`}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View style={[tw`h-20 w-20 rounded-xl m-3 bg-gray-200 justify-center items-center`, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }]}/>
            )}
            {/* Info Game */}
            <View style={tw`flex-1 py-3 pr-3 justify-between`}>
              <View>
                {/* Badge Genre */}
                <View style={[tw`self-start px-3 py-1 rounded-full mb-1`, { backgroundColor: '#3b82f6', alignSelf: 'flex-start' }]}> 
                  <Text style={tw`text-xs text-white font-bold`}>{item.genre}</Text>
                </View>
                <Text style={[tw`text-base font-semibold mb-1`, { color: themeColors.text }]} numberOfLines={2}>{item.title}</Text>
                <Text style={[tw`text-xs mb-1`, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>{item.platform}</Text>
                <Text style={[tw`text-xs`, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>Release: {item.release_date}</Text>
              </View>
              <TouchableOpacity style={tw`mt-2 flex-row items-center`} onPress={() => router.push(`/gameDetail?id=${item.id}&title=${item.title}`)}>
                <Text style={[tw`text-sm font-medium`, { color: themeColors.tint }]}>Detail</Text>
                <Icon name="chevron-forward" size={16} color={themeColors.tint} style={tw`ml-1`} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeColors.background }]}> 
      <View style={tw`flex-row items-center justify-between px-4 pt-4 mb-2`}>
        <Text style={[tw`text-2xl font-bold`, { color: themeColors.text }]}>Games</Text>
        <View style={[tw`px-3 py-1 rounded-full`, { backgroundColor: '#e0edff' }] }>
          <Text style={tw`text-blue-700 font-semibold`}>Total: {games.length}</Text>
        </View>
      </View>
      {/* Filter Kategori */}
      <View style={tw`px-4 mb-4`}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`px-4 mb-2`}>
          <View style={tw`flex-row gap-2`}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                onPress={() => setSelectedCategory(cat.value)}
                style={[tw`px-4 py-2 rounded-full mr-2`, { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginRight: 8, borderWidth: selectedCategory === cat.value ? 0 : 1, borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', backgroundColor: selectedCategory === cat.value ? themeColors.tint : (colorScheme === 'dark' ? '#23272b' : '#fff'), minWidth: 60, alignItems: 'center', justifyContent: 'center' }
                ]}
              >
                <Text style={selectedCategory === cat.value
                  ? [tw`font-medium`, { color: '#000', fontSize: 15 }]
                  : [{ color: themeColors.text, fontSize: 15 }]
                }>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      {/* Search Section */}
      <View style={tw`px-4 mb-2`}>
        <TextInput
          style={[
            tw`rounded-lg border px-4 py-2`,
            { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', color: themeColors.text, fontSize: 16 }
          ]}
          placeholder="Cari game..."
          placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>
      <View style={tw`flex-1 px-2 pb-2`}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
