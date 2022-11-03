import { MaterialIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";

import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import ManageOrder from "../screens/ManageOrder";
import InventoryItems from "../screens/InventoryItems";

import {
  BottomTabParamList,
} from "../types";

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function MerchantBottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="ManageOrder"
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
        name="ManageOrder"
        component={ManageOrder}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="inbox" color={color} />
          ),
          tabBarLabel: "Manage Orders",
        }}
      />
      <BottomTab.Screen
        name="InventoryItems"
        component={InventoryItems}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="inventory" color={color} />
          ),
          tabBarLabel: "Inventory Items",
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


