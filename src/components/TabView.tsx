import React, { useCallback, useState } from 'react'
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  Extrapolate,
  SharedValue,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

type PropsT<TabT> = {
  tabs: TabT[]
  TabScene: React.FC<{ tab: TabT; index: number; isActive: boolean }>
}
const width = Dimensions.get('screen').width

const _TabView = <TabT,>(props: PropsT<TabT>) => {
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const translationX = useSharedValue(0)
  const transition = useSharedValue(0)

  const onTabPress = useCallback((index: number) => {
    setActiveTabIndex(index)
    translationX.value = withTiming(-1 * width * index, { duration: 200 })
  }, [])

  const pan = Gesture.Pan()
    .onChange((e) => {
      let translation = e.translationX

      if (
        (activeTabIndex === 0 && e.translationX > 0) ||
        (activeTabIndex === props.tabs.length - 1 && e.translationX < 0)
      ) {
        translation = e.translationX / Math.pow(Math.abs(e.translationX), 0.4)
      }

      translationX.value = -1 * width * activeTabIndex + translation
    })
    .onFinalize((e) => {
      if (
        Math.abs(e.translationX) > width / 2 &&
        translationX.value > (props.tabs.length - 1) * width * -1 &&
        translationX.value < 0
      ) {
        if (e.translationX < 0) {
          translationX.value = withTiming(
            -width * (activeTabIndex + 1),
            {
              duration: 200,
              easing: Easing.out(Easing.poly(4)),
            },
            () => {
              runOnJS(setActiveTabIndex)(
                Math.min(activeTabIndex + 1, props.tabs.length - 1)
              )
            }
          )
        } else if (e.translationX > 0) {
          translationX.value = withTiming(
            -width * (activeTabIndex - 1),
            {
              duration: 200,
              easing: Easing.out(Easing.poly(4)),
            },
            () => {
              runOnJS(setActiveTabIndex)(
                Math.min(Math.max(0, activeTabIndex - 1))
              )
            }
          )
        }
      } else {
        translationX.value = withTiming(-activeTabIndex * width, {
          duration: 200,
          easing: Easing.out(Easing.poly(4)),
        })
      }
    })

  useAnimatedReaction(
    () => {
      return translationX.value
    },
    (newValue) => {
      if (newValue > 0 || newValue < -1 * props.tabs.length * width) {
        return
      }

      // Extrat the transition by tabs. TODO Rethink if this is the better way at all
      transition.value = Math.abs(newValue / width)
    },
    [translationX.value]
  )

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: translationX.value,
        },
      ],
    }),
    []
  )

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <TabBar
        tabs={props.tabs}
        animation={transition}
        activeIndex={activeTabIndex}
        onTabPress={onTabPress}
      />
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              flex: 1,
            },
            animatedStyle,
          ]}
          collapsable={false}
        >
          {props.tabs.map((tab, index) => (
            <Animated.View
              key={index}
              style={[{ width: '100%' }]}
              collapsable={false}
            >
              <props.TabScene key={index} tab={tab} index={index} isActive />
            </Animated.View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

type TabBarPropsT<TabT> = {
  tabs: TabT[]
  activeIndex: number
  animation: SharedValue<number>
  onTabPress: (index: number) => void
}

const TabBar = <TabT,>(props: TabBarPropsT<TabT>) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 10,
        columnGap: 15,
      }}
    >
      {props.tabs.map((tab, index) => (
        <AnimatedBackground
          key={index}
          index={index}
          animation={props.animation}
          onTabPress={props.onTabPress}
        >
          <Text>{typeof tab === 'object' ? (tab as any).id : tab}</Text>
        </AnimatedBackground>
      ))}
    </View>
  )
}

const AnimatedBackground = (props: {
  animation: SharedValue<number>
  children: any
  index: number
  onTabPress: (idx: number) => void
}) => {
  const fadeInAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        props.animation.value,
        [props.index - 1, props.index, props.index + 1],
        [0, 0.8, 0]
      ),
    }
  })

  const onPress = useCallback(() => {
    props.onTabPress(props.index)
  }, [props.onTabPress, props.index])

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 10,
          paddingHorizontal: 7,
          borderRadius: 8,
          overflow: 'hidden',
        },
      ]}
    >
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            flex: 1,
            backgroundColor: 'rgb(72, 159, 210)',
          },
          fadeInAnimationStyle,
        ]}
      />
      <TouchableOpacity onPress={onPress}>{props.children}</TouchableOpacity>
    </Animated.View>
  )
}

export const TabView = React.memo(_TabView) as typeof _TabView
