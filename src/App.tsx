import { StatusBar } from 'expo-status-bar'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StackList } from './components/StackList'

export default function App() {
  const data = useMemo<
    ({ type: 'b'; peshka?: string } | { type: 'a'; monka?: number })[]
  >(() => {
    return [
      { type: 'a' },
      { type: 'b' },
      { type: 'a' },
      { type: 'b' },
      { type: 'b' },
      { type: 'a' },
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
                width: 150,
                height: 120,
                paddingVertical: 20,
                paddingHorizontal: 15,
                borderRadius: 20,
                borderWidth: 0.5,
                borderColor: 'grey',
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{`Id is: ${item.type}`}</Text>
              <View
                style={{
                  padding: 20,
                }}
              >
                <Text>
                  {
                    'Hello I am very cool item. My main purpose in life is to show how the stack basically works'
                  }
                </Text>
              </View>
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
