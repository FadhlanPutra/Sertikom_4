import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { router, useRouter } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';

export default function Games() {
  // Define the type for a single game object
  type GamesProps = {
    id: string;
    title: string;
    genre: string;
    platform: string;
    release_date: string;
    thumbnail: string;
    short_description: string;
  };

  // API URL for fetching free games
  const API_URL = "https://www.freetogame.com/api";

  // State to store the list of games
  const [games, setGames] = useState<GamesProps[]>([]);
  const [filteredGames, setFilteredGames] = useState<GamesProps[]>([]);
  // State to manage loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to manage error messages
  const [error, setError] = useState<string | null>(null);
  // State untuk filter dan sort
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [useApiFilter, setUseApiFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const ITEMS_PER_PAGE = 10;

  // Kategori games
  const categories = [
    { label: 'Semua Kategori', value: '' },
    { label: 'MMORPG', value: 'mmorpg' },
    { label: 'Shooter', value: 'shooter' },
    { label: 'Strategy', value: 'strategy' },
    { label: 'MOBA', value: 'moba' },
    { label: 'Racing', value: 'racing' },
    { label: 'Sports', value: 'sports' },
    { label: 'Social', value: 'social' },
    { label: 'Sandbox', value: 'sandbox' },
    { label: 'Open World', value: 'open-world' },
    { label: 'Survival', value: 'survival' },
    { label: 'PVP', value: 'pvp' },
    { label: 'PVE', value: 'pve' },
    { label: 'Pixel', value: 'pixel' },
    { label: 'Voxel', value: 'voxel' },
    { label: 'Zombie', value: 'zombie' },
    { label: 'Turn Based', value: 'turn-based' },
    { label: 'First Person', value: 'first-person' },
    { label: 'Third Person', value: 'third-Person' },
    { label: 'Top Down', value: 'top-down' },
    { label: 'Tank', value: 'tank' },
    { label: 'Space', value: 'space' },
    { label: 'Sailing', value: 'sailing' },
    { label: 'Side Scroller', value: 'side-scroller' },
    { label: 'Superhero', value: 'superhero' },
    { label: 'Permadeath', value: 'permadeath' },
    { label: 'Card', value: 'card' },
    { label: 'Battle Royale', value: 'battle-royale' },
    { label: 'MMO', value: 'mmo' },
    { label: 'MMOFPS', value: 'mmofps' },
    { label: 'MMOTPS', value: 'mmotps' },
    { label: '3D', value: '3d' },
    { label: '2D', value: '2d' },
    { label: 'Anime', value: 'anime' },
    { label: 'Fantasy', value: 'fantasy' },
    { label: 'Sci-Fi', value: 'sci-fi' },
    { label: 'Fighting', value: 'fighting' },
    { label: 'Action RPG', value: 'action-rpg' },
    { label: 'Action', value: 'action' },
    { label: 'Military', value: 'military' },
    { label: 'Martial Arts', value: 'martial-arts' },
    { label: 'Flight', value: 'flight' },
    { label: 'Low Spec', value: 'low-spec' },
    { label: 'Tower Defense', value: 'tower-defense' },
    { label: 'Horror', value: 'horror' },
    { label: 'MMORTS', value: 'mmorts' },
  ];

  // Opsi sorting
  const sortOptions = [
    { label: 'Default', value: '' },
    { label: 'Release Date (Newest)', value: 'release-date-desc' },
    { label: 'Release Date (Oldest)', value: 'release-date-asc' },
    { label: 'Alphabetical', value: 'alphabetical' },
    { label: 'Relevance', value: 'relevance' },
  ];

  /**
   * Fetches the list of games from the API.
   * Sets loading, error, and games states accordingly.
   */
  const getGames = async (isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      let url = `${API_URL}/games`;
      const params = new URLSearchParams();
      
      // Tambahkan parameter kategori jika menggunakan API filter
      if (useApiFilter && selectedCategory) {
        params.append('category', selectedCategory);
      }

      // Tambahkan parameter pagination
      params.append('page', page.toString());
      params.append('limit', ITEMS_PER_PAGE.toString());

      // Tambahkan parameter ke URL
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      const newGames = response.data;
      
      if (isLoadMore) {
        setGames(prevGames => [...prevGames, ...newGames]);
        setFilteredGames(prevGames => [...prevGames, ...newGames]);
      } else {
        setGames(newGames);
        setFilteredGames(newGames);
      }

      setHasMoreData(newGames.length === ITEMS_PER_PAGE);
    } catch (err) {
      console.error("Error fetching games:", err);
      if (axios.isAxiosError(err)) {
        setError(err.message || "Failed to fetch games. Please check your network connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    getGames();
  }, []);

  // Fungsi untuk memfilter games berdasarkan kategori dan pencarian
  const filterGamesByCategory = (category: string, query: string) => {
    let filtered = games;
    
    // Filter berdasarkan kategori
    if (category) {
      filtered = filtered.filter(game => 
        game.genre.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter berdasarkan pencarian
    if (query) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredGames(filtered);
  };

  // Tambahkan useEffect untuk memantau perubahan searchQuery
  useEffect(() => {
    filterGamesByCategory(selectedCategory, searchQuery);
  }, [searchQuery, selectedCategory, games]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setPage(1);
    setHasMoreData(true);
    getGames();
  }, [useApiFilter, selectedCategory, selectedSort]);

  // Fungsi untuk mengurutkan games
  const sortGames = (sortBy: string) => {
    let sorted = [...filteredGames];
    
    switch (sortBy) {
      case 'release-date-desc':
        sorted.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        break;
      case 'release-date-asc':
        sorted.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'relevance':
        // Implementasi relevansi bisa disesuaikan dengan kebutuhan
        // Contoh sederhana: urutkan berdasarkan judul
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Default: urutkan berdasarkan ID
        sorted.sort((a, b) => Number(a.id) - Number(b.id));
    }
    
    setFilteredGames(sorted);
  };

  // Fungsi untuk memuat data lebih banyak
  const loadMoreData = () => {
    if (!isLoadingMore && hasMoreData) {
      setPage(prevPage => prevPage + 1);
      getGames(true);
    }
  };

  // useEffect untuk mengurutkan games saat sort berubah
  useEffect(() => {
    sortGames(selectedSort);
  }, [selectedSort]);

  // Render content based on loading, error, or data availability
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color={tw.color('blue-500')} />
          <Text style={tw`mt-2 text-gray-600`}>Loading games...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-red-600 text-lg text-center`}>Error: {error}</Text>
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
          <Text style={tw`text-gray-600 text-lg text-center`}>No games found.</Text>
          <TouchableOpacity
            style={tw`mt-4 bg-blue-500 p-3 rounded-lg`}
            onPress={() => getGames()}
          >
            <Text style={tw`text-white text-base font-semibold`}>Refresh</Text>
          </TouchableOpacity>
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
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`mb-4 bg-white p-4 rounded-lg shadow`}
            onPress={() => router.push(`/gameDetail?id=${item.id}&title=${item.title}`)}
          >
            <Text style={tw`text-xl font-semibold text-gray-900`}>{item.title}</Text>
            <Text style={tw`text-sm text-gray-600`}>{item.genre}</Text>
            <Text style={tw`text-sm text-gray-600`}>{item.platform}</Text>
            <Text style={tw`text-sm text-gray-600`}>Release: {item.release_date}</Text>
            <Text style={tw`text-sm text-gray-500 mt-2`}>{item.short_description}</Text>
          </TouchableOpacity>
        )}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          isLoadingMore ? (
            <View style={tw`py-4`}>
              <ActivityIndicator size="small" color={tw.color('blue-500')} />
              <Text style={tw`text-center text-gray-600 mt-2`}>Loading more games...</Text>
            </View>
          ) : null
        )}
      />
    );
  };

  return (
    <SafeAreaView style={tw`flex bg-gray-100`}>
      <View style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Games</Text>
          <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Total: {filteredGames.length}</Text>
        </View>

        {/* Search Section */}
        <View style={tw`mb-4`}>
          <TextInput
            style={tw`bg-white p-3 rounded-lg border border-gray-200`}
            placeholder="Cari game..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        {/* Filter Section */}
        <View style={tw`mb-4`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-lg font-semibold text-gray-700`}>Filter:</Text>
            <TouchableOpacity
              onPress={() => setUseApiFilter(!useApiFilter)}
              style={tw`px-3 py-1 rounded-full ${
                useApiFilter ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <Text style={tw`${
                useApiFilter ? 'text-white' : 'text-gray-700'
              }`}>
                {useApiFilter ? 'API Filter' : 'Local Filter'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={tw`flex-row gap-2`}>
            <View style={tw`flex-1 bg-white rounded-md overflow-hidden`}>
              <RNPickerSelect
                onValueChange={(value) => setSelectedCategory(value)}
                items={categories}
                value={selectedCategory}
                placeholder={{ label: 'Pilih Kategori', value: null }}
                style={{
                  inputAndroid: {
                    padding: 12,
                    color: '#374151',
                  },
                }}
              />
            </View>
            <View style={tw`flex-1 bg-white rounded-md overflow-hidden`}>
              <RNPickerSelect
                onValueChange={(value) => setSelectedSort(value)}
                items={sortOptions}
                value={selectedSort}
                placeholder={{ label: 'Urutkan', value: null }}
                style={{
                  inputAndroid: {
                    padding: 12,
                    color: '#374151',
                  },
                }}
              />
            </View>
          </View>
        </View>

        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
