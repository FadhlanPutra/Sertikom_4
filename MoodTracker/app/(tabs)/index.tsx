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
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color={tw.color('blue-500')} />
        <Text style={tw`mt-2 text-gray-600`}>Memuat data mood...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={tw`absolute w-full h-40`}
      />
      <ScrollView 
        style={tw`flex-1`} 
        contentContainerStyle={tw`pb-4`}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#ffffff']}
            tintColor="#ffffff"
          />
        }
      >
        <View style={tw`p-4`}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={tw`text-3xl font-bold text-white`}>Mood Tracker</Text>
            <TouchableOpacity 
              style={tw`bg-white/20 p-2 rounded-full`}
              onPress={getMoods}
            >
              <FontAwesome name="refresh" size={20} color="white"/>
            </TouchableOpacity>
          </View>
          
          {error ? (
            <View style={tw`bg-red-100 p-4 rounded-lg mb-4 border-l-4 border-red-500`}>
              <Text style={tw`text-red-600`}>{error}</Text>
            </View>
          ) : null}

          <View style={tw`bg-white/95 p-6 rounded-2xl shadow-lg mb-6 border border-gray-100`}>
            <TextInput
              label="Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={tw`mb-3 bg-white`}
              maxLength={255}
              theme={{ colors: { primary: '#3b5998' } }}
            />
            
            <View style={tw`mb-3 bg-white rounded-md overflow-hidden border border-gray-200`}>
              <RNPickerSelect
                onValueChange={(value) => setCategory(value)}
                items={categoryOptions}
                value={category}
                placeholder={{ label: 'Pilih kategori', value: null }}
                style={{
                  inputAndroid: {
                    padding: 12,
                    color: '#374151',
                  },
                  inputIOS: {
                    padding: 12,
                    color: '#374151',
                  },
                }}
              />
            </View>

            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={tw`mb-3`}
            >
              <TextInput
                label="Tanggal"
                mode="outlined"
                value={date}
                editable={false}
                style={tw`bg-white`}
                right={<TextInput.Icon icon="calendar" />}
                theme={{ colors: { primary: '#3b5998' } }}
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
              buttonColor={editingId ? '#f97316' : '#3b5998'}
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

          {/* Filter Section */}
          <View style={tw`mb-6`}>
            <Text style={tw`text-lg font-semibold mb-3 text-gray-700`}>Filter Kategori:</Text>
            <View style={tw`flex-row flex-wrap gap-2`}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleFilterChange(option.value as 'Semua' | 'Senang' | 'Sedih' | 'Stress')}
                  style={tw`px-4 py-2 rounded-full ${
                    selectedFilter === option.value 
                      ? 'bg-blue-500 shadow-md' 
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}
                >
                  <Text style={tw`${
                    selectedFilter === option.value 
                      ? 'text-white font-medium' 
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filteredMood.map((item) => (
            <MoodCard
              key={item.id}
              item={item}
              onEdit={startEditing}
              onDelete={deleteMood}
              onToggleStatus={toggleStatus}
            />
          ))}

          {filteredMood.length === 0 && (
            <View style={tw`py-12 items-center bg-white rounded-xl shadow-sm border border-gray-100`}>
              <Icon name="sad-outline" size={48} color={tw.color('gray-400')} />
              <Text style={tw`text-gray-500 mt-2 text-center text-lg`}>Tidak ada data mood</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
    </GestureHandlerRootView>

  );
}
