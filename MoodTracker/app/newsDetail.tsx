import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import tw from 'twrnc';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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

export default function NewsDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [article, setArticle] = useState<ArticleProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  useEffect(() => {
    if (params.article) {
      try {
        const parsedArticle = JSON.parse(params.article as string);
        setArticle(parsedArticle);
      } catch (error) {
        console.error('Error parsing article:', error);
      }
    }
    setIsLoading(false);
  }, [params.article]);

  const handleOpenWebsite = async () => {
    if (article?.url) {
      try {
        await Linking.openURL(article.url);
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.tint} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: themeColors.background }]}>
        <Text style={[tw`text-lg`, { color: themeColors.text }]}>Artikel tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeColors.background }]}>
      <ScrollView style={tw`flex-1`}>
        <View style={tw`p-4`}>
          {article.urlToImage && (
            <Image
              source={{ uri: article.urlToImage }}
              style={tw`w-full h-60 rounded-xl mb-4`}
              resizeMode="cover"
            />
          )}

          <View style={[tw`rounded-xl p-4 shadow-md`, { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', elevation: 2 }]}>
            <Text style={[tw`text-2xl font-bold mb-2`, { color: themeColors.text }]}>
              {article.title}
            </Text>

            <View style={tw`flex-row items-center mb-4`}>
              {article.author && (
                <View style={tw`flex-row items-center mr-4`}>
                  <Icon name="person" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
                  <Text style={[tw`ml-1 text-sm`, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{article.author}</Text>
                </View>
              )}
              {article.publishedAt && (
                <View style={tw`flex-row items-center`}>
                  <Icon name="time" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
                  <Text style={[tw`ml-1 text-sm`, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {article.description && (
              <Text style={[tw`text-lg mb-4`, { color: themeColors.text }]}>
                {article.description}
              </Text>
            )}

            {article.content && (
              <Text style={[tw`leading-6`, { color: colorScheme === 'dark' ? '#ccc' : '#555' }]}>
                {article.content.replace(/\[\+\d+ chars\]$/, '')}
              </Text>
            )}

            <View style={tw`mt-6 pt-4 border-t border-gray-200`}>
              <Text style={[tw`text-sm mb-4`, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>
                Source: {article.source.name}
              </Text>
              
              <TouchableOpacity
                onPress={handleOpenWebsite}
                style={[tw`py-3 px-4 rounded-lg flex-row items-center justify-center shadow-md`, { backgroundColor: themeColors.tint, elevation: 2 }]}
              >
                <Icon name="globe-outline" size={20} color="white" style={tw`mr-2`} />
                <Text style={tw`text-white font-medium text-center text-base`}>
                  Buka di Website
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
