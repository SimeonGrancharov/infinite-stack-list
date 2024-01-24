import { StatusBar } from 'expo-status-bar'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StackList } from './components/StackList'

export default function App() {
  const data = useMemo(() => {
    return [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
    ]
  }, [])

  return (
    <View style={styles.container}>
      <GestureHandlerRootView>
        <StackList
          items={data}
          renderItem={(item) => (
            <View
              style={{
                width: 200,
                height: 120,
                backgroundColor: Math.random() > 0.5 ? 'green' : 'blue',
                borderRadius: 20,
                borderWidth: 0.5,
                borderColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{`Id is: ${item.id}`}</Text>
            </View>
          )}
        />
      </GestureHandlerRootView>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
})
