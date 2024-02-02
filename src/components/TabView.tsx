import React, { useState } from 'react'
import { Dimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
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
  const transition = useSharedValue(0)

  const pan = Gesture.Pan()
    .onChange((e) => {
      let translation = e.translationX

      if (
        (activeTabIndex === 0 && e.translationX > 0) ||
        (activeTabIndex === props.tabs.length - 1 && e.translationX < 0)
      ) {
        translation = e.translationX / Math.pow(Math.abs(e.translationX), 0.4)
      }

      transition.value = -1 * width * activeTabIndex + translation
    })
    .onTouchesUp((e) => {
      if (Math.abs(transition.value) > width / 2) {
        transition.value = withTiming(
          -width,
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
      } else {
        transition.value = withTiming(
          0,
          {
            duration: 200,
            easing: Easing.out(Easing.poly(4)),
          },
          () => {
            runOnJS(setActiveTabIndex)(Math.max(0, activeTabIndex - 1))
          }
        )
      }
    })

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateX: transition.value,
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

export const TabView = React.memo(_TabView) as typeof _TabView
