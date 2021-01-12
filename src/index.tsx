import React, { ReactElement, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  FlatList,
  Text,
  View,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

type dataType = {
  value: number | string;
  label: number | string;
};

interface WheelNumberPickerProps {
  minValue: number;
  maxValue: number;
  data: dataType[];
  height: number;
  textStyle?: StyleProp<TextStyle>;
  selectedTextStyle?: StyleProp<TextStyle>;
  unselectedTextStyle?: StyleProp<TextStyle>;
  dividerWidth?: ViewStyle["borderBottomWidth"];
  dividerColor?: ViewStyle["borderBottomColor"];
  selectedValue?: number | string;
  onValueChange?: (value: number | string) => void;
}

function WheelNumberPicker({
  height = 25,
  textStyle,
  selectedTextStyle,
  unselectedTextStyle,
  dividerWidth = 1,
  dividerColor,
  selectedValue = 0,
  onValueChange,
  data = [],
}: WheelNumberPickerProps): ReactElement {
  const [dataArray, setDataArray] = useState<dataType[]>([]);
  const [value, setValue] = useState<number | string>(selectedValue);

  const flatListRef = useRef<FlatList>(null);
  const currentYOffset = useRef<number>(0);
  const numberOfValue = useRef<number>(data.length);
  const initialOffset = useRef<number>((data.length - 0.5) * height);

  // initialize array
  useEffect(() => {
    setDataArray([...data, ...data, ...data]);
  }, []);

  // set offset in center of list when rendered
  useEffect(() => {
    if (dataArray.length === 0) return;
    let offset = initialOffset.current;
    if (selectedValue) {
      const selectedValueIndex = data.findIndex(
        (obj) => obj.value === selectedValue
      );
      if (selectedValueIndex !== -1) {
        offset += height * selectedValueIndex;
      }
    }

    flatListRef.current?.scrollToOffset({
      offset: offset,
      animated: false,
    });
    currentYOffset.current = initialOffset.current;
  }, [dataArray.length]);

  // for onValueChange props
  useEffect(() => {
    if (!onValueChange) return;
    onValueChange(value);
  }, [value]);

  // FIXME: not snap to center when scrollToOffset sometime
  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = nativeEvent.contentOffset.y;
    let index = Math.ceil((offsetY % initialOffset.current) / height);
    index = index < numberOfValue.current ? index : numberOfValue.current - 1;
    const selectedValue = data[index].value;
    if (value !== selectedValue) {
      setValue(selectedValue);
    }

    if (offsetY < currentYOffset.current) {
      if (offsetY <= initialOffset.current - height) {
        flatListRef.current?.scrollToOffset({
          offset: offsetY + height * numberOfValue.current,
          animated: false,
        });
        currentYOffset.current = offsetY + height * numberOfValue.current;
        return;
      }
    }

    if (offsetY > currentYOffset.current) {
      if (offsetY > initialOffset.current + height) {
        flatListRef.current?.scrollToOffset({
          offset: offsetY - height * numberOfValue.current,
          animated: false,
        });
        currentYOffset.current = offsetY - height * numberOfValue.current;
        return;
      }
    }

    currentYOffset.current = offsetY;
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* view component for picker divider */}
      <View
        style={{
          position: "absolute",
          borderTopWidth: dividerWidth,
          borderBottomWidth: dividerWidth,
          borderColor: dividerColor,
          height: height,
          width: height * 1.2,
        }}
      />
      <View style={{ width: height * 1.2, height: height * 2 }}>
        <FlatList
          data={dataArray}
          onScroll={onScroll}
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          snapToAlignment="center"
          snapToInterval={height}
          scrollEventThrottle={16}
          decelerationRate="fast"
          initialScrollIndex={0}
          keyExtractor={(item, index) => `WNPicker_${index.toString()}`}
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          renderItem={({ item }) => {
            return (
              <View
                style={{
                  width: "100%",
                  height: height,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.value === value ? (
                  <Text style={[textStyle, selectedTextStyle]}>
                    {item.label}
                  </Text>
                ) : (
                  <Text
                    style={[
                      textStyle,
                      { color: "rgba(200,200,200,0.6)" },
                      unselectedTextStyle,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

export default WheelNumberPicker;
