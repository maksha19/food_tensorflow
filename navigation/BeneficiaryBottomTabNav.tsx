import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import PlaceOrder from "../screens/PlaceOrder";
import MyHistory from "../screens/MyHistory"; 

import {
  BottomTabParamList,
} from "../types";

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BeneficiaryBottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="PlaceOrder"
      // tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarStyle: [
          {
            display: "flex",
          },
          null,
        ],
      }}
    >
      <BottomTab.Screen
        name="PlaceOrder"
        component={PlaceOrder}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="add-shopping-cart" color={color} />
          ),
          tabBarLabel: "Place Orders",
        }}
      />
      <BottomTab.Screen
        name="MyHistory"
        component={MyHistory}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="history-edu" color={color} />
          ),
          tabBarLabel: "My History",
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <MaterialIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}
