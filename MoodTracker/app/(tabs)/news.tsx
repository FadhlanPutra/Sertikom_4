import { View, Text, FlatList, Linking, TouchableOpacity, Image, RefreshControl, TextInput } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Explore() {
  const router = useRouter();

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

  const API_URL = "https://newsapi.org/v2/top-headlines?sources=bbc-news&apiKey=45e121fe5c4f4a6bb7be1c2199bb09bf";

  const [articles, setArticles] = useState<ArticleProps[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // const [filteredNews, setFilteredNews] = useState<ArticleProps[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      setArticles(response.data.articles);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    getArticles();
  }, []);

    // Fungsi untuk memfilter games berdasarkan kategori dan pencarian
  const filteredNewsSearch = (query: string) => {

    let filtered = articles;

    // Filter berdasarkan pencarian
    if (query) {
      setIsRefreshing(true);
      filtered = filtered.filter(articles =>
        articles.title.toLowerCase().includes(query.toLowerCase()),
        setIsRefreshing(false)
      );
    } else {
      getArticles();
    }
    
    setArticles(filtered);
  };

  // Tambahkan useEffect untuk memantau perubahan searchQuery
  useEffect(() => {
    filteredNewsSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    getArticles();
  }, []);

  const handleArticlePress = (article: ArticleProps) => {
    router.push({
      pathname: '/newsDetail',
      params: { article: JSON.stringify(article) }
    });
  };

  return (
    <GestureHandlerRootView style={tw`flex-1 bg-gray-50`}>
      <SafeAreaView style={tw`flex-1`}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={tw`absolute w-full h-40`}
        />
        <View style={tw`flex-1 p-4`}>
          <Text style={tw`text-2xl font-bold mb-4 text-white`}>Articles</Text>
          {/* Search Section */}
          <View style={tw`mb-4`}>
            <TextInput
              style={tw`bg-white p-3 rounded-lg border border-gray-200`}
              placeholder="Cari game..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>
          <FlatList
            data={articles}
            keyExtractor={(item) => item.url}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#ffffff']}
                tintColor="#ffffff"
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={tw`bg-white/95 rounded-xl shadow-md p-4 mb-4`}
                onPress={() => handleArticlePress(item)}
              >
                {item.urlToImage && (
                  <Image
                    source={{ uri: item.urlToImage }}
                    style={tw`h-40 w-full rounded-md mb-2`}
                    resizeMode="cover"
                  />
                )}
                <Text style={tw`text-lg font-semibold text-gray-900`}>
                  {item.title}
                </Text>
                {item.author && (
                  <Text style={tw`text-gray-600 italic`}>By: {item.author}</Text>
                )}
                {item.publishedAt && (
                  <Text style={tw`text-gray-600 italic`}>On: {new Date(item.publishedAt).toLocaleDateString()}</Text>
                )}
                {item.description && (
                  <Text style={tw`text-gray-600 mt-2`} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <Text style={tw`text-blue-500 mt-2`}>Baca Selengkapnya</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
