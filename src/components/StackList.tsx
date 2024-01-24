import { useCallback, useState, useEffect } from 'react'
import { LayoutChangeEvent, StyleProp, View, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  SharedValue,
  useSharedValue,
  runOnJS,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated'
import { usePrevious } from '../hooks/usePrevious'

type ItemT = {
  id: string
}

type PropsT = {
  items: ItemT[]
  renderItem: (item: ItemT) => JSX.Element
  reversed?: boolean
  visibleItems?: number
}

const Threshold = 1.02

const Item = ({
  item,
  renderItem,
  offset,
  isLast,
  onDragStart,
  onDragEnd,
  onDrag,
  onItemMeasured,
  animatedStyle,
}: {
  item: ItemT
  renderItem: (item: ItemT) => JSX.Element
  offset: number
  animation: SharedValue<number>
  isLast: boolean
  onDragStart: () => void
  onDragEnd: (translationY: number) => void
  onDrag: (translationY: number) => void
  onItemMeasured: (height: number) => void
  animatedStyle: StyleProp<ViewStyle>
}) => {
  const pan = Gesture.Pan()
    .onBegin(() => {
      runOnJS(onDragStart)()
    })
    .onChange((event) => {
      if (event.translationY > 0) {
        return
      }

      runOnJS(onDrag)(event.translationY)
    })
    .onFinalize((event) => {
      if (event.translationY > 0) {
        return
      }

      runOnJS(onDragEnd)(event.translationY)
    })
    .enabled(isLast)

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        onLayout={(e) => onItemMeasured(e.nativeEvent.layout.height)}
        style={[
          {
            position: 'absolute',
            left: offset * 3.2,
            bottom: offset * 3.2,
          },
          animatedStyle,
        ]}
      >
        {renderItem(item)}
      </Animated.View>
    </GestureDetector>
  )
}

export const StackList = ({ renderItem, visibleItems, ...rest }: PropsT) => {
  const [items, setItems] = useState<ItemT[]>(rest.items)
  const [itemHeight, setItemHeight] = useState<number | undefined>(undefined)

  const [animationState, setAnimationState] = useState<
    'drag' | 'return' | 'descend' | undefined
  >(undefined)

  const [currentlyDraggedItem, setCurrentlyDraggedItem] = useState<
    ItemT['id'] | undefined
  >()
  const animation = useSharedValue<number>(0)
  const prevAnimationState = usePrevious(animationState)

  useEffect(() => {
    if (prevAnimationState === 'drag') {
      if (animationState === 'return') {
        animation.value = withTiming(0, { duration: 40 })
      } else if (animationState === 'descend') {
        animation.value = withTiming(0, { duration: 500 }, () => {
          runOnJS(moveItemInFront)()
        })
      }
    }
  }, [prevAnimationState, animationState])

  useAnimatedReaction(
    () => {
      return animation.value
    },
    (currentValue, prevValue) => {
      if (animationState === undefined) {
        return
      }

      if (prevValue && currentValue === 0) {
        runOnJS(setAnimationState)(undefined)
      }
    }
  )

  const moveItemInFront = useCallback(() => {
    setItems((items) => {
      const item = items.find((i) => i.id === currentlyDraggedItem)

      if (!item) {
        return items
      }

      const newItems = items.filter((i) => i.id !== currentlyDraggedItem)

      newItems.unshift(item)

      return newItems
    })
  }, [setItems, currentlyDraggedItem])

  const onItemLayout = useCallback(
    (height: number) => {
      if (itemHeight !== undefined) {
        return
      }

      setItemHeight(height)
    },
    [itemHeight]
  )

  const onItemDragBegin = useCallback((id: ItemT['id']) => {
    runOnJS(setAnimationState)('drag')

    setCurrentlyDraggedItem(id)
  }, [])

  const onDragEnd = useCallback(
    (id: ItemT['id'], translationY: number) => {
      if (Math.abs(translationY) / itemHeight < Threshold) {
        setAnimationState('return')
      } else {
        const progress = Math.min(
          Math.abs(translationY) / itemHeight,
          Threshold
        )

        if (progress === Threshold) {
          setAnimationState('descend')
        }
      }

      setCurrentlyDraggedItem(id)
    },
    [itemHeight]
  )

  const onItemDrag = useCallback(
    (translationY: number) => {
      const progress = Math.min(Math.abs(translationY) / itemHeight, Threshold)

      animation.value = withTiming(progress, { duration: 1 })
    },
    [itemHeight]
  )

  const style = useAnimatedStyle(
    () => ({
      transform: [
        animationState === 'drag' || animationState === 'return'
          ? { translateY: -1 * animation.value * (itemHeight ?? 0) }
          : undefined,
        ...(animationState === 'descend'
          ? [
              { scale: Math.min(1, Math.max(animation.value, 0.94)) },
              {
                translateY: -animation.value * (itemHeight ?? 0),
              },
            ]
          : []),
      ].filter(Boolean),
      zIndex: animationState === 'descend' ? -10 : 0,
    }),
    [itemHeight, animationState]
  )

  const nonDraggableStyle = useAnimatedStyle(
    () => ({
      transform: [
        animationState !== undefined
          ? {
              translateY: -0.02 * animation.value * (itemHeight ?? 0),
            }
          : undefined,
        animationState !== undefined
          ? {
              translateX: 0.02 * animation.value * (itemHeight ?? 0),
            }
          : undefined,
      ].filter(Boolean),
    }),
    [itemHeight, animationState]
  )

  return (
    <View>
      {items.map((item, index) => (
        <Item
          key={item.id}
          item={item}
          renderItem={renderItem}
          offset={
            (visibleItems ?? 4) -
            Math.min(visibleItems ?? 4, items.length - index)
          }
          isLast={index === items.length - 1}
          animation={animation}
          onDragStart={() => onItemDragBegin(item.id)}
          onDragEnd={(translationY: number) => onDragEnd(item.id, translationY)}
          onDrag={onItemDrag}
          onItemMeasured={onItemLayout}
          animatedStyle={
            currentlyDraggedItem !== undefined
              ? item.id === currentlyDraggedItem
                ? style
                : nonDraggableStyle
              : undefined
          }
        />
      ))}
    </View>
  )
}
