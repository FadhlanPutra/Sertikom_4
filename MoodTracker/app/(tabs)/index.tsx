import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, TouchableOpacity, Platform, Alert, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { TextInput, Button, Checkbox, Text } from 'react-native-paper';
import axios from 'axios';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type MoodProps = {
  id: string;
  title: string;
  status: 'Completed' | 'Pending';
  category: 'Senang' | 'Sedih' | 'Stress';
  date: string;
};

type MoodCardProps = {
  item: MoodProps;
  onEdit: (item: MoodProps) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'Completed' | 'Pending') => void;
};

const MoodCard = ({ item, onEdit, onDelete, onToggleStatus }: MoodCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        tw`mb-4 p-4 bg-white rounded-xl shadow-md border border-gray-100`,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={tw`flex-row justify-between items-start`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-lg font-semibold text-gray-800 ${
              item.status === 'Completed' ? 'line-through text-gray-400' : ''
            }`}>{item.title}</Text>
            <View style={tw`flex-row items-center mt-2`}>
              <View style={tw`px-3 py-1 rounded-full ${
                item.category === 'Senang' ? 'bg-green-100' :
                item.category === 'Sedih' ? 'bg-blue-100' :
                'bg-red-100'
              }`}>
                <Text style={tw`text-sm font-medium ${
                  item.category === 'Senang' ? 'text-green-700' :
                  item.category === 'Sedih' ? 'text-blue-700' :
                  'text-red-700'
                } ${item.status === 'Completed' ? 'line-through' : ''}`}>
                  {item.category}
                </Text>
              </View>
              <Text style={tw`text-sm text-gray-500 ml-2 ${
                item.status === 'Completed' ? 'line-through' : ''
              }`}>{item.date}</Text>
            </View>
          </View>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity 
              onPress={() => onEdit(item)}
              style={tw`p-2 rounded-full bg-blue-50 mr-2`}
            >
              <Icon name="create" size={20} color={tw.color('blue-500')} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onDelete(item.id)}
              style={tw`p-2 rounded-full bg-red-50 mr-2`}
            >
              <Icon name="trash" size={20} color={tw.color('red-500')} />
            </TouchableOpacity>
            <Checkbox
              status={item.status === 'Completed' ? 'checked' : 'unchecked'}
              onPress={() => onToggleStatus(item.id, item.status)}
              color="#3b5998"
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function Index() {
  const API_URL = 'https://api.tprojectlan.my.id';
  
  const [mood, setMood] = useState<MoodProps[]>([]);
  const [filteredMood, setFilteredMood] = useState<MoodProps[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Senang' | 'Sedih' | 'Stress'>('Semua');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'Completed' | 'Pending'>('Pending');
  const [category, setCategory] = useState<'Senang' | 'Sedih' | 'Stress' | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isPressedRef = useRef(false);
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const categoryOptions = [
    { label: 'Senang', value: 'Senang' },
    { label: 'Sedih', value: 'Sedih' },
    { label: 'Stress', value: 'Stress' },
  ];

  const filterOptions = [
    { label: 'Semua', value: 'Semua' },
    { label: 'Senang', value: 'Senang' },
    { label: 'Sedih', value: 'Sedih' },
    { label: 'Stress', value: 'Stress' },
  ];

  const getMoods = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/mood?apiKey=45e121fe5c4f4a6bb7be1c2199bb09bf`);
      const formattedMoods = response.data.map((item: MoodProps) => ({
        ...item,
        date: item.date.split('T')[0]
      }));
      setMood(formattedMoods);
      setFilteredMood(formattedMoods);
    } catch (error) {
      console.error(error);
      setError('Gagal memuat data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    getMoods();
  }, []);

  const handleFilterChange = (value: 'Semua' | 'Senang' | 'Sedih' | 'Stress') => {
    setSelectedFilter(value);
    if (value === 'Semua') {
      setFilteredMood(mood);
    } else {
      const filtered = mood.filter(item => item.category === value);
      setFilteredMood(filtered);
    }
  };

  const startEditing = (mood: MoodProps) => {
    setTitle(mood.title);
    setStatus(mood.status);
    setCategory(mood.category);
    setDate(mood.date.split('T')[0]);
    setEditingId(mood.id);
  };

  const addOrEditMood = async () => {
    if (isPressedRef.current) return;

    isPressedRef.current = true;

    try {
      setError('');
      
      if (!title || !category || !date) {
        Alert.alert('Peringatan', 'Semua field harus diisi!');
        return;
      }

      if (title.length < 3) {
        Alert.alert('Peringatan', 'Title Minimal 3 karakter');
        return;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      if (new Date(date) < yesterday) {
        Alert.alert('Peringatan', 'Tanggal tidak boleh kurang dari kemarin');
        return;
      }

      const payload = {
        title: title,
        status: status,
        category: category,
        date: date
      };

      if (editingId) {
        Alert.alert(
          "Konfirmasi Edit",
          "Apakah Anda yakin ingin menyimpan perubahan ini?",
          [
            {
              text: "Batal",
              style: "cancel"
            },
            {
              text: "Simpan",
              onPress: async () => {
                try {
                  const editPayload = {
                    title: title,
                    status: status,
                    category: category,
                    date: date
                  };
                  
                  const response = await axios.put(
                    `${API_URL}/api/mood/${editingId}?apiKey=45e121fe5c4f4a6bb7be1c2199bb09bf`, 
                    editPayload
                  );
                  
                  if (response.status === 200) {
                    Toast.show({
                      type: 'success',
                      text1: 'Berhasil',
                      text2: 'Data berhasil diperbarui',
                      position: 'top',
                      visibilityTime: 2000,
                    });
                    resetForm();
                    getMoods();
                  }
                } catch (error: any) {
                  if (error.response?.status === 422) {
                    const errors = error.response.data.errors;
                    const errorMessage = Object.values(errors).flat().join('\n');
                    setError(errorMessage);
                  } else {
                    setError('Terjadi kesalahan saat menyimpan data');
                  }
                  console.error(error);
                }
              }
            }
          ]
        );
      } else {
        try {
          const response = await axios.post(
            `${API_URL}/api/mood?apiKey=45e121fe5c4f4a6bb7be1c2199bb09bf`, 
            payload
          );
          
          if (response.status === 201) {
            Toast.show({
              type: 'success',
              text1: 'Berhasil',
              text2: 'Data berhasil ditambahkan',
              position: 'top',
              visibilityTime: 2000,
            });
            resetForm();
            getMoods();
          }
        } catch (error: any) {
          if (error.response?.status === 422) {
            const errors = error.response.data.errors;
            const errorMessage = Object.values(errors).flat().join('\n');
            setError(errorMessage);
          } else {
            setError('Terjadi kesalahan saat menyimpan data');
          }
          console.error(error);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessage = Object.values(errors).flat().join('\n');
        setError(errorMessage);
      } else {
        setError('Terjadi kesalahan saat menyimpan data');
      }
      console.error(error);
    } finally {
      setTimeout(() => {
        isPressedRef.current = false;
      }, 1000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setStatus('Pending');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditingId(null);
    setError('');
  };

  const toggleStatus = async (id: string, currentStatus: 'Completed' | 'Pending') => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    Alert.alert(
      "Konfirmasi Ubah Status",
      `Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`,
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Ubah",
          onPress: async () => {
            try {
              const response = await axios.put(
                `${API_URL}/api/mood/${id}/status?apiKey=45e121fe5c4f4a6bb7be1c2199bb09bf`, 
                { status: newStatus }
              );
              
              if (response.status === 200) {
                Toast.show({
                  type: 'success',
                  text1: 'Berhasil',
                  text2: 'Status berhasil diperbarui',
                  position: 'top',
                  visibilityTime: 2000,
                });
                getMoods();
              }
            } catch (error) {
              console.error('Error updating status:', error);
              setError('Gagal mengubah status');
            }
          }
        }
      ]
    );
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      if (selectedDate < yesterday) {
        setError('Tanggal tidak boleh kurang dari kemarin');
        return;
      }
      
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  };

  const deleteMood = async (id: string) => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus data ini?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/mood/${id}?apiKey=45e121fe5c4f4a6bb7be1c2199bb09bf`);
              Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Data berhasil dihapus',
                position: 'top',
                visibilityTime: 2000,
              });
              getMoods();
            } catch (error) {
              console.error(error);
              setError('Gagal menghapus data');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    getMoods();
  }, []);

  if (isLoading) {
    return (
      <View style={[tw`flex-1 justify-center items-center`, { backgroundColor: themeColors.background }]}> 
        <ActivityIndicator size="large" color={themeColors.tint} />
        <Text style={[tw`mt-2`, { color: themeColors.text }]}>Memuat data mood...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <SafeAreaView style={[tw`flex-1`, { backgroundColor: themeColors.background }]}> 
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-4 pt-4 mb-2`}>
          <Text style={[tw`text-2xl font-bold`, { color: themeColors.text }]}>Moods</Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-blue-100 px-3 py-1 rounded-full mr-2`}>
              <Text style={tw`text-blue-700 font-semibold`}>Total: {mood.length}</Text>
            </View>
            <TouchableOpacity style={tw`p-2`} onPress={getMoods}>
              <Icon name="refresh-outline" size={24} color={themeColors.icon} />
            </TouchableOpacity>
          </View>
        </View>
        {/* Notes Library (Form Input) */}
        <View style={[tw`mx-4 mb-4 rounded-2xl shadow-lg`, { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#f8fafc' }]}> 
          <Text style={[tw`text-lg font-bold mb-2 mt-4 ml-2`, { color: themeColors.text }]}>Notes Library</Text>
          <View style={tw`p-4 pt-0`}> 
            <TextInput
              label="Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={[tw`mb-3`, { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', color: themeColors.text }]}
              maxLength={255}
              theme={{ colors: { primary: themeColors.tint, text: themeColors.text, background: colorScheme === 'dark' ? '#23272b' : '#fff' } }}
            />
            <View style={[tw`mb-3 rounded-md overflow-hidden border`, { borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff' }]}> 
              <RNPickerSelect
                onValueChange={(value) => setCategory(value)}
                items={categoryOptions}
                value={category}
                placeholder={{ label: 'Pilih kategori', value: null }}
                style={{
                  inputAndroid: {
                    padding: 12,
                    color: themeColors.text,
                    backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff',
                  },
                  inputIOS: {
                    padding: 12,
                    color: themeColors.text,
                    backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff',
                  },
                }}
              />
            </View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`mb-3`}>
              <TextInput
                label="Tanggal"
                mode="outlined"
                value={date}
                editable={false}
                style={[{ backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', color: themeColors.text }]}
                right={<TextInput.Icon icon="calendar" />}
                theme={{ colors: { primary: themeColors.tint, text: themeColors.text, background: colorScheme === 'dark' ? '#23272b' : '#fff' } }}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date(date)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            <Button
              mode="contained"
              onPress={addOrEditMood}
              buttonColor={editingId ? '#f97316' : themeColors.tint}
              style={tw`mt-2 rounded-lg`}
              contentStyle={tw`py-2`}
            >
              {editingId ? 'Simpan Perubahan' : 'Tambah Mood'}
            </Button>
            {editingId && (
              <Button
                mode="outlined"
                onPress={resetForm}
                style={tw`mt-2 rounded-lg border-orange-500`}
                textColor="#f97316"
              >
                Batal Edit
              </Button>
            )}
          </View>
        </View>
        {/* Filter Section */}
        <View style={tw`px-4 mb-4`}> 
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={tw`flex-row gap-2`}> 
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleFilterChange(option.value as 'Semua' | 'Senang' | 'Sedih' | 'Stress')}
                  style={[tw`px-4 py-2 rounded-full mr-2`,
                    selectedFilter === option.value
                      ? { backgroundColor: themeColors.tint, shadowColor: themeColors.tint, shadowOpacity: 0.2, shadowRadius: 4 }
                      : { backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff', borderWidth: 1, borderColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }
                  ]}
                >
                  <Text style={selectedFilter === option.value
                    ? [tw`font-medium`, { color: '#fff' }]
                    : [{ color: themeColors.text }]
                  }>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        {/* List Notes/Mood */}
        <FlatList
          data={filteredMood}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={tw`pb-4 px-4`}
          ListEmptyComponent={() => (
            <View
              style={[
                tw`py-12 items-center rounded-xl shadow-sm border`,
                {
                  backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#333' : '#f3f4f6',
                },
              ]}
            >
              <Icon name="sad-outline" size={48} color={colorScheme === 'dark' ? '#666' : tw.color('gray-400')} />
              <Text style={[tw`mt-2 text-center text-lg`, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>
                Tidak ada data mood
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Animated.View
              style={[
                tw`mb-4 p-4 rounded-xl shadow-md border`,
                {
                  backgroundColor: colorScheme === 'dark' ? '#23272b' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#333' : '#f3f4f6',
                },
              ]}
            >
              <TouchableOpacity activeOpacity={0.9}>
                <View style={tw`flex-row justify-between items-start`}>
                  <View style={tw`flex-1`}>
                    <Text
                      style={[
                        tw`text-lg font-semibold`,
                        { color: themeColors.text },
                        item.status === 'Completed' && {
                          textDecorationLine: 'line-through',
                          color: colorScheme === 'dark' ? '#666' : '#a3a3a3',
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={[tw`text-xs mt-1`, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>{item.date}</Text>
                    <View style={tw`flex-row items-center mt-2`}>
                      <View
                        style={[
                          tw`px-3 py-1 rounded-full mr-2`,
                          item.category === 'Senang'
                            ? { backgroundColor: '#bbf7d0' }
                            : item.category === 'Sedih'
                            ? { backgroundColor: '#bfdbfe' }
                            : { backgroundColor: '#fecaca' },
                        ]}
                      >
                        <Text
                          style={[
                            tw`text-xs font-medium`,
                            item.category === 'Senang'
                              ? { color: '#15803d' }
                              : item.category === 'Sedih'
                              ? { color: '#1d4ed8' }
                              : { color: '#b91c1c' },
                            item.status === 'Completed' && { textDecorationLine: 'line-through' },
                          ]}
                        >
                          {item.category}
                        </Text>
                      </View>
                      <Text
                        style={[
                          tw`text-xs`,
                          { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' },
                          item.status === 'Completed' && { textDecorationLine: 'line-through' },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <TouchableOpacity onPress={() => startEditing(item)} style={tw`p-2 rounded-full bg-blue-50 mr-2`}>
                      <Icon name="create" size={20} color={tw.color('blue-500')} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteMood(item.id)} style={tw`p-2 rounded-full bg-red-50 mr-2`}>
                      <Icon name="trash" size={20} color={tw.color('red-500')} />
                    </TouchableOpacity>
                    <Checkbox
                      status={item.status === 'Completed' ? 'checked' : 'unchecked'}
                      onPress={() => toggleStatus(item.id, item.status)}
                      color={themeColors.tint}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
