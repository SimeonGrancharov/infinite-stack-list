import { StatusBar } from 'expo-status-bar'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StackList } from './components/StackList'
import { TabView } from './components/TabView'

export default function App() {
  const data = useMemo<
    ({ id: string } & (
      | { type: 'b'; peshka?: string }
      | { type: 'a'; monka?: number }
    ))[]
  >(() => {
    return [
      { id: '1', type: 'a' },
      { id: '2', type: 'b' },
      { id: '3', type: 'a' },
      { id: '4', type: 'b' },
      { id: '5', type: 'b' },
      { id: '6', type: 'a' },
    ]
  }, [])

  const tabs = ['first', 'second', 'third', 'fourth']

  return (
    <View style={styles.container}>
      <View
        style={{
          height: 75,
          backgroundColor: 'red',
        }}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TabView
          tabs={tabs}
          TabScene={(props) => {
            return (
              <View
                style={{
                  flex: 1,
                  backgroundColor: props.index % 2 === 0 ? 'red' : 'blue',
                }}
              ></View>
            )
          }}
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
  },
})
