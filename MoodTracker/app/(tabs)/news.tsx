import { View, Text, FlatList, Linking, TouchableOpacity, Image, RefreshControl, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import Icon from '@expo/vector-icons/Ionicons';

export default function Explore() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  type ArticleProps = {
    source: {
      id: string;
      name: string;
    };
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
  };

  const API_KEY = '45e121fe5c4f4a6bb7be1c2199bb09bf';
  const BASE_URL = 'https://newsapi.org/v2/top-headlines';

  const categories = [
    { label: 'All', value: '' },
    { label: 'Business', value: 'business' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'General', value: 'general' },
    { label: 'Health', value: 'health' },
    { label: 'Science', value: 'science' },
    { label: 'Sports', value: 'sports' },
    { label: 'Technology', value: 'technology' },
  ];

  const [articles, setArticles] = useState<ArticleProps[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const getArticles = async (category = selectedCategory, query = searchQuery) => {
    setIsLoading(true);
    try {
      let url = `${BASE_URL}?country=us&apiKey=${API_KEY}`;
      if (category) url += `&category=${category}`;
      if (query) url += `&q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);
      setArticles(response.data.articles);
    } catch (error) {
      setArticles([]);
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    getArticles();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    getArticles();
  }, [selectedCategory, searchQuery]);

  const handleArticlePress = (article: ArticleProps) => {
    router.push({
      pathname: '/newsDetail',
      params: { article: JSON.stringify(article) }
    });
  };

  return (
    <GestureHandlerRootView style={[tw`flex-1`, { backgroundColor: themeColors.background }]}> 
      <SafeAreaView style={tw`flex-1`}>
        <View style={tw`flex-row items-center justify-between px-4 pt-4 mb-2`}>
          <Text style={[tw`text-2xl font-bold`, { color: themeColors.text }]}>News</Text>
        </View>
        {/* Filter Kategori */}
        <View style={tw`px-4 mb-4`}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={tw`px-4 mb-2`}>
            <View style={tw`flex-row gap-2`}>
              {categories.map((cat) => (
                <TouchableOpacity
                key={cat.value}
                onPress={() => setSelectedCategory(cat.value)}
                style={[
                  { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, marginRight: 8, borderWidth: selectedCategory === cat.value ? 0 : 1, borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', backgroundColor: selectedCategory === cat.value ? themeColors.tint : (colorScheme === 'dark' ? '#23272b' : '#fff'), minWidth: 60, alignItems: 'center', justifyContent: 'center' }
                ]}
                >
                  <Text style={selectedCategory === cat.value
                    ? [tw`font-medium`, { color: '#fff', fontSize: 15 }]
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
            style={[tw`rounded-lg border px-4 py-2`, { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', color: themeColors.text }]}
            placeholder="Cari berita..."
            placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#888'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            // mode="flat"
          />
        </View>
        <View style={tw`flex-1 px-2 pb-2`}> 
          {isLoading ? (
            <View style={tw`flex-1 justify-center items-center`}>
              <ActivityIndicator size="large" color={themeColors.tint} />
              <Text style={[tw`mt-2`, { color: themeColors.text }]}>Memuat berita...</Text>
            </View>
          ) : (
            <FlatList
              data={articles}
              keyExtractor={(item) => item.url}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={[themeColors.tint]}
                  tintColor={themeColors.tint}
                />
              }
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[tw`flex-row rounded-2xl mb-4 bg-white shadow-md`, { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff' }]}
                  onPress={() => handleArticlePress(item)}
                  activeOpacity={0.9}
                >
                  {item.urlToImage ? (
                    <Image
                      source={{ uri: item.urlToImage }}
                      style={tw`h-24 w-24 rounded-xl m-3`}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[tw`h-24 w-24 rounded-xl m-3 bg-gray-200 justify-center items-center`, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }]}/>
                  )}
                  <View style={tw`flex-1 py-3 pr-3 justify-between`}>
                    <View>
                      {/* Badge */}
                      {index % 3 === 0 && (
                        <View style={[tw`self-start px-3 py-1 rounded-full mb-1`, { backgroundColor: '#7c3aed' }]}> 
                          <Text style={tw`text-xs text-white font-bold`}>New Article</Text>
                        </View>
                      )}
                      {index % 3 === 1 && (
                        <View style={[tw`self-start px-3 py-1 rounded-full mb-1`, { backgroundColor: '#f97316' }]}> 
                          <Text style={tw`text-xs text-white font-bold`}>Popular Read</Text>
                        </View>
                      )}
                      <Text style={[tw`text-base font-semibold mb-1`, { color: themeColors.text }]} numberOfLines={2}>{item.title}</Text>
                    </View>
                    <TouchableOpacity style={tw`mt-2 flex-row items-center`} onPress={() => handleArticlePress(item)}>
                      <Text style={[tw`text-sm font-medium`, { color: themeColors.tint }]}>Read more</Text>
                      <Icon name="chevron-forward" size={16} color={themeColors.tint} style={tw`ml-1`} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={tw`flex-1 justify-center items-center py-12`}>
                  <Text style={[tw`text-lg`, { color: themeColors.text }]}>Tidak ada berita ditemukan</Text>
                </View>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
